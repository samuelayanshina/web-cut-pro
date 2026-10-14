import React from 'react';
import { AspectRatioType, ProjectFormat } from '../types/fcp';
import { SmartConformEngine } from '../engine/SmartConformEngine';
import { Smartphone, Monitor, Square, X, Sparkles } from 'lucide-react';

interface SmartConformModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentFormat: ProjectFormat;
  onApplyFormat: (format: ProjectFormat) => void;
}

export const SmartConformModal: React.FC<SmartConformModalProps> = ({
  isOpen,
  onClose,
  currentFormat,
  onApplyFormat,
}) => {
  if (!isOpen) return null;

  const ratios: Array<{ id: AspectRatioType; name: string; desc: string; icon: any }> = [
    { id: '16:9', name: '16:9 Widescreen', desc: 'YouTube, Cinema, TV Broadcast (1920x1080)', icon: Monitor },
    { id: '9:16', name: '9:16 Vertical', desc: 'TikTok, Instagram Reels, YouTube Shorts (1080x1920)', icon: Smartphone },
    { id: '1:1', name: '1:1 Square', desc: 'Instagram Feed, Profile Video (1080x1080)', icon: Square },
    { id: '4:5', name: '4:5 Portrait', desc: 'Instagram & Facebook Mobile Feed (1080x1350)', icon: Smartphone },
  ];

  const handleSelectRatio = (ratio: AspectRatioType) => {
    const dims = SmartConformEngine.getDimensionsForRatio(ratio);
    onApplyFormat({
      ...currentFormat,
      aspectRatio: ratio,
      width: dims.width,
      height: dims.height,
      name: `${ratio} ${ratio === '9:16' ? 'Vertical Short' : ratio === '16:9' ? 'Cinema' : 'Social'}`,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#202020] border border-gray-700 w-full max-w-md rounded-xl shadow-2xl overflow-hidden select-none text-xs">
        <div className="px-4 py-3 bg-[#262626] border-b border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-amber-400" />
            <span className="font-bold text-white text-sm">Smart Conform & Auto-Reframe</span>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white p-1 rounded">
            <X size={15} />
          </button>
        </div>

        <div className="p-4 space-y-3">
          <div className="text-gray-400 text-[11px] leading-relaxed">
            Automatically transform your project aspect ratio. AI Smart Conform centers your subjects automatically for vertical video platforms.
          </div>

          <div className="space-y-2 pt-1">
            {ratios.map((r) => {
              const Icon = r.icon;
              const isSelected = currentFormat.aspectRatio === r.id;

              return (
                <div
                  key={r.id}
                  onClick={() => handleSelectRatio(r.id)}
                  className={`p-3 rounded-lg border cursor-pointer flex items-center justify-between transition-all ${
                    isSelected
                      ? 'bg-fcp-accent/20 border-fcp-accent text-white font-medium'
                      : 'bg-[#181818] border-gray-800 text-gray-300 hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-[#262626] flex items-center justify-center text-amber-400">
                      <Icon size={16} />
                    </div>
                    <div>
                      <div className="font-semibold text-white text-xs">{r.name}</div>
                      <div className="text-[10px] text-gray-400">{r.desc}</div>
                    </div>
                  </div>

                  {isSelected && (
                    <span className="text-[9px] bg-fcp-accent text-white px-2 py-0.5 rounded font-bold">
                      CURRENT
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
