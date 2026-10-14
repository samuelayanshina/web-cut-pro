import React, { useState } from 'react';
import { FCPProject, TimelineClip, AudioRole, Marker } from '../types/fcp';
import { Timecode } from '../engine/Timecode';
import { 
  Search, 
  Film, 
  Music, 
  VolumeX, 
  Volume2, 
  Bookmark, 
  CheckSquare, 
  Square, 
  X,
  Layers,
  Tag
} from 'lucide-react';

interface TimelineIndexProps {
  isOpen: boolean;
  onClose: () => void;
  project: FCPProject;
  selectedClipId: string | null;
  onSelectClip: (clip: TimelineClip) => void;
  onSeek: (time: number) => void;
  onToggleRoleMute: (role: AudioRole) => void;
  onToggleMarkerComplete: (markerId: string) => void;
}

export const TimelineIndex: React.FC<TimelineIndexProps> = ({
  isOpen,
  onClose,
  project,
  selectedClipId,
  onSelectClip,
  onSeek,
  onToggleRoleMute,
  onToggleMarkerComplete,
}) => {
  const [activeTab, setActiveTab] = useState<'clips' | 'roles' | 'markers'>('clips');
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  // Flatten all spine + connected clips
  const allClips: TimelineClip[] = [];
  project.spine.forEach((c) => {
    allClips.push(c);
    if (c.connectedClips) {
      c.connectedClips.forEach((conn) => allClips.push(conn));
    }
  });

  const filteredClips = allClips.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-72 h-full bg-[#1c1c1c] border-r border-fcp-border flex flex-col select-none text-xs z-30 shadow-2xl">
      {/* Index Header & Tab Bar */}
      <div className="bg-[#242424] border-b border-fcp-border p-2 flex items-center justify-between">
        <div className="flex items-center gap-1 font-bold text-gray-200">
          <Layers size={13} className="text-amber-400" />
          <span className="uppercase text-[11px] tracking-wider">Timeline Index</span>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white p-0.5 rounded"
          title="Close Index"
        >
          <X size={14} />
        </button>
      </div>

      {/* Tab Switcher */}
      <div className="flex border-b border-fcp-border bg-[#181818] text-[11px]">
        <button
          onClick={() => setActiveTab('clips')}
          className={`flex-1 py-1.5 font-medium border-b-2 text-center transition-colors ${
            activeTab === 'clips' ? 'border-fcp-accent text-white' : 'border-transparent text-gray-400'
          }`}
        >
          Clips ({allClips.length})
        </button>
        <button
          onClick={() => setActiveTab('roles')}
          className={`flex-1 py-1.5 font-medium border-b-2 text-center transition-colors ${
            activeTab === 'roles' ? 'border-emerald-500 text-white' : 'border-transparent text-gray-400'
          }`}
        >
          Roles
        </button>
        <button
          onClick={() => setActiveTab('markers')}
          className={`flex-1 py-1.5 font-medium border-b-2 text-center transition-colors ${
            activeTab === 'markers' ? 'border-amber-500 text-white' : 'border-transparent text-gray-400'
          }`}
        >
          Markers ({project.markers.length})
        </button>
      </div>

      {/* Search Input for Clips */}
      {activeTab === 'clips' && (
        <div className="p-2 border-b border-gray-800 bg-[#161616]">
          <div className="flex items-center gap-1.5 bg-[#202020] px-2 py-1 rounded border border-gray-700">
            <Search size={12} className="text-gray-400" />
            <input
              type="text"
              placeholder="Search clips..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none text-white text-[11px] focus:outline-none w-full"
            />
          </div>
        </div>
      )}

      {/* Index Content */}
      <div className="flex-1 overflow-y-auto p-1.5 space-y-1">
        {/* 1. CLIPS TAB */}
        {activeTab === 'clips' && (
          <div>
            {filteredClips.map((clip) => {
              const isSelected = selectedClipId === clip.id;
              return (
                <div
                  key={clip.id}
                  onClick={() => {
                    onSelectClip(clip);
                    onSeek(clip.timelineIn);
                  }}
                  className={`p-1.5 rounded flex items-center justify-between cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-fcp-accent text-white font-medium shadow-sm'
                      : 'hover:bg-[#252525] text-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-1.5 truncate max-w-[170px]">
                    {clip.type === 'audio' ? (
                      <Music size={12} className="text-emerald-400 flex-shrink-0" />
                    ) : (
                      <Film size={12} className="text-blue-400 flex-shrink-0" />
                    )}
                    <span className="truncate text-[11px]">{clip.name}</span>
                  </div>

                  <span className="text-[10px] font-mono opacity-70">
                    {Timecode.formatDuration(clip.duration)}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* 2. ROLES TAB (Dialogue, Music, Effects) */}
        {activeTab === 'roles' && (
          <div className="p-2 space-y-2">
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
              Audio & Video Roles Sub-Mix
            </div>

            {(['dialogue', 'music', 'effects'] as AudioRole[]).map((role) => {
              const isMuted = project.activeRoleMutes?.[role] || false;
              const count = allClips.filter((c) => c.role === role).length;

              return (
                <div
                  key={role}
                  className="p-2 bg-[#202020] rounded border border-gray-700 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        role === 'dialogue'
                          ? 'bg-blue-400'
                          : role === 'music'
                          ? 'bg-emerald-400'
                          : 'bg-purple-400'
                      }`}
                    />
                    <div>
                      <div className="font-semibold text-white capitalize text-[11px]">{role}</div>
                      <div className="text-[9px] text-gray-400">{count} clips assigned</div>
                    </div>
                  </div>

                  <button
                    onClick={() => onToggleRoleMute(role)}
                    className={`p-1.5 rounded transition-colors ${
                      isMuted
                        ? 'bg-red-900/60 text-red-300 border border-red-500'
                        : 'bg-gray-700 text-gray-300 hover:text-white'
                    }`}
                    title={isMuted ? `Unmute ${role}` : `Mute ${role}`}
                  >
                    {isMuted ? <VolumeX size={13} /> : <Volume2 size={13} />}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* 3. MARKERS TAB */}
        {activeTab === 'markers' && (
          <div className="p-1 space-y-1">
            {project.markers.length === 0 ? (
              <div className="text-center text-gray-500 py-6 text-[11px]">
                No markers created. Press 'M' to drop a marker at playhead.
              </div>
            ) : (
              project.markers.map((m) => (
                <div
                  key={m.id}
                  onClick={() => onSeek(m.time)}
                  className="p-2 bg-[#202020] hover:bg-[#282828] border border-gray-800 rounded flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleMarkerComplete(m.id);
                      }}
                      className="text-gray-400 hover:text-white"
                    >
                      {m.completed ? (
                        <CheckSquare size={13} className="text-emerald-400" />
                      ) : (
                        <Square size={13} />
                      )}
                    </button>
                    <div>
                      <span className={`text-[11px] font-medium ${m.completed ? 'line-through opacity-60 text-gray-400' : 'text-gray-200'}`}>
                        {m.label}
                      </span>
                      <div className="text-[9px] font-mono text-gray-500">
                        {Timecode.formatDuration(m.time)}
                      </div>
                    </div>
                  </div>

                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: m.color }}
                  />
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};
