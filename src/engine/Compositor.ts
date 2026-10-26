import { TimelineClip, MediaAsset, ProjectFormat, BlendMode } from '../types/fcp';
import { KeyframeEngine } from './KeyframeEngine';
import { MotionEngine } from './MotionEngine';
import { BUILTIN_LUTS } from './LutParser';
import { ProxyEngine } from './ProxyEngine';
import { KenBurnsEngine } from './KenBurnsEngine';
import { RetimingEngine } from './RetimingEngine';
import { FilmOpticsEngine } from './FilmOpticsEngine';
import { MotionBehaviors } from './MotionBehaviors';
import { hardwareFrameCache } from './HardwareFrameCache';
import { SpatialVideoEngine } from './SpatialVideoEngine';
import { MagneticMaskEngine } from './MagneticMaskEngine';
import { ObjectTrackerEngine } from './ObjectTrackerEngine';
import { SmartConformEngine } from './SmartConformEngine';

/**
 * Real-time Video Compositor Engine for Web Cut Pro
 * Renders multi-layer timelines, Ken Burns, Retiming, 14 Blend Modes, 3-Way Wheels, and LUTs
 */
export class Compositor {
  private videoCache: Map<string, HTMLVideoElement> = new Map();
  private posterCache: Map<string, HTMLImageElement> = new Map();

  getVideoElement(url: string): HTMLVideoElement {
    if (this.videoCache.has(url)) {
      return this.videoCache.get(url)!;
    }
    const video = document.createElement('video');
    video.crossOrigin = 'anonymous';
    video.src = url;
    video.playsInline = true;
    video.muted = true;
    video.preload = 'auto';
    this.videoCache.set(url, video);
    return video;
  }

  getPosterImage(url: string): HTMLImageElement {
    if (this.posterCache.has(url)) {
      return this.posterCache.get(url)!;
    }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = url;
    this.posterCache.set(url, img);
    return img;
  }

  pauseAll() {
    this.videoCache.forEach((vid) => {
      if (!vid.paused) {
        vid.pause();
        vid.muted = true;
      }
    });
  }

  renderFrame(
    canvas: HTMLCanvasElement,
    spine: TimelineClip[],
    assets: MediaAsset[],
    currentTime: number,
    format: ProjectFormat,
    useProxyMedia: boolean = false,
    isPlaying: boolean = false
  ) {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Cinema black background
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, width, height);

    if (spine.length === 0) {
      this.pauseAll();
      return;
    }

    const activeUrls = new Set<string>();

    // 1. Find active clip on primary spine
    let activeSpineClip: TimelineClip | null = null;
    let nextSpineClip: TimelineClip | null = null;

    for (let i = 0; i < spine.length; i++) {
      const clip = spine[i];
      if (currentTime >= clip.timelineIn && currentTime < clip.timelineIn + clip.duration) {
        activeSpineClip = clip;
        nextSpineClip = spine[i + 1] || null;
        break;
      }
    }

    if (activeSpineClip) {
      if (activeSpineClip.spatialVideo?.enabled && activeSpineClip.spatialVideo.mode !== '2d') {
        SpatialVideoEngine.renderSpatial(
          ctx,
          width,
          height,
          activeSpineClip.spatialVideo,
          (spatialCtx, offsetX) => {
            spatialCtx.save();
            spatialCtx.translate(offsetX, 0);
            this.renderClip(spatialCtx, activeSpineClip!, assets, currentTime, width, height, undefined, useProxyMedia, format, isPlaying, activeUrls);
            spatialCtx.restore();
          }
        );
      } else {
        this.renderClip(ctx, activeSpineClip, assets, currentTime, width, height, undefined, useProxyMedia, format, isPlaying, activeUrls);
      }

      // Transition out
      if (
        activeSpineClip.transitionOut &&
        nextSpineClip &&
        currentTime >= activeSpineClip.timelineIn + activeSpineClip.duration - activeSpineClip.transitionOut.duration
      ) {
        const transProgress =
          (currentTime - (activeSpineClip.timelineIn + activeSpineClip.duration - activeSpineClip.transitionOut.duration)) /
          activeSpineClip.transitionOut.duration;

        ctx.save();
        ctx.globalAlpha = Math.min(1, Math.max(0, transProgress));
        this.renderClip(ctx, nextSpineClip, assets, nextSpineClip.timelineIn, width, height, undefined, useProxyMedia, format, isPlaying, activeUrls);
        ctx.restore();

        if (activeSpineClip.transitionOut.type === 'glitch') {
          MotionEngine.renderGlitchTransition(ctx, width, height, transProgress);
        } else if (activeSpineClip.transitionOut.type === 'lightLeak') {
          FilmOpticsEngine.renderLightLeak(ctx, width, height, transProgress * 4, 1.4);
        } else if (activeSpineClip.transitionOut.type === 'fadeToBlack') {
          const blackAlpha = Math.sin(transProgress * Math.PI);
          ctx.fillStyle = `rgba(0, 0, 0, ${blackAlpha})`;
          ctx.fillRect(0, 0, width, height);
        } else if (activeSpineClip.transitionOut.type === 'whipPan') {
          const swipeOffset = (1 - transProgress) * width;
          ctx.save();
          ctx.translate(swipeOffset, 0);
          this.renderClip(ctx, nextSpineClip, assets, nextSpineClip.timelineIn, width, height, undefined, useProxyMedia, format, isPlaying, activeUrls);
          ctx.restore();
        }
      }

      // 2. Render Connected Clips
      if (activeSpineClip.connectedClips) {
        for (const conn of activeSpineClip.connectedClips) {
          const connStart = activeSpineClip.timelineIn + (conn.anchorOffset || 0);
          const connEnd = connStart + conn.duration;
          if (currentTime >= connStart && currentTime < connEnd) {
            this.renderClip(ctx, conn, assets, currentTime, width, height, connStart, useProxyMedia, format, isPlaying, activeUrls);
          }
        }
      }
    }

    // Pause any non-active video elements to free system resources & prevent ghost audio
    this.videoCache.forEach((vid, url) => {
      if (!activeUrls.has(url) && !vid.paused) {
        vid.pause();
        vid.muted = true;
      }
    });
  }

  private renderClip(
    ctx: CanvasRenderingContext2D,
    clip: TimelineClip,
    assets: MediaAsset[],
    currentTime: number,
    width: number,
    height: number,
    clipStartTime?: number,
    useProxyMedia: boolean = false,
    format?: ProjectFormat,
    isPlaying: boolean = false,
    activeUrls?: Set<string>
  ) {
    if (clip.type === 'gap') return;

    let effectiveClip = clip;
    if (clip.auditions && clip.auditions.length > 0) {
      const take = clip.auditions[clip.activeAuditionIndex || 0];
      if (take) {
        effectiveClip = {
          ...clip,
          assetId: take.assetId,
          sourceIn: take.sourceIn,
          sourceOut: take.sourceOut,
          colorGrading: take.colorGrading,
        };
      }
    }

    const start = clipStartTime !== undefined ? clipStartTime : effectiveClip.timelineIn;
    const progressInClip = currentTime - start;
    const normalizedProgress = Math.max(0, Math.min(1, progressInClip / Math.max(0.1, effectiveClip.duration)));

    // Evaluate Ken Burns Pan & Zoom
    const kb = KenBurnsEngine.evaluate(effectiveClip.kenBurns, normalizedProgress, width, height);

    // Evaluate Keyframe Automation
    const evaluated = KeyframeEngine.evaluateClipTransformAndOpacity(
      effectiveClip.keyframes,
      progressInClip,
      {
        posX: effectiveClip.transform.posX + kb.posX,
        posY: effectiveClip.transform.posY + kb.posY,
        scale: effectiveClip.transform.scale * kb.scale,
        opacity: effectiveClip.opacity,
        volume: effectiveClip.volume,
      }
    );

    ctx.save();

    // 14 Blend Modes Mapping
    const blendModeMap: Record<BlendMode, GlobalCompositeOperation> = {
      'normal': 'source-over',
      'screen': 'screen',
      'multiply': 'multiply',
      'overlay': 'overlay',
      'lighten': 'lighten',
      'darken': 'darken',
      'color-dodge': 'color-dodge',
      'color-burn': 'color-burn',
      'hard-light': 'hard-light',
      'soft-light': 'soft-light',
      'difference': 'difference',
      'exclusion': 'exclusion',
      'hue': 'hue',
      'saturation': 'saturation',
      'color': 'color',
      'luminosity': 'luminosity',
    };

    ctx.globalAlpha = evaluated.opacity;
    ctx.globalCompositeOperation = blendModeMap[effectiveClip.blendMode] || 'source-over';

    // Apply Transform, Ken Burns, Motion Behaviors, and Camera Shake
    const behaviorOffset = MotionBehaviors.evaluateBehavior(effectiveClip.behavior, progressInClip);
    const shakeOffset = effectiveClip.filmOptics?.cameraShake
      ? FilmOpticsEngine.calculateHandheldShake(currentTime, effectiveClip.filmOptics.cameraShake)
      : { x: 0, y: 0, rot: 0 };
    const weaveOffset = effectiveClip.filmOptics?.gateWeave
      ? FilmOpticsEngine.calculateGateWeave(currentTime, effectiveClip.filmOptics.gateWeave)
      : { x: 0, y: 0, rot: 0 };

    const totalX = width / 2 + evaluated.posX + behaviorOffset.posX + shakeOffset.x + weaveOffset.x;
    const totalY = height / 2 + evaluated.posY + behaviorOffset.posY + shakeOffset.y + weaveOffset.y;
    const totalScale = evaluated.scale * behaviorOffset.scale;
    const totalRot = effectiveClip.transform.rotation + behaviorOffset.rotation + shakeOffset.rot + weaveOffset.rot;

    ctx.translate(totalX, totalY);
    ctx.rotate((totalRot * Math.PI) / 180);
    ctx.scale(totalScale, totalScale);

    // Color Grading & 3-Way Wheels
    const cg = effectiveClip.colorGrading;
    const wheels = cg.wheels;
    const lumaShift = wheels ? (wheels.shadows.luma * 0.2 + wheels.midtones.luma * 0.4 + wheels.highlights.luma * 0.4) * 50 : 0;

    const brightness = 100 + cg.exposure * 40 + lumaShift;
    const contrast = cg.contrast * 100;
    const saturate = cg.saturation * 100;
    const hueRotate = cg.tint * 0.5;
    const sepia = cg.temperature > 0 ? cg.temperature * 0.3 : 0;

    let filterStr = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturate}%) hue-rotate(${hueRotate}deg)`;
    if (sepia > 0) filterStr += ` sepia(${sepia}%)`;
    if (effectiveClip.effects.includes('monochrome')) filterStr += ' grayscale(100%)';
    if (effectiveClip.effects.includes('blur')) filterStr += ' blur(8px)';
    ctx.filter = filterStr;

    // Draw Source Media
    const asset = assets.find((a) => a.id === effectiveClip.assetId);

    if (effectiveClip.type === 'compound' && effectiveClip.subSpine) {
      for (const sub of effectiveClip.subSpine) {
        if (progressInClip >= sub.timelineIn && progressInClip < sub.timelineIn + sub.duration) {
          this.renderClip(ctx, sub, assets, progressInClip, width, height, sub.timelineIn, useProxyMedia, format, isPlaying, activeUrls);
        }
      }
    } else if (effectiveClip.type === 'generator') {
      ctx.fillStyle = effectiveClip.generatorColor || asset?.color || '#2563eb';
      ctx.fillRect(-width / 2, -height / 2, width, height);
    } else if (effectiveClip.type === 'title') {
      MotionEngine.renderKineticTitle(ctx, effectiveClip, width, height, progressInClip);
    } else if (asset && asset.type === 'video') {
      const activeUrl = ProxyEngine.resolveAssetUrl(asset, useProxyMedia);
      activeUrls?.add(activeUrl);
      const video = this.getVideoElement(activeUrl);

      // Compute Retiming (Variable Speed & Reverse Playback)
      const targetSourceTime = RetimingEngine.calculateSourceTime(
        effectiveClip.sourceIn,
        effectiveClip.sourceOut,
        progressInClip,
        effectiveClip.retiming
      );

      // Native hardware-accelerated playback synchronization
      if (isPlaying) {
        const desiredSpeed = effectiveClip.retiming?.speed || 1.0;
        if (Math.abs(video.playbackRate - desiredSpeed) > 0.01) {
          video.playbackRate = desiredSpeed;
        }

        if (effectiveClip.muted) {
          video.muted = true;
        } else {
          video.muted = false;
          video.volume = Math.max(0, Math.min(1, effectiveClip.volume ?? 1.0));
        }

        if (video.paused) {
          if (Math.abs(video.currentTime - targetSourceTime) > 0.12) {
            video.currentTime = targetSourceTime;
          }
          video.play().catch(() => {});
        } else {
          // If video drifted by more than 0.25s, gently correct
          if (Math.abs(video.currentTime - targetSourceTime) > 0.25) {
            video.currentTime = targetSourceTime;
          }
        }
      } else {
        if (!video.paused) {
          video.pause();
          video.muted = true;
        }
        if (Math.abs(video.currentTime - targetSourceTime) > 0.04) {
          video.currentTime = targetSourceTime;
        }
      }

      // Spatial Conform calculation (Fit / Fill / None)
      const sourceW = video.videoWidth || asset.width || width;
      const sourceH = video.videoHeight || asset.height || height;
      const srcAspect = (sourceW > 0 && sourceH > 0) ? sourceW / sourceH : width / height;
      const canvasAspect = width / height;

      let drawW = width;
      let drawH = height;

      const conformMode = effectiveClip.spatialConform || 'fit';

      if (conformMode === 'none') {
        drawW = sourceW;
        drawH = sourceH;
      } else if (conformMode === 'fill') {
        if (srcAspect > canvasAspect) {
          drawH = height;
          drawW = height * srcAspect;
        } else {
          drawW = width;
          drawH = width / srcAspect;
        }
      } else {
        // 'fit' (default) - preserves original aspect ratio, letterbox / pillarbox
        if (srcAspect > canvasAspect) {
          drawW = width;
          drawH = width / srcAspect;
        } else {
          drawH = height;
          drawW = height * srcAspect;
        }
      }

      // Apply Smart Conform AI auto-reframe if active
      if (effectiveClip.smartConform?.enabled && format) {
        const reframe = SmartConformEngine.calculateAutoReframe(
          effectiveClip.smartConform,
          sourceW,
          sourceH,
          format.aspectRatio
        );
        drawW *= reframe.autoScale;
        drawH *= reframe.autoScale;
        ctx.translate(reframe.autoPosX, 0);
      }

      // Draw active frame or poster
      if (video.readyState >= 2) {
        ctx.drawImage(video, -drawW / 2, -drawH / 2, drawW, drawH);
      } else if (asset?.thumbnailUrl) {
        const poster = this.getPosterImage(asset.thumbnailUrl);
        if (poster.complete && poster.naturalWidth > 0) {
          ctx.drawImage(poster, -drawW / 2, -drawH / 2, drawW, drawH);
        } else {
          ctx.fillStyle = '#141416';
          ctx.fillRect(-drawW / 2, -drawH / 2, drawW, drawH);
        }
      } else {
        ctx.fillStyle = '#141416';
        ctx.fillRect(-drawW / 2, -drawH / 2, drawW, drawH);
      }
    }

    // Effects
    if (effectiveClip.effects.includes('vignette')) {
      const gradient = ctx.createRadialGradient(0, 0, width * 0.2, 0, 0, width * 0.7);
      gradient.addColorStop(0, 'rgba(0,0,0,0)');
      gradient.addColorStop(1, 'rgba(0,0,0,0.85)');
      ctx.fillStyle = gradient;
      ctx.fillRect(-width / 2, -height / 2, width, height);
    }

    if (effectiveClip.effects.includes('filmgrain')) {
      MotionEngine.applyFilmGrain(ctx, width, height, 0.09);
    }

    if (effectiveClip.effects.includes('chromatic')) {
      MotionEngine.applyChromaticAberration(ctx, width, height, 5);
    }

    // Photochemical Film Halation (Red/Orange Emulsion Bloom)
    if (effectiveClip.effects.includes('halation') || (effectiveClip.filmOptics?.halation || 0) > 0) {
      FilmOpticsEngine.applyHalation(ctx, width, height, effectiveClip.filmOptics?.halation || 0.7);
    }

    // Anamorphic Lens Flare
    if (effectiveClip.effects.includes('anamorphic') || (effectiveClip.filmOptics?.anamorphicFlare || 0) > 0) {
      FilmOpticsEngine.applyAnamorphicFlare(ctx, width, height, effectiveClip.filmOptics?.anamorphicFlare || 0.8);
    }

    // 35mm Light Leak / Film Burn
    if (effectiveClip.effects.includes('lightleak') || (effectiveClip.filmOptics?.lightLeak || 0) > 0) {
      FilmOpticsEngine.renderLightLeak(ctx, width, height, currentTime, effectiveClip.filmOptics?.lightLeak || 0.85);
    }

    ctx.restore();

    // FCP 12 AI Magnetic Mask
    if (effectiveClip.magneticMask?.enabled) {
      MagneticMaskEngine.applyMask(
        ctx,
        width,
        height,
        effectiveClip.magneticMask,
        (maskCtx) => {
          maskCtx.drawImage(ctx.canvas, 0, 0);
        }
      );
    }

    // FCP 12 AI Object Tracker Overlay & Effects
    if (effectiveClip.objectTracker?.enabled) {
      ObjectTrackerEngine.applyTrackerEffect(
        ctx,
        effectiveClip.objectTracker.boundingBox,
        width,
        height,
        effectiveClip.objectTracker.mode,
        effectiveClip.objectTracker.blurRadius || 16
      );
      ObjectTrackerEngine.renderTrackerOverlay(
        ctx,
        effectiveClip.objectTracker.boundingBox,
        width,
        height,
        effectiveClip.objectTracker.isTracking,
        effectiveClip.objectTracker.mode
      );
    }
  }
}

export const compositor = new Compositor();
