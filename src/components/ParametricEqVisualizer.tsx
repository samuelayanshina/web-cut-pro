import React from 'react';
import { AudioDspSettings } from '../types/fcp';
import { Activity, Shield } from 'lucide-react';

interface ParametricEqProps {
  dsp: AudioDspSettings;
  onChange: (dsp: AudioDspSettings) => void;
}

const FREQUENCIES = ['32Hz', '64Hz', '125Hz', '250Hz', '500Hz', '1kHz', '2kHz', '4kHz', '8kHz', '16kHz'];

export const ParametricEqVisualizer: React.FC<ParametricEqProps> = ({ dsp, onChange }) => {
  const bands = dsp.eq10Bands && dsp.eq10Bands.length === 10
    ? dsp.eq10Bands
    : new Array(10).fill(0);

  const updateBand = (index: number, gain: number) => {
    const newBands = [...bands];
    newBands[index] = gain;
    onChange({
      ...dsp,
      eq10Bands: newBands,
    });
  };

  const toggleLimiter = () => {
    onChange({
      ...dsp,
      limiterCeiling: dsp.limiterCeiling === 0 ? -0.1 : 0,
    });
  };

  // Generate smooth SVG curve path across the 10 bands
  const svgWidth = 280;
  const svgHeight = 70;
  const centerY = svgHeight / 2;

  const points = bands.map((gain, i) => {
    const x = (i / (bands.length - 1)) * (svgWidth - 20) + 10;
    const y = centerY - (gain / 12) * (centerY - 6);
    return `${x},${y}`;
  });

  const curvePath = `M 10,${centerY} Q ${points.join(' T ')}`;

  return (
    <div className="p-2.5 bg-[#181818] rounded-md border border-gray-800 space-y-2 select-none">
      <div className="flex items-center justify-between text-gray-200">
        <div className="flex items-center gap-1 font-bold text-[11px] text-emerald-400">
          <Activity size={12} />
          <span>10-Band Studio Equalizer</span>
        </div>
        <button
          onClick={toggleLimiter}
          className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold transition-colors ${
            dsp.limiterCeiling !== undefined
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              : 'bg-gray-800 text-gray-500'
          }`}
          title="0 dB Brickwall Limiter"
        >
          <Shield size={10} />
          <span>0dB Limiter</span>
        </button>
      </div>

      {/* SVG Frequency Response Curve */}
      <div className="w-full h-16 bg-[#111111] rounded border border-gray-800 relative overflow-hidden flex items-center justify-center">
        <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-full">
          {/* Reference 0dB Grid Line */}
          <line
            x1="0"
            y1={centerY}
            x2={svgWidth}
            y2={centerY}
            stroke="#333333"
            strokeDasharray="2,2"
          />

          {/* Smooth Response Curve */}
          <path
            d={curvePath}
            fill="none"
            stroke="#10b981"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Frequency Control Nodes */}
          {bands.map((gain, i) => {
            const cx = (i / (bands.length - 1)) * (svgWidth - 20) + 10;
            const cy = centerY - (gain / 12) * (centerY - 6);
            return (
              <circle
                key={i}
                cx={cx}
                cy={cy}
                r="3.5"
                fill="#ffffff"
                stroke="#10b981"
                strokeWidth="1.5"
              />
            );
          })}
        </svg>
      </div>

      {/* 10 Vertical Micro Sliders */}
      <div className="grid grid-cols-10 gap-0.5 pt-1">
        {FREQUENCIES.map((freq, i) => (
          <div key={freq} className="flex flex-col items-center">
            <input
              type="range"
              min="-12"
              max="12"
              step="1"
              value={bands[i]}
              onChange={(e) => updateBand(i, Number(e.target.value))}
              className="h-10 accent-emerald-500 bg-gray-800 w-1 rounded cursor-pointer [writing-mode:vertical-lr] [direction:rtl]"
            />
            <span className="text-[7px] text-gray-500 font-mono mt-1">{freq}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
