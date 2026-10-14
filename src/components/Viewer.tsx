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
  Camera
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
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [showSafeZones, setShowSafeZones] = useState(false);
  const [scopeMode, setScopeMode] = useState<ScopeMode>('off');
  const [isMulticamOpen, setIsMulticamOpen] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

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
        </div>

        {/* Audio Meters */}
        <div className="absolute right-0 top-0 bottom-0">
          <AudioMeters isPlaying={isPlaying} />
        </div>
      </div>

      {/* Viewer Transport Control Bar */}
      <div className="h-10 bg-fcp-header border-t border-fcp-border flex items-center justify-between px-3 text-xs">
        {/* Left: View Controls */}
        <div className="flex items-center gap-2">
          {/* Toggle Multicam */}
          <button
            onClick={() => setIsMulticamOpen(!isMulticamOpen)}
            className={`p-1.5 rounded transition-colors flex items-center gap-1 text-[11px] font-medium ${
              isMulticamOpen
                ? 'bg-blue-600 text-white shadow'
                : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
            }`}
            title="Toggle Multicam Angle Viewer (Keys 1-4)"
          >
            <Camera size={14} />
            <span className="hidden xl:inline">Multicam</span>
          </button>

          {/* Toggle Video Scopes */}
          <button
            onClick={() => setScopeMode(scopeMode === 'off' ? 'waveform' : 'off')}
            className={`p-1.5 rounded transition-colors flex items-center gap-1 text-[11px] font-medium ${
              scopeMode !== 'off'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
            }`}
            title="Toggle Video Scopes"
          >
            <Activity size={14} />
            <span className="hidden xl:inline">Scopes</span>
          </button>

          {/* Toggle Proxy vs Original Media */}
          <button
            onClick={onToggleProxyMedia}
            className={`p-1.5 rounded transition-colors flex items-center gap-1 text-[11px] font-medium ${
              project.useProxyMedia
                ? 'bg-amber-500 text-black font-bold shadow'
                : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
            }`}
            title="Toggle Proxy vs Original Media"
          >
            <HardDrive size={13} />
            <span className="hidden xl:inline">{project.useProxyMedia ? 'Proxy' : 'Original'}</span>
          </button>

          <button
            onClick={() => setShowSafeZones(!showSafeZones)}
            className={`p-1.5 rounded transition-colors ${
              showSafeZones ? 'bg-fcp-accent text-white' : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
            }`}
            title="Toggle Safe Zones"
          >
            <Grid size={14} />
          </button>

          <button
            onClick={toggleMute}
            className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded transition-colors"
            title={isMuted ? 'Unmute' : 'Mute Master Audio'}
          >
            {isMuted ? <VolumeX size={14} className="text-red-400" /> : <Volume2 size={14} />}
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
