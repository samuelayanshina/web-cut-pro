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

/**
 * Real-time Video Compositor Engine for Web Cut Pro
 * Renders multi-layer timelines, Ken Burns, Retiming, 14 Blend Modes, 3-Way Wheels, and LUTs
 */
export class Compositor {
  private videoCache: Map<string, HTMLVideoElement> = new Map();

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

  renderFrame(
    canvas: HTMLCanvasElement,
    spine: TimelineClip[],
    assets: MediaAsset[],
    currentTime: number,
    format: ProjectFormat,
    useProxyMedia: boolean = false
  ) {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Cinema black background
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, width, height);

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
      this.renderClip(ctx, activeSpineClip, assets, currentTime, width, height, undefined, useProxyMedia);

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
        this.renderClip(ctx, nextSpineClip, assets, nextSpineClip.timelineIn, width, height, undefined, useProxyMedia);
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
          this.renderClip(ctx, nextSpineClip, assets, nextSpineClip.timelineIn, width, height, undefined, useProxyMedia);
          ctx.restore();
        }
      }

      // 2. Render Connected Clips
      if (activeSpineClip.connectedClips) {
        for (const conn of activeSpineClip.connectedClips) {
          const connStart = activeSpineClip.timelineIn + (conn.anchorOffset || 0);
          const connEnd = connStart + conn.duration;
          if (currentTime >= connStart && currentTime < connEnd) {
            this.renderClip(ctx, conn, assets, currentTime, width, height, connStart, useProxyMedia);
          }
        }
      }
    }
  }

  private renderClip(
    ctx: CanvasRenderingContext2D,
    clip: TimelineClip,
    assets: MediaAsset[],
    currentTime: number,
    width: number,
    height: number,
    clipStartTime?: number,
    useProxyMedia: boolean = false
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
          this.renderClip(ctx, sub, assets, progressInClip, width, height, sub.timelineIn, useProxyMedia);
        }
      }
    } else if (effectiveClip.type === 'generator') {
      ctx.fillStyle = effectiveClip.generatorColor || asset?.color || '#2563eb';
      ctx.fillRect(-width / 2, -height / 2, width, height);
    } else if (effectiveClip.type === 'title') {
      MotionEngine.renderKineticTitle(ctx, effectiveClip, width, height, progressInClip);
    } else if (asset && asset.type === 'video') {
      const activeUrl = ProxyEngine.resolveAssetUrl(asset, useProxyMedia);
      const video = this.getVideoElement(activeUrl);

      // Compute Retiming (Variable Speed & Reverse Playback)
      const targetSourceTime = RetimingEngine.calculateSourceTime(
        effectiveClip.sourceIn,
        effectiveClip.sourceOut,
        progressInClip,
        effectiveClip.retiming
      );

      // Instant Hardware Frame Cache check (0ms retrieval)
      const cached = hardwareFrameCache.getCachedFrame(effectiveClip.assetId, targetSourceTime, 30);
      if (cached) {
        ctx.drawImage(cached, -width / 2, -height / 2, width, height);
      } else {
        if (Math.abs(video.currentTime - targetSourceTime) > 0.08) {
          video.currentTime = targetSourceTime;
        }

        if (video.readyState >= 2) {
          ctx.drawImage(video, -width / 2, -height / 2, width, height);
          createImageBitmap(video).then((bitmap) => {
            hardwareFrameCache.storeFrame(effectiveClip.assetId, targetSourceTime, bitmap, 30);
          }).catch(() => {});
        } else {
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(-width / 2, -height / 2, width, height);
          ctx.fillStyle = '#64748b';
          ctx.font = '24px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(`Loading ${effectiveClip.name}...`, 0, 0);
        }
      }

      // Pre-fetch surrounding frames for buttery scrubbing
      hardwareFrameCache.prefetchWindow(video, effectiveClip.assetId, targetSourceTime, 30, 0.5);
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
  }
}

export const compositor = new Compositor();
