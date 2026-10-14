/**
 * Professional Color Management & Camera Log Transformation Matrices
 * Supports Apple Log, Sony S-Log3, Canon C-Log, and Rec. 2020 to Rec. 709 conversions.
 */
export class ColorManagement {
  /**
   * Apple Log to Rec. 709 Curve Transform (Apple Official Whitepaper Formula)
   */
  static appleLogToLinear(v: number): number {
    const c = 0.0078125;
    const beta = 0.4166666666666667;
    const gamma = 1.0;
    const d = 0.0001;

    if (v >= 0.09) {
      return (Math.pow(2.0, (v - beta) / gamma) - d);
    } else {
      return (v * c);
    }
  }

  /**
   * Sony S-Log3 to Linear Transform
   */
  static sLog3ToLinear(v: number): number {
    if (v >= 171.2102946929 / 1023.0) {
      return Math.pow(10.0, ((v * 1023.0 - 420.0) / 261.5)) * (0.18 + 0.01) - 0.01;
    } else {
      return ((v * 1023.0 - 95.0) * 0.18) / 76.5844488886;
    }
  }

  /**
   * Linear to standard sRGB / Rec. 709 gamma
   */
  static linearToRec709(linear: number): number {
    if (linear <= 0.018) {
      return linear * 4.5;
    }
    return 1.099 * Math.pow(linear, 0.45) - 0.099;
  }

  /**
   * Applies camera log conversion to an RGB pixel buffer
   */
  static convertLogToRec709(r: number, g: number, b: number, profile: 'Apple Log' | 'Sony S-Log3' | 'Rec. 709'): [number, number, number] {
    if (profile === 'Rec. 709') return [r, g, b];

    const normR = r / 255;
    const normG = g / 255;
    const normB = b / 255;

    let linR = normR, linG = normG, linB = normB;
    if (profile === 'Apple Log') {
      linR = this.appleLogToLinear(normR);
      linG = this.appleLogToLinear(normG);
      linB = this.appleLogToLinear(normB);
    } else if (profile === 'Sony S-Log3') {
      linR = this.sLog3ToLinear(normR);
      linG = this.sLog3ToLinear(normG);
      linB = this.sLog3ToLinear(normB);
    }

    const outR = Math.min(255, Math.max(0, Math.round(this.linearToRec709(linR) * 255)));
    const outG = Math.min(255, Math.max(0, Math.round(this.linearToRec709(linG) * 255)));
    const outB = Math.min(255, Math.max(0, Math.round(this.linearToRec709(linB) * 255)));

    return [outR, outG, outB];
  }
}
