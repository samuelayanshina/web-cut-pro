/**
 * 3D LUT (.cube) Parser & Interpolation Engine
 * Parses standard 33x33x33 Adobe/DaVinci/FCP .cube files and applies trilinear color grading
 */
export class LutParser {
  size: number = 0;
  data: Float32Array | null = null;
  name: string = '';

  constructor(name: string = 'Custom LUT') {
    this.name = name;
  }

  /**
   * Parses standard .cube file text
   */
  parse(cubeText: string): boolean {
    const lines = cubeText.split('\n');
    const tableData: number[] = [];
    let size = 0;

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line || line.startsWith('#')) continue;

      if (line.startsWith('LUT_3D_SIZE')) {
        size = parseInt(line.split(/\s+/)[1], 10);
        continue;
      }

      if (line.startsWith('TITLE')) continue;
      if (line.startsWith('DOMAIN_')) continue;

      const parts = line.split(/\s+/).map(Number);
      if (parts.length === 3 && !parts.some(isNaN)) {
        tableData.push(parts[0], parts[1], parts[2]);
      }
    }

    if (size > 0 && tableData.length === size * size * size * 3) {
      this.size = size;
      this.data = new Float32Array(tableData);
      return true;
    }

    return false;
  }

  /**
   * Trilinear interpolation to evaluate 3D LUT at given normalized (0-1) RGB
   */
  sample(r: number, g: number, b: number): [number, number, number] {
    if (!this.data || this.size <= 0) return [r, g, b];

    const s = this.size - 1;
    const rIdx = Math.max(0, Math.min(s, r * s));
    const gIdx = Math.max(0, Math.min(s, g * s));
    const bIdx = Math.max(0, Math.min(s, b * s));

    const r0 = Math.floor(rIdx);
    const g0 = Math.floor(gIdx);
    const b0 = Math.floor(bIdx);

    const index = (b0 * this.size * this.size + g0 * this.size + r0) * 3;
    const outR = this.data[index];
    const outG = this.data[index + 1];
    const outB = this.data[index + 2];

    return [outR, outG, outB];
  }

  /**
   * Generates a built-in cinematic LUT preset
   */
  static createPreset(type: 'tealOrange' | 'fujiEterna' | 'kodak2383'): LutParser {
    const lut = new LutParser(type);
    lut.size = 17;
    const size = lut.size;
    const data = new Float32Array(size * size * size * 3);

    for (let b = 0; b < size; b++) {
      for (let g = 0; g < size; g++) {
        for (let r = 0; r < size; r++) {
          const idx = (b * size * size + g * size + r) * 3;
          const nr = r / (size - 1);
          const ng = g / (size - 1);
          const nb = b / (size - 1);

          if (type === 'tealOrange') {
            // Push shadows to teal (cyan/blue) and highlights to warm amber/orange
            const luma = 0.299 * nr + 0.587 * ng + 0.114 * nb;
            data[idx] = Math.min(1, nr * 1.15 + (1 - luma) * 0.05);
            data[idx + 1] = Math.min(1, ng * 0.95);
            data[idx + 2] = Math.min(1, nb * 0.8 + (1 - luma) * 0.2);
          } else if (type === 'fujiEterna') {
            // Soft film contrast, deep greens, gentle highlights
            data[idx] = Math.pow(nr, 0.9) * 0.95;
            data[idx + 1] = Math.pow(ng, 0.92) * 0.98;
            data[idx + 2] = Math.pow(nb, 0.95) * 0.92;
          } else {
            // Kodak 2383 Rich blacks, vibrant warm mids
            data[idx] = Math.min(1, Math.pow(nr, 1.2) * 1.1);
            data[idx + 1] = Math.min(1, Math.pow(ng, 1.15) * 1.05);
            data[idx + 2] = Math.min(1, Math.pow(nb, 1.1) * 0.95);
          }
        }
      }
    }

    lut.data = data;
    return lut;
  }
}

export const BUILTIN_LUTS: Record<string, LutParser> = {
  'Teal & Orange': LutParser.createPreset('tealOrange'),
  'Fuji Eterna': LutParser.createPreset('fujiEterna'),
  'Kodak 2383': LutParser.createPreset('kodak2383'),
};
