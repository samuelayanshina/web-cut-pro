import React, { useRef, useEffect, useState } from 'react';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  ChevronLeft, 
  ChevronRight, 
  Maximize2, 
  Grid, 
  Volume2, 
  VolumeX, 
  Repeat, 
  Activity, 
  HardDrive,
  Camera,
  Glasses,
  Sparkles,
  BookOpen,
  PlusCircle,
  X,
  HelpCircle,
  Video
} from 'lucide-react';
import { FCPProject, MediaAsset, ScopeMode } from '../types/fcp';
import { compositor } from '../engine/Compositor';
import { Timecode } from '../engine/Timecode';
import { AudioMeters } from './AudioMeters';
import { audioEngine } from '../engine/AudioEngine';
import { VideoScopes } from './VideoScopes';
import { MulticamViewer } from './MulticamViewer';

interface ViewerProps {
  project: FCPProject;
  assets: MediaAsset[];
  currentTime: number;
  isPlaying: boolean;
  totalDuration: number;
  activeMulticamAngle: number;
  onTogglePlay: () => void;
  onSeek: (time: number) => void;
  onStepFrame: (deltaFrames: number) => void;
  onToggleProxyMedia: () => void;
  onSwitchMulticamAngle: (angleIndex: number) => void;
  onStartBlankProject?: () => void;
  onLoadDemoProject?: () => void;
  onOpenTutorialGuide?: () => void;
}

export const Viewer: React.FC<ViewerProps> = ({
  project,
  assets,
  currentTime,
  isPlaying,
  totalDuration,
  activeMulticamAngle,
  onTogglePlay,
  onSeek,
  onStepFrame,
  onToggleProxyMedia,
  onSwitchMulticamAngle,
  onStartBlankProject,
  onLoadDemoProject,
  onOpenTutorialGuide,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [showSafeZones, setShowSafeZones] = useState(false);
  const [scopeMode, setScopeMode] = useState<ScopeMode>('off');
  const [isMulticamOpen, setIsMulticamOpen] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showWelcomeCard, setShowWelcomeCard] = useState<boolean>(() => {
    try {
      return !localStorage.getItem('webcutpro_dismissed_welcome_v1');
    } catch {
      return true;
    }
  });

  // Render canvas frame on currentTime update
  useEffect(() => {
    if (canvasRef.current) {
      compositor.renderFrame(
        canvasRef.current,
        project.spine,
        assets,
        currentTime,
        project.format,
        project.useProxyMedia
      );
    }
  }, [currentTime, project, assets]);

  const toggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    audioEngine.setMasterVolume(next ? 0 : 1.0);
  };

  const handleFullscreen = () => {
    if (containerRef.current) {
      if (!document.fullscreenElement) {
        containerRef.current.requestFullscreen();
      } else {
        document.exitFullscreen();
      }
    }
  };

  return (
    <div
      ref={containerRef}
      className="flex flex-col h-full bg-[#121212] select-none border-b border-fcp-border relative"
    >
      {/* Video Scopes HUD Floating Overlay */}
      <VideoScopes
        sourceCanvasRef={canvasRef as React.RefObject<HTMLCanvasElement>}
        mode={scopeMode}
        onSetMode={setScopeMode}
        onClose={() => setScopeMode('off')}
      />

      {/* Multicam 4-Angle Switcher Floating Overlay */}
      <MulticamViewer
        isOpen={isMulticamOpen}
        onClose={() => setIsMulticamOpen(false)}
        assets={assets}
        activeAngleIndex={activeMulticamAngle}
        onSwitchAngle={onSwitchMulticamAngle}
      />

      {/* Viewer Main Screen Area */}
      <div className="flex-1 relative flex items-center justify-center p-2 min-h-0 overflow-hidden">
        <div className="relative aspect-video max-h-full max-w-full bg-black shadow-2xl rounded overflow-hidden flex items-center justify-center border border-gray-800">
          <canvas
            ref={canvasRef}
            width={1920}
            height={1080}
            className="w-full h-full object-contain"
          />

          {/* Safe Zones Overlay */}
          {showSafeZones && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="w-[90%] h-[90%] border border-cyan-400/40 relative">
                <span className="absolute top-1 left-1 text-[9px] text-cyan-400 font-mono">Action Safe (90%)</span>
              </div>
              <div className="absolute w-[80%] h-[80%] border border-yellow-400/50 flex items-center justify-center">
                <span className="absolute top-1 left-1 text-[9px] text-yellow-400 font-mono">Title Safe (80%)</span>
                <div className="w-4 h-[1px] bg-yellow-400/60" />
                <div className="h-4 w-[1px] bg-yellow-400/60 absolute" />
              </div>
            </div>
          )}

          {/* Resolution Badge & Indicators */}
          <div className="absolute top-2 left-2 flex items-center gap-1.5 pointer-events-none">
            <span className="px-1.5 py-0.5 bg-black/70 backdrop-blur-sm rounded text-[10px] font-mono text-gray-300">
              {project.format.width}x{project.format.height} | {project.format.frameRate} fps
            </span>

            {project.useProxyMedia && (
              <span className="px-1.5 py-0.5 bg-amber-500/90 text-black font-bold rounded text-[9px] font-mono shadow">
                PROXY 720p
              </span>
            )}
          </div>

          {/* Empty Timeline State */}
          {project.spine.length === 0 && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#111113] p-6 text-center space-y-3 select-none">
              <div className="w-12 h-12 rounded-2xl bg-[#1c1c1e] border border-[#2c2c2e] flex items-center justify-center text-[#8e8e93] shadow-md">
                <Video size={22} className="text-[#a1a1a6]" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-white">No Clips on Timeline</h3>
                <p className="text-xs text-[#8e8e93] max-w-xs">
                  Drag videos down from the library, or try the sample project to see how it works.
                </p>
              </div>
              <div className="flex items-center gap-2 pt-1">
                {onLoadDemoProject && (
                  <button
                    onClick={onLoadDemoProject}
                    className="px-3.5 py-2 bg-[#0071e3] hover:bg-[#0077ed] text-white rounded-xl text-xs font-medium flex items-center gap-1.5 shadow-sm transition-all"
                  >
                    <Play size={13} className="fill-white" />
                    <span>Try Sample Project</span>
                  </button>
                )}
                {onOpenTutorialGuide && (
                  <button
                    onClick={onOpenTutorialGuide}
                    className="px-3.5 py-2 bg-[#242426] hover:bg-[#2c2c2e] border border-[#38383a] text-[#d1d1d6] hover:text-white rounded-xl text-xs font-normal flex items-center gap-1.5 transition-all"
                  >
                    <BookOpen size={13} className="text-[#0a84ff]" />
                    <span>Tutorial Guide</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Clean Welcoming First-Run Card (When Project Has Clips) */}
          {project.spine.length > 0 && showWelcomeCard && !isPlaying && (
            <div className="absolute inset-0 z-20 flex items-center justify-center p-4 bg-black/60 backdrop-blur-[4px]">
              <div className="max-w-sm w-full bg-[#1c1c1e] border border-[#38383a] rounded-2xl p-5 shadow-2xl text-center space-y-3.5 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between pb-2 border-b border-[#2c2c2e]">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-[#0071e3] flex items-center justify-center text-white shadow-sm">
                      <Play size={12} className="fill-white ml-0.5" />
                    </div>
                    <span className="font-semibold text-white tracking-tight text-xs">
                      Welcome to Web Cut Pro
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setShowWelcomeCard(false);
                      try {
                        localStorage.setItem('webcutpro_dismissed_welcome_v1', 'true');
                      } catch {}
                    }}
                    className="p-1 text-[#8e8e93] hover:text-white hover:bg-[#2c2c2e] rounded-lg transition-colors"
                    title="Dismiss"
                  >
                    <X size={15} />
                  </button>
                </div>

                <p className="text-[11px] text-[#a1a1a6] text-left leading-relaxed">
                  Final Cut Pro workflow in your browser. Choose how to start:
                </p>

                <div className="space-y-2 pt-1">
                  {/* Action 1: Play Demo */}
                  <button
                    onClick={() => {
                      setShowWelcomeCard(false);
                      try {
                        localStorage.setItem('webcutpro_dismissed_welcome_v1', 'true');
                      } catch {}
                      if (!isPlaying) onTogglePlay();
                    }}
                    className="w-full py-2.5 px-3.5 bg-[#0071e3] hover:bg-[#0077ed] text-white rounded-xl text-xs font-medium flex items-center justify-between shadow-sm transition-all"
                  >
                    <div className="flex items-center gap-2">
                      <Play size={13} className="fill-white" />
                      <span>Play Sample Video</span>
                    </div>
                    <span className="text-[10px] text-white/80 font-mono">Space</span>
                  </button>

                  {/* Action 2: Blank Canvas for My Video */}
                  {onStartBlankProject && (
                    <button
                      onClick={() => {
                        setShowWelcomeCard(false);
                        try {
                          localStorage.setItem('webcutpro_dismissed_welcome_v1', 'true');
                        } catch {}
                        onStartBlankProject();
                      }}
                      className="w-full py-2.5 px-3.5 bg-[#242426] hover:bg-[#2c2c2e] border border-[#38383a] text-[#f5f5f7] hover:text-white rounded-xl text-xs font-medium flex items-center justify-between transition-all"
                    >
                      <div className="flex items-center gap-2">
                        <PlusCircle size={13} className="text-[#30d158]" />
                        <span>Start Blank (Edit My Video)</span>
                      </div>
                      <span className="text-[10px] text-[#8e8e93]">Clean Slate</span>
                    </button>
                  )}

                  {/* Action 3: Tutorial Guide */}
                  {onOpenTutorialGuide && (
                    <button
                      onClick={() => {
                        setShowWelcomeCard(false);
                        onOpenTutorialGuide();
                      }}
                      className="w-full py-2 px-3 bg-transparent hover:bg-[#242426] text-[#8e8e93] hover:text-white rounded-xl text-xs font-normal flex items-center justify-center gap-1.5 transition-all"
                    >
                      <BookOpen size={13} className="text-[#0a84ff]" />
                      <span>Open Final Cut Tutorial Guide</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Audio Meters */}
        <div className="absolute right-0 top-0 bottom-0">
          <AudioMeters isPlaying={isPlaying} />
        </div>
      </div>

      {/* Viewer Transport Control Bar */}
      <div className="h-10 bg-[#18181a] border-t border-[#2c2c2e] flex items-center justify-between px-3 text-xs">
        {/* Left: View Controls */}
        <div className="flex items-center gap-1.5">
          {/* Toggle Multicam */}
          <button
            onClick={() => setIsMulticamOpen(!isMulticamOpen)}
            className={`p-1.5 rounded-md transition-colors flex items-center gap-1 text-xs font-normal ${
              isMulticamOpen
                ? 'bg-[#2c2c2e] text-white border border-[#3e3e42]'
                : 'text-[#8e8e93] hover:text-[#d1d1d6] hover:bg-[#242426]'
            }`}
            title="Toggle Multicam Angle Viewer (Keys 1-4)"
          >
            <Camera size={13} className={isMulticamOpen ? 'text-[#0a84ff]' : 'text-[#8e8e93]'} />
            <span className="hidden xl:inline">Multicam</span>
          </button>

          {/* Toggle Video Scopes */}
          <button
            onClick={() => setScopeMode(scopeMode === 'off' ? 'waveform' : 'off')}
            className={`p-1.5 rounded-md transition-colors flex items-center gap-1 text-xs font-normal ${
              scopeMode !== 'off'
                ? 'bg-[#2c2c2e] text-white border border-[#3e3e42]'
                : 'text-[#8e8e93] hover:text-[#d1d1d6] hover:bg-[#242426]'
            }`}
            title="Toggle Video Scopes"
          >
            <Activity size={13} className={scopeMode !== 'off' ? 'text-[#0a84ff]' : 'text-[#8e8e93]'} />
            <span className="hidden xl:inline">Scopes</span>
          </button>

          {/* Toggle Proxy vs Original Media */}
          <button
            onClick={onToggleProxyMedia}
            className={`p-1.5 rounded-md transition-colors flex items-center gap-1 text-xs font-normal ${
              project.useProxyMedia
                ? 'bg-[#2c2c2e] text-white border border-[#3e3e42]'
                : 'text-[#8e8e93] hover:text-[#d1d1d6] hover:bg-[#242426]'
            }`}
            title="Toggle Proxy vs Original Media"
          >
            <HardDrive size={13} className={project.useProxyMedia ? 'text-[#0a84ff]' : 'text-[#8e8e93]'} />
            <span className="hidden xl:inline">{project.useProxyMedia ? 'Proxy' : 'Original'}</span>
          </button>

          {/* Toggle Spatial Video (Vision Pro) */}
          <button
            onClick={() => {
              const activeClip = project.spine.find(
                (c) => currentTime >= c.timelineIn && currentTime < c.timelineIn + c.duration
              );
              if (activeClip) {
                const isCurrently3D = activeClip.spatialVideo?.enabled && activeClip.spatialVideo.mode !== '2d';
                const nextMode = !isCurrently3D
                  ? 'anaglyph-3d'
                  : activeClip.spatialVideo?.mode === 'anaglyph-3d'
                  ? 'side-by-side'
                  : '2d';

                activeClip.spatialVideo = {
                  enabled: nextMode !== '2d',
                  mode: nextMode as any,
                  disparity: activeClip.spatialVideo?.disparity || 0,
                  eyeSeparation: 18,
                };
                onStepFrame(0);
              }
            }}
            className={`p-1.5 rounded-md transition-colors flex items-center gap-1 text-xs font-normal ${
              project.spine.some(
                (c) =>
                  currentTime >= c.timelineIn &&
                  currentTime < c.timelineIn + c.duration &&
                  c.spatialVideo?.enabled &&
                  c.spatialVideo.mode !== '2d'
              )
                ? 'bg-[#2c2c2e] text-white border border-[#3e3e42]'
                : 'text-[#8e8e93] hover:text-[#d1d1d6] hover:bg-[#242426]'
            }`}
            title="Toggle Spatial Video Mode"
          >
            <Glasses size={13} />
            <span className="hidden xl:inline">Spatial 3D</span>
          </button>

          <button
            onClick={() => setShowSafeZones(!showSafeZones)}
            className={`p-1.5 rounded-md transition-colors ${
              showSafeZones ? 'bg-[#2c2c2e] text-[#0a84ff] border border-[#3e3e42]' : 'text-[#8e8e93] hover:text-[#d1d1d6] hover:bg-[#242426]'
            }`}
            title="Toggle Safe Zones"
          >
            <Grid size={14} />
          </button>

          <button
            onClick={toggleMute}
            className="p-1.5 text-[#8e8e93] hover:text-white hover:bg-[#242426] rounded-md transition-colors"
            title={isMuted ? 'Unmute' : 'Mute Master Audio'}
          >
            {isMuted ? <VolumeX size={14} className="text-[#ff453a]" /> : <Volume2 size={14} />}
          </button>
        </div>

        {/* Center: Playback Transport */}
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => onSeek(0)}
            className="p-1.5 text-gray-300 hover:text-white hover:bg-gray-700 rounded transition-colors"
            title="Go to Beginning"
          >
            <SkipBack size={14} />
          </button>

          <button
            onClick={() => onStepFrame(-1)}
            className="p-1.5 text-gray-300 hover:text-white hover:bg-gray-700 rounded transition-colors"
            title="Step 1 Frame Backward"
          >
            <ChevronLeft size={16} />
          </button>

          <button
            onClick={onTogglePlay}
            className="w-8 h-8 rounded-full bg-fcp-accent hover:bg-fcp-accentHover text-white flex items-center justify-center shadow transition-all hover:scale-105"
            title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
          >
            {isPlaying ? <Pause size={15} /> : <Play size={15} className="ml-0.5" />}
          </button>

          <button
            onClick={() => onStepFrame(1)}
            className="p-1.5 text-gray-300 hover:text-white hover:bg-gray-700 rounded transition-colors"
            title="Step 1 Frame Forward"
          >
            <ChevronRight size={16} />
          </button>

          <button
            onClick={() => onSeek(totalDuration)}
            className="p-1.5 text-gray-300 hover:text-white hover:bg-gray-700 rounded transition-colors"
            title="Go to End"
          >
            <SkipForward size={14} />
          </button>

          <button
            onClick={() => setIsLooping(!isLooping)}
            className={`p-1.5 rounded transition-colors ${
              isLooping ? 'bg-blue-600/30 text-blue-400' : 'text-gray-400 hover:text-white'
            }`}
            title="Toggle Playback Loop"
          >
            <Repeat size={13} />
          </button>
        </div>

        {/* Right: Timecode & Fullscreen */}
        <div className="flex items-center gap-3">
          <div className="text-right font-mono text-[11px]">
            <span className="text-blue-400 font-bold">
              {Timecode.formatSMPTE(currentTime, project.format.frameRate)}
            </span>
            <span className="text-gray-500 mx-1">/</span>
            <span className="text-gray-400">
              {Timecode.formatSMPTE(totalDuration, project.format.frameRate)}
            </span>
          </div>

          <button
            onClick={() => setShowWelcomeCard(true)}
            className="p-1.5 text-[#8e8e93] hover:text-white hover:bg-[#242426] rounded-md transition-colors"
            title="Welcome & Quick Start"
          >
            <HelpCircle size={14} />
          </button>

          <button
            onClick={handleFullscreen}
            className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded transition-colors"
            title="Fullscreen Viewer"
          >
            <Maximize2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};
