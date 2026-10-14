import { audioDspEngine } from './AudioDspEngine';
import { AudioDspSettings } from '../types/fcp';

/**
 * Web Audio Engine for Web Cut Pro
 * Handles master mixing, per-clip gain and stereo pan, Logic Pro DSP, and stereo VU meters
 */
export class AudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private analyserLeft: AnalyserNode | null = null;
  private analyserRight: AnalyserNode | null = null;
  private splitter: ChannelSplitterNode | null = null;
  private audioNodes: Map<
    string,
    {
      source: MediaElementAudioSourceNode;
      gain: GainNode;
      panner: StereoPannerNode;
      dspChain?: ReturnType<typeof audioDspEngine.createDspChain>;
    }
  > = new Map();

  init() {
    if (this.ctx) return;
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    this.ctx = new AudioCtx();

    audioDspEngine.init(this.ctx);

    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = 1.0;

    // Dual VU meters analysis
    this.splitter = this.ctx.createChannelSplitter(2);
    this.analyserLeft = this.ctx.createAnalyser();
    this.analyserRight = this.ctx.createAnalyser();

    this.analyserLeft.fftSize = 256;
    this.analyserRight.fftSize = 256;

    this.masterGain.connect(this.ctx.destination);
    this.masterGain.connect(this.splitter);

    this.splitter.connect(this.analyserLeft, 0);
    this.splitter.connect(this.analyserRight, 1);
  }

  resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setMasterVolume(volume: number) {
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(Math.max(0, volume), this.ctx.currentTime);
    }
  }

  /**
   * Registers or updates an audio track element with Logic Pro DSP chain
   */
  connectElement(
    id: string,
    element: HTMLMediaElement,
    volume: number = 1.0,
    pan: number = 0,
    dspSettings?: AudioDspSettings
  ) {
    this.init();
    if (!this.ctx || !this.masterGain) return;

    if (this.audioNodes.has(id)) {
      const nodes = this.audioNodes.get(id)!;
      nodes.gain.gain.value = volume;
      if (nodes.panner.pan) {
        nodes.panner.pan.value = pan;
      }
      if (nodes.dspChain && dspSettings) {
        nodes.dspChain.eqLow.gain.value = dspSettings.eqLowGain;
        nodes.dspChain.eqMid.gain.value = dspSettings.eqMidGain;
        nodes.dspChain.eqHigh.gain.value = dspSettings.eqHighGain;
        nodes.dspChain.compressor.threshold.value = dspSettings.compressorThreshold;
        nodes.dspChain.compressor.ratio.value = dspSettings.compressorRatio;
        nodes.dspChain.reverbGain.gain.value = dspSettings.reverbMix;
      }
      return;
    }

    try {
      const source = this.ctx.createMediaElementSource(element);
      const gain = this.ctx.createGain();
      gain.gain.value = volume;

      const panner = this.ctx.createStereoPanner();
      panner.pan.value = pan;

      let dspChain = undefined;
      if (dspSettings) {
        dspChain = audioDspEngine.createDspChain(source, dspSettings);
      }

      if (dspChain) {
        dspChain.outputNode.connect(gain);
      } else {
        source.connect(gain);
      }

      gain.connect(panner);
      panner.connect(this.masterGain);

      this.audioNodes.set(id, { source, gain, panner, dspChain: dspChain || undefined });
    } catch {
      // Element might already be hooked
    }
  }

  /**
   * Returns current peak volume levels for Left and Right channels in dB (-60dB to 0dB)
   */
  getLevels(): { leftDb: number; rightDb: number; peakClip: boolean } {
    if (!this.analyserLeft || !this.analyserRight) {
      return { leftDb: -60, rightDb: -60, peakClip: false };
    }

    const dataLeft = new Uint8Array(this.analyserLeft.frequencyBinCount);
    const dataRight = new Uint8Array(this.analyserRight.frequencyBinCount);

    this.analyserLeft.getByteTimeDomainData(dataLeft);
    this.analyserRight.getByteTimeDomainData(dataRight);

    let maxLeft = 0;
    let maxRight = 0;

    for (let i = 0; i < dataLeft.length; i++) {
      const valL = Math.abs((dataLeft[i] - 128) / 128);
      const valR = Math.abs((dataRight[i] - 128) / 128);
      if (valL > maxLeft) maxLeft = valL;
      if (valR > maxRight) maxRight = valR;
    }

    const toDb = (peak: number) => {
      if (peak < 0.001) return -60;
      return Math.max(-60, 20 * Math.log10(peak));
    };

    const leftDb = toDb(maxLeft);
    const rightDb = toDb(maxRight);
    const peakClip = leftDb >= -0.1 || rightDb >= -0.1;

    return { leftDb, rightDb, peakClip };
  }

  dispose() {
    if (this.ctx) {
      this.ctx.close();
      this.ctx = null;
    }
    this.audioNodes.clear();
  }
}

export const audioEngine = new AudioEngine();
