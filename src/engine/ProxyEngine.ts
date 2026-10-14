import { MediaAsset } from '../types/fcp';

/**
 * Background Proxy Generator & Media Cache Engine
 * Transcodes high-bitrate media into lightweight 720p editing proxies
 * for zero-lag editing, matching Final Cut Pro's proxy workflow.
 */
export class ProxyEngine {
  /**
   * Generates a lightweight proxy video stream using an offscreen canvas
   */
  static async generateProxy(
    sourceUrl: string,
    onProgress?: (pct: number) => void
  ): Promise<string> {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      video.crossOrigin = 'anonymous';
      video.src = sourceUrl;
      video.muted = true;

      video.onloadedmetadata = async () => {
        const targetWidth = 1280;
        const targetHeight = 720;
        const canvas = document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          resolve(sourceUrl);
          return;
        }

        // Use captureStream and MediaRecorder to render a lightweight proxy
        const stream = canvas.captureStream(24);
        const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp8')
          ? 'video/webm;codecs=vp8'
          : 'video/webm';

        const recorder = new MediaRecorder(stream, {
          mimeType,
          videoBitsPerSecond: 1500000, // 1.5 Mbps proxy
        });

        const chunks: Blob[] = [];
        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) chunks.push(e.data);
        };

        recorder.onstop = () => {
          const blob = new Blob(chunks, { type: mimeType });
          resolve(URL.createObjectURL(blob));
        };

        recorder.start();

        const duration = Math.min(video.duration, 15.0); // Proxy first 15 seconds
        const fps = 24;
        const totalFrames = Math.floor(duration * fps);
        let frame = 0;

        const processNext = () => {
          if (frame >= totalFrames) {
            recorder.stop();
            return;
          }
          video.currentTime = frame / fps;
          ctx.drawImage(video, 0, 0, targetWidth, targetHeight);
          frame++;
          if (onProgress) onProgress(Math.round((frame / totalFrames) * 100));
          setTimeout(processNext, 12);
        };

        processNext();
      };

      video.onerror = () => {
        resolve(sourceUrl);
      };
    });
  }

  /**
   * Resolves whether to use Original or Proxy URL for playback
   */
  static resolveAssetUrl(asset: MediaAsset, useProxy: boolean): string {
    if (useProxy && asset.proxyUrl) {
      return asset.proxyUrl;
    }
    return asset.url;
  }
}
