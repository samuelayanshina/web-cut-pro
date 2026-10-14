import React from 'react';
import { X, Keyboard } from 'lucide-react';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: 'Space', desc: 'Play / Pause Timeline' },
    { key: 'J / K / L', desc: 'Step Back / Pause / Step Forward' },
    { key: 'A', desc: 'Select Tool' },
    { key: 'B', desc: 'Blade Tool (Cut clip)' },
    { key: 'T', desc: 'Trim / Ripple Tool' },
    { key: 'H', desc: 'Hand Tool' },
    { key: '⌘ + B', desc: 'Blade Clip at Playhead' },
    { key: '⌥ + W', desc: 'Insert Gap Clip on Spine' },
    { key: 'N', desc: 'Toggle Magnetic Snapping' },
    { key: 'S', desc: 'Toggle Skimmer Preview' },
    { key: 'Delete / ⌫', desc: 'Delete Clip (Auto-Ripples Magnetic Gap)' },
    { key: 'Home / End', desc: 'Jump to Timeline Start / End' },
    { key: '← / →', desc: 'Step 1 Frame' },
  ];

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#202020] border border-gray-700 w-full max-w-lg rounded-xl shadow-2xl overflow-hidden select-none text-xs">
        <div className="px-4 py-3 bg-[#262626] border-b border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Keyboard size={16} className="text-amber-400" />
            <span className="font-bold text-white text-sm">Final Cut Pro Keyboard Shortcuts</span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1 rounded-md transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-4 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {shortcuts.map((sc, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-2 bg-[#181818] border border-gray-800 rounded-md"
              >
                <span className="text-gray-300 text-[11px]">{sc.desc}</span>
                <kbd className="px-2 py-0.5 bg-[#2a2a2a] border border-gray-600 rounded text-amber-400 font-mono text-[10px] font-bold shadow-inner">
                  {sc.key}
                </kbd>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
