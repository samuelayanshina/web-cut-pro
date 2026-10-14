/**
 * Real-Time Broadcast Video Scopes Engine
 * Renders Luma Waveform (IRE 0-100), RGB Parade, Vectorscope with Skin-Tone line,
 * and Histogram directly onto target display canvas.
 */
export class ScopesEngine {
  /**
   * Renders the selected Scope mode from source canvas pixels
   */
  static renderScope(
    sourceCanvas: HTMLCanvasElement,
    scopeCanvas: HTMLCanvasElement,
    mode: 'waveform' | 'parade' | 'vectorscope' | 'histogram'
  ) {
    const sCtx = sourceCanvas.getContext('2d');
    const dCtx = scopeCanvas.getContext('2d');
    if (!sCtx || !dCtx) return;

    const sw = sourceCanvas.width;
    const sh = sourceCanvas.height;
    const dw = scopeCanvas.width;
    const dh = scopeCanvas.height;

    // Downsample for ultra-fast 60fps scope rendering
    const sampleW = 240;
    const sampleH = 135;

    // Offscreen downscaled canvas
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = sampleW;
    tempCanvas.height = sampleH;
    const tCtx = tempCanvas.getContext('2d');
    if (!tCtx) return;

    tCtx.drawImage(sourceCanvas, 0, 0, sampleW, sampleH);
    const imgData = tCtx.getImageData(0, 0, sampleW, sampleH);
    const pixels = imgData.data;

    // Clear Scope Background
    dCtx.fillStyle = '#0a0a0a';
    dCtx.fillRect(0, 0, dw, dh);

    if (mode === 'waveform') {
      this.drawWaveform(dCtx, pixels, sampleW, sampleH, dw, dh);
    } else if (mode === 'parade') {
      this.drawRGBParade(dCtx, pixels, sampleW, sampleH, dw, dh);
    } else if (mode === 'vectorscope') {
      this.drawVectorscope(dCtx, pixels, sampleW, sampleH, dw, dh);
    } else if (mode === 'histogram') {
      this.drawHistogram(dCtx, pixels, sampleW, sampleH, dw, dh);
    }
  }

  // 1. Luma Waveform (IRE 0 to 100)
  private static drawWaveform(
    ctx: CanvasRenderingContext2D,
    pixels: Uint8ClampedArray,
    sw: number,
    sh: number,
    dw: number,
    dh: number
  ) {
    // Draw IRE grid lines (0, 20, 40, 60, 80, 100)
    ctx.strokeStyle = '#262626';
    ctx.lineWidth = 1;
    [0, 25, 50, 75, 100].forEach((ire) => {
      const y = dh - (ire / 100) * dh;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(dw, y);
      ctx.stroke();

      ctx.fillStyle = '#555555';
      ctx.font = '9px monospace';
      ctx.fillText(`${ire}`, 2, Math.max(9, y - 2));
    });

    // Plot Luma dots in phosphor green
    ctx.fillStyle = 'rgba(74, 222, 128, 0.25)'; // Emerald phosphor
    for (let x = 0; x < sw; x++) {
      const targetX = (x / sw) * dw;
      for (let y = 0; y < sh; y += 2) {
        const i = (y * sw + x) * 4;
        const r = pixels[i];
        const g = pixels[i + 1];
        const b = pixels[i + 2];
        const luma = 0.299 * r + 0.587 * g + 0.114 * b; // 0 to 255
        const targetY = dh - (luma / 255) * dh;

        ctx.fillRect(targetX, targetY, 1.5, 1.5);
      }
    }
  }

  // 2. RGB Parade (Red, Green, Blue columns)
  private static drawRGBParade(
    ctx: CanvasRenderingContext2D,
    pixels: Uint8ClampedArray,
    sw: number,
    sh: number,
    dw: number,
    dh: number
  ) {
    const colW = dw / 3;

    // Draw dividers
    ctx.strokeStyle = '#333333';
    ctx.strokeRect(0, 0, colW, dh);
    ctx.strokeRect(colW, 0, colW, dh);
    ctx.strokeRect(colW * 2, 0, colW, dh);

    // Labels
    ctx.font = '10px monospace';
    ctx.fillStyle = '#ef4444';
    ctx.fillText('RED', 4, 12);
    ctx.fillStyle = '#22c55e';
    ctx.fillText('GREEN', colW + 4, 12);
    ctx.fillStyle = '#3b82f6';
    ctx.fillText('BLUE', colW * 2 + 4, 12);

    for (let x = 0; x < sw; x++) {
      const relX = (x / sw) * colW;
      for (let y = 0; y < sh; y += 2) {
        const i = (y * sw + x) * 4;
        const r = pixels[i];
        const g = pixels[i + 1];
        const b = pixels[i + 2];

        // Red column
        ctx.fillStyle = 'rgba(239, 68, 68, 0.3)';
        ctx.fillRect(relX, dh - (r / 255) * dh, 1.5, 1.5);

        // Green column
        ctx.fillStyle = 'rgba(34, 197, 94, 0.3)';
        ctx.fillRect(colW + relX, dh - (g / 255) * dh, 1.5, 1.5);

        // Blue column
        ctx.fillStyle = 'rgba(59, 130, 246, 0.3)';
        ctx.fillRect(colW * 2 + relX, dh - (b / 255) * dh, 1.5, 1.5);
      }
    }
  }

  // 3. Vectorscope (Polar color distribution with Skin-Tone I-Line)
  private static drawVectorscope(
    ctx: CanvasRenderingContext2D,
    pixels: Uint8ClampedArray,
    sw: number,
    sh: number,
    dw: number,
    dh: number
  ) {
    const cx = dw / 2;
    const cy = dh / 2;
    const radius = Math.min(cx, cy) - 10;

    // Draw Polar Circle & Crosshairs
    ctx.strokeStyle = '#262626';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(cx, cy, radius * 0.75, 0, Math.PI * 2); // 75% target ring
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(cx - radius, cy);
    ctx.lineTo(cx + radius, cy);
    ctx.moveTo(cx, cy - radius);
    ctx.lineTo(cx, cy + radius);
    ctx.stroke();

    // Skin Tone Indicator Line (~57 degrees / 11 o'clock)
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.7)';
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    const skinAngle = -Math.PI * 0.68;
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(skinAngle) * radius, cy + Math.sin(skinAngle) * radius);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = '#f59e0b';
    ctx.font = '8px monospace';
    ctx.fillText('SKIN TONE', cx + Math.cos(skinAngle) * radius + 2, cy + Math.sin(skinAngle) * radius);

    // Plot U/V color chroma points
    ctx.fillStyle = 'rgba(56, 189, 248, 0.25)';
    for (let i = 0; i < pixels.length; i += 8) {
      const r = pixels[i];
      const g = pixels[i + 1];
      const b = pixels[i + 2];

      // YUV conversion
      const u = -0.14713 * r - 0.28886 * g + 0.436 * b;
      const v = 0.615 * r - 0.51499 * g - 0.10001 * b;

      const px = cx + (u / 128) * radius * 1.5;
      const py = cy - (v / 128) * radius * 1.5;

      ctx.fillRect(px, py, 1.5, 1.5);
    }
  }

  // 4. Histogram
  private static drawHistogram(
    ctx: CanvasRenderingContext2D,
    pixels: Uint8ClampedArray,
    sw: number,
    sh: number,
    dw: number,
    dh: number
  ) {
    const bins = 128;
    const histR = new Array(bins).fill(0);
    const histG = new Array(bins).fill(0);
    const histB = new Array(bins).fill(0);

    for (let i = 0; i < pixels.length; i += 4) {
      const bR = Math.floor((pixels[i] / 256) * bins);
      const bG = Math.floor((pixels[i + 1] / 256) * bins);
      const bB = Math.floor((pixels[i + 2] / 256) * bins);
      histR[bR]++;
      histG[bG]++;
      histB[bB]++;
    }

    const maxVal = Math.max(...histR, ...histG, ...histB, 1);
    const binW = dw / bins;

    for (let i = 0; i < bins; i++) {
      const hR = (histR[i] / maxVal) * dh;
      const hG = (histG[i] / maxVal) * dh;
      const hB = (histB[i] / maxVal) * dh;

      ctx.fillStyle = 'rgba(239, 68, 68, 0.4)';
      ctx.fillRect(i * binW, dh - hR, binW, hR);

      ctx.fillStyle = 'rgba(34, 197, 94, 0.4)';
      ctx.fillRect(i * binW, dh - hG, binW, hG);

      ctx.fillStyle = 'rgba(59, 130, 246, 0.4)';
      ctx.fillRect(i * binW, dh - hB, binW, hB);
    }
  }
}
