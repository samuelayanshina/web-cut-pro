import React, { useState } from 'react';
import { 
  Folder, 
  Film, 
  Music, 
  Type, 
  Sparkles, 
  Plus, 
  Upload, 
  Play, 
  PlusCircle, 
  Layers,
  Palette,
  Trash2
} from 'lucide-react';
import { MediaAsset, MediaType } from '../types/fcp';
import { Timecode } from '../engine/Timecode';

import { FCPSmartCollection } from '../types/fcp';
import { LibraryHierarchyEngine } from '../engine/LibraryHierarchyEngine';

interface MediaBrowserProps {
  assets: MediaAsset[];
  onAddAssetToSpine: (asset: MediaAsset) => void;
  onConnectAsset: (asset: MediaAsset) => void;
  onAddTitle: (titleText: string, type: 'lowerThird' | 'center') => void;
  onImportCustomFiles: (files: FileList) => void;
  onDeleteAsset?: (assetId: string) => void;
  onReplaceSpineWithAsset?: (asset: MediaAsset) => void;
}

export const MediaBrowser: React.FC<MediaBrowserProps> = ({
  assets,
  onAddAssetToSpine,
  onConnectAsset,
  onAddTitle,
  onImportCustomFiles,
  onDeleteAsset,
  onReplaceSpineWithAsset,
}) => {
  const [activeTab, setActiveTab] = useState<'media' | 'titles' | 'generators'>('media');
  const [selectedSmartFilter, setSelectedSmartFilter] = useState<FCPSmartCollection['filterType']>('all_video');
  const [showLibrarySidebar, setShowLibrarySidebar] = useState<boolean>(false);

  const filteredAssets = LibraryHierarchyEngine.filterAssetsBySmartCollection(assets, selectedSmartFilter);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onImportCustomFiles(e.target.files);
    }
  };

  return (
    <div className="flex flex-col h-full bg-fcp-panel border-r border-fcp-border select-none text-xs">
      {/* Top Sidebar Tabs (Libraries / Titles / Generators) */}
      <div className="flex items-center border-b border-[#2c2c2e] bg-[#18181a] px-2">
        <button
          onClick={() => setActiveTab('media')}
          className={`flex items-center gap-1.5 py-2 px-3 border-b-2 font-medium transition-colors ${
            activeTab === 'media'
              ? 'border-[#0071e3] text-white'
              : 'border-transparent text-[#8e8e93] hover:text-[#d1d1d6]'
          }`}
        >
          <Film size={13} />
          <span>Clips</span>
        </button>

        <button
          onClick={() => setActiveTab('titles')}
          className={`flex items-center gap-1.5 py-2 px-3 border-b-2 font-medium transition-colors ${
            activeTab === 'titles'
              ? 'border-[#0071e3] text-white'
              : 'border-transparent text-[#8e8e93] hover:text-[#d1d1d6]'
          }`}
        >
          <Type size={13} />
          <span>Titles</span>
        </button>

        <button
          onClick={() => setActiveTab('generators')}
          className={`flex items-center gap-1.5 py-2 px-3 border-b-2 font-medium transition-colors ${
            activeTab === 'generators'
              ? 'border-[#0071e3] text-white'
              : 'border-transparent text-[#8e8e93] hover:text-[#d1d1d6]'
          }`}
        >
          <Palette size={13} />
          <span>Generators</span>
        </button>
      </div>

      {/* Final Cut Pro Library Hierarchy & Smart Collections */}
      {activeTab === 'media' && (
        <div className="border-b border-fcp-border bg-[#181818]">
          <div
            onClick={() => setShowLibrarySidebar(s => !s)}
            className="flex items-center justify-between px-2.5 py-1.5 cursor-pointer hover:bg-[#202020] text-gray-300"
          >
            <div className="flex items-center gap-1.5 font-medium text-[11px]">
              <Folder size={13} className="text-amber-400" />
              <span className="text-white font-semibold">Web Cut Pro.fcpbundle</span>
            </div>
            <span className="text-[10px] text-gray-500">
              {showLibrarySidebar ? '▾' : '▸'}
            </span>
          </div>

          {showLibrarySidebar && (
            <div className="px-2 pb-2 pt-0.5 space-y-0.5 bg-[#141414] border-t border-[#222222]">
              <div className="text-[10px] uppercase font-bold text-gray-500 px-1 pt-1">Smart Collections</div>
              {[
                { id: 'all_video', label: 'All Video', icon: Film, count: assets.filter(a => a.type === 'video').length },
                { id: 'all_audio', label: 'All Audio', icon: Music, count: assets.filter(a => a.type === 'audio').length },
                { id: 'favorites', label: 'Favorites', icon: Sparkles, count: Math.ceil(assets.length / 2) },
                { id: 'high_fps', label: 'High FPS (>50fps)', icon: Play, count: assets.filter(a => (a.fps || 24) >= 50).length },
                { id: 'dialogue', label: 'Dialogue Role', icon: Layers, count: 2 },
                { id: 'music', label: 'Music Role', icon: Music, count: 1 },
              ].map(sc => {
                const IconComponent = sc.icon;
                const isSelected = selectedSmartFilter === sc.id;
                return (
                  <div
                    key={sc.id}
                    onClick={() => setSelectedSmartFilter(sc.id as any)}
                    className={`flex items-center justify-between px-2 py-1 rounded cursor-pointer text-[11px] transition-colors ${
                      isSelected ? 'bg-fcp-accent text-white font-medium' : 'text-gray-400 hover:bg-[#202020] hover:text-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <IconComponent size={12} className={isSelected ? 'text-white' : 'text-gray-400'} />
                      <span>{sc.label}</span>
                    </div>
                    <span className={`text-[10px] ${isSelected ? 'text-blue-100' : 'text-gray-500'}`}>{sc.count}</span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Sub-header Filter & Import Bar */}
          <div className="flex items-center justify-between p-2 border-t border-fcp-border bg-[#1d1d1d]">
            <span className="text-[11px] text-gray-400 font-medium">
              {filteredAssets.length} Clips
            </span>

            {/* Import Media Button */}
            <label className="flex items-center gap-1.5 px-2.5 py-1 bg-[#242426] hover:bg-[#2c2c2e] text-[#d1d1d6] hover:text-white border border-[#38383a] rounded-md cursor-pointer transition-colors text-xs font-normal">
              <Upload size={12} className="text-[#8e8e93]" />
              <span>Import Media</span>
              <input
                type="file"
                multiple
                accept="video/*,audio/*,image/*"
                className="hidden"
                onChange={handleFileInput}
              />
            </label>
          </div>
        </div>
      )}

      {/* Media Grid Content */}
      <div className="flex-1 overflow-y-auto p-2">
        {activeTab === 'media' && (
          <div className="grid grid-cols-2 gap-2">
            {filteredAssets.map((asset) => (
              <div
                key={asset.id}
                onClick={() => onAddAssetToSpine(asset)}
                className="group relative bg-[#181818] border border-gray-800 hover:border-fcp-accent rounded-md overflow-hidden flex flex-col cursor-pointer transition-all shadow-sm"
              >
                {/* Thumbnail / Filmstrip Preview */}
                <div className="w-full h-20 bg-black relative flex items-center justify-center overflow-hidden">
                  {asset.thumbnailUrl ? (
                    <img
                      src={asset.thumbnailUrl}
                      alt={asset.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : asset.type === 'audio' ? (
                    <div className="flex flex-col items-center justify-center text-emerald-400">
                      <Music size={24} />
                      <span className="text-[9px] mt-1 text-gray-400">Audio Track</span>
                    </div>
                  ) : (
                    <div
                      className="w-full h-full flex items-center justify-center text-gray-500 font-mono text-[10px]"
                      style={{ backgroundColor: asset.color || '#1e293b' }}
                    >
                      <Film size={24} className="text-gray-400" />
                    </div>
                  )}

                  {/* Delete custom asset button */}
                  {asset.id.startsWith('local-') && onDeleteAsset && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteAsset(asset.id);
                      }}
                      className="absolute top-1 right-1 p-1 bg-black/75 hover:bg-red-600 text-gray-300 hover:text-white rounded transition-colors z-20 shadow-md"
                      title="Delete this custom clip from Library"
                    >
                      <Trash2 size={11} />
                    </button>
                  )}

                  {/* Duration Badge */}
                  <span className="absolute bottom-1 right-1 bg-black/85 px-1 py-0.5 rounded text-[9px] font-mono text-gray-200 shadow">
                    {Timecode.formatDuration(asset.duration)}
                  </span>
                </div>

                {/* Name & Type */}
                <div className="p-1.5 flex flex-col justify-between flex-1">
                  <span className="font-medium text-gray-200 truncate text-[11px]" title={asset.name}>
                    {asset.name}
                  </span>

                  {/* Action Overlay Buttons */}
                  <div className="mt-1 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {onReplaceSpineWithAsset && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onReplaceSpineWithAsset(asset);
                        }}
                        className="flex-1 py-1 bg-[#0071e3] hover:bg-[#0077ed] text-white rounded text-[10px] font-medium text-center shadow-sm"
                        title="Start fresh project with this video"
                      >
                        Use on Timeline
                      </button>
                    )}

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddAssetToSpine(asset);
                      }}
                      className="px-2 py-1 bg-[#2c2c2e] hover:bg-[#3a3a3c] text-white rounded text-[10px] font-medium text-center"
                      title="Append to Primary Storyline (E)"
                    >
                      + Add
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onConnectAsset(asset);
                      }}
                      className="px-1.5 py-1 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded text-[10px]"
                      title="Connect Clip / B-Roll (Q)"
                    >
                      Connect
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Titles Tab */}
        {activeTab === 'titles' && (
          <div className="space-y-2">
            <div
              onClick={() => onAddTitle('CINEMATIC 3D TITLE', 'center')}
              className="p-3 bg-[#1c1c1c] hover:bg-[#252525] border border-gray-800 hover:border-purple-500 rounded cursor-pointer transition-all flex items-center justify-between"
            >
              <div>
                <div className="font-semibold text-purple-300 text-xs">Cinematic 3D Gold Extrusion</div>
                <div className="text-[10px] text-gray-400">Extruded 3D bevels, specular lighting & pitch/yaw</div>
              </div>
              <PlusCircle size={16} className="text-purple-400" />
            </div>

            <div
              onClick={() => onAddTitle('NEON CYBER TITLE', 'center')}
              className="p-3 bg-[#1c1c1c] hover:bg-[#252525] border border-gray-800 hover:border-cyan-500 rounded cursor-pointer transition-all flex items-center justify-between"
            >
              <div>
                <div className="font-semibold text-cyan-300 text-xs">Neon Glass Refraction 3D</div>
                <div className="text-[10px] text-gray-400">Translucent neon core with edge refraction</div>
              </div>
              <PlusCircle size={16} className="text-cyan-400" />
            </div>

            <div
              onClick={() => onAddTitle('Sarah Jenkins | Lead Director', 'lowerThird')}
              className="p-3 bg-[#1c1c1c] hover:bg-[#252525] border border-gray-800 hover:border-blue-500 rounded cursor-pointer transition-all flex items-center justify-between"
            >
              <div>
                <div className="font-semibold text-blue-300 text-xs">Apple Motion Rigged Lower Third</div>
                <div className="text-[10px] text-gray-400">Procedural accent bar & live indicator badge</div>
              </div>
              <PlusCircle size={16} className="text-blue-400" />
            </div>

            <div
              onClick={() => onAddTitle('Chapter 01 — The Beginning', 'lowerThird')}
              className="p-3 bg-[#1c1c1c] hover:bg-[#252525] border border-gray-800 hover:border-amber-500 rounded cursor-pointer transition-all flex items-center justify-between"
            >
              <div>
                <div className="font-semibold text-amber-300 text-xs">Minimalist Chapter Lower Third</div>
                <div className="text-[10px] text-gray-400">Clean serif typography with fade-in reveal</div>
              </div>
              <PlusCircle size={16} className="text-amber-400" />
            </div>
          </div>
        )}

        {/* Generators Tab */}
        {activeTab === 'generators' && (
          <div className="grid grid-cols-2 gap-2">
            {[
              { name: 'Vivid Blue Solid', color: '#1e3a8a' },
              { name: 'Midnight Charcoal', color: '#09090b' },
              { name: 'Sunset Amber', color: '#b45309' },
              { name: 'Emerald Forest', color: '#064e3b' },
            ].map((gen, idx) => (
              <div
                key={idx}
                onClick={() => {
                  onAddAssetToSpine({
                    id: `generator-${idx}-${Date.now()}`,
                    name: gen.name,
                    type: 'generator',
                    url: '',
                    duration: 5.0,
                    color: gen.color,
                  });
                }}
                className="bg-[#181818] border border-gray-800 hover:border-amber-500 rounded-md p-2 flex flex-col gap-2 cursor-pointer transition-colors"
              >
                <div
                  className="w-full h-12 rounded"
                  style={{ backgroundColor: gen.color }}
                />
                <span className="text-[11px] font-medium text-gray-200 truncate">{gen.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
