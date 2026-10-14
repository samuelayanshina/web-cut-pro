/**
 * SMPTE Timecode and Rational Time utilities for Web Cut Pro
 */

export class Timecode {
  static secondsToFrames(seconds: number, fps: number): number {
    return Math.round(seconds * fps);
  }

  static framesToSeconds(frames: number, fps: number): number {
    return frames / fps;
  }

  /**
   * Formats seconds into standard SMPTE Timecode: HH:MM:SS:FF
   */
  static formatSMPTE(seconds: number, fps: number = 30): string {
    if (isNaN(seconds) || seconds < 0) seconds = 0;
    
    const totalFrames = Math.floor(seconds * fps);
    const frames = totalFrames % Math.round(fps);
    const totalSeconds = Math.floor(seconds);
    const s = totalSeconds % 60;
    const m = Math.floor(totalSeconds / 60) % 60;
    const h = Math.floor(totalSeconds / 3600);

    const pad = (n: number, z = 2) => ('00' + n).slice(-z);
    return `${pad(h)}:${pad(m)}:${pad(s)}:${pad(frames)}`;
  }

  /**
   * Formats seconds into human-readable duration like 00:04.12
   */
  static formatDuration(seconds: number): string {
    if (isNaN(seconds) || seconds < 0) seconds = 0;
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 100);
    const pad = (n: number) => ('00' + n).slice(-2);
    return `${pad(m)}:${pad(s)}.${pad(ms)}`;
  }

  /**
   * Parses standard SMPTE timecode (HH:MM:SS:FF) into seconds
   */
  static parseSMPTE(tc: string, fps: number = 30): number {
    const parts = tc.split(':').map(Number);
    if (parts.length !== 4 || parts.some(isNaN)) return 0;
    const [h, m, s, f] = parts;
    const totalSeconds = h * 3600 + m * 60 + s + f / fps;
    return totalSeconds;
  }

  /**
   * Apple CMTime / FCPXML Rational Time format e.g. "1001/30000s" or "50s"
   */
  static toRationalTime(seconds: number, fps: number = 30): string {
    const roundedFps = Math.round(fps);
    if (fps === 23.976 || fps === 29.97 || fps === 59.94) {
      const timescale = 30000;
      const units = Math.round(seconds * timescale);
      return `${units}/${timescale}s`;
    }
    const frames = Math.round(seconds * roundedFps);
    return `${frames}/${roundedFps}s`;
  }
}
