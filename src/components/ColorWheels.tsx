import React from 'react';
import { ThreeWayColorWheels, ColorWheelItem } from '../types/fcp';
import { RotateCcw } from 'lucide-react';

interface ColorWheelsProps {
  wheels: ThreeWayColorWheels;
  onChange: (wheels: ThreeWayColorWheels) => void;
}

export const ColorWheels: React.FC<ColorWheelsProps> = ({ wheels, onChange }) => {
  const updateWheel = (key: keyof ThreeWayColorWheels, partial: Partial<ColorWheelItem>) => {
    onChange({
      ...wheels,
      [key]: { ...wheels[key], ...partial },
    });
  };

  const resetWheel = (key: keyof ThreeWayColorWheels) => {
    updateWheel(key, { hueX: 0, hueY: 0, luma: 0 });
  };

  const renderWheel = (title: string, key: keyof ThreeWayColorWheels, item: ColorWheelItem) => {
    const handleWheelMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const radius = rect.width / 2;

      const updatePos = (clientX: number, clientY: number) => {
        const dx = (clientX - (rect.left + radius)) / radius;
        const dy = (clientY - (rect.top + radius)) / radius;
        const dist = Math.sqrt(dx * dx + dy * dy);

        let finalX = dx;
        let finalY = dy;
        if (dist > 1.0) {
          finalX = dx / dist;
          finalY = dy / dist;
        }

        updateWheel(key, { hueX: finalX, hueY: finalY });
      };

      updatePos(e.clientX, e.clientY);

      const onMouseMove = (moveEvent: MouseEvent) => {
        updatePos(moveEvent.clientX, moveEvent.clientY);
      };

      const onMouseUp = () => {
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
      };

      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    };

    return (
      <div className="flex flex-col items-center bg-[#181818] p-2 rounded-lg border border-gray-800">
        <div className="flex items-center justify-between w-full mb-1 px-1">
          <span className="font-bold text-[10px] text-gray-300 uppercase tracking-wider">{title}</span>
          <button
            onClick={() => resetWheel(key)}
            className="text-gray-500 hover:text-gray-300 p-0.5 rounded"
            title="Reset Wheel"
          >
            <RotateCcw size={10} />
          </button>
        </div>

        {/* 2D Circular Color Disc */}
        <div
          onMouseDown={handleWheelMouseDown}
          className="relative w-20 h-20 rounded-full cursor-crosshair border border-gray-700 shadow-inner flex items-center justify-center overflow-hidden my-1"
          style={{
            background: 'radial-gradient(circle, #ffffff 0%, rgba(255,255,255,0) 65%), conic-gradient(red, yellow, lime, aqua, blue, magenta, red)',
          }}
        >
          {/* Neutral Center Reference */}
          <div className="w-1.5 h-1.5 rounded-full bg-black/40 pointer-events-none" />

          {/* Interactive Puck */}
          <div
            style={{
              left: `${50 + item.hueX * 42}%`,
              top: `${50 + item.hueY * 42}%`,
            }}
            className="absolute w-3 h-3 rounded-full bg-white border-2 border-black -translate-x-1/2 -translate-y-1/2 pointer-events-none shadow-md"
          />
        </div>

        {/* Master Luminance Slider */}
        <div className="w-full mt-1.5">
          <div className="flex justify-between text-[9px] text-gray-400 font-mono mb-0.5">
            <span>Luma</span>
            <span>{item.luma > 0 ? '+' : ''}{(item.luma * 100).toFixed(0)}</span>
          </div>
          <input
            type="range"
            min="-1.0"
            max="1.0"
            step="0.05"
            value={item.luma}
            onChange={(e) => updateWheel(key, { luma: Number(e.target.value) })}
            className="w-full accent-fcp-accent h-1 bg-gray-700 rounded cursor-pointer"
          />
        </div>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-3 gap-2">
      {renderWheel('Shadows (Lift)', 'shadows', wheels.shadows)}
      {renderWheel('Midtones (Gamma)', 'midtones', wheels.midtones)}
      {renderWheel('Highlights (Gain)', 'highlights', wheels.highlights)}
    </div>
  );
};
