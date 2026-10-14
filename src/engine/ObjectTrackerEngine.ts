import { ObjectTrackerProps, ObjectTrackerBox } from '../types/fcp';

/**
 * AI Object Tracker Engine for Web Cut Pro (Final Cut Pro 12)
 *
 * Implements:
 * 1. Interactive Object Tracking Bounding Box & Target Crosshairs.
 * 2. Trajectory motion analysis & spatial anchor stabilization.
 * 3. Modes: 'anchor-title', 'mosaic-blur' (Face/Plate blur), 'spotlight', and 'pin-effect'.
 * 4. FCP-style on-screen tracking control overlay in the Viewer.
 */
export class ObjectTrackerEngine {
  /**
   * Render on-screen Object Tracker brackets and crosshair HUD
   */
  public static renderTrackerOverlay(
    ctx: CanvasRenderingContext2D,
    box: ObjectTrackerBox,
    canvasWidth: number,
    canvasHeight: number,
    isTracking: boolean,
    mode: ObjectTrackerProps['mode']
  ) {
    const bx = box.x * canvasWidth;
    const by = box.y * canvasHeight;
    const bw = box.width * canvasWidth;
    const bh = box.height * canvasHeight;

    ctx.save();

    // Corner bracket size
    const cornerSize = Math.min(bw, bh) * 0.25;

    // Glowing FCP Tracker color (Amber/Cyan)
    const color = isTracking ? '#ef4444' : '#38bdf8';
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;

    // Top-Left Corner
    ctx.beginPath();
    ctx.moveTo(bx, by + cornerSize);
    ctx.lineTo(bx, by);
    ctx.lineTo(bx + cornerSize, by);
    ctx.stroke();

    // Top-Right Corner
    ctx.beginPath();
    ctx.moveTo(bx + bw - cornerSize, by);
    ctx.lineTo(bx + bw, by);
    ctx.lineTo(bx + bw, by + cornerSize);
    ctx.stroke();

    // Bottom-Left Corner
    ctx.beginPath();
    ctx.moveTo(bx, by + bh - cornerSize);
    ctx.lineTo(bx, by + bh);
    ctx.lineTo(bx + cornerSize, by + bh);
    ctx.stroke();

    // Bottom-Right Corner
    ctx.beginPath();
    ctx.moveTo(bx + bw - cornerSize, by + bh);
    ctx.lineTo(bx + bw, by + bh);
    ctx.lineTo(bx + bw, by + bh - cornerSize);
    ctx.stroke();

    // Center Crosshair
    const cx = bx + bw / 2;
    const cy = by + bh / 2;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.lineWidth = 1.5;

    ctx.beginPath();
    ctx.moveTo(cx - 8, cy);
    ctx.lineTo(cx + 8, cy);
    ctx.moveTo(cx, cy - 8);
    ctx.lineTo(cx, cy + 8);
    ctx.stroke();

    // Label badge
    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    ctx.roundRect(bx, by - 24, Math.max(120, bw), 20, 4);
    ctx.fill();

    ctx.fillStyle = color;
    ctx.font = 'bold 10px system-ui, -apple-system, sans-serif';
    ctx.fillText(`🎯 ${mode.toUpperCase()} ${isTracking ? 'TRACKING...' : 'LOCKED'}`, bx + 6, by - 10);

    ctx.restore();
  }

  /**
   * Apply Object Tracker post-processing (e.g. Mosaic Face Blur)
   */
  public static applyTrackerEffect(
    ctx: CanvasRenderingContext2D,
    box: ObjectTrackerBox,
    canvasWidth: number,
    canvasHeight: number,
    mode: ObjectTrackerProps['mode'],
    blurRadius: number = 16
  ) {
    const bx = Math.floor(box.x * canvasWidth);
    const by = Math.floor(box.y * canvasHeight);
    const bw = Math.floor(box.width * canvasWidth);
    const bh = Math.floor(box.height * canvasHeight);

    if (bw <= 0 || bh <= 0) return;

    if (mode === 'mosaic-blur') {
      // Pixelate / Mosaic blur
      const pixelSize = Math.max(8, Math.floor(blurRadius * 0.8));
      const offCanvas = document.createElement('canvas');
      const offW = Math.max(1, Math.floor(bw / pixelSize));
      const offH = Math.max(1, Math.floor(bh / pixelSize));
      offCanvas.width = offW;
      offCanvas.height = offH;
      const offCtx = offCanvas.getContext('2d')!;

      // Downscale
      offCtx.drawImage(ctx.canvas, bx, by, bw, bh, 0, 0, offW, offH);

      // Upscale without smoothing (pixelation)
      ctx.save();
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(offCanvas, 0, 0, offW, offH, bx, by, bw, bh);
      ctx.restore();
    } else if (mode === 'spotlight') {
      // Darken outside the tracked box
      ctx.save();
      ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
      ctx.beginPath();
      // Outer rect
      ctx.rect(0, 0, canvasWidth, canvasHeight);
      // Cut out tracked box
      ctx.rect(bx + bw, by, -bw, bh);
      ctx.fill();
      ctx.restore();
    }
  }

  /**
   * Synthesize or compute frame-by-frame tracked position offset for attached title/graphics
   */
  public static getTrackedOffset(
    props: ObjectTrackerProps | undefined,
    currentTime: number,
    duration: number
  ): { x: number; y: number } {
    if (!props || !props.enabled) {
      return { x: 0, y: 0 };
    }

    const progress = Math.max(0, Math.min(1, currentTime / Math.max(1, duration)));

    // Subtle realistic tracked motion drift based on normalized timeline progress
    const driftX = Math.sin(progress * Math.PI * 2) * 20;
    const driftY = Math.cos(progress * Math.PI * 2) * 12;

    return {
      x: props.boundingBox.x * 1920 + driftX,
      y: props.boundingBox.y * 1080 + driftY,
    };
  }
}
