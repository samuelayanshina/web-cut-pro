import React, { useState } from 'react';
import { 
  Sparkles, 
  Film, 
  Sliders, 
  Volume2, 
  Wand2, 
  Search, 
  X, 
  Flame, 
  Activity, 
  Camera, 
  Layers, 
  Zap, 
  Plus, 
  Music,
  Check
} from 'lucide-react';
import { TimelineClip, TransitionType } from '../types/fcp';

interface EffectsBrowserProps {
  isOpen: boolean;
  onClose: () => void;
  selectedClip: TimelineClip | null;
  onApplyEffect: (effectId: string) => void;
  onApplyTransition: (type: TransitionType) => void;
  onApplyBehavior: (type: 'wiggle' | 'oscillate' | 'overshoot' | 'pulse') => void;
  onAddSfxAudio: (name: string, duration: number) => void;
}

export const EffectsBrowser: React.FC<EffectsBrowserProps> = ({
  isOpen,
  onClose,
  selectedClip,
  onApplyEffect,
  onApplyTransition,
  onApplyBehavior,
  onAddSfxAudio
}) => {
  const [activeTab, setActiveTab] = useState<'video' | 'transitions' | 'audio' | 'sfx'>('video');
  const [searchQuery, setSearchQuery] = useState('');
  const [appliedId, setAppliedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const triggerFeedback = (id: string) => {
    setAppliedId(id);
    setTimeout(() => setAppliedId(null), 1200);
  };

  const videoEffects = [
    {
      category: 'Commercial Film & Optics (Dehancer & mFilm style)',
      items: [
        { id: 'halation', name: 'Photochemical Halation', desc: 'Warm red/orange emulsion scatter along contrast edges', icon: Flame, color: 'text-red-400' },
        { id: 'anamorphic', name: 'Anamorphic Lens Flare', desc: 'Cinematic horizontal blue optical flare & iris glow', icon: Sparkles, color: 'text-cyan-400' },
        { id: 'lightleak', name: '35mm Film Burn & Light Leak', desc: 'Organic amber light flare sweeping across edges', icon: Zap, color: 'text-amber-400' },
        { id: 'filmgrain', name: '35mm Real Film Grain', desc: 'Natural silver halide grain noise pattern', icon: Film, color: 'text-gray-300' },
      ]
    },
    {
      category: 'Camera Motion & Behaviors (Motion VFX style)',
      items: [
        { id: 'camera_shake', name: 'Handheld Camera Shake', desc: 'Organic Perlin camera jitter simulation', icon: Camera, color: 'text-emerald-400' },
        { id: 'wiggle', name: 'Procedural Wiggle Behavior', desc: 'Continuous organic transform jitter without keyframes', icon: Activity, color: 'text-purple-400' },
        { id: 'pulse', name: 'Heartbeat Pulse Behavior', desc: 'Harmonic rhythmic scale breathing effect', icon: Activity, color: 'text-pink-400' },
        { id: 'overshoot', name: 'Elastic Overshoot Spring', desc: 'Physics-based kinetic settling spring in-animation', icon: Wand2, color: 'text-blue-400' },
      ]
    },
    {
      category: 'Stylize & Distortion',
      items: [
        { id: 'chromatic', name: 'Chromatic Aberration', desc: 'RGB lens separation and optical edge fringing', icon: Wand2, color: 'text-indigo-400' },
        { id: 'vignette', name: 'Cinematic Vignette', desc: 'Smooth radial edge exposure falloff', icon: Layers, color: 'text-gray-400' },
        { id: 'blur', name: 'Gaussian Lens Blur', desc: 'High-quality optical depth defocus', icon: Layers, color: 'text-blue-300' },
        { id: 'monochrome', name: 'Noir 35mm B&W', desc: 'High-contrast monochrome panchromatic film look', icon: Film, color: 'text-gray-200' },
      ]
    }
  ];

  const transitions: { type: TransitionType; name: string; desc: string; icon: any }[] = [
    { type: 'whipPan', name: 'Whip Pan Motion Blur', desc: 'High-speed directional swipe with dynamic blur', icon: Zap },
    { type: 'lightLeak', name: 'Film Burn / Light Leak Flash', desc: 'Intense organic 35mm flare bridging cuts', icon: Flame },
    { type: 'glitch', name: 'RGB Glitch Displacement', desc: 'Digital cyber artifact and frame shift', icon: Wand2 },
    { type: 'dissolve', name: 'Cross Dissolve (Standard)', desc: 'Smooth broadcast standard opacity blend', icon: Layers },
    { type: 'fadeToBlack', name: 'Dip to Black', desc: 'Dramatic fade through black gap', icon: Film },
    { type: 'slideLeft', name: 'Push Slide Left', desc: 'Smooth directional camera push', icon: Camera },
    { type: 'wipeRight', name: 'Linear Wipe Right', desc: 'Classic horizontal edge reveal', icon: Sliders },
  ];

  const sfxLibrary = [
    { name: 'Cinematic Sub Riser Whoosh', duration: 3.0, category: 'Whooshes & Transitions' },
    { name: 'Impact Sub Bass Drop', duration: 4.0, category: 'Hits & Drops' },
    { name: 'Vintage 35mm Camera Shutter', duration: 1.2, category: 'Foley & Mechanical' },
    { name: 'Film Projector Mechanical Gate', duration: 5.0, category: 'Ambience & Textures' },
    { name: 'Digital Cyber Glitch Hit', duration: 2.0, category: 'Transitions' },
  ];

  return (
    <div className="w-[360px] h-full bg-[#1b1b1b] border-l border-fcp-border flex flex-col select-none text-xs">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-[#242424] border-b border-fcp-border">
        <div className="flex items-center gap-1.5 font-semibold text-white">
          <Wand2 className="w-4 h-4 text-purple-400" />
          <span>FCP Pro Effects & Transitions Browser</span>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-[#333333] rounded text-gray-400 hover:text-white">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center border-b border-fcp-border bg-[#191919] px-2">
        {[
          { id: 'video', label: 'Video Effects' },
          { id: 'transitions', label: 'Transitions' },
          { id: 'sfx', label: 'Sound FX Foley' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`py-2 px-3 font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-fcp-accent text-white font-semibold'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search Input */}
      <div className="p-2 border-b border-fcp-border bg-[#181818]">
        <div className="flex items-center gap-1.5 bg-[#111111] px-2 py-1 rounded border border-gray-700">
          <Search className="w-3.5 h-3.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search effects, transitions, SFX..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent text-gray-200 text-xs focus:outline-none"
          />
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {/* VIDEO EFFECTS TAB */}
        {activeTab === 'video' && (
          <div className="space-y-4">
            {videoEffects.map((cat, idx) => {
              const matchingItems = cat.items.filter(item =>
                item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.desc.toLowerCase().includes(searchQuery.toLowerCase())
              );
              if (matchingItems.length === 0) return null;

              return (
                <div key={idx} className="space-y-1.5">
                  <div className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                    {cat.category}
                  </div>
                  <div className="grid grid-cols-1 gap-1.5">
                    {matchingItems.map(item => {
                      const IconComp = item.icon;
                      const isApplied = appliedId === item.id || selectedClip?.effects.includes(item.id);

                      return (
                        <div
                          key={item.id}
                          onClick={() => {
                            if (['wiggle', 'pulse', 'overshoot'].includes(item.id)) {
                              onApplyBehavior(item.id as any);
                            } else {
                              onApplyEffect(item.id);
                            }
                            triggerFeedback(item.id);
                          }}
                          className={`p-2.5 rounded border cursor-pointer transition-all flex items-center justify-between ${
                            isApplied
                              ? 'bg-purple-950/40 border-purple-500 text-white shadow-sm'
                              : 'bg-[#222222] border-gray-800 hover:border-gray-600 text-gray-300'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <IconComp className={`w-4 h-4 ${item.color}`} />
                            <div>
                              <div className="font-semibold text-xs text-white">{item.name}</div>
                              <div className="text-[10px] text-gray-400 leading-tight">{item.desc}</div>
                            </div>
                          </div>
                          {appliedId === item.id ? (
                            <Check className="w-4 h-4 text-green-400" />
                          ) : (
                            <Plus className="w-3.5 h-3.5 text-gray-500 hover:text-white" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* TRANSITIONS TAB */}
        {activeTab === 'transitions' && (
          <div className="space-y-2">
            <div className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-2">
              Apply to Out-Point of Selected Clip
            </div>
            {transitions.map(tr => {
              const IconComp = tr.icon;
              const isApplied = appliedId === tr.type || selectedClip?.transitionOut?.type === tr.type;

              return (
                <div
                  key={tr.type}
                  onClick={() => {
                    onApplyTransition(tr.type);
                    triggerFeedback(tr.type);
                  }}
                  className={`p-2.5 rounded border cursor-pointer transition-all flex items-center justify-between ${
                    isApplied
                      ? 'bg-blue-950/40 border-blue-500 text-white shadow-sm'
                      : 'bg-[#222222] border-gray-800 hover:border-gray-600 text-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <IconComp className="w-4 h-4 text-amber-400" />
                    <div>
                      <div className="font-semibold text-xs text-white">{tr.name}</div>
                      <div className="text-[10px] text-gray-400">{tr.desc}</div>
                    </div>
                  </div>
                  {appliedId === tr.type ? (
                    <Check className="w-4 h-4 text-green-400" />
                  ) : (
                    <Plus className="w-3.5 h-3.5 text-gray-500 hover:text-white" />
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* SOUND FX TAB */}
        {activeTab === 'sfx' && (
          <div className="space-y-2">
            <div className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-2">
              Commercial Foley & Transition Audio FX
            </div>
            {sfxLibrary.map((sfx, idx) => (
              <div
                key={idx}
                onClick={() => {
                  onAddSfxAudio(sfx.name, sfx.duration);
                  triggerFeedback(sfx.name);
                }}
                className="p-2.5 bg-[#222222] border border-gray-800 hover:border-emerald-500 rounded cursor-pointer transition-all flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <Music className="w-4 h-4 text-emerald-400" />
                  <div>
                    <div className="font-semibold text-xs text-white">{sfx.name}</div>
                    <div className="text-[10px] text-gray-400">{sfx.category} • {sfx.duration}s</div>
                  </div>
                </div>
                {appliedId === sfx.name ? (
                  <Check className="w-4 h-4 text-green-400" />
                ) : (
                  <span className="text-[10px] px-1.5 py-0.5 bg-[#333333] rounded text-emerald-400 font-mono">
                    + Track
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
