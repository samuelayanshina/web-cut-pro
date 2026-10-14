import React, { useRef, useEffect } from 'react';
import { ScopeMode } from '../types/fcp';
import { ScopesEngine } from '../engine/ScopesEngine';
import { X, Activity } from 'lucide-react';

interface VideoScopesProps {
  sourceCanvasRef: React.RefObject<HTMLCanvasElement>;
  mode: ScopeMode;
  onSetMode: (mode: ScopeMode) => void;
  onClose: () => void;
}

export const VideoScopes: React.FC<VideoScopesProps> = ({
  sourceCanvasRef,
  mode,
  onSetMode,
  onClose,
}) => {
  const scopeCanvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    let animId: number;

    const renderLoop = () => {
      if (
        mode !== 'off' &&
        sourceCanvasRef.current &&
        scopeCanvasRef.current
      ) {
        ScopesEngine.renderScope(
          sourceCanvasRef.current,
          scopeCanvasRef.current,
          mode
        );
      }
      animId = requestAnimationFrame(renderLoop);
    };

    animId = requestAnimationFrame(renderLoop);
    return () => cancelAnimationFrame(animId);
  }, [mode, sourceCanvasRef]);

  if (mode === 'off') return null;

  return (
    <div className="absolute top-2 right-12 z-40 bg-[#141414]/95 border border-gray-700 rounded-lg shadow-2xl p-2 flex flex-col gap-2 backdrop-blur-md">
      {/* Scope Mode Header */}
      <div className="flex items-center justify-between gap-3 border-b border-gray-800 pb-1.5 text-xs">
        <div className="flex items-center gap-1.5 font-bold text-gray-200">
          <Activity size={13} className="text-emerald-400" />
          <span className="uppercase text-[10px] tracking-wider">Video Scopes</span>
        </div>

        <div className="flex items-center gap-1 bg-black p-0.5 rounded border border-gray-700 text-[10px]">
          <button
            onClick={() => onSetMode('waveform')}
            className={`px-1.5 py-0.5 rounded ${
              mode === 'waveform' ? 'bg-emerald-600 text-white font-bold' : 'text-gray-400'
            }`}
          >
            Waveform
          </button>
          <button
            onClick={() => onSetMode('parade')}
            className={`px-1.5 py-0.5 rounded ${
              mode === 'parade' ? 'bg-blue-600 text-white font-bold' : 'text-gray-400'
            }`}
          >
            RGB Parade
          </button>
          <button
            onClick={() => onSetMode('vectorscope')}
            className={`px-1.5 py-0.5 rounded ${
              mode === 'vectorscope' ? 'bg-amber-600 text-white font-bold' : 'text-gray-400'
            }`}
          >
            Vectorscope
          </button>
          <button
            onClick={() => onSetMode('histogram')}
            className={`px-1.5 py-0.5 rounded ${
              mode === 'histogram' ? 'bg-purple-600 text-white font-bold' : 'text-gray-400'
            }`}
          >
            Histogram
          </button>
        </div>

        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white p-0.5 rounded"
          title="Close Scopes"
        >
          <X size={13} />
        </button>
      </div>

      {/* Scope Canvas */}
      <div className="w-[300px] h-[170px] bg-black rounded overflow-hidden border border-gray-800 relative">
        <canvas
          ref={scopeCanvasRef}
          width={300}
          height={170}
          className="w-full h-full object-contain"
        />
      </div>
    </div>
  );
};
