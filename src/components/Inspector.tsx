import React, { useState } from 'react';
import { 
  Sliders, 
  Palette, 
  Volume2, 
  Type, 
  Layers, 
  Sparkles, 
  Info, 
  Trash2, 
  Radio, 
  Activity, 
  Clock,
  Plus,
  Play,
  Film,
  FastForward,
  Camera,
  Tag,
  Scissors,
  Split
} from 'lucide-react';
import { TimelineClip, FCPProject, AudioDspSettings, Keyframe, ThreeWayColorWheels, BlendMode, AudioRole } from '../types/fcp';
import { ColorWheels } from './ColorWheels';
import { BUILTIN_LUTS, LutParser } from '../engine/LutParser';
import { ParametricEqVisualizer } from './ParametricEqVisualizer';
import { SubFrameAudioEngine } from '../engine/SubFrameAudioEngine';

interface InspectorProps {
  selectedClip: TimelineClip | null;
  project: FCPProject;
  currentTime: number;
  onUpdateClip: (clip: TimelineClip) => void;
  onDeleteClip: (clipId: string) => void;
  onDetachAudio?: (clip: TimelineClip) => void;
}

export const Inspector: React.FC<InspectorProps> = ({
  selectedClip,
  project,
  currentTime,
  onUpdateClip,
  onDeleteClip,
  onDetachAudio,
}) => {
  const [activeTab, setActiveTab] = useState<'video' | 'color' | 'audio' | 'dsp' | 'text' | 'auditions' | 'optics'>('video');
  const [colorMode, setColorMode] = useState<'wheels' | 'board' | 'lut'>('wheels');

  if (!selectedClip) {
    return (
      <div className="flex flex-col h-full bg-fcp-panel border-l border-fcp-border p-4 text-xs select-none">
        <div className="flex items-center gap-1.5 text-gray-400 font-semibold mb-4 pb-2 border-b border-fcp-border">
          <Info size={14} />
          <span>Project Inspector</span>
        </div>

        <div className="space-y-3 text-gray-300">
          <div>
            <div className="text-gray-500 text-[10px] uppercase font-bold tracking-wider">Project Name</div>
            <div className="font-medium text-sm text-white mt-0.5">{project.name}</div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-800">
            <div>
              <div className="text-gray-500 text-[10px] uppercase">Format</div>
              <div className="font-mono text-gray-200">{project.format.width} × {project.format.height}</div>
            </div>
            <div>
              <div className="text-gray-500 text-[10px] uppercase">Aspect Ratio</div>
              <div className="font-mono text-amber-400 font-bold">{project.format.aspectRatio || '16:9'}</div>
            </div>
          </div>

          <div className="pt-2 border-t border-gray-800">
            <div className="text-gray-500 text-[10px] uppercase">Color Space</div>
            <div className="text-gray-200">{project.format.colorSpace}</div>
          </div>
        </div>
      </div>
    );
  }

  // Updaters
  const updateTransform = (partial: Partial<TimelineClip['transform']>) => {
    onUpdateClip({
      ...selectedClip,
      transform: { ...selectedClip.transform, ...partial },
    });
  };

  const updateColorGrading = (partial: Partial<TimelineClip['colorGrading']>) => {
    onUpdateClip({
      ...selectedClip,
      colorGrading: { ...selectedClip.colorGrading, ...partial },
    });
  };

  const updateWheels = (newWheels: ThreeWayColorWheels) => {
    updateColorGrading({ wheels: newWheels });
  };

  const updateDsp = (newDsp: AudioDspSettings) => {
    onUpdateClip({
      ...selectedClip,
      dsp: newDsp,
    });
  };

  const updateRetiming = (partial: Partial<TimelineClip['retiming']>) => {
    onUpdateClip({
      ...selectedClip,
      retiming: { ...selectedClip.retiming, ...partial },
    });
  };

  const updateKenBurns = (partial: Partial<TimelineClip['kenBurns']>) => {
    onUpdateClip({
      ...selectedClip,
      kenBurns: { ...selectedClip.kenBurns, ...partial },
    });
  };

  const updateSmartConform = (partial: Partial<TimelineClip['smartConform']>) => {
    onUpdateClip({
      ...selectedClip,
      smartConform: { ...selectedClip.smartConform, ...partial },
    });
  };

  const toggleEffect = (effectName: string) => {
    const exists = selectedClip.effects.includes(effectName);
    const newEffects = exists
      ? selectedClip.effects.filter((e) => e !== effectName)
      : [...selectedClip.effects, effectName];
    onUpdateClip({ ...selectedClip, effects: newEffects });
  };

  const addKeyframe = (trackName: 'scale' | 'opacity') => {
    const clipOffset = Math.max(0, currentTime - selectedClip.timelineIn);
    const currentVal = trackName === 'scale' ? selectedClip.transform.scale : selectedClip.opacity;

    const newKf: Keyframe<number> = {
      id: `kf-${Date.now()}`,
      timeOffset: clipOffset,
      value: currentVal,
      easing: 'easeInOut',
    };

    const existingTrack = selectedClip.keyframes[trackName] || [];
    const updatedTrack = [...existingTrack.filter((k) => Math.abs(k.timeOffset - clipOffset) > 0.05), newKf];

    onUpdateClip({
      ...selectedClip,
      keyframes: {
        ...selectedClip.keyframes,
        [trackName]: updatedTrack,
      },
    });
  };

  const switchAuditionTake = (takeIndex: number) => {
    onUpdateClip({
      ...selectedClip,
      activeAuditionIndex: takeIndex,
    });
  };

  return (
    <div className="flex flex-col h-full bg-fcp-panel border-l border-fcp-border text-xs select-none">
      {/* Clip Title & Actions */}
      <div className="p-2.5 bg-fcp-header border-b border-fcp-border flex items-center justify-between">
        <div className="font-semibold text-white truncate max-w-[170px]" title={selectedClip.name}>
          {selectedClip.name}
        </div>
        <div className="flex items-center gap-1">
          {selectedClip.type === 'video' && onDetachAudio && (
            <button
              onClick={() => onDetachAudio(selectedClip)}
              className="p-1 text-gray-400 hover:text-blue-400 hover:bg-blue-950/30 rounded"
              title="Detach Audio (Shift+⌘+S)"
            >
              <Split size={13} />
            </button>
          )}
          <button
            onClick={() => onDeleteClip(selectedClip.id)}
            className="p-1 text-gray-400 hover:text-red-400 hover:bg-red-950/30 rounded"
            title="Delete Clip"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex items-center border-b border-fcp-border bg-[#1d1d1d] px-1 overflow-x-auto">
        <button
          onClick={() => setActiveTab('video')}
          className={`flex-1 py-1.5 px-2 flex items-center justify-center gap-1 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'video' ? 'border-fcp-accent text-white font-medium' : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          <Sliders size={12} />
          <span>Video</span>
        </button>

        <button
          onClick={() => setActiveTab('color')}
          className={`flex-1 py-1.5 px-2 flex items-center justify-center gap-1 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'color' ? 'border-fcp-accent text-white font-medium' : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          <Palette size={12} />
          <span>Color</span>
        </button>

        <button
          onClick={() => setActiveTab('dsp')}
          className={`flex-1 py-1.5 px-2 flex items-center justify-center gap-1 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'dsp' ? 'border-emerald-500 text-emerald-400 font-medium' : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          <Activity size={12} />
          <span>Logic DSP</span>
        </button>

        {selectedClip.type === 'title' && (
          <button
            onClick={() => setActiveTab('text')}
            className={`flex-1 py-1.5 px-2 flex items-center justify-center gap-1 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'text' ? 'border-purple-500 text-purple-400 font-medium' : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <Type size={12} />
            <span>3D Text</span>
          </button>
        )}

        <button
          onClick={() => setActiveTab('optics')}
          className={`flex-1 py-1.5 px-2 flex items-center justify-center gap-1 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'optics' ? 'border-cyan-500 text-cyan-400 font-medium' : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          <Sparkles size={12} />
          <span>Optics & FX</span>
        </button>

        {selectedClip.auditions && selectedClip.auditions.length > 0 && (
          <button
            onClick={() => setActiveTab('auditions')}
            className={`flex-1 py-1.5 px-2 flex items-center justify-center gap-1 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'auditions' ? 'border-amber-500 text-amber-400 font-medium' : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <Radio size={12} />
            <span>Auditions</span>
          </button>
        )}
      </div>

      {/* Inspector Body */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {/* VIDEO TAB (AI Smart Conform & Retiming) */}
        {activeTab === 'video' && (
          <div className="space-y-3">
            {/* AI Smart Conform Auto-Reframe Focus */}
            <div className="p-2.5 bg-[#181818] rounded-md border border-gray-800 space-y-2">
              <div className="flex items-center justify-between font-bold text-gray-300 text-[11px]">
                <div className="flex items-center gap-1">
                  <Sparkles size={13} className="text-amber-400" />
                  <span>AI Smart Conform (Auto-Reframe)</span>
                </div>
                <input
                  type="checkbox"
                  checked={selectedClip.smartConform?.enabled || false}
                  onChange={(e) => updateSmartConform({ enabled: e.target.checked })}
                  className="accent-amber-500"
                />
              </div>

              {selectedClip.smartConform?.enabled && (
                <div>
                  <div className="flex justify-between text-[10px] text-gray-400 mb-0.5">
                    <span>Focal Tracking Pan X</span>
                    <span className="font-mono">{selectedClip.smartConform.trackingFocusX}%</span>
                  </div>
                  <input
                    type="range"
                    min="-50"
                    max="50"
                    value={selectedClip.smartConform.trackingFocusX}
                    onChange={(e) => updateSmartConform({ trackingFocusX: Number(e.target.value) })}
                    className="w-full accent-amber-500 h-1 bg-gray-700 rounded cursor-pointer"
                  />
                </div>
              )}
            </div>

            {/* Retiming & Variable Speed */}
            <div className="p-2.5 bg-[#181818] rounded-md border border-gray-800 space-y-2">
              <div className="flex items-center justify-between font-bold text-gray-300 text-[11px]">
                <div className="flex items-center gap-1">
                  <FastForward size={13} className="text-amber-400" />
                  <span>Retiming & Speed</span>
                </div>
                <span className="font-mono text-amber-400">
                  {selectedClip.retiming?.speed ? `${selectedClip.retiming.speed}x` : '1.0x'}
                </span>
              </div>

              <div>
                <input
                  type="range"
                  min="0.25"
                  max="4.0"
                  step="0.25"
                  value={selectedClip.retiming?.speed || 1.0}
                  onChange={(e) => updateRetiming({ speed: Number(e.target.value) })}
                  className="w-full accent-amber-500 h-1 bg-gray-700 rounded cursor-pointer"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedClip.retiming?.reverse || false}
                    onChange={(e) => updateRetiming({ reverse: e.target.checked })}
                    className="accent-fcp-accent"
                  />
                  <span className="text-[10px] text-gray-300">Reverse</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedClip.retiming?.opticalFlow || false}
                    onChange={(e) => updateRetiming({ opticalFlow: e.target.checked })}
                    className="accent-fcp-accent"
                  />
                  <span className="text-[10px] text-gray-300">Optical Flow</span>
                </label>
              </div>
            </div>

            {/* 14 Blend Modes */}
            <div className="p-2.5 bg-[#181818] rounded-md border border-gray-800 space-y-2">
              <div className="text-[11px] font-bold text-gray-300 uppercase">Compositing (14 Blend Modes)</div>
              <select
                value={selectedClip.blendMode}
                onChange={(e) => onUpdateClip({ ...selectedClip, blendMode: e.target.value as BlendMode })}
                className="w-full bg-[#141414] border border-gray-700 rounded px-2 py-1 text-gray-200 text-xs"
              >
                <option value="normal">Normal (Source Over)</option>
                <option value="screen">Screen (Lighten)</option>
                <option value="multiply">Multiply (Darken)</option>
                <option value="overlay">Overlay</option>
                <option value="lighten">Lighten</option>
                <option value="darken">Darken</option>
                <option value="color-dodge">Color Dodge</option>
                <option value="color-burn">Color Burn</option>
                <option value="hard-light">Hard Light</option>
                <option value="soft-light">Soft Light</option>
                <option value="difference">Difference</option>
                <option value="exclusion">Exclusion</option>
                <option value="hue">Hue</option>
                <option value="saturation">Saturation</option>
                <option value="color">Color</option>
                <option value="luminosity">Luminosity</option>
              </select>
            </div>
          </div>
        )}

        {/* LOGIC DSP TAB (10-Band Parametric Visual EQ) */}
        {activeTab === 'dsp' && (
          <div className="space-y-3">
            <ParametricEqVisualizer
              dsp={selectedClip.dsp}
              onChange={updateDsp}
            />
          </div>
        )}

        {/* COLOR TAB (3-Way Wheels) */}
        {activeTab === 'color' && (
          <div className="space-y-3">
            <ColorWheels
              wheels={
                selectedClip.colorGrading.wheels || {
                  shadows: { hueX: 0, hueY: 0, luma: 0 },
                  midtones: { hueX: 0, hueY: 0, luma: 0 },
                  highlights: { hueX: 0, hueY: 0, luma: 0 },
                  global: { hueX: 0, hueY: 0, luma: 0 },
                }
              }
              onChange={updateWheels}
            />
          </div>
        )}

        {/* 3D TEXT & APPLE MOTION TAB */}
        {activeTab === 'text' && selectedClip.titleProps && (
          <div className="space-y-4">
            <div className="p-3 bg-[#181818] rounded-md border border-gray-800 space-y-3">
              <div className="text-[11px] font-bold text-purple-400 uppercase tracking-wide">
                Typography & Layout
              </div>
              <div>
                <label className="text-[10px] text-gray-400 block mb-1">Text Content</label>
                <input
                  type="text"
                  value={selectedClip.titleProps.text}
                  onChange={(e) =>
                    onUpdateClip({
                      ...selectedClip,
                      titleProps: { ...selectedClip.titleProps!, text: e.target.value }
                    })
                  }
                  className="w-full bg-[#141414] border border-gray-700 rounded px-2 py-1 text-white text-xs font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-gray-400 block mb-1">Font Size</label>
                  <input
                    type="number"
                    value={selectedClip.titleProps.fontSize}
                    onChange={(e) =>
                      onUpdateClip({
                        ...selectedClip,
                        titleProps: { ...selectedClip.titleProps!, fontSize: Number(e.target.value) }
                      })
                    }
                    className="w-full bg-[#141414] border border-gray-700 rounded px-2 py-1 text-gray-200 text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-gray-400 block mb-1">Color</label>
                  <input
                    type="color"
                    value={selectedClip.titleProps.color}
                    onChange={(e) =>
                      onUpdateClip({
                        ...selectedClip,
                        titleProps: { ...selectedClip.titleProps!, color: e.target.value }
                      })
                    }
                    className="w-full h-7 bg-[#141414] border border-gray-700 rounded cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Apple Motion 3D Extrusion Engine */}
            <div className="p-3 bg-[#181818] rounded-md border border-purple-900/50 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-purple-300 uppercase tracking-wide">
                  Apple Motion 3D Text Engine
                </span>
                <input
                  type="checkbox"
                  checked={selectedClip.titleProps.motion3D?.is3D || false}
                  onChange={(e) => {
                    const m3d = selectedClip.titleProps?.motion3D || {
                      is3D: true,
                      depth: 30,
                      bevel: 6,
                      material: 'brushedMetal',
                      rotationX: 12,
                      rotationY: -15,
                      rotationZ: 0,
                      lightIntensity: 1.2,
                      lightAngle: 45,
                      specular: 0.6
                    };
                    onUpdateClip({
                      ...selectedClip,
                      titleProps: {
                        ...selectedClip.titleProps!,
                        motion3D: { ...m3d, is3D: e.target.checked }
                      }
                    });
                  }}
                  className="accent-purple-500 cursor-pointer"
                />
              </div>

              {selectedClip.titleProps.motion3D?.is3D && (
                <div className="space-y-2.5 pt-1 border-t border-gray-800">
                  <div>
                    <label className="text-[10px] text-gray-400 block mb-1">3D Surface Material</label>
                    <select
                      value={selectedClip.titleProps.motion3D.material}
                      onChange={(e) => {
                        onUpdateClip({
                          ...selectedClip,
                          titleProps: {
                            ...selectedClip.titleProps!,
                            motion3D: {
                              ...selectedClip.titleProps!.motion3D!,
                              material: e.target.value as any
                            }
                          }
                        });
                      }}
                      className="w-full bg-[#141414] border border-gray-700 rounded px-2 py-1 text-purple-300 text-xs font-medium"
                    >
                      <option value="brushedMetal">Brushed Titanium / Steel</option>
                      <option value="polishedChrome">Polished Chrome Mirror</option>
                      <option value="matteGold">24K Matte Gold</option>
                      <option value="neonGlass">Neon Glass Glow</option>
                      <option value="carbonFiber">Carbon Fiber Weave</option>
                      <option value="plastic">Smooth Plastic Diffuse</option>
                    </select>
                  </div>

                  <div>
                    <div className="flex justify-between text-[10px] text-gray-400 mb-0.5">
                      <span>Extrusion Depth</span>
                      <span className="font-mono text-purple-400">{selectedClip.titleProps.motion3D.depth}px</span>
                    </div>
                    <input
                      type="range"
                      min={2}
                      max={80}
                      value={selectedClip.titleProps.motion3D.depth}
                      onChange={(e) => {
                        onUpdateClip({
                          ...selectedClip,
                          titleProps: {
                            ...selectedClip.titleProps!,
                            motion3D: {
                              ...selectedClip.titleProps!.motion3D!,
                              depth: Number(e.target.value)
                            }
                          }
                        });
                      }}
                      className="w-full accent-purple-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-gray-400 block mb-0.5">Pitch (Rot X)</label>
                      <input
                        type="range"
                        min={-45}
                        max={45}
                        value={selectedClip.titleProps.motion3D.rotationX}
                        onChange={(e) => {
                          onUpdateClip({
                            ...selectedClip,
                            titleProps: {
                              ...selectedClip.titleProps!,
                              motion3D: {
                                ...selectedClip.titleProps!.motion3D!,
                                rotationX: Number(e.target.value)
                              }
                            }
                          });
                        }}
                        className="w-full accent-purple-500"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-400 block mb-0.5">Yaw (Rot Y)</label>
                      <input
                        type="range"
                        min={-45}
                        max={45}
                        value={selectedClip.titleProps.motion3D.rotationY}
                        onChange={(e) => {
                          onUpdateClip({
                            ...selectedClip,
                            titleProps: {
                              ...selectedClip.titleProps!,
                              motion3D: {
                                ...selectedClip.titleProps!.motion3D!,
                                rotationY: Number(e.target.value)
                              }
                            }
                          });
                        }}
                        className="w-full accent-purple-500"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* OPTICS & MOTION BEHAVIORS TAB */}
        {activeTab === 'optics' && (
          <div className="space-y-4">
            {/* Commercial Film Optics Card */}
            <div className="p-3 bg-[#181818] rounded-md border border-cyan-900/50 space-y-3">
              <div className="text-[11px] font-bold text-cyan-300 uppercase tracking-wide">
                Photochemical Optics & Film Emulation
              </div>

              {/* Halation */}
              <div>
                <div className="flex justify-between text-[10px] text-gray-400 mb-0.5">
                  <span>Photochemical Halation (Bloom)</span>
                  <span className="font-mono text-red-400">
                    {Math.round((selectedClip.filmOptics?.halation || 0) * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={selectedClip.filmOptics?.halation || 0}
                  onChange={(e) =>
                    onUpdateClip({
                      ...selectedClip,
                      filmOptics: {
                        ...selectedClip.filmOptics,
                        halation: Number(e.target.value)
                      }
                    })
                  }
                  className="w-full accent-red-500"
                />
              </div>

              {/* Anamorphic Flare */}
              <div>
                <div className="flex justify-between text-[10px] text-gray-400 mb-0.5">
                  <span>Anamorphic Optical Streak & Flare</span>
                  <span className="font-mono text-cyan-400">
                    {Math.round((selectedClip.filmOptics?.anamorphicFlare || 0) * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={selectedClip.filmOptics?.anamorphicFlare || 0}
                  onChange={(e) =>
                    onUpdateClip({
                      ...selectedClip,
                      filmOptics: {
                        ...selectedClip.filmOptics,
                        anamorphicFlare: Number(e.target.value)
                      }
                    })
                  }
                  className="w-full accent-cyan-500"
                />
              </div>

              {/* Handheld Camera Shake */}
              <div>
                <div className="flex justify-between text-[10px] text-gray-400 mb-0.5">
                  <span>Handheld Camera Shake</span>
                  <span className="font-mono text-emerald-400">
                    {(selectedClip.filmOptics?.cameraShake || 0).toFixed(1)}x
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={2}
                  step={0.1}
                  value={selectedClip.filmOptics?.cameraShake || 0}
                  onChange={(e) =>
                    onUpdateClip({
                      ...selectedClip,
                      filmOptics: {
                        ...selectedClip.filmOptics,
                        cameraShake: Number(e.target.value)
                      }
                    })
                  }
                  className="w-full accent-emerald-500"
                />
              </div>

              {/* 35mm Light Leak */}
              <div>
                <div className="flex justify-between text-[10px] text-gray-400 mb-0.5">
                  <span>35mm Film Burn & Light Leak</span>
                  <span className="font-mono text-amber-400">
                    {Math.round((selectedClip.filmOptics?.lightLeak || 0) * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={selectedClip.filmOptics?.lightLeak || 0}
                  onChange={(e) =>
                    onUpdateClip({
                      ...selectedClip,
                      filmOptics: {
                        ...selectedClip.filmOptics,
                        lightLeak: Number(e.target.value)
                      }
                    })
                  }
                  className="w-full accent-amber-500"
                />
              </div>
            </div>

            {/* Apple Motion Parameter Behaviors Card */}
            <div className="p-3 bg-[#181818] rounded-md border border-purple-900/50 space-y-3">
              <div className="text-[11px] font-bold text-purple-300 uppercase tracking-wide">
                Apple Motion Parameter Behaviors
              </div>

              <div>
                <label className="text-[10px] text-gray-400 block mb-1">Procedural Behavior</label>
                <select
                  value={selectedClip.behavior?.type || 'none'}
                  onChange={(e) =>
                    onUpdateClip({
                      ...selectedClip,
                      behavior: {
                        type: e.target.value as any,
                        rate: selectedClip.behavior?.rate || 2,
                        amount: selectedClip.behavior?.amount || 1
                      }
                    })
                  }
                  className="w-full bg-[#121212] border border-gray-700 rounded px-2.5 py-1.5 text-purple-300 text-xs font-medium"
                >
                  <option value="none">None (Static)</option>
                  <option value="wiggle">Continuous Organic Wiggle</option>
                  <option value="oscillate">Harmonic Sine Oscillate</option>
                  <option value="pulse">Heartbeat Scale Pulse</option>
                  <option value="overshoot">Elastic Spring Overshoot</option>
                </select>
              </div>

              {selectedClip.behavior && selectedClip.behavior.type !== 'none' && (
                <div className="space-y-2 pt-1 border-t border-gray-800">
                  <div>
                    <div className="flex justify-between text-[10px] text-gray-400 mb-0.5">
                      <span>Rate (Frequency)</span>
                      <span className="font-mono text-purple-400">{selectedClip.behavior.rate} Hz</span>
                    </div>
                    <input
                      type="range"
                      min={0.5}
                      max={8}
                      step={0.5}
                      value={selectedClip.behavior.rate}
                      onChange={(e) =>
                        onUpdateClip({
                          ...selectedClip,
                          behavior: {
                            ...selectedClip.behavior!,
                            rate: Number(e.target.value)
                          }
                        })
                      }
                      className="w-full accent-purple-500"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-[10px] text-gray-400 mb-0.5">
                      <span>Amount (Amplitude)</span>
                      <span className="font-mono text-purple-400">{selectedClip.behavior.amount.toFixed(1)}x</span>
                    </div>
                    <input
                      type="range"
                      min={0.2}
                      max={3}
                      step={0.1}
                      value={selectedClip.behavior.amount}
                      onChange={(e) =>
                        onUpdateClip({
                          ...selectedClip,
                          behavior: {
                            ...selectedClip.behavior!,
                            amount: Number(e.target.value)
                          }
                        })
                      }
                      className="w-full accent-purple-500"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
