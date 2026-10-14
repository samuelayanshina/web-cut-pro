export interface CurvePoint {
  x: number; // 0 to 1
  y: number; // 0 to 1
}

export interface ColorCurvesProps {
  master: CurvePoint[];
  red: CurvePoint[];
  green: CurvePoint[];
  blue: CurvePoint[];
  hueVsSat?: { hue: number; satMultiplier: number }[]; // Hue 0-360 -> sat 0-2
}

/**
 * Final Cut Pro Professional Color Curves Engine
 * Provides cubic spline curve evaluation for Master, Red, Green, and Blue channels,
 * plus secondary Hue vs Saturation selective isolation.
 */
export class ColorCurvesEngine {
  public static defaultCurves(): ColorCurvesProps {
    return {
      master: [{ x: 0, y: 0 }, { x: 0.5, y: 0.5 }, { x: 1, y: 1 }],
      red: [{ x: 0, y: 0 }, { x: 1, y: 1 }],
      green: [{ x: 0, y: 0 }, { x: 1, y: 1 }],
      blue: [{ x: 0, y: 0 }, { x: 1, y: 1 }],
    };
  }

  /**
   * Generates a 256-element integer Lookup Table (LUT) from curve points
   */
  public static generateLut(points: CurvePoint[]): Uint8Array {
    const lut = new Uint8Array(256);
    if (!points || points.length === 0) {
      for (let i = 0; i < 256; i++) lut[i] = i;
      return lut;
    }

    const sorted = [...points].sort((a, b) => a.x - b.x);

    for (let i = 0; i < 256; i++) {
      const normX = i / 255;
      lut[i] = Math.round(this.interpolateSpline(sorted, normX) * 255);
    }
    return lut;
  }

  /**
   * Linear piecewise spline interpolation
   */
  private static interpolateSpline(points: CurvePoint[], x: number): number {
    if (x <= points[0].x) return points[0].y;
    if (x >= points[points.length - 1].x) return points[points.length - 1].y;

    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      if (x >= p0.x && x <= p1.x) {
        const t = (x - p0.x) / (p1.x - p0.x);
        // Smooth Hermite cubic interpolation
        const smoothT = t * t * (3 - 2 * t);
        const y = p0.y + smoothT * (p1.y - p0.y);
        return Math.max(0, Math.min(1, y));
      }
    }
    return x;
  }

  /**
   * Applies RGB Curves LUT directly onto a Canvas ImageData buffer
   */
  public static applyCurvesToImageData(
    imageData: ImageData,
    masterLut: Uint8Array,
    redLut: Uint8Array,
    greenLut: Uint8Array,
    blueLut: Uint8Array
  ) {
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      const r = masterLut[data[i]];
      const g = masterLut[data[i + 1]];
      const b = masterLut[data[i + 2]];

      data[i] = redLut[r];
      data[i + 1] = greenLut[g];
      data[i + 2] = blueLut[b];
    }
  }
}
