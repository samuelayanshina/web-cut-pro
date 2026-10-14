/**
 * AI Scene Cut Detector Engine
 * Analyzes frame-by-frame histogram deltas to automatically detect
 * camera cuts and split continuous footage into individual clips.
 */
export class SceneCutDetector {
  /**
   * Analyzes an HTMLVideoElement and finds cut timestamps
   */
  static async detectCuts(
    videoUrl: string,
    onProgress?: (pct: number) => void
  ): Promise<number[]> {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      video.crossOrigin = 'anonymous';
      video.src = videoUrl;
      video.muted = true;

      video.onloadedmetadata = async () => {
        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 36;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve([]);
          return;
        }

        const duration = Math.min(video.duration, 30.0);
        const step = 0.25; // 4 samples per second
        const totalSteps = Math.floor(duration / step);

        let previousHist: number[] | null = null;
        const detectedCutTimes: number[] = [];
        let currentStep = 0;

        const checkNextFrame = () => {
          if (currentStep >= totalSteps) {
            resolve(detectedCutTimes);
            return;
          }

          const time = currentStep * step;
          video.currentTime = time;

          video.onseeked = () => {
            ctx.drawImage(video, 0, 0, 64, 36);
            const data = ctx.getImageData(0, 0, 64, 36).data;

            // Generate 16-bin color histogram
            const hist = new Array(16).fill(0);
            for (let i = 0; i < data.length; i += 4) {
              const lum = Math.floor((data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114) / 16);
              hist[lum]++;
            }

            if (previousHist) {
              // Calculate histogram difference score
              let delta = 0;
              for (let h = 0; h < 16; h++) {
                delta += Math.abs(hist[h] - previousHist[h]);
              }

              // Threshold for shot transition
              if (delta > 750 && time > 0.5) {
                detectedCutTimes.push(Math.round(time * 10) / 10);
              }
            }

            previousHist = hist;
            currentStep++;
            if (onProgress) onProgress(Math.round((currentStep / totalSteps) * 100));
            setTimeout(checkNextFrame, 10);
          };
        };

        checkNextFrame();
      };

      video.onerror = () => resolve([]);
    });
  }
}
