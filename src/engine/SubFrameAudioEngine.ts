import { TimelineClip } from '../types/fcp';

/**
 * Final Cut Pro Sub-Frame Audio Editing Engine
 * Delivers 48,000 Hz sample-accurate audio calculations (1/100th to 1/2000th of a video frame)
 * and audio detachment mechanics (Shift+Cmd+S).
 */
export class SubFrameAudioEngine {
  static readonly SAMPLE_RATE = 48000;

  /**
   * Converts video seconds to exact audio sample index
   */
  static secondsToSamples(seconds: number): number {
    return Math.round(seconds * this.SAMPLE_RATE);
  }

  /**
   * Micro-nudges audio clip offset by fractional frame increments
   */
  static nudgeAudioSubFrame(currentOffset: number, subFrameDelta: number, fps: number = 30): number {
    const frameDuration = 1 / fps;
    const subFrameStep = frameDuration / 100; // 1/100th of a frame
    return Math.max(0, currentOffset + subFrameDelta * subFrameStep);
  }

  /**
   * Detaches Audio from a Video clip (Shift+Cmd+S in Final Cut Pro)
   * Converts embedded audio into an independent connected audio clip
   */
  static detachAudio(clip: TimelineClip): { updatedVideoClip: TimelineClip; detachedAudioClip: TimelineClip } {
    const audioClipId = `audio-detached-${clip.id}-${Date.now()}`;

    const detachedAudioClip: TimelineClip = {
      id: audioClipId,
      name: `${clip.name} (Audio)`,
      assetId: clip.assetId,
      type: 'audio',
      role: 'dialogue',
      timelineIn: 0,
      duration: clip.duration,
      sourceIn: clip.sourceIn,
      sourceOut: clip.sourceOut,
      retiming: clip.retiming,
      kenBurns: { enabled: false, start: { x: 0, y: 0, scale: 1 }, end: { x: 0, y: 0, scale: 1 } },
      smartConform: { enabled: false, targetAspectRatio: '16:9', trackingFocusX: 0 },
      spatialConform: 'fit',
      volume: clip.volume,
      pan: clip.pan,
      muted: false,
      dsp: { ...clip.dsp },
      opacity: 1,
      blendMode: 'normal',
      transform: { posX: 0, posY: 0, scale: 1, rotation: 0, anchorX: 0.5, anchorY: 0.5 },
      colorGrading: clip.colorGrading,
      effects: [],
      keyframes: {},
      connectedClips: [],
      lane: -1,
      anchorOffset: 0,
    };

    const updatedVideoClip: TimelineClip = {
      ...clip,
      muted: true, // Mute original embedded audio since it's now detached
      connectedClips: [...(clip.connectedClips || []), detachedAudioClip],
    };

    return { updatedVideoClip, detachedAudioClip };
  }
}
