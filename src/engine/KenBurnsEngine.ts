import { KenBurnsProps } from '../types/fcp';

/**
 * Final Cut Pro Ken Burns Pan & Zoom Engine
 * Smoothly interpolates camera positioning, framing, and zoom between Start and End viewports.
 */
export class KenBurnsEngine {
  /**
   * Calculates transform matrix offset for the current playback progress (0.0 to 1.0)
   */
  static evaluate(
    props: KenBurnsProps,
    progress: number,
    width: number,
    height: number
  ): { posX: number; posY: number; scale: number } {
    if (!props.enabled) {
      return { posX: 0, posY: 0, scale: 1.0 };
    }

    // Smooth cubic ease-in-out
    const t = progress < 0.5 ? 2 * progress * progress : -1 + (4 - 2 * progress) * progress;

    const startX = (props.start.x / 100) * width;
    const startY = (props.start.y / 100) * height;
    const startScale = props.start.scale;

    const endX = (props.end.x / 100) * width;
    const endY = (props.end.y / 100) * height;
    const endScale = props.end.scale;

    const posX = startX + (endX - startX) * t;
    const posY = startY + (endY - startY) * t;
    const scale = startScale + (endScale - startScale) * t;

    return { posX, posY, scale };
  }
}
