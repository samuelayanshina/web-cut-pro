import React, { useRef, useState, useEffect } from 'react';
import { 
  MousePointer, 
  Scissors, 
  MoveHorizontal, 
  Hand, 
  Magnet, 
  Eye, 
  ZoomIn, 
  ZoomOut, 
  Plus, 
  Trash2, 
  Volume2,
  Film,
  Music,
  Type,
  Split,
  Radio,
  Layers,
  Bookmark,
  Play,
  Trash,
  X
} from 'lucide-react';
import { TimelineClip, ToolType, FCPProject, MediaAsset, AudioRole } from '../types/fcp';
import { Timecode } from '../engine/Timecode';
import { MagneticTimelineEngine } from '../engine/MagneticTimeline';
import { TimelineIndex } from './TimelineIndex';

interface TimelineProps {
  project: FCPProject;
  assets: MediaAsset[];
  currentTime: number;
  totalDuration: number;
  selectedClipId: string | null;
  activeTool: ToolType;
  snappingEnabled: boolean;
  skimmerEnabled: boolean;
  onSelectClip: (clip: TimelineClip | null) => void;
  onSeek: (time: number) => void;
  onUpdateSpine: (newSpine: TimelineClip[]) => void;
  onSetActiveTool: (tool: ToolType) => void;
  onToggleSnapping: () => void;
  onToggleSkimmer: () => void;
  onBladeAtPlayhead: () => void;
  onInsertGap: () => void;
  onToggleRoleMute: (role: AudioRole) => void;
  onToggleMarkerComplete: (markerId: string) => void;
  onLoadDemoProject?: () => void;
  onDeleteClip?: (clipId: string) => void;
  onClearTimeline?: () => void;
}

export const Timeline: React.FC<TimelineProps> = ({
  project,
  assets,
  currentTime,
  totalDuration,
  selectedClipId,
  activeTool,
  snappingEnabled,
  skimmerEnabled,
  onSelectClip,
  onSeek,
  onUpdateSpine,
  onSetActiveTool,
  onToggleSnapping,
  onToggleSkimmer,
  onBladeAtPlayhead,
  onInsertGap,
  onToggleRoleMute,
  onToggleMarkerComplete,
  onLoadDemoProject,
  onDeleteClip,
  onClearTimeline,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const trackAreaRef = useRef<HTMLDivElement | null>(null);

  const [pixelsPerSecond, setPixelsPerSecond] = useState<number>(50);
  const [skimmerTime, setSkimmerTime] = useState<number | null>(null);
  const [isDraggingPlayhead, setIsDraggingPlayhead] = useState(false);
  const [isIndexOpen, setIsIndexOpen] = useState(false);
  const [trimmingState, setTrimmingState] = useState<{
    clipId: string;
    edge: 'start' | 'end';
    initialX: number;
    initialDuration: number;
  } | null>(null);
  const [showCoachTip, setShowCoachTip] = useState<boolean>(() => {
    try {
      return !localStorage.getItem('webcutpro_dismissed_tip_v1');
    } catch {
      return true;
    }
  });

  const spine = project.spine;
  const timelineWidth = Math.max(1200, (totalDuration + 5) * pixelsPerSecond);

  const handleTimelineMouseDown = (e: React.MouseEvent) => {
    if (!trackAreaRef.current) return;
    const rect = trackAreaRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left + (containerRef.current?.scrollLeft || 0);
    const targetTime = Math.max(0, clickX / pixelsPerSecond);

    if (snappingEnabled) {
      const snap = MagneticTimelineEngine.getSnapTime(spine, targetTime);
      onSeek(snap.snappedTime);
    } else {
      onSeek(targetTime);
    }
    setIsDraggingPlayhead(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDraggingPlayhead && trackAreaRef.current) {
        const rect = trackAreaRef.current.getBoundingClientRect();
        const mouseX = e.clientX - rect.left + (containerRef.current?.scrollLeft || 0);
        let targetTime = Math.max(0, mouseX / pixelsPerSecond);
        if (snappingEnabled) {
          const snap = MagneticTimelineEngine.getSnapTime(spine, targetTime);
          targetTime = snap.snappedTime;
        }
        onSeek(targetTime);
      }

      if (trimmingState) {
        const deltaX = e.clientX - trimmingState.initialX;
        const deltaSeconds = deltaX / pixelsPerSecond;
        const newSpine = MagneticTimelineEngine.rippleTrimClip(
          spine,
          trimmingState.clipId,
          trimmingState.edge,
          deltaSeconds
        );
        onUpdateSpine(newSpine);
      }
    };

    const handleMouseUp = () => {
      setIsDraggingPlayhead(false);
      setTrimmingState(null);
    };

    if (isDraggingPlayhead || trimmingState) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingPlayhead, trimmingState, pixelsPerSecond, spine, snappingEnabled]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!skimmerEnabled || !trackAreaRef.current) {
      setSkimmerTime(null);
      return;
    }
    const rect = trackAreaRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left + (containerRef.current?.scrollLeft || 0);
    const time = Math.max(0, mouseX / pixelsPerSecond);
    setSkimmerTime(time);
  };

  const handleMouseLeave = () => {
    setSkimmerTime(null);
  };

  const handleClipClick = (e: React.MouseEvent, clip: TimelineClip) => {
    e.stopPropagation();
    if (activeTool === 'blade') {
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const splitOffset = clickX / pixelsPerSecond;
      const splitTime = clip.timelineIn + splitOffset;
      const newSpine = MagneticTimelineEngine.bladeClipAtTime(spine, splitTime);
      onUpdateSpine(newSpine);
    } else {
      onSelectClip(clip);
    }
  };

  return (
    <div className="flex h-full bg-[#181818] select-none text-xs">
      {/* 1. DOCKED TIMELINE INDEX PANEL */}
      <TimelineIndex
        isOpen={isIndexOpen}
        onClose={() => setIsIndexOpen(false)}
        project={project}
        selectedClipId={selectedClipId}
        onSelectClip={onSelectClip}
        onSeek={onSeek}
        onToggleRoleMute={onToggleRoleMute}
        onToggleMarkerComplete={onToggleMarkerComplete}
      />

      {/* 2. TIMELINE MAIN WORKSPACE */}
      <div className="flex-1 flex flex-col h-full min-w-0">
        {/* Timeline Control Toolbar */}
        <div className="h-9 bg-[#18181a] border-b border-[#2c2c2e] flex items-center justify-between px-3">
          {/* Left: Index Button + Tools */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsIndexOpen(!isIndexOpen)}
              className={`px-2 py-1 rounded-md transition-colors flex items-center gap-1 font-medium text-[11px] ${
                isIndexOpen
                  ? 'bg-[#2c2c2e] text-white border border-[#3e3e42]'
                  : 'text-[#8e8e93] hover:text-[#d1d1d6] hover:bg-[#242426]'
              }`}
              title="Toggle Timeline Index (Clips, Roles, Markers)"
            >
              <Layers size={13} />
              <span>Index</span>
            </button>

            <div className="h-4 w-[1px] bg-[#2c2c2e] mx-1" />

            <button
              onClick={() => onSetActiveTool('select')}
              className={`p-1.5 rounded-md transition-colors ${
                activeTool === 'select'
                  ? 'bg-[#2c2c2e] text-white border border-[#3e3e42]'
                  : 'text-[#8e8e93] hover:text-[#d1d1d6] hover:bg-[#242426]'
              }`}
              title="Select Tool (A)"
            >
              <MousePointer size={14} />
            </button>

            <button
              onClick={() => onSetActiveTool('trim')}
              className={`p-1.5 rounded-md transition-colors ${
                activeTool === 'trim'
                  ? 'bg-[#2c2c2e] text-white border border-[#3e3e42]'
                  : 'text-[#8e8e93] hover:text-[#d1d1d6] hover:bg-[#242426]'
              }`}
              title="Trim Tool (T)"
            >
              <MoveHorizontal size={14} />
            </button>

            <button
              onClick={() => onSetActiveTool('blade')}
              className={`p-1.5 rounded-md transition-colors ${
                activeTool === 'blade'
                  ? 'bg-[#2c2c2e] text-white border border-[#3e3e42]'
                  : 'text-[#8e8e93] hover:text-[#d1d1d6] hover:bg-[#242426]'
              }`}
              title="Blade Tool (B)"
            >
              <Scissors size={14} />
            </button>

            <button
              onClick={() => onSetActiveTool('hand')}
              className={`p-1.5 rounded-md transition-colors ${
                activeTool === 'hand'
                  ? 'bg-[#2c2c2e] text-white border border-[#3e3e42]'
                  : 'text-[#8e8e93] hover:text-[#d1d1d6] hover:bg-[#242426]'
              }`}
              title="Hand Tool (H)"
            >
              <Hand size={14} />
            </button>

            <div className="h-4 w-[1px] bg-[#2c2c2e] mx-1" />

            <button
              onClick={onBladeAtPlayhead}
              className="flex items-center gap-1.5 px-2 py-1 text-[#c7c7cc] hover:text-white hover:bg-[#242426] rounded-md transition-colors text-xs font-normal"
              title="Blade at Playhead (⌘B)"
            >
              <Split size={13} className="text-[#8e8e93]" />
              <span className="hidden sm:inline">Blade</span>
            </button>

            <button
              onClick={onInsertGap}
              className="flex items-center gap-1.5 px-2 py-1 text-[#c7c7cc] hover:text-white hover:bg-[#242426] rounded-md transition-colors text-xs font-normal"
              title="Insert Gap Clip (⌥W)"
            >
              <Plus size={13} className="text-[#8e8e93]" />
              <span className="hidden sm:inline">Gap</span>
            </button>

            {selectedClipId && onDeleteClip && (
              <button
                onClick={() => onDeleteClip(selectedClipId)}
                className="flex items-center gap-1.5 px-2.5 py-1 bg-red-950/70 hover:bg-red-900 border border-red-800 text-red-200 hover:text-white rounded-md transition-colors text-xs font-medium"
                title="Delete Selected Clip (Backspace / ⌫)"
              >
                <Trash2 size={13} className="text-red-400" />
                <span>Delete Clip</span>
              </button>
            )}

            {spine.length > 0 && onClearTimeline && (
              <button
                onClick={onClearTimeline}
                className="flex items-center gap-1.5 px-2 py-1 text-[#8e8e93] hover:text-red-400 hover:bg-[#242426] rounded-md transition-colors text-xs font-normal"
                title="Clear All Clips from Timeline"
              >
                <Trash size={12} />
                <span className="hidden md:inline">Clear All</span>
              </button>
            )}
          </div>

          {/* Center: Friendly 1-Line Coach Tip Pill */}
          {showCoachTip && (
            <div className="hidden lg:flex items-center gap-2 px-3 py-0.5 bg-[#202022] border border-[#323236] rounded-full text-[11px] text-[#c7c7cc] shadow-sm animate-in fade-in">
              <span className="text-[#0a84ff]">💡</span>
              <span><strong>Tip:</strong> Press <strong>Space</strong> to Play • <strong>⌘B</strong> to Cut • <strong>Delete</strong> to Remove</span>
              <button
                onClick={() => {
                  setShowCoachTip(false);
                  try {
                    localStorage.setItem('webcutpro_dismissed_tip_v1', 'true');
                  } catch {}
                }}
                className="text-[#636366] hover:text-white ml-1 text-xs"
                title="Dismiss Tip"
              >
                ✕
              </button>
            </div>
          )}

          {/* Right Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={onToggleSkimmer}
              className={`p-1.5 rounded-md transition-colors ${
                skimmerEnabled
                  ? 'bg-[#2c2c2e] text-[#0a84ff] border border-[#3e3e42]'
                  : 'text-[#8e8e93] hover:text-[#d1d1d6] hover:bg-[#242426]'
              }`}
              title="Toggle Skimmer (S)"
            >
              <Eye size={14} />
            </button>

            <button
              onClick={onToggleSnapping}
              className={`p-1.5 rounded-md transition-colors ${
                snappingEnabled
                  ? 'bg-[#2c2c2e] text-[#0a84ff] border border-[#3e3e42]'
                  : 'text-[#8e8e93] hover:text-[#d1d1d6] hover:bg-[#242426]'
              }`}
              title="Toggle Snapping (N)"
            >
              <Magnet size={14} />
            </button>

            <div className="h-4 w-[1px] bg-[#2c2c2e] mx-1" />

            <div className="flex items-center gap-1.5">
              <ZoomOut size={13} className="text-[#636366]" />
              <input
                type="range"
                min="20"
                max="150"
                value={pixelsPerSecond}
                onChange={(e) => setPixelsPerSecond(Number(e.target.value))}
                className="w-16 sm:w-24 accent-[#0071e3] h-1 bg-[#38383a] rounded cursor-pointer"
                title="Zoom Level"
              />
              <ZoomIn size={13} className="text-[#636366]" />
            </div>
          </div>
        </div>

        {/* Scrollable Canvas Container */}
        <div
          ref={containerRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="flex-1 overflow-x-auto overflow-y-auto relative bg-[#151515]"
        >
          <div
            ref={trackAreaRef}
            style={{ width: `${timelineWidth}px` }}
            className="relative min-h-full pb-8 cursor-default"
          >
            {/* 1. TIMELINE RULER & MARKERS */}
            <div
              onMouseDown={handleTimelineMouseDown}
              className="h-7 bg-[#1c1c1c] border-b border-gray-800 relative cursor-pointer select-none sticky top-0 z-20"
            >
              {Array.from({ length: Math.ceil(totalDuration + 10) }).map((_, sec) => (
                <div
                  key={sec}
                  style={{ left: `${sec * pixelsPerSecond}px` }}
                  className="absolute top-0 bottom-0 flex flex-col justify-between pointer-events-none"
                >
                  <span className="text-[9px] font-mono text-gray-500 pl-1">
                    {Timecode.formatDuration(sec)}
                  </span>
                  <div className="w-[1px] h-2 bg-gray-600" />
                </div>
              ))}

              {/* Render Markers on Ruler */}
              {project.markers.map((m) => (
                <div
                  key={m.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSeek(m.time);
                  }}
                  style={{ left: `${m.time * pixelsPerSecond}px` }}
                  className="absolute top-0 w-3 h-3 -translate-x-1/2 flex items-center justify-center cursor-pointer z-30"
                  title={`${m.label} (${m.type})`}
                >
                  <Bookmark
                    size={11}
                    style={{ fill: m.color, color: m.color }}
                  />
                </div>
              ))}
            </div>

            {/* 2. TRACK CONTENT AREA */}
            <div className="pt-4 px-2 space-y-3 relative">
              {/* Secondary Storylines */}
              <div className="h-10 relative">
                {spine.map((parentClip) => {
                  if (!parentClip.connectedClips || parentClip.connectedClips.length === 0) return null;

                  return parentClip.connectedClips.map((conn) => {
                    const connStart = parentClip.timelineIn + (conn.anchorOffset || 0);
                    const isSelected = selectedClipId === conn.id;

                    return (
                      <div
                        key={conn.id}
                        onClick={(e) => handleClipClick(e, conn)}
                        style={{
                          left: `${connStart * pixelsPerSecond}px`,
                          width: `${Math.max(20, conn.duration * pixelsPerSecond)}px`,
                        }}
                        className={`absolute top-0 h-9 rounded px-2 py-1 flex items-center justify-between text-xs cursor-pointer border transition-all shadow-md ${
                          conn.type === 'title'
                            ? 'bg-purple-900/80 border-purple-500 text-purple-100'
                            : 'bg-indigo-900/80 border-indigo-500 text-indigo-100'
                        } ${isSelected ? 'ring-2 ring-yellow-400 z-10' : ''}`}
                      >
                        <div className="flex items-center gap-1.5 truncate">
                          {conn.type === 'title' ? <Type size={12} /> : <Film size={12} />}
                          <span className="truncate font-medium text-[11px]">{conn.name}</span>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <span className="text-[9px] opacity-75 font-mono">
                            {conn.duration.toFixed(1)}s
                          </span>
                          {onDeleteClip && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteClip(conn.id);
                              }}
                              className="p-0.5 rounded hover:bg-red-500/40 text-gray-400 hover:text-red-300 transition-colors"
                              title="Delete Connected Clip (⌫)"
                            >
                              <X size={9} />
                            </button>
                          )}
                        </div>
                        <div className="absolute -bottom-3 left-2 w-0.5 h-3 bg-yellow-400/80 pointer-events-none" />
                      </div>
                    );
                  });
                })}
              </div>

              {/* Primary Storyline (Spine) */}
              <div className="h-20 bg-[#111111]/80 rounded-md border border-gray-800 p-1 flex items-center relative shadow-inner">
                {spine.length === 0 ? (
                  <div className="w-full h-full flex items-center justify-between border border-dashed border-[#38383a] rounded bg-[#18181a]/50 text-center px-4 sm:px-6">
                    <div className="flex items-center gap-3 text-[#8e8e93]">
                      <div className="w-8 h-8 rounded-lg bg-[#242426] border border-[#38383a] flex items-center justify-center text-[#0a84ff] shrink-0">
                        <Plus size={16} />
                      </div>
                      <div className="text-left">
                        <div className="text-xs text-[#f5f5f7] font-medium">Timeline is Empty</div>
                        <div className="text-[11px] text-[#8e8e93]">Drag clips from the library above, or drop video files here to start editing</div>
                      </div>
                    </div>

                    {onLoadDemoProject && (
                      <button
                        onClick={onLoadDemoProject}
                        className="px-3 py-1.5 bg-[#0071e3] hover:bg-[#0077ed] text-white rounded-lg text-xs font-medium flex items-center gap-1.5 shadow-sm transition-all shrink-0"
                        title="Load Sample Project to Test"
                      >
                        <Play size={12} className="fill-white" />
                        <span>Try Sample Project</span>
                      </button>
                    )}
                  </div>
                ) : (
                  spine.map((clip) => {
                  const isSelected = selectedClipId === clip.id;
                  const isGap = clip.type === 'gap';
                  const isCompound = clip.type === 'compound';
                  const asset = assets.find((a) => a.id === clip.assetId);

                  return (
                    <div
                      key={clip.id}
                      onClick={(e) => handleClipClick(e, clip)}
                      style={{
                        width: `${Math.max(30, clip.duration * pixelsPerSecond)}px`,
                      }}
                      className={`h-full relative flex flex-col justify-between rounded overflow-hidden select-none cursor-pointer border transition-all ${
                        isGap
                          ? 'bg-[#1e1e1e] border-dashed border-gray-600 text-gray-500'
                          : isCompound
                          ? 'bg-amber-950/80 border-amber-600 text-amber-100'
                          : isSelected
                          ? 'bg-fcp-videoClip border-2 border-yellow-400 shadow-lg shadow-yellow-500/20 z-10'
                          : 'bg-fcp-videoClip/90 hover:bg-fcp-videoClip border-fcp-videoClipBorder/70 text-gray-200'
                      }`}
                    >
                      <div
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          setTrimmingState({
                            clipId: clip.id,
                            edge: 'start',
                            initialX: e.clientX,
                            initialDuration: clip.duration,
                          });
                        }}
                        className="absolute left-0 top-0 bottom-0 w-2.5 hover:bg-yellow-400/80 cursor-col-resize z-10"
                        title="Ripple Trim In"
                      />

                      <div className="px-2 py-1 flex items-center justify-between text-[11px] font-semibold bg-black/40">
                        <div className="flex items-center gap-1.5 truncate">
                          {isGap ? (
                            <span className="text-gray-400 italic">Gap ({clip.duration.toFixed(1)}s)</span>
                          ) : isCompound ? (
                            <>
                              <Layers size={12} className="text-amber-400" />
                              <span className="truncate">{clip.name}</span>
                            </>
                          ) : (
                            <>
                              <Film size={12} className="text-blue-400" />
                              <span className="truncate">{clip.name}</span>
                            </>
                          )}

                          {clip.auditions && clip.auditions.length > 0 && (
                            <span className="flex items-center gap-0.5 text-[8px] bg-amber-500/30 text-amber-300 border border-amber-500/40 px-1 rounded font-mono">
                              <Radio size={8} />
                              Take {(clip.activeAuditionIndex || 0) + 1}/{clip.auditions.length}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {!isGap && (
                            <span className="text-[9px] font-mono opacity-80">
                              {clip.duration.toFixed(1)}s
                            </span>
                          )}
                          {onDeleteClip && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteClip(clip.id);
                              }}
                              className="p-1 rounded hover:bg-red-500/40 text-gray-400 hover:text-red-300 transition-colors"
                              title="Delete Clip (⌫)"
                            >
                              <X size={10} />
                            </button>
                          )}
                        </div>
                      </div>

                      {!isGap && (
                        <div className="flex-1 flex items-center px-1 relative opacity-60 overflow-hidden">
                          <div className="w-full flex items-center gap-[1px] h-3">
                            {asset?.waveformPeaks && asset.waveformPeaks.length > 0
                              ? asset.waveformPeaks.map((peak, wIdx) => (
                                  <div
                                    key={wIdx}
                                    className="flex-1 bg-emerald-400 rounded-full"
                                    style={{ height: `${Math.max(15, peak * 100)}%` }}
                                  />
                                ))
                              : Array.from({ length: 24 }).map((_, wIdx) => (
                                  <div
                                    key={wIdx}
                                    className="flex-1 bg-emerald-400 rounded-full"
                                    style={{ height: `${25 + ((wIdx * 19) % 75)}%` }}
                                  />
                                ))}
                          </div>
                        </div>
                      )}

                      <div
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          setTrimmingState({
                            clipId: clip.id,
                            edge: 'end',
                            initialX: e.clientX,
                            initialDuration: clip.duration,
                          });
                        }}
                        className="absolute right-0 top-0 bottom-0 w-2.5 hover:bg-yellow-400/80 cursor-col-resize z-10"
                        title="Ripple Trim Out"
                      />
                    </div>
                  );
                })
              )}
              </div>

              {/* Connected Audio Storyline */}
              <div className="h-10 relative">
                {spine.map((clip) => {
                  const audioClips = (clip.connectedClips || []).filter((c) => c.type === 'audio');
                  return audioClips.map((ac) => {
                    const acStart = clip.timelineIn + (ac.anchorOffset || 0);
                    const isSelected = selectedClipId === ac.id;

                    return (
                      <div
                        key={ac.id}
                        onClick={(e) => handleClipClick(e, ac)}
                        style={{
                          left: `${acStart * pixelsPerSecond}px`,
                          width: `${Math.max(20, ac.duration * pixelsPerSecond)}px`,
                        }}
                        className={`absolute top-0 h-8 rounded px-2 flex items-center justify-between text-xs cursor-pointer border bg-emerald-950/80 border-emerald-600 text-emerald-200 transition-all ${
                          isSelected ? 'ring-2 ring-yellow-400 z-10' : ''
                        }`}
                      >
                        <div className="flex items-center gap-1 truncate text-[11px]">
                          <Music size={12} />
                          <span className="truncate">{ac.name}</span>
                        </div>
                        <span className="text-[9px] font-mono opacity-80">{ac.duration.toFixed(1)}s</span>
                        <div className="absolute -top-3 left-2 w-0.5 h-3 bg-yellow-400/80 pointer-events-none" />
                      </div>
                    );
                  });
                })}
              </div>
            </div>

            {/* Skimmer */}
            {skimmerEnabled && skimmerTime !== null && (
              <div
                style={{ left: `${skimmerTime * pixelsPerSecond}px` }}
                className="absolute top-0 bottom-0 w-[1.5px] bg-amber-400 z-30 pointer-events-none shadow-sm shadow-amber-400"
              >
                <div className="absolute -top-1 -left-1.5 w-3 h-3 bg-amber-400 rotate-45 rounded-[1px]" />
              </div>
            )}

            {/* Playhead */}
            <div
              style={{ left: `${currentTime * pixelsPerSecond}px` }}
              className="absolute top-0 bottom-0 w-[2px] bg-red-500 z-40 pointer-events-none shadow-md shadow-red-500"
            >
              <div
                onMouseDown={handleTimelineMouseDown}
                className="w-4 h-4 bg-red-500 rounded-sm -left-[7px] -top-1 absolute pointer-events-auto cursor-ew-resize flex items-center justify-center shadow"
              >
                <div className="w-1 h-2 bg-white rounded-full opacity-70" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
