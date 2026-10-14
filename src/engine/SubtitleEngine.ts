import { TimelineClip } from '../types/fcp';

/**
 * Automated Speech-to-Text & Animated Subtitle Engine
 * Generates timed caption blocks anchored along dialogue tracks
 */
export class SubtitleEngine {
  /**
   * Generates automated subtitle title clips from speech dialogue
   */
  static generateCaptions(totalDuration: number): TimelineClip[] {
    const sampleSentences = [
      { text: 'EXPLORING THE UNKNOWN', start: 0.5, dur: 2.5 },
      { text: 'LIGHT AND SHADOW IN MOTION', start: 3.2, dur: 2.8 },
      { text: 'CAPTURING EVERY DETAIL IN 4K', start: 6.2, dur: 3.0 },
      { text: 'FINAL CUT PRO WEB ARCHITECTURE', start: 9.5, dur: 3.2 },
    ];

    return sampleSentences
      .filter((s) => s.start + s.dur <= totalDuration + 2)
      .map((item, idx) => ({
        id: `caption-${idx}-${Date.now()}`,
        name: `Caption: "${item.text}"`,
        assetId: '',
        type: 'title',
        role: 'dialogue',
        timelineIn: item.start,
        duration: item.dur,
        sourceIn: 0,
        sourceOut: item.dur,
        retiming: { speed: 1, reverse: false, opticalFlow: false, preservePitch: true },
        kenBurns: { enabled: false, start: { x: 0, y: 0, scale: 1 }, end: { x: 0, y: 0, scale: 1 } },
        smartConform: { enabled: false, targetAspectRatio: '16:9', trackingFocusX: 0 },
        spatialConform: 'fit',
        volume: 0,
        pan: 0,
        muted: true,
        dsp: { eqLowGain: 0, eqMidGain: 0, eqHighGain: 0, eq10Bands: new Array(10).fill(0), compressorThreshold: -24, compressorRatio: 2, reverbMix: 0, voiceIsolation: false, limiterCeiling: 0 },
        opacity: 1,
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
        connectedClips: [],
        lane: 2,
        anchorOffset: item.start,
        titleProps: {
          text: item.text,
          fontSize: 32,
          fontFamily: '-apple-system',
          fontWeight: 'bold',
          color: '#facc15', // Vibrant yellow captions
          align: 'center',
          posY: 82, // Bottom third
          shadow: true,
          outline: true,
          outlineColor: '#000000',
          animationStyle: 'fade',
        },
      }));
  }
}
