import React from 'react';
import { 
  Play, 
  Share2, 
  FileCode, 
  Keyboard, 
  RotateCcw, 
  Scissors, 
  HelpCircle,
  Video,
  Layers,
  Sparkles,
  Smartphone,
  Split,
  MessageSquare
} from 'lucide-react';
import { Timecode } from '../engine/Timecode';
import { FCPProject } from '../types/fcp';

interface MenuBarProps {
  project: FCPProject;
  currentTime: number;
  onExportVideo: () => void;
  onOpenBatchQueue: () => void;
  onOpenCompressor: () => void;
  onToggleEffectsBrowser: () => void;
  onExportFcpXml: () => void;
  onImportFcpXml: (file: File) => void;
  onOpenShortcuts: () => void;
  onResetDemo: () => void;
  onOpenSmartConform: () => void;
  onRunSceneDetection: () => void;
  onGenerateCaptions: () => void;
}

export const MenuBar: React.FC<MenuBarProps> = ({
  project,
  currentTime,
  onExportVideo,
  onOpenBatchQueue,
  onOpenCompressor,
  onToggleEffectsBrowser,
  onExportFcpXml,
  onImportFcpXml,
  onOpenShortcuts,
  onResetDemo,
  onOpenSmartConform,
  onRunSceneDetection,
  onGenerateCaptions,
}) => {
  return (
    <div className="h-10 bg-fcp-header border-b border-fcp-border flex items-center justify-between px-3 select-none text-xs">
      {/* Left: macOS App & Menus */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 font-semibold text-white">
          <div className="w-5 h-5 bg-gradient-to-tr from-blue-600 via-indigo-500 to-amber-500 rounded flex items-center justify-center text-white shadow-sm">
            <Video size={12} className="stroke-[2.5]" />
          </div>
          <span className="tracking-tight text-sm font-bold bg-gradient-to-r from-gray-100 to-gray-300 bg-clip-text text-transparent">
            Web Cut Pro
          </span>
        </div>

        {/* AI Action Quick Buttons */}
        <div className="hidden lg:flex items-center gap-1.5 pl-2 border-l border-gray-700">
          <button
            onClick={onOpenSmartConform}
            className="flex items-center gap-1 px-2 py-0.5 bg-[#1c1c1c] hover:bg-[#282828] border border-gray-700 rounded text-amber-300 text-[10px] font-medium transition-colors"
            title="Auto-Reframe Project Aspect Ratio (16:9 -> 9:16 Shorts)"
          >
            <Smartphone size={11} />
            <span>Smart Conform ({project.format.aspectRatio || '16:9'})</span>
          </button>

          <button
            onClick={onRunSceneDetection}
            className="flex items-center gap-1 px-2 py-0.5 bg-[#1c1c1c] hover:bg-[#282828] border border-gray-700 rounded text-blue-300 text-[10px] font-medium transition-colors"
            title="AI Camera Scene Cut Detection"
          >
            <Split size={11} />
            <span>Detect Cuts</span>
          </button>

          <button
            onClick={onGenerateCaptions}
            className="flex items-center gap-1 px-2 py-0.5 bg-[#1c1c1c] hover:bg-[#282828] border border-gray-700 rounded text-emerald-300 text-[10px] font-medium transition-colors"
            title="Auto-Generate Speech Subtitles & Captions"
          >
            <MessageSquare size={11} />
            <span>Auto Captions</span>
          </button>
        </div>
      </div>

      {/* Center: Digital LED Timecode Display */}
      <div className="flex items-center gap-3 bg-[#111111] px-4 py-1 rounded-md border border-[#333333] shadow-inner">
        <span className="text-gray-400 font-medium text-[11px] truncate max-w-[120px] sm:max-w-[200px]">
          {project.name}
        </span>
        <div className="h-3 w-[1px] bg-gray-700" />
        <div className="font-mono text-sm tracking-wider text-blue-400 font-bold">
          {Timecode.formatSMPTE(currentTime, project.format.frameRate)}
        </div>
        <div className="hidden sm:block text-[10px] text-gray-500 font-mono">
          {project.format.height}p{project.format.frameRate}
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={onOpenShortcuts}
          className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded transition-colors"
          title="Keyboard Shortcuts"
        >
          <Keyboard size={15} />
        </button>

        <button
          onClick={onResetDemo}
          className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded transition-colors"
          title="Reset Project"
        >
          <RotateCcw size={15} />
        </button>

        {/* FCPXML Import */}
        <label
          className="flex items-center gap-1.5 px-2 py-1 bg-[#222222] hover:bg-[#2e2e2e] border border-gray-700 rounded text-gray-300 text-xs font-medium cursor-pointer transition-colors"
          title="Import Apple Final Cut Pro XML (.fcpxml)"
        >
          <FileCode size={13} className="text-blue-400" />
          <span className="hidden sm:inline">Import XML</span>
          <input
            type="file"
            accept=".xml,.fcpxml"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                onImportFcpXml(e.target.files[0]);
              }
            }}
          />
        </label>

        <button
          onClick={onExportFcpXml}
          className="flex items-center gap-1.5 px-2.5 py-1 bg-[#2a2a2a] hover:bg-[#383838] border border-gray-600 rounded text-gray-200 text-xs font-medium transition-colors"
          title="Export Apple Final Cut Pro XML (.fcpxml)"
        >
          <FileCode size={13} className="text-amber-400" />
          <span className="hidden sm:inline">Export FCPXML</span>
        </button>

        <button
          onClick={onToggleEffectsBrowser}
          className="flex items-center gap-1.5 px-2.5 py-1 bg-[#222222] hover:bg-[#2e2e2e] border border-purple-800 rounded text-purple-300 text-xs font-medium transition-colors"
          title="Open Effects & Transitions Browser (⌘5)"
        >
          <Sparkles size={13} className="text-purple-400" />
          <span className="hidden sm:inline">Effects (⌘5)</span>
        </button>

        <button
          onClick={onOpenCompressor}
          className="flex items-center gap-1.5 px-2.5 py-1 bg-[#222222] hover:bg-[#2e2e2e] border border-indigo-800 rounded text-indigo-300 text-xs font-medium transition-colors"
          title="Apple Compressor Custom Settings"
        >
          <Layers size={13} className="text-indigo-400" />
          <span className="hidden sm:inline">Compressor</span>
        </button>

        <button
          onClick={onOpenBatchQueue}
          className="flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded text-xs font-medium shadow-sm transition-colors"
          title="FCP Share Destinations & Batch Queue"
        >
          <Share2 size={13} />
          <span>Share</span>
        </button>
      </div>
    </div>
  );
};
