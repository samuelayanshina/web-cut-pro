/**
 * Professional Film Emulation & Optical Shaders Engine
 * Replicates high-end commercial FCP plugins (Dehancer, FilmConvert, motionVFX mFilm, Lens Distortions).
 * Features: Photochemical Film Halation, Anamorphic Lens Flare, Gate Weave,
 * Handheld Camera Shake, and 35mm Light Leaks.
 */
export class FilmOpticsEngine {
  /**
   * Photochemical Film Halation:
   * Simulates light penetrating film emulsion and reflecting off the anti-halation backing,
   * creating a characteristic warm red-orange bloom around high-contrast edges and specular highlights.
   */
  public static applyHalation(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    intensity: number = 0.7,
    threshold: number = 210
  ) {
    if (intensity <= 0) return;

    ctx.save();
    // 1. Offscreen canvas to isolate high-IRE highlights
    const hlCanvas = document.createElement('canvas');
    hlCanvas.width = Math.max(64, Math.floor(width / 4));
    hlCanvas.height = Math.max(64, Math.floor(height / 4));
    const hlCtx = hlCanvas.getContext('2d');
    if (!hlCtx) {
      ctx.restore();
      return;
    }

    // Downscale source
    hlCtx.drawImage(ctx.canvas, 0, 0, hlCanvas.width, hlCanvas.height);
    const imgData = hlCtx.getImageData(0, 0, hlCanvas.width, hlCanvas.height);
    const data = imgData.data;

    // Filter pixels above threshold and tint red-orange
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const luma = 0.299 * r + 0.587 * g + 0.114 * b;

      if (luma > threshold) {
        const factor = (luma - threshold) / (255 - threshold);
        data[i] = Math.min(255, 255 * factor * 1.2);     // Intense Red
        data[i + 1] = Math.min(255, 65 * factor);        // Warm Orange
        data[i + 2] = Math.min(255, 15 * factor);        // Trace Blue
        data[i + 3] = Math.floor(255 * factor * intensity);
      } else {
        data[i + 3] = 0;
      }
    }
    hlCtx.putImageData(imgData, 0, 0);

    // 2. Composite back with screen blend and heavy Gaussian blur
    ctx.globalCompositeOperation = 'screen';
    ctx.filter = `blur(${Math.max(4, Math.round(width * 0.015))}px)`;
    ctx.globalAlpha = Math.min(1.0, intensity);
    ctx.drawImage(hlCanvas, 0, 0, width, height);

    ctx.restore();
  }

  /**
   * Anamorphic Optical Lens Flare & Streak:
   * Generates cinematic horizontal anamorphic blue/cyan flares across the frame.
   */
  public static applyAnamorphicFlare(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    intensity: number = 0.6
  ) {
    if (intensity <= 0) return;

    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    ctx.globalAlpha = intensity * 0.75;

    // Center anamorphic horizontal flare streak
    const cy = height * 0.45;
    const flareGrad = ctx.createLinearGradient(0, cy, width, cy);
    flareGrad.addColorStop(0, 'rgba(0, 100, 255, 0)');
    flareGrad.addColorStop(0.3, 'rgba(0, 170, 255, 0.4)');
    flareGrad.addColorStop(0.5, 'rgba(200, 240, 255, 0.95)');
    flareGrad.addColorStop(0.7, 'rgba(0, 170, 255, 0.4)');
    flareGrad.addColorStop(1, 'rgba(0, 100, 255, 0)');

    ctx.fillStyle = flareGrad;
    ctx.fillRect(0, cy - 2, width, 4);

    // Anamorphic oval glow
    const ovalGrad = ctx.createRadialGradient(width * 0.5, cy, 5, width * 0.5, cy, width * 0.3);
    ovalGrad.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
    ovalGrad.addColorStop(0.2, 'rgba(0, 160, 255, 0.4)');
    ovalGrad.addColorStop(1, 'rgba(0, 60, 200, 0)');

    ctx.save();
    ctx.scale(1.0, 0.25);
    ctx.fillStyle = ovalGrad;
    ctx.beginPath();
    ctx.arc(width * 0.5, cy / 0.25, width * 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.restore();
  }

  /**
   * 35mm Film Gate Weave:
   * Simulates the slight physical mechanical jitter of film passing through a camera gate.
   */
  public static calculateGateWeave(time: number, amount: number = 1.0): { x: number; y: number; rot: number } {
    if (amount <= 0) return { x: 0, y: 0, rot: 0 };
    // Continuous harmonic frequencies
    const x = Math.sin(time * 18.0) * 0.8 * amount + Math.cos(time * 31.0) * 0.4 * amount;
    const y = Math.cos(time * 24.0) * 1.2 * amount + Math.sin(time * 42.0) * 0.5 * amount;
    const rot = Math.sin(time * 12.0) * 0.05 * amount;
    return { x, y, rot };
  }

  /**
   * Handheld Camera Shake (Perlin-style smooth organic motion)
   */
  public static calculateHandheldShake(time: number, intensity: number = 1.0): { x: number; y: number; rot: number } {
    if (intensity <= 0) return { x: 0, y: 0, rot: 0 };
    const x = (Math.sin(time * 2.3) + Math.sin(time * 5.7) * 0.5) * 8 * intensity;
    const y = (Math.cos(time * 1.9) + Math.cos(time * 4.3) * 0.5) * 6 * intensity;
    const rot = Math.sin(time * 2.1) * 0.8 * intensity;
    return { x, y, rot };
  }

  /**
   * 35mm Light Leak & Film Burn
   */
  public static renderLightLeak(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    time: number,
    intensity: number = 0.7
  ) {
    if (intensity <= 0) return;

    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    ctx.globalAlpha = Math.min(1.0, (Math.sin(time * 2) * 0.3 + 0.7) * intensity);

    const sweepX = (Math.sin(time * 1.5) * 0.3 + 0.5) * width;
    const grad = ctx.createRadialGradient(sweepX, 0, 50, sweepX, height * 0.6, width * 0.6);
    grad.addColorStop(0, 'rgba(255, 140, 0, 0.9)');
    grad.addColorStop(0.3, 'rgba(255, 60, 0, 0.6)');
    grad.addColorStop(0.7, 'rgba(180, 0, 100, 0.25)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    ctx.restore();
  }
}
