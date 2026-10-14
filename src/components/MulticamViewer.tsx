import React from 'react';
import { MediaAsset } from '../types/fcp';
import { Camera, X, Check } from 'lucide-react';

interface MulticamViewerProps {
  isOpen: boolean;
  onClose: () => void;
  assets: MediaAsset[];
  activeAngleIndex: number;
  onSwitchAngle: (index: number) => void;
}

export const MulticamViewer: React.FC<MulticamViewerProps> = ({
  isOpen,
  onClose,
  assets,
  activeAngleIndex,
  onSwitchAngle,
}) => {
  if (!isOpen) return null;

  // Take up to 4 video assets for multicam grid
  const videoAssets = assets.filter((a) => a.type === 'video').slice(0, 4);

  return (
    <div className="absolute top-2 left-2 z-40 bg-[#161616]/95 border border-gray-700 rounded-lg shadow-2xl p-2.5 flex flex-col gap-2 backdrop-blur-md select-none">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-800 pb-1.5 text-xs">
        <div className="flex items-center gap-1.5 font-bold text-gray-200">
          <Camera size={14} className="text-blue-400" />
          <span className="uppercase text-[10px] tracking-wider">Multicam Angle Switcher (Keys 1-4)</span>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white p-0.5 rounded"
          title="Close Multicam"
        >
          <X size={13} />
        </button>
      </div>

      {/* 2x2 Camera Angle Grid */}
      <div className="grid grid-cols-2 gap-2 w-[340px]">
        {videoAssets.map((asset, idx) => {
          const isActive = activeAngleIndex === idx;
          return (
            <div
              key={asset.id}
              onClick={() => onSwitchAngle(idx)}
              className={`relative aspect-video rounded overflow-hidden cursor-pointer border-2 transition-all ${
                isActive
                  ? 'border-blue-500 ring-2 ring-blue-500/50 shadow-lg'
                  : 'border-gray-800 hover:border-gray-600 opacity-75 hover:opacity-100'
              }`}
            >
              {asset.thumbnailUrl ? (
                <img
                  src={asset.thumbnailUrl}
                  alt={asset.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-[#1e293b]" />
              )}

              {/* Angle Label & Shortcut Tag */}
              <div className="absolute top-1 left-1 flex items-center gap-1 bg-black/80 px-1.5 py-0.5 rounded text-[9px] font-mono text-white">
                <span className="w-3.5 h-3.5 rounded-full bg-blue-600 text-center font-bold text-[8px] flex items-center justify-center">
                  {idx + 1}
                </span>
                <span className="truncate max-w-[90px]">{asset.name}</span>
              </div>

              {isActive && (
                <div className="absolute bottom-1 right-1 bg-blue-600 text-white px-1.5 py-0.2 rounded text-[8px] font-bold flex items-center gap-0.5">
                  <Check size={9} />
                  <span>ACTIVE</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
