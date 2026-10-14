import { TimelineClip, MediaAsset, ProjectFormat } from '../types/fcp';
import { KeyframeEngine } from './KeyframeEngine';
import { Motion3DTextEngine } from './Motion3DTextEngine';

/**
 * Apple Motion Web Equivalent & Procedural Motion Graphics Engine
 * Handles kinetic typography, shader effects (Chromatic Aberration, Film Grain),
 * custom transitions, and recursive Compound Clip rendering.
 */
export class MotionEngine {
  /**
   * Applies procedural kinetic motion styling to dynamic title layers
   */
  static renderKineticTitle(
    ctx: CanvasRenderingContext2D,
    clip: TimelineClip,
    width: number,
    height: number,
    clipProgress: number
  ) {
    if (!clip.titleProps) return;
    const props = clip.titleProps;

    ctx.save();

    let textToDraw = props.text;
    let opacity = clip.opacity;
    let offsetY = 0;
    let scale = 1.0;

    // In-animation effects based on animationStyle
    const inDuration = 0.8;
    if (clipProgress < inDuration) {
      const t = clipProgress / inDuration;
      switch (props.animationStyle) {
        case 'slideUp':
          offsetY = (1 - t) * 60;
          opacity = t;
          break;
        case 'typewriter': {
          const charCount = Math.floor(t * props.text.length);
          textToDraw = props.text.slice(0, charCount);
          break;
        }
        case 'glitch':
          scale = 1.0 + (1 - t) * 0.3;
          offsetY = ((Math.random() - 0.5) * 10 * (1 - t));
          break;
        case 'fade':
        default:
          opacity = t;
          break;
      }
    }

    ctx.globalAlpha = opacity;
    ctx.font = `${props.fontWeight} ${props.fontSize * (width / 1920) * 1.5}px ${props.fontFamily}, sans-serif`;
    ctx.textAlign = props.align;
    ctx.textBaseline = 'middle';

    const basePosY = (props.posY / 100 - 0.5) * height + offsetY;

    // Render Procedural Motion Rigging graphics (Lower Thirds, Badges, Accent bars)
    if (props.motionRig && props.motionRig.enabled) {
      const barWidthParam = props.motionRig.parameters.find(p => p.id === 'barWidth');
      const barWidth = typeof barWidthParam?.value === 'number' ? barWidthParam.value : 300;
      const liveBadgeParam = props.motionRig.parameters.find(p => p.id === 'liveBadge');

      // Accent lower third bar
      ctx.save();
      const barGrad = ctx.createLinearGradient(-barWidth / 2, 0, barWidth / 2, 0);
      barGrad.addColorStop(0, 'rgba(0, 240, 255, 0.9)');
      barGrad.addColorStop(1, 'rgba(138, 43, 226, 0.4)');
      ctx.fillStyle = barGrad;
      ctx.fillRect(-barWidth / 2, basePosY + props.fontSize * 0.7, barWidth, 4);

      if (liveBadgeParam && liveBadgeParam.value === true) {
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(-barWidth / 2, basePosY - props.fontSize * 0.9, 50, 18);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('LIVE', -barWidth / 2 + 25, basePosY - props.fontSize * 0.9 + 10);
      }
      ctx.restore();
    }

    // 3D Motion Text vs 2D Standard Text
    if (props.motion3D && props.motion3D.is3D) {
      Motion3DTextEngine.render3DText(ctx, textToDraw, 0, basePosY, {
        fontSize: props.fontSize * (width / 1920) * 1.5,
        fontFamily: props.fontFamily,
        fontWeight: props.fontWeight,
        color: props.color,
        motion3D: props.motion3D,
      });
    } else {
      // Drop Shadow
      if (props.shadow) {
        ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
        ctx.shadowBlur = 16;
        ctx.shadowOffsetX = 4;
        ctx.shadowOffsetY = 4;
      }

      // Stroke Outline
      if (props.outline) {
        ctx.strokeStyle = props.outlineColor || '#000000';
        ctx.lineWidth = 6;
        ctx.strokeText(textToDraw, 0, basePosY);
      }

      ctx.fillStyle = props.color;
      ctx.fillText(textToDraw, 0, basePosY);
    }

    ctx.restore();
  }

  /**
   * Chromatic Aberration Shader effect (RGB Split)
   */
  static applyChromaticAberration(ctx: CanvasRenderingContext2D, width: number, height: number, intensity: number = 4) {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    const copy = new Uint8ClampedArray(data);

    const shift = Math.floor(intensity);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4;
        const rIndex = (y * width + Math.min(width - 1, x + shift)) * 4;
        const bIndex = (y * width + Math.max(0, x - shift)) * 4;

        data[i] = copy[rIndex];         // Shift Red right
        data[i + 2] = copy[bIndex + 2]; // Shift Blue left
      }
    }

    ctx.putImageData(imageData, 0, 0);
  }

  /**
   * 35mm Real Film Grain generator
   */
  static applyFilmGrain(ctx: CanvasRenderingContext2D, width: number, height: number, amount: number = 0.08) {
    ctx.save();
    const grainCanvas = document.createElement('canvas');
    grainCanvas.width = 256;
    grainCanvas.height = 256;
    const gCtx = grainCanvas.getContext('2d');
    if (!gCtx) return;

    const imgData = gCtx.createImageData(256, 256);
    const buf = new Uint32Array(imgData.data.buffer);
    for (let i = 0; i < buf.length; i++) {
      const v = Math.floor(Math.random() * 255);
      buf[i] = (Math.floor(amount * 255) << 24) | (v << 16) | (v << 8) | v;
    }
    gCtx.putImageData(imgData, 0, 0);

    ctx.globalCompositeOperation = 'overlay';
    ctx.fillStyle = ctx.createPattern(grainCanvas, 'repeat') || '#ffffff';
    ctx.fillRect(-width / 2, -height / 2, width, height);
    ctx.restore();
  }

  /**
   * Custom Glitch Transition Shader between two clips
   */
  static renderGlitchTransition(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    progress: number
  ) {
    if (progress <= 0 || progress >= 1) return;

    ctx.save();
    const slices = 8;
    for (let i = 0; i < slices; i++) {
      if (Math.random() < 0.4) {
        const sliceY = (i / slices) * height - height / 2;
        const sliceH = height / slices;
        const offsetX = (Math.random() - 0.5) * 40 * Math.sin(progress * Math.PI);
        ctx.drawImage(
          ctx.canvas,
          0,
          i * (height / slices),
          width,
          sliceH,
          -width / 2 + offsetX,
          sliceY,
          width,
          sliceH
        );
      }
    }
    ctx.restore();
  }
}
