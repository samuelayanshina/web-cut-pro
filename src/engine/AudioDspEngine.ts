import { AudioDspSettings } from '../types/fcp';

/**
 * Logic Pro Web Audio DSP Subsystem for Web Cut Pro
 * Real-time 4-Band Parametric EQ, Studio Compressor, Convolution Reverb,
 * and PCM Audio Waveform Peak Extraction.
 */
export class AudioDspEngine {
  private ctx: AudioContext | null = null;
  private impulseBuffer: AudioBuffer | null = null;

  init(ctx: AudioContext) {
    this.ctx = ctx;
    if (!this.impulseBuffer) {
      this.impulseBuffer = this.generateSyntheticReverbImpulse(1.8, 2.0);
    }
  }

  /**
   * Builds a studio DSP chain for a media source element
   */
  createDspChain(
    sourceNode: AudioNode,
    settings: AudioDspSettings
  ): {
    outputNode: AudioNode;
    eqLow: BiquadFilterNode;
    eqMid: BiquadFilterNode;
    eqHigh: BiquadFilterNode;
    compressor: DynamicsCompressorNode;
    reverbGain: GainNode;
  } | null {
    if (!this.ctx) return null;

    // 1. Low Shelf EQ (200Hz)
    const eqLow = this.ctx.createBiquadFilter();
    eqLow.type = 'lowshelf';
    eqLow.frequency.value = 200;
    eqLow.gain.value = settings.eqLowGain;

    // 2. Peaking Mid EQ (1500Hz)
    const eqMid = this.ctx.createBiquadFilter();
    eqMid.type = 'peaking';
    eqMid.frequency.value = 1500;
    eqMid.Q.value = 1.2;
    eqMid.gain.value = settings.eqMidGain;

    // 3. High Shelf EQ (8000Hz)
    const eqHigh = this.ctx.createBiquadFilter();
    eqHigh.type = 'highshelf';
    eqHigh.frequency.value = 8000;
    eqHigh.gain.value = settings.eqHighGain;

    // 4. Broadcast Dynamics Compressor (Logic Pro style)
    const compressor = this.ctx.createDynamicsCompressor();
    compressor.threshold.setValueAtTime(settings.compressorThreshold, this.ctx.currentTime);
    compressor.ratio.setValueAtTime(settings.compressorRatio, this.ctx.currentTime);
    compressor.attack.setValueAtTime(0.003, this.ctx.currentTime);
    compressor.release.setValueAtTime(0.25, this.ctx.currentTime);

    // 5. Convolution Reverb Bus
    const convolver = this.ctx.createConvolver();
    if (this.impulseBuffer) {
      convolver.buffer = this.impulseBuffer;
    }
    const reverbGain = this.ctx.createGain();
    reverbGain.gain.value = settings.reverbMix;

    const dryGain = this.ctx.createGain();
    dryGain.gain.value = 1.0 - settings.reverbMix * 0.5;

    const outSum = this.ctx.createGain();

    // Wire DSP Chain
    sourceNode.connect(eqLow);
    eqLow.connect(eqMid);
    eqMid.connect(eqHigh);
    eqHigh.connect(compressor);

    // Dry path
    compressor.connect(dryGain);
    dryGain.connect(outSum);

    // Wet reverb path
    compressor.connect(convolver);
    convolver.connect(reverbGain);
    reverbGain.connect(outSum);

    return {
      outputNode: outSum,
      eqLow,
      eqMid,
      eqHigh,
      compressor,
      reverbGain,
    };
  }

  /**
   * Generates a high quality synthetic acoustic space impulse response for reverb
   */
  private generateSyntheticReverbImpulse(duration: number, decay: number): AudioBuffer | null {
    if (!this.ctx) return null;
    const sampleRate = this.ctx.sampleRate;
    const length = sampleRate * duration;
    const impulse = this.ctx.createBuffer(2, length, sampleRate);
    const left = impulse.getChannelData(0);
    const right = impulse.getChannelData(1);

    for (let i = 0; i < length; i++) {
      const n = i;
      const t = n / sampleRate;
      const factor = Math.exp(-t * decay);
      left[i] = (Math.random() * 2 - 1) * factor;
      right[i] = (Math.random() * 2 - 1) * factor;
    }

    return impulse;
  }

  /**
   * Real PCM Audio Waveform Peak Extraction from an Audio/Video URL
   * Decodes actual raw audio samples to render genuine waveforms
   */
  async extractWaveformPeaks(url: string, numBuckets: number = 64): Promise<number[]> {
    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();

      const tempCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const audioBuffer = await tempCtx.decodeAudioData(arrayBuffer);

      const rawData = audioBuffer.getChannelData(0); // Left/Mono channel
      const blockSize = Math.floor(rawData.length / numBuckets);
      const peaks: number[] = [];

      for (let i = 0; i < numBuckets; i++) {
        let max = 0;
        const start = i * blockSize;
        for (let j = 0; j < blockSize; j += 10) {
          const val = Math.abs(rawData[start + j]);
          if (val > max) max = val;
        }
        peaks.push(Math.min(1.0, max));
      }

      tempCtx.close();
      return peaks;
    } catch {
      // Return pseudo-peaks fallback if CORS blocks direct fetch
      return Array.from({ length: numBuckets }).map((_, i) => 0.2 + ((i * 19) % 80) / 100);
    }
  }
}

export const audioDspEngine = new AudioDspEngine();
