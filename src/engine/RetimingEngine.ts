import { RetimingProps } from '../types/fcp';

/**
 * Final Cut Pro Retiming & Variable Speed Engine
 * Computes source media timestamps, reverse scrubbing, and optical flow frame blending.
 */
export class RetimingEngine {
  /**
   * Computes the exact source media seek time taking into account speed and reverse direction
   */
  static calculateSourceTime(
    sourceIn: number,
    sourceOut: number,
    progressInClip: number,
    props: RetimingProps
  ): number {
    const speed = props.speed || 1.0;

    if (props.reverse) {
      const elapsed = progressInClip * speed;
      return Math.max(sourceIn, sourceOut - elapsed);
    } else {
      const elapsed = progressInClip * speed;
      return Math.min(sourceOut, sourceIn + elapsed);
    }
  }

  /**
   * Optical Flow / Frame Blending simulation when slowing down footage (< 100% speed)
   */
  static shouldApplyFrameBlend(props: RetimingProps): boolean {
    return props.opticalFlow && (props.speed < 1.0);
  }
}
