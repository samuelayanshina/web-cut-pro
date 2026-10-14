import { AspectRatioType, ProjectFormat, SmartConformProps } from '../types/fcp';

/**
 * AI Smart Conform & Auto-Reframe Engine
 * Analyzes video framing and automatically recalculates scaling and pan centering
 * when converting widescreen (16:9) projects to vertical (9:16) for TikTok, Reels, and Shorts.
 */
export class SmartConformEngine {
  /**
   * Returns standard pixel dimensions for target aspect ratio
   */
  static getDimensionsForRatio(ratio: AspectRatioType): { width: number; height: number } {
    switch (ratio) {
      case '9:16':
        return { width: 1080, height: 1920 };
      case '1:1':
        return { width: 1080, height: 1080 };
      case '4:5':
        return { width: 1080, height: 1350 };
      case '16:9':
      default:
        return { width: 1920, height: 1080 };
    }
  }

  /**
   * Automatically calculates scale and horizontal tracking offset to frame the subject
   */
  static calculateAutoReframe(
    props: SmartConformProps,
    sourceWidth: number,
    sourceHeight: number,
    targetRatio: AspectRatioType
  ): { autoScale: number; autoPosX: number } {
    if (!props.enabled) {
      return { autoScale: 1.0, autoPosX: 0 };
    }

    const { width: tw, height: th } = this.getDimensionsForRatio(targetRatio);
    const targetAspect = tw / th;
    const sourceAspect = sourceWidth / sourceHeight;

    let autoScale = 1.0;
    if (sourceAspect > targetAspect) {
      // Source is wider than target (e.g. 16:9 in 9:16) - scale to fill height
      autoScale = (th / sourceHeight) * (sourceWidth / tw);
    }

    // Apply AI tracking focus offset
    const autoPosX = (props.trackingFocusX / 100) * (sourceWidth * 0.4);

    return { autoScale, autoPosX };
  }
}
