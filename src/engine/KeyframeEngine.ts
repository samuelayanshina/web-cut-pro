import { Keyframe, KeyframeTracks } from '../types/fcp';

/**
 * High-performance Keyframe Interpolation Engine
 * Evaluates parameter curves (bezier / ease / linear) at any timestamp
 */
export class KeyframeEngine {
  /**
   * Evaluates a track of numeric keyframes at a given time offset
   */
  static evaluateTrack(
    track: Keyframe<number>[] | undefined,
    currentTimeOffset: number,
    defaultValue: number
  ): number {
    if (!track || track.length === 0) return defaultValue;

    // Sort keyframes by time
    const sorted = [...track].sort((a, b) => a.timeOffset - b.timeOffset);

    // Before first keyframe
    if (currentTimeOffset <= sorted[0].timeOffset) {
      return sorted[0].value;
    }

    // After last keyframe
    if (currentTimeOffset >= sorted[sorted.length - 1].timeOffset) {
      return sorted[sorted.length - 1].value;
    }

    // Between two keyframes
    for (let i = 0; i < sorted.length - 1; i++) {
      const k1 = sorted[i];
      const k2 = sorted[i + 1];

      if (currentTimeOffset >= k1.timeOffset && currentTimeOffset <= k2.timeOffset) {
        const span = k2.timeOffset - k1.timeOffset;
        if (span <= 0) return k1.value;

        const t = (currentTimeOffset - k1.timeOffset) / span;
        const easedT = this.applyEasing(t, k1.easing);
        return k1.value + (k2.value - k1.value) * easedT;
      }
    }

    return defaultValue;
  }

  /**
   * Interpolates an entire KeyframeTracks set at time offset
   */
  static evaluateClipTransformAndOpacity(
    tracks: KeyframeTracks | undefined,
    offset: number,
    base: { posX: number; posY: number; scale: number; opacity: number; volume: number }
  ) {
    if (!tracks) return base;

    return {
      posX: this.evaluateTrack(tracks.posX, offset, base.posX),
      posY: this.evaluateTrack(tracks.posY, offset, base.posY),
      scale: this.evaluateTrack(tracks.scale, offset, base.scale),
      opacity: this.evaluateTrack(tracks.opacity, offset, base.opacity),
      volume: this.evaluateTrack(tracks.volume, offset, base.volume),
    };
  }

  private static applyEasing(
    t: number,
    easing: 'linear' | 'easeIn' | 'easeOut' | 'easeInOut'
  ): number {
    switch (easing) {
      case 'easeIn':
        return t * t * t;
      case 'easeOut':
        return 1 - Math.pow(1 - t, 3);
      case 'easeInOut':
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      case 'linear':
      default:
        return t;
    }
  }
}
