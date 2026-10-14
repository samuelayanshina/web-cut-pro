import React, { useEffect, useState } from 'react';
import { audioEngine } from '../engine/AudioEngine';

interface AudioMetersProps {
  isPlaying: boolean;
}

export const AudioMeters: React.FC<AudioMetersProps> = ({ isPlaying }) => {
  const [leftDb, setLeftDb] = useState(-60);
  const [rightDb, setRightDb] = useState(-60);
  const [peakClip, setPeakClip] = useState(false);

  useEffect(() => {
    let animId: number;

    const update = () => {
      if (isPlaying) {
        const levels = audioEngine.getLevels();
        setLeftDb(levels.leftDb);
        setRightDb(levels.rightDb);
        if (levels.peakClip) {
          setPeakClip(true);
        }
      } else {
        setLeftDb((prev) => Math.max(-60, prev - 2));
        setRightDb((prev) => Math.max(-60, prev - 2));
      }
      animId = requestAnimationFrame(update);
    };

    animId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying]);

  // Convert dB (-60 to 0) to percentage (0% to 100%)
  const dbToPercent = (db: number) => {
    const clamped = Math.max(-60, Math.min(0, db));
    return ((clamped + 60) / 60) * 100;
  };

  return (
    <div className="flex flex-col items-center justify-between h-full py-2 px-1 bg-[#1a1a1a] border-l border-fcp-border w-8 select-none text-[9px] font-mono">
      {/* Peak Clip Indicator LED */}
      <div
        className={`w-4 h-2 rounded-sm transition-colors ${
          peakClip ? 'bg-red-500 shadow-sm shadow-red-500' : 'bg-[#333333]'
        }`}
        onClick={() => setPeakClip(false)}
        title="Peak Clip Indicator (click to reset)"
      />

      {/* dB scale labels */}
      <div className="flex justify-between w-full h-full my-1">
        <div className="flex flex-col justify-between text-gray-500 text-[8px] leading-none py-1">
          <span>0</span>
          <span>-6</span>
          <span>-12</span>
          <span>-24</span>
          <span>-40</span>
          <span>-60</span>
        </div>

        {/* Dual Meter Bars */}
        <div className="flex gap-1 h-full w-4 bg-[#111111] p-[1px] rounded">
          {/* Left Channel */}
          <div className="w-1.5 h-full bg-[#181818] rounded-sm relative overflow-hidden flex flex-col justify-end">
            <div
              className="w-full transition-all duration-75 rounded-sm"
              style={{
                height: `${dbToPercent(leftDb)}%`,
                background: 'linear-gradient(to top, #10b981 65%, #f59e0b 85%, #ef4444 100%)',
              }}
            />
          </div>

          {/* Right Channel */}
          <div className="w-1.5 h-full bg-[#181818] rounded-sm relative overflow-hidden flex flex-col justify-end">
            <div
              className="w-full transition-all duration-75 rounded-sm"
              style={{
                height: `${dbToPercent(rightDb)}%`,
                background: 'linear-gradient(to top, #10b981 65%, #f59e0b 85%, #ef4444 100%)',
              }}
            />
          </div>
        </div>
      </div>

      <span className="text-[8px] text-gray-400 font-bold">dB</span>
    </div>
  );
};
