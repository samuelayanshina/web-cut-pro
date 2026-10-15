import React, { useState, useRef, useEffect } from 'react';
import { 
  Play, 
  Share2, 
  FileCode, 
  Keyboard, 
  RotateCcw, 
  Scissors, 
  Video,
  Layers,
  Sparkles,
  Smartphone,
  Split,
  MessageSquare,
  Undo2,
  Redo2,
  MoreHorizontal,
  Download,
  Upload,
  BookOpen
} from 'lucide-react';
import { Timecode } from '../engine/Timecode';
import { FCPProject } from '../types/fcp';

interface MenuBarProps {
  project: FCPProject;
  currentTime: number;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onExportVideo: () => void;
  onOpenBatchQueue: () => void;
  onOpenCompressor: () => void;
  onToggleEffectsBrowser: () => void;
  onExportFcpXml: () => void;
  onImportFcpXml: (file: File) => void;
  onOpenShortcuts: () => void;
  onOpenTutorialGuide?: () => void;
  onResetDemo: () => void;
  onOpenSmartConform: () => void;
  onRunSceneDetection: () => void;
  onGenerateCaptions: () => void;
}

export const MenuBar: React.FC<MenuBarProps> = ({
  project,
  currentTime,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onExportVideo,
  onOpenBatchQueue,
  onOpenCompressor,
  onToggleEffectsBrowser,
  onExportFcpXml,
  onImportFcpXml,
  onOpenShortcuts,
  onOpenTutorialGuide,
  onResetDemo,
  onOpenSmartConform,
  onRunSceneDetection,
  onGenerateCaptions,
}) => {
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const moreMenuRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(e.target as Node)) {
        setShowMoreMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="h-11 bg-[#18181a] border-b border-[#2c2c2e] flex items-center justify-between px-3 md:px-4 select-none text-xs z-30">
      {/* Left: Apple Clean Branding & Primary Editing Tools */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Apple Minimalist App Icon */}
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-[#242426] border border-[#38383a] flex items-center justify-center text-white shadow-sm">
            <Video size={13} className="text-white" />
          </div>
          <span className="font-semibold text-white tracking-tight text-[13px] hidden sm:inline">
            Web Cut Pro
          </span>
        </div>

        <div className="h-4 w-[1px] bg-[#2c2c2e] hidden md:block" />

        {/* Clean Apple Monochrome Action Buttons (Desktop Only) */}
        <div className="hidden md:flex items-center gap-1.5">
          <button
            onClick={onOpenSmartConform}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-[#242426] hover:bg-[#2c2c2e] border border-[#38383a] rounded-md text-[#d1d1d6] hover:text-white text-xs font-normal transition-colors"
            title="Auto-Reframe Project Aspect Ratio"
          >
            <Smartphone size={13} className="text-[#a1a1a6]" />
            <span>Reframe ({project.format.aspectRatio || '16:9'})</span>
          </button>

          <button
            onClick={onRunSceneDetection}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-[#242426] hover:bg-[#2c2c2e] border border-[#38383a] rounded-md text-[#d1d1d6] hover:text-white text-xs font-normal transition-colors"
            title="Scene Cut Detection"
          >
            <Scissors size={13} className="text-[#a1a1a6]" />
            <span>Cut Detect</span>
          </button>

          <button
            onClick={onGenerateCaptions}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-[#242426] hover:bg-[#2c2c2e] border border-[#38383a] rounded-md text-[#d1d1d6] hover:text-white text-xs font-normal transition-colors"
            title="Generate Captions & Subtitles"
          >
            <MessageSquare size={13} className="text-[#a1a1a6]" />
            <span>Captions</span>
          </button>

          <button
            onClick={onToggleEffectsBrowser}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-[#242426] hover:bg-[#2c2c2e] border border-[#38383a] rounded-md text-[#d1d1d6] hover:text-white text-xs font-normal transition-colors"
            title="Effects & Transitions Browser (⌘5)"
          >
            <Sparkles size={13} className="text-[#a1a1a6]" />
            <span>Effects</span>
          </button>

          <button
            onClick={onOpenTutorialGuide}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-[#242426] hover:bg-[#2c2c2e] border border-[#38383a] rounded-md text-[#d1d1d6] hover:text-white text-xs font-normal transition-colors"
            title="Final Cut Pro Tutorial Companion Guide"
          >
            <BookOpen size={13} className="text-[#0a84ff]" />
            <span>Tutorial Guide</span>
          </button>
        </div>
      </div>

      {/* Center: Apple macOS Minimalist Timecode Pill */}
      <div className="flex items-center gap-2 md:gap-3 bg-[#121214] px-3 py-1 rounded-md border border-[#2c2c2e] shadow-inner">
        <span className="text-[#8e8e93] font-normal text-xs truncate max-w-[90px] sm:max-w-[150px]">
          {project.name}
        </span>
        <div className="h-3 w-[1px] bg-[#2c2c2e]" />
        <div className="font-mono text-xs sm:text-sm tracking-wider text-[#0a84ff] font-medium">
          {Timecode.formatSMPTE(currentTime, project.format.frameRate)}
        </div>
        <div className="hidden sm:block text-[11px] text-[#636366] font-mono">
          {project.format.height}p{project.format.frameRate}
        </div>
      </div>

      {/* Right: Restrained Plain Controls */}
      <div className="flex items-center gap-1 sm:gap-2">
        {/* Undo / Redo */}
        <div className="flex items-center">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className={`p-1.5 rounded-md transition-colors ${
              canUndo ? 'text-[#c7c7cc] hover:text-white hover:bg-[#242426]' : 'text-[#48484a] cursor-not-allowed'
            }`}
            title="Undo (⌘Z)"
          >
            <Undo2 size={14} />
          </button>

          <button
            onClick={onRedo}
            disabled={!canRedo}
            className={`p-1.5 rounded-md transition-colors ${
              canRedo ? 'text-[#c7c7cc] hover:text-white hover:bg-[#242426]' : 'text-[#48484a] cursor-not-allowed'
            }`}
            title="Redo (⇧⌘Z)"
          >
            <Redo2 size={14} />
          </button>
        </div>

        <div className="h-4 w-[1px] bg-[#2c2c2e] mx-0.5" />

        {/* Shortcuts & Reset */}
        <button
          onClick={onOpenShortcuts}
          className="p-1.5 text-[#8e8e93] hover:text-white hover:bg-[#242426] rounded-md transition-colors hidden sm:block"
          title="Keyboard Shortcuts (⌘/)"
        >
          <Keyboard size={14} />
        </button>

        <button
          onClick={onResetDemo}
          className="p-1.5 text-[#8e8e93] hover:text-white hover:bg-[#242426] rounded-md transition-colors hidden sm:block"
          title="Reset Project to Factory Default"
        >
          <RotateCcw size={14} />
        </button>

        {/* More Menu for Secondary Actions */}
        <div className="relative" ref={moreMenuRef}>
          <button
            onClick={() => setShowMoreMenu(!showMoreMenu)}
            className="p-1.5 text-[#8e8e93] hover:text-white hover:bg-[#242426] rounded-md transition-colors"
            title="Project Options & XML"
          >
            <MoreHorizontal size={15} />
          </button>

          {showMoreMenu && (
            <div className="absolute right-0 mt-1.5 w-52 bg-[#1c1c1e] border border-[#2c2c2e] rounded-xl shadow-2xl p-1.5 z-50 text-xs">
              <button
                onClick={() => {
                  fileInputRef.current?.click();
                  setShowMoreMenu(false);
                }}
                className="w-full px-2.5 py-1.5 flex items-center gap-2 text-[#d1d1d6] hover:text-white hover:bg-[#2c2c2e] rounded-lg transition-colors text-left"
              >
                <Upload size={13} className="text-[#8e8e93]" />
                <span>Import FCPXML...</span>
              </button>

              <button
                onClick={() => {
                  onExportFcpXml();
                  setShowMoreMenu(false);
                }}
                className="w-full px-2.5 py-1.5 flex items-center gap-2 text-[#d1d1d6] hover:text-white hover:bg-[#2c2c2e] rounded-lg transition-colors text-left"
              >
                <Download size={13} className="text-[#8e8e93]" />
                <span>Export FCPXML...</span>
              </button>

              <div className="h-[1px] bg-[#2c2c2e] my-1" />

              <button
                onClick={() => {
                  onOpenCompressor();
                  setShowMoreMenu(false);
                }}
                className="w-full px-2.5 py-1.5 flex items-center gap-2 text-[#d1d1d6] hover:text-white hover:bg-[#2c2c2e] rounded-lg transition-colors text-left"
              >
                <Layers size={13} className="text-[#8e8e93]" />
                <span>Compressor Settings</span>
              </button>

              <button
                onClick={() => {
                  onOpenTutorialGuide?.();
                  setShowMoreMenu(false);
                }}
                className="w-full px-2.5 py-1.5 flex items-center gap-2 text-[#d1d1d6] hover:text-white hover:bg-[#2c2c2e] rounded-lg transition-colors text-left"
              >
                <BookOpen size={13} className="text-[#0a84ff]" />
                <span>Tutorial Companion Guide</span>
              </button>

              <button
                onClick={() => {
                  onOpenShortcuts();
                  setShowMoreMenu(false);
                }}
                className="w-full px-2.5 py-1.5 flex items-center gap-2 text-[#d1d1d6] hover:text-white hover:bg-[#2c2c2e] rounded-lg transition-colors text-left sm:hidden"
              >
                <Keyboard size={13} className="text-[#8e8e93]" />
                <span>Keyboard Shortcuts</span>
              </button>

              <button
                onClick={() => {
                  onResetDemo();
                  setShowMoreMenu(false);
                }}
                className="w-full px-2.5 py-1.5 flex items-center gap-2 text-[#ff453a] hover:bg-[#ff453a]/10 rounded-lg transition-colors text-left sm:hidden"
              >
                <RotateCcw size={13} />
                <span>Reset Project</span>
              </button>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept=".xml,.fcpxml"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                onImportFcpXml(e.target.files[0]);
              }
            }}
          />
        </div>

        {/* Primary Action Button: Solid Apple Blue */}
        <button
          onClick={onOpenBatchQueue}
          className="flex items-center gap-1.5 px-3 md:px-3.5 py-1 bg-[#0071e3] hover:bg-[#0077ed] active:scale-[0.98] text-white rounded-md text-xs font-medium shadow-sm transition-all"
          title="Share Project or Export Master (⌘E)"
        >
          <Share2 size={13} />
          <span>Share</span>
        </button>
      </div>
    </header>
  );
};
