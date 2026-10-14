export type BehaviorType = 'none' | 'wiggle' | 'oscillate' | 'overshoot' | 'pulse';

export interface BehaviorProps {
  type: BehaviorType;
  rate: number; // Hz (frequency)
  amount: number; // Amplitude
}

/**
 * Apple Motion Parameter Behaviors Engine
 * Calculates continuous procedural transformations (Wiggle, Oscillate, Overshoot, Pulse)
 * without requiring manual keyframing.
 */
export class MotionBehaviors {
  public static evaluateBehavior(
    behavior: BehaviorProps | undefined,
    clipProgress: number
  ): { posX: number; posY: number; scale: number; rotation: number } {
    if (!behavior || behavior.type === 'none') {
      return { posX: 0, posY: 0, scale: 1, rotation: 0 };
    }

    const { type, rate = 2, amount = 1 } = behavior;

    switch (type) {
      case 'wiggle': {
        const x = (Math.sin(clipProgress * rate * 4.3) + Math.sin(clipProgress * rate * 9.7) * 0.5) * 12 * amount;
        const y = (Math.cos(clipProgress * rate * 3.7) + Math.cos(clipProgress * rate * 8.1) * 0.5) * 8 * amount;
        const rot = Math.sin(clipProgress * rate * 3.1) * 2 * amount;
        return { posX: x, posY: y, scale: 1, rotation: rot };
      }

      case 'oscillate': {
        const osc = Math.sin(clipProgress * rate * Math.PI * 2);
        return { posX: osc * 15 * amount, posY: 0, scale: 1, rotation: osc * 3 * amount };
      }

      case 'pulse': {
        const pulse = Math.sin(clipProgress * rate * Math.PI * 2);
        const scaleOffset = pulse * 0.08 * amount;
        return { posX: 0, posY: 0, scale: 1 + scaleOffset, rotation: 0 };
      }

      case 'overshoot': {
        // Elastic settling spring curve during first 1.2 seconds
        if (clipProgress > 1.5) {
          return { posX: 0, posY: 0, scale: 1, rotation: 0 };
        }
        const t = clipProgress / 1.5;
        // Damped harmonic oscillator
        const decay = Math.exp(-t * 5);
        const oscillation = Math.cos(t * rate * Math.PI * 4);
        const springFactor = 1 - decay * oscillation * amount;
        return { posX: 0, posY: 0, scale: Math.max(0, springFactor), rotation: 0 };
      }

      default:
        return { posX: 0, posY: 0, scale: 1, rotation: 0 };
    }
  }
}
