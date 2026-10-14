import { TimelineClip } from '../types/fcp';

/**
 * The Magnetic Timeline Engine
 * Implements Final Cut Pro's automatic rippling, spine gaplessness,
 * anchored secondary storylines, and blade/trim mechanics.
 */
export class MagneticTimelineEngine {
  /**
   * Recalculates timelineIn for every clip on the primary spine sequentially,
   * guaranteeing zero accidental gaps and automatic magnetic snapping.
   */
  static recalculateSpine(spine: TimelineClip[]): TimelineClip[] {
    let currentPosition = 0;
    return spine.map((clip) => {
      const updatedClip: TimelineClip = {
        ...clip,
        timelineIn: currentPosition,
      };
      currentPosition += clip.duration;
      return updatedClip;
    });
  }

  /**
   * Calculates total project duration based on the primary spine
   */
  static getTotalDuration(spine: TimelineClip[]): number {
    return spine.reduce((acc, clip) => acc + clip.duration, 0);
  }

  /**
   * Find clip on spine at a given timestamp
   */
  static getClipAtTime(spine: TimelineClip[], time: number): { clip: TimelineClip; index: number } | null {
    let cumulative = 0;
    for (let i = 0; i < spine.length; i++) {
      const clip = spine[i];
      if (time >= cumulative && time < cumulative + clip.duration) {
        return { clip, index: i };
      }
      cumulative += clip.duration;
    }
    // If exactly at the end
    if (spine.length > 0 && Math.abs(time - cumulative) < 0.001) {
      return { clip: spine[spine.length - 1], index: spine.length - 1 };
    }
    return null;
  }

  /**
   * Magnetic Blade Tool (B / Cmd+B in FCP)
   * Splits a clip cleanly at the given time, apportioning sourceIn, sourceOut,
   * and properly re-anchoring connected clips.
   */
  static bladeClipAtTime(spine: TimelineClip[], splitTime: number): TimelineClip[] {
    const target = this.getClipAtTime(spine, splitTime);
    if (!target) return spine;

    const { clip, index } = target;
    const offsetFromClipStart = splitTime - clip.timelineIn;

    // Do not split if too close to edges (minimum 0.1s)
    if (offsetFromClipStart < 0.1 || offsetFromClipStart > clip.duration - 0.1) {
      return spine;
    }

    const firstDuration = offsetFromClipStart;
    const secondDuration = clip.duration - offsetFromClipStart;

    // Partition connected clips between the two halves
    const firstConnected: TimelineClip[] = [];
    const secondConnected: TimelineClip[] = [];

    (clip.connectedClips || []).forEach((c) => {
      const cAnchor = c.anchorOffset || 0;
      if (cAnchor < firstDuration) {
        firstConnected.push(c);
      } else {
        secondConnected.push({
          ...c,
          anchorOffset: cAnchor - firstDuration,
        });
      }
    });

    const leftClip: TimelineClip = {
      ...clip,
      id: `${clip.id}_part1_${Date.now()}`,
      duration: firstDuration,
      sourceOut: clip.sourceIn + firstDuration,
      connectedClips: firstConnected,
    };

    const rightClip: TimelineClip = {
      ...clip,
      id: `${clip.id}_part2_${Date.now()}`,
      duration: secondDuration,
      sourceIn: clip.sourceIn + firstDuration,
      connectedClips: secondConnected,
    };

    const newSpine = [...spine];
    newSpine.splice(index, 1, leftClip, rightClip);
    return this.recalculateSpine(newSpine);
  }

  /**
   * Ripple Trim (T in FCP)
   * Adjusts the start or end of a clip. All downstream clips magnetically ripple!
   */
  static rippleTrimClip(
    spine: TimelineClip[],
    clipId: string,
    edge: 'start' | 'end',
    deltaSeconds: number
  ): TimelineClip[] {
    const index = spine.findIndex((c) => c.id === clipId);
    if (index === -1) return spine;

    const clip = spine[index];
    const minDuration = 0.2; // Minimum clip duration

    if (edge === 'end') {
      const newDuration = Math.max(minDuration, clip.duration + deltaSeconds);
      const updatedClip: TimelineClip = {
        ...clip,
        duration: newDuration,
        sourceOut: clip.sourceIn + newDuration,
      };
      const newSpine = [...spine];
      newSpine[index] = updatedClip;
      return this.recalculateSpine(newSpine);
    } else {
      // Trimming start edge
      const proposedChange = Math.min(clip.duration - minDuration, deltaSeconds);
      const newDuration = clip.duration - proposedChange;
      const newSourceIn = Math.max(0, clip.sourceIn + proposedChange);

      const updatedClip: TimelineClip = {
        ...clip,
        duration: newDuration,
        sourceIn: newSourceIn,
        // Shift connected clips anchor offsets
        connectedClips: (clip.connectedClips || []).map((c) => ({
          ...c,
          anchorOffset: Math.max(0, (c.anchorOffset || 0) - proposedChange),
        })),
      };
      const newSpine = [...spine];
      newSpine[index] = updatedClip;
      return this.recalculateSpine(newSpine);
    }
  }

  /**
   * Delete a clip from the spine - magnetically closes the gap automatically!
   */
  static deleteClip(spine: TimelineClip[], clipId: string): TimelineClip[] {
    // Check if it is on the primary spine
    const isSpine = spine.some((c) => c.id === clipId);
    if (isSpine) {
      const newSpine = spine.filter((c) => c.id !== clipId);
      return this.recalculateSpine(newSpine);
    }

    // Check if it is a connected clip
    return spine.map((parent) => ({
      ...parent,
      connectedClips: (parent.connectedClips || []).filter((c) => c.id !== clipId),
    }));
  }

  /**
   * Magnetic Reordering: Drag a clip and drop it between other clips.
   */
  static reorderClip(spine: TimelineClip[], sourceIndex: number, targetIndex: number): TimelineClip[] {
    if (sourceIndex === targetIndex || sourceIndex < 0 || targetIndex < 0) return spine;
    const newSpine = [...spine];
    const [moved] = newSpine.splice(sourceIndex, 1);
    newSpine.splice(targetIndex, 0, moved);
    return this.recalculateSpine(newSpine);
  }

  /**
   * Insert an explicit Gap clip (Option-W in FCP)
   */
  static insertGapClip(spine: TimelineClip[], atIndex: number, duration: number = 3.0): TimelineClip[] {
    const gapClip: TimelineClip = {
      id: `gap_${Date.now()}`,
      name: 'Gap',
      assetId: '',
      type: 'gap',
      role: 'dialogue',
      timelineIn: 0,
      duration,
      sourceIn: 0,
      sourceOut: duration,
      retiming: { speed: 1, reverse: false, opticalFlow: false, preservePitch: true },
      kenBurns: { enabled: false, start: { x: 0, y: 0, scale: 1 }, end: { x: 0, y: 0, scale: 1 } },
      smartConform: { enabled: false, targetAspectRatio: '16:9', trackingFocusX: 0 },
      spatialConform: 'fit',
      volume: 0,
      pan: 0,
      muted: true,
      dsp: { eqLowGain: 0, eqMidGain: 0, eqHighGain: 0, eq10Bands: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], compressorThreshold: -24, compressorRatio: 2, reverbMix: 0, voiceIsolation: false, limiterCeiling: 0 },
      opacity: 0,
      blendMode: 'normal',
      transform: { posX: 0, posY: 0, scale: 1, rotation: 0, anchorX: 0.5, anchorY: 0.5 },
      colorGrading: {
        exposure: 0,
        contrast: 1,
        saturation: 1,
        temperature: 0,
        tint: 0,
        shadows: 0,
        midtones: 0,
        highlights: 0,
        wheels: {
          shadows: { hueX: 0, hueY: 0, luma: 0 },
          midtones: { hueX: 0, hueY: 0, luma: 0 },
          highlights: { hueX: 0, hueY: 0, luma: 0 },
          global: { hueX: 0, hueY: 0, luma: 0 },
        },
      },
      effects: [],
      keyframes: {},
      connectedClips: []
    };
    const newSpine = [...spine];
    newSpine.splice(atIndex, 0, gapClip);
    return this.recalculateSpine(newSpine);
  }

  /**
   * Snapping calculation: checks if a testTime is close to playhead or clip boundaries
   */
  static getSnapTime(
    spine: TimelineClip[],
    testTime: number,
    otherSnapPoints: number[] = [],
    tolerance: number = 0.15
  ): { snappedTime: number; isSnapped: boolean } {
    const snapPoints = [...otherSnapPoints];
    let cum = 0;
    snapPoints.push(0);
    for (const c of spine) {
      cum += c.duration;
      snapPoints.push(cum);
    }

    for (const pt of snapPoints) {
      if (Math.abs(testTime - pt) <= tolerance) {
        return { snappedTime: pt, isSnapped: true };
      }
    }
    return { snappedTime: testTime, isSnapped: false };
  }
}
