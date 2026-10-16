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
  Split,
  Smartphone
} from 'lucide-react';
import { TimelineClip, FCPProject, AudioDspSettings, Keyframe, ThreeWayColorWheels, BlendMode, AudioRole } from '../types/fcp';
import { ColorWheels } from './ColorWheels';
import { BUILTIN_LUTS, LutParser } from '../engine/LutParser';
import { ParametricEqVisualizer } from './ParametricEqVisualizer';
import { SubFrameAudioEngine } from '../engine/SubFrameAudioEngine';
import { EnhanceLightColorEngine } from '../engine/EnhanceLightColorEngine';

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
  const [activeTab, setActiveTab] = useState<'video' | 'color' | 'audio' | 'dsp' | 'text' | 'auditions' | 'optics' | 'fcp12'>('video');
  const [colorMode, setColorMode] = useState<'wheels' | 'board' | 'lut'>('wheels');
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [showAdvancedVideo, setShowAdvancedVideo] = useState(false);

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

  const handleEnhanceLightColor = () => {
    if (!selectedClip) return;
    setIsEnhancing(true);
    setTimeout(() => {
      const canvasEl = document.querySelector('canvas');
      const enhanced = EnhanceLightColorEngine.analyzeAndEnhance(
        canvasEl || document.createElement('canvas'),
        selectedClip.colorGrading,
        selectedClip.enhanceLightColor
      );
      onUpdateClip({
        ...selectedClip,
        colorGrading: enhanced,
        enhanceLightColor: {
          enabled: true,
          intensity: 100,
          autoBalanced: true,
          exposureOffset: enhanced.exposure,
          contrastBoost: enhanced.contrast,
          tempCorrection: enhanced.temperature,
          vibranceBoost: enhanced.saturation,
        },
      });
      setIsEnhancing(false);
    }, 200);
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
      <div className="flex items-center border-b border-[#2c2c2e] bg-[#18181a] px-1 overflow-x-auto">
        <button
          onClick={() => setActiveTab('video')}
          className={`flex-1 py-2 px-2.5 flex items-center justify-center gap-1.5 border-b-2 text-xs transition-colors whitespace-nowrap ${
            activeTab === 'video' ? 'border-[#0071e3] text-white font-medium' : 'border-transparent text-[#8e8e93] hover:text-[#d1d1d6]'
          }`}
        >
          <Sliders size={13} />
          <span>Video</span>
        </button>

        <button
          onClick={() => setActiveTab('color')}
          className={`flex-1 py-2 px-2.5 flex items-center justify-center gap-1.5 border-b-2 text-xs transition-colors whitespace-nowrap ${
            activeTab === 'color' ? 'border-[#0071e3] text-white font-medium' : 'border-transparent text-[#8e8e93] hover:text-[#d1d1d6]'
          }`}
        >
          <Palette size={13} />
          <span>Color</span>
        </button>

        <button
          onClick={() => setActiveTab('dsp')}
          className={`flex-1 py-2 px-2.5 flex items-center justify-center gap-1.5 border-b-2 text-xs transition-colors whitespace-nowrap ${
            activeTab === 'dsp' ? 'border-[#0071e3] text-white font-medium' : 'border-transparent text-[#8e8e93] hover:text-[#d1d1d6]'
          }`}
        >
          <Volume2 size={13} />
          <span>Audio</span>
        </button>

        <button
          onClick={() => setActiveTab('optics')}
          className={`flex-1 py-2 px-2.5 flex items-center justify-center gap-1.5 border-b-2 text-xs transition-colors whitespace-nowrap ${
            activeTab === 'optics' ? 'border-[#0071e3] text-white font-medium' : 'border-transparent text-[#8e8e93] hover:text-[#d1d1d6]'
          }`}
        >
          <Sparkles size={13} />
          <span>Effects</span>
        </button>

        {selectedClip.type === 'title' && (
          <button
            onClick={() => setActiveTab('text')}
            className={`flex-1 py-2 px-2.5 flex items-center justify-center gap-1.5 border-b-2 text-xs transition-colors whitespace-nowrap ${
              activeTab === 'text' ? 'border-[#0071e3] text-white font-medium' : 'border-transparent text-[#8e8e93] hover:text-[#d1d1d6]'
            }`}
          >
            <Type size={13} />
            <span>Text</span>
          </button>
        )}

        {selectedClip.auditions && selectedClip.auditions.length > 0 && (
          <button
            onClick={() => setActiveTab('auditions')}
            className={`flex-1 py-2 px-2.5 flex items-center justify-center gap-1.5 border-b-2 text-xs transition-colors whitespace-nowrap ${
              activeTab === 'auditions' ? 'border-[#0071e3] text-white font-medium' : 'border-transparent text-[#8e8e93] hover:text-[#d1d1d6]'
            }`}
          >
            <Radio size={13} />
            <span>Takes</span>
          </button>
        )}
      </div>

      {/* Inspector Body */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {/* VIDEO TAB (Transform, Scale, Opacity & Advanced) */}
        {activeTab === 'video' && (
          <div className="space-y-3">
            {/* Basic Transform: Scale, Position, Opacity */}
            <div className="p-3 bg-[#1c1c1e] rounded-lg border border-[#2c2c2e] space-y-3">
              <div className="font-semibold text-[#f5f5f7] text-xs pb-1 border-b border-[#2c2c2e]">
                Transform
              </div>

              {/* Scale Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-[#8e8e93]">
                  <span>Scale</span>
                  <span className="font-mono text-[#d1d1d6]">{Math.round((selectedClip.transform?.scale || 1.0) * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="2.5"
                  step="0.05"
                  value={selectedClip.transform?.scale || 1.0}
                  onChange={(e) => updateTransform({ scale: Number(e.target.value) })}
                  className="w-full accent-[#0071e3] h-1 bg-[#38383a] rounded cursor-pointer"
                />
              </div>

              {/* Position X & Y */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] text-[#8e8e93]">
                    <span>Pos X</span>
                    <span className="font-mono text-[#d1d1d6]">{Math.round(selectedClip.transform?.posX || 0)}px</span>
                  </div>
                  <input
                    type="range"
                    min="-200"
                    max="200"
                    step="5"
                    value={selectedClip.transform?.posX || 0}
                    onChange={(e) => updateTransform({ posX: Number(e.target.value) })}
                    className="w-full accent-[#0071e3] h-1 bg-[#38383a] rounded cursor-pointer"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] text-[#8e8e93]">
                    <span>Pos Y</span>
                    <span className="font-mono text-[#d1d1d6]">{Math.round(selectedClip.transform?.posY || 0)}px</span>
                  </div>
                  <input
                    type="range"
                    min="-200"
                    max="200"
                    step="5"
                    value={selectedClip.transform?.posY || 0}
                    onChange={(e) => updateTransform({ posY: Number(e.target.value) })}
                    className="w-full accent-[#0071e3] h-1 bg-[#38383a] rounded cursor-pointer"
                  />
                </div>
              </div>

              {/* Opacity */}
              <div className="space-y-1 pt-1 border-t border-[#2c2c2e]">
                <div className="flex justify-between text-[11px] text-[#8e8e93]">
                  <span>Opacity</span>
                  <span className="font-mono text-[#d1d1d6]">{Math.round((selectedClip.opacity ?? 1.0) * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1.0"
                  step="0.05"
                  value={selectedClip.opacity ?? 1.0}
                  onChange={(e) => onUpdateClip({ ...selectedClip, opacity: Number(e.target.value) })}
                  className="w-full accent-[#0071e3] h-1 bg-[#38383a] rounded cursor-pointer"
                />
              </div>
            </div>

            {/* Collapsible Advanced Settings (Reframe, Retiming, Blend Modes) */}
            <div className="p-2.5 bg-[#18181a] rounded-lg border border-[#2c2c2e]">
              <button
                type="button"
                onClick={() => setShowAdvancedVideo(!showAdvancedVideo)}
                className="w-full flex items-center justify-between text-xs text-[#8e8e93] hover:text-white transition-colors"
              >
                <span className="font-medium">Advanced Compositing & Speed</span>
                <span className="font-mono text-[10px]">{showAdvancedVideo ? '▾ Less' : '▸ More'}</span>
              </button>

              {showAdvancedVideo && (
                <div className="pt-3 space-y-3 border-t border-[#2c2c2e] mt-2">
                  {/* Auto-Reframe Focus */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs text-[#f5f5f7]">
                      <div className="flex items-center gap-1.5">
                        <Smartphone size={13} className="text-[#8e8e93]" />
                        <span>Auto Reframe</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={selectedClip.smartConform?.enabled || false}
                        onChange={(e) => updateSmartConform({ enabled: e.target.checked })}
                        className="accent-[#0071e3] rounded cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Retiming & Variable Speed */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs text-[#f5f5f7]">
                      <div className="flex items-center gap-1.5">
                        <FastForward size={13} className="text-[#8e8e93]" />
                        <span>Retiming</span>
                      </div>
                      <span className="font-mono text-[#d1d1d6] text-xs">
                        {selectedClip.retiming?.speed ? `${selectedClip.retiming.speed}x` : '1.0x'}
                      </span>
                    </div>

                    <input
                      type="range"
                      min="0.25"
                      max="4.0"
                      step="0.25"
                      value={selectedClip.retiming?.speed || 1.0}
                      onChange={(e) => updateRetiming({ speed: Number(e.target.value) })}
                      className="w-full accent-[#0071e3] h-1 bg-[#38383a] rounded cursor-pointer"
                    />
                  </div>

                  {/* 14 Blend Modes */}
                  <div className="space-y-1">
                    <div className="text-[10px] text-[#8e8e93] uppercase font-semibold">Blend Mode</div>
                    <select
                      value={selectedClip.blendMode}
                      onChange={(e) => onUpdateClip({ ...selectedClip, blendMode: e.target.value as BlendMode })}
                      className="w-full bg-[#121214] border border-[#2c2c2e] rounded px-2 py-1 text-[#d1d1d6] text-xs"
                    >
                      <option value="normal">Normal (Source Over)</option>
                      <option value="screen">Screen (Lighten)</option>
                      <option value="multiply">Multiply (Darken)</option>
                      <option value="overlay">Overlay</option>
                      <option value="lighten">Lighten</option>
                      <option value="darken">Darken</option>
                    </select>
                  </div>
                </div>
              )}
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

        {/* COLOR TAB (3-Way Wheels & AI Enhance Light and Color) */}
        {activeTab === 'color' && (
          <div className="space-y-3">
            {/* ✨ FCP 12 One-Click Enhance Light & Color */}
            <div className="p-2.5 bg-gradient-to-r from-sky-950/70 to-indigo-950/50 rounded border border-sky-800/60 flex items-center justify-between shadow">
              <div>
                <div className="text-[11px] font-bold text-sky-300 flex items-center gap-1.5">
                  <Sparkles size={13} className="text-sky-400 animate-pulse" />
                  <span>Enhance Light & Color</span>
                </div>
                <div className="text-[10px] text-gray-400 mt-0.5">
                  FCP 12 neural auto-balance & dynamic range stretch
                </div>
              </div>
              <button
                onClick={handleEnhanceLightColor}
                disabled={isEnhancing}
                className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded font-medium text-[11px] shadow transition-all flex items-center gap-1 active:scale-95"
              >
                {isEnhancing ? 'Analyzing...' : '✨ Enhance'}
              </button>
            </div>

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

        {/* FCP 12 AI SUITE TAB */}
        {activeTab === 'fcp12' && (
          <div className="space-y-4">
            {/* 1. ✨ AI ENHANCE LIGHT AND COLOR */}
            <div className="p-3 bg-[#181818] rounded-md border border-sky-900/60 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-bold text-sky-400 text-[11px] uppercase tracking-wide">
                  <Sparkles size={13} className="text-sky-400" />
                  <span>Enhance Light & Color</span>
                </div>
                <button
                  onClick={handleEnhanceLightColor}
                  disabled={isEnhancing}
                  className="px-2.5 py-1 bg-sky-600 hover:bg-sky-500 text-white rounded font-medium text-[10px] shadow transition-all active:scale-95"
                >
                  {isEnhancing ? 'Analyzing...' : 'Auto Grade'}
                </button>
              </div>

              <div className="text-[10px] text-gray-400 leading-relaxed">
                Applies neural histogram balancing, dynamic range expansion, and skin-tone safe chromatic adaptation.
              </div>

              {selectedClip.enhanceLightColor?.autoBalanced && (
                <div className="grid grid-cols-2 gap-2 p-2 bg-[#121212] rounded border border-sky-950 text-[10px] font-mono">
                  <div className="text-gray-400">Exposure: <span className="text-sky-300">{selectedClip.enhanceLightColor.exposureOffset > 0 ? '+' : ''}{selectedClip.enhanceLightColor.exposureOffset} EV</span></div>
                  <div className="text-gray-400">Contrast: <span className="text-sky-300">{selectedClip.enhanceLightColor.contrastBoost}x</span></div>
                  <div className="text-gray-400">Temp: <span className="text-sky-300">{selectedClip.enhanceLightColor.tempCorrection > 0 ? '+' : ''}{selectedClip.enhanceLightColor.tempCorrection}K</span></div>
                  <div className="text-gray-400">Vibrance: <span className="text-sky-300">{selectedClip.enhanceLightColor.vibranceBoost}x</span></div>
                </div>
              )}
            </div>

            {/* 2. 🥽 APPLE VISION PRO SPATIAL VIDEO */}
            <div className="p-3 bg-[#181818] rounded-md border border-cyan-900/60 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-bold text-cyan-400 text-[11px] uppercase tracking-wide">
                  <span>🥽 Vision Pro Spatial Video</span>
                </div>
                <input
                  type="checkbox"
                  checked={selectedClip.spatialVideo?.enabled || false}
                  onChange={(e) =>
                    onUpdateClip({
                      ...selectedClip,
                      spatialVideo: {
                        enabled: e.target.checked,
                        mode: selectedClip.spatialVideo?.mode || 'anaglyph-3d',
                        disparity: selectedClip.spatialVideo?.disparity || 0,
                        eyeSeparation: selectedClip.spatialVideo?.eyeSeparation || 18,
                      },
                    })
                  }
                  className="accent-cyan-500 cursor-pointer"
                />
              </div>

              {selectedClip.spatialVideo?.enabled && (
                <div className="space-y-2.5 pt-2 border-t border-gray-800">
                  <div>
                    <label className="text-[10px] text-gray-400 block mb-1">Stereoscopic Viewing Mode</label>
                    <select
                      value={selectedClip.spatialVideo.mode}
                      onChange={(e) =>
                        onUpdateClip({
                          ...selectedClip,
                          spatialVideo: {
                            ...selectedClip.spatialVideo!,
                            mode: e.target.value as any,
                          },
                        })
                      }
                      className="w-full bg-[#141414] border border-gray-700 rounded px-2 py-1 text-cyan-300 text-xs font-medium"
                    >
                      <option value="anaglyph-3d">Anaglyph 3D (Red / Cyan Dubois)</option>
                      <option value="side-by-side">Side-by-Side (SBS 3D Headset)</option>
                      <option value="left-eye">Left Eye Perspective</option>
                      <option value="right-eye">Right Eye Perspective</option>
                      <option value="2d">2D Standard (Single Monocular)</option>
                    </select>
                  </div>

                  <div>
                    <div className="flex justify-between text-[10px] text-gray-400 mb-0.5">
                      <span>Zero-Parallax Convergence Plane</span>
                      <span className="font-mono text-cyan-400">{selectedClip.spatialVideo.disparity} px</span>
                    </div>
                    <input
                      type="range"
                      min={-80}
                      max={80}
                      step={2}
                      value={selectedClip.spatialVideo.disparity}
                      onChange={(e) =>
                        onUpdateClip({
                          ...selectedClip,
                          spatialVideo: {
                            ...selectedClip.spatialVideo!,
                            disparity: Number(e.target.value),
                          },
                        })
                      }
                      className="w-full accent-cyan-500"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-[10px] text-gray-400 mb-0.5">
                      <span>Inter-Ocular Separation</span>
                      <span className="font-mono text-cyan-400">{selectedClip.spatialVideo.eyeSeparation} mm</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={40}
                      step={1}
                      value={selectedClip.spatialVideo.eyeSeparation}
                      onChange={(e) =>
                        onUpdateClip({
                          ...selectedClip,
                          spatialVideo: {
                            ...selectedClip.spatialVideo!,
                            eyeSeparation: Number(e.target.value),
                          },
                        })
                      }
                      className="w-full accent-cyan-500"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* 3. 🪄 AI MAGNETIC MASK (SUBJECT ISOLATION) */}
            <div className="p-3 bg-[#181818] rounded-md border border-pink-900/60 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-bold text-pink-400 text-[11px] uppercase tracking-wide">
                  <span>🪄 AI Magnetic Mask</span>
                </div>
                <input
                  type="checkbox"
                  checked={selectedClip.magneticMask?.enabled || false}
                  onChange={(e) =>
                    onUpdateClip({
                      ...selectedClip,
                      magneticMask: {
                        enabled: e.target.checked,
                        feather: selectedClip.magneticMask?.feather || 12,
                        invert: selectedClip.magneticMask?.invert || false,
                        showMatte: selectedClip.magneticMask?.showMatte || false,
                        points: selectedClip.magneticMask?.points || [{ x: 0.5, y: 0.45, isForeground: true }],
                        edgeTolerance: selectedClip.magneticMask?.edgeTolerance || 40,
                        blurBackground: selectedClip.magneticMask?.blurBackground ?? true,
                        backgroundBlurAmount: selectedClip.magneticMask?.backgroundBlurAmount || 14,
                      },
                    })
                  }
                  className="accent-pink-500 cursor-pointer"
                />
              </div>

              {selectedClip.magneticMask?.enabled && (
                <div className="space-y-2.5 pt-2 border-t border-gray-800">
                  <div className="grid grid-cols-2 gap-2">
                    <label className="flex items-center gap-1.5 cursor-pointer text-[10px] text-gray-300">
                      <input
                        type="checkbox"
                        checked={selectedClip.magneticMask.blurBackground}
                        onChange={(e) =>
                          onUpdateClip({
                            ...selectedClip,
                            magneticMask: {
                              ...selectedClip.magneticMask!,
                              blurBackground: e.target.checked,
                            },
                          })
                        }
                        className="accent-pink-500"
                      />
                      <span>Portrait Bokeh</span>
                    </label>

                    <label className="flex items-center gap-1.5 cursor-pointer text-[10px] text-gray-300">
                      <input
                        type="checkbox"
                        checked={selectedClip.magneticMask.showMatte}
                        onChange={(e) =>
                          onUpdateClip({
                            ...selectedClip,
                            magneticMask: {
                              ...selectedClip.magneticMask!,
                              showMatte: e.target.checked,
                            },
                          })
                        }
                        className="accent-pink-500"
                      />
                      <span>Matte View</span>
                    </label>
                  </div>

                  {selectedClip.magneticMask.blurBackground && (
                    <div>
                      <div className="flex justify-between text-[10px] text-gray-400 mb-0.5">
                        <span>Background Bokeh Blur</span>
                        <span className="font-mono text-pink-400">{selectedClip.magneticMask.backgroundBlurAmount} px</span>
                      </div>
                      <input
                        type="range"
                        min={2}
                        max={30}
                        step={1}
                        value={selectedClip.magneticMask.backgroundBlurAmount}
                        onChange={(e) =>
                          onUpdateClip({
                            ...selectedClip,
                            magneticMask: {
                              ...selectedClip.magneticMask!,
                              backgroundBlurAmount: Number(e.target.value),
                            },
                          })
                        }
                        className="w-full accent-pink-500"
                      />
                    </div>
                  )}

                  <div>
                    <div className="flex justify-between text-[10px] text-gray-400 mb-0.5">
                      <span>Edge Feathering</span>
                      <span className="font-mono text-pink-400">{selectedClip.magneticMask.feather} px</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={40}
                      step={1}
                      value={selectedClip.magneticMask.feather}
                      onChange={(e) =>
                        onUpdateClip({
                          ...selectedClip,
                          magneticMask: {
                            ...selectedClip.magneticMask!,
                            feather: Number(e.target.value),
                          },
                        })
                      }
                      className="w-full accent-pink-500"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* 4. 🎯 AI OBJECT TRACKER */}
            <div className="p-3 bg-[#181818] rounded-md border border-amber-900/60 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-bold text-amber-400 text-[11px] uppercase tracking-wide">
                  <span>🎯 AI Object Tracker</span>
                </div>
                <input
                  type="checkbox"
                  checked={selectedClip.objectTracker?.enabled || false}
                  onChange={(e) =>
                    onUpdateClip({
                      ...selectedClip,
                      objectTracker: {
                        enabled: e.target.checked,
                        mode: selectedClip.objectTracker?.mode || 'mosaic-blur',
                        boundingBox: selectedClip.objectTracker?.boundingBox || { x: 0.38, y: 0.3, width: 0.24, height: 0.35 },
                        isTracking: false,
                        blurRadius: selectedClip.objectTracker?.blurRadius || 18,
                      },
                    })
                  }
                  className="accent-amber-500 cursor-pointer"
                />
              </div>

              {selectedClip.objectTracker?.enabled && (
                <div className="space-y-2.5 pt-2 border-t border-gray-800">
                  <div>
                    <label className="text-[10px] text-gray-400 block mb-1">Tracking Output Mode</label>
                    <select
                      value={selectedClip.objectTracker.mode}
                      onChange={(e) =>
                        onUpdateClip({
                          ...selectedClip,
                          objectTracker: {
                            ...selectedClip.objectTracker!,
                            mode: e.target.value as any,
                          },
                        })
                      }
                      className="w-full bg-[#141414] border border-gray-700 rounded px-2 py-1 text-amber-300 text-xs font-medium"
                    >
                      <option value="mosaic-blur">Mosaic Blur (Face / Plate Censorship)</option>
                      <option value="anchor-title">Anchor 3D Title to Object</option>
                      <option value="spotlight">Spotlight (Isolate & Dim Background)</option>
                    </select>
                  </div>

                  {selectedClip.objectTracker.mode === 'mosaic-blur' && (
                    <div>
                      <div className="flex justify-between text-[10px] text-gray-400 mb-0.5">
                        <span>Pixelation Blur Density</span>
                        <span className="font-mono text-amber-400">{selectedClip.objectTracker.blurRadius || 18} px</span>
                      </div>
                      <input
                        type="range"
                        min={8}
                        max={40}
                        step={2}
                        value={selectedClip.objectTracker.blurRadius || 18}
                        onChange={(e) =>
                          onUpdateClip({
                            ...selectedClip,
                            objectTracker: {
                              ...selectedClip.objectTracker!,
                              blurRadius: Number(e.target.value),
                            },
                          })
                        }
                        className="w-full accent-amber-500"
                      />
                    </div>
                  )}

                  <div className="pt-1">
                    <button
                      onClick={() => {
                        onUpdateClip({
                          ...selectedClip,
                          objectTracker: {
                            ...selectedClip.objectTracker!,
                            isTracking: !selectedClip.objectTracker!.isTracking,
                          },
                        });
                      }}
                      className={`w-full py-1.5 rounded font-bold text-[10px] transition-all flex items-center justify-center gap-1.5 ${
                        selectedClip.objectTracker.isTracking
                          ? 'bg-red-600 text-white animate-pulse'
                          : 'bg-amber-600 hover:bg-amber-500 text-black'
                      }`}
                    >
                      {selectedClip.objectTracker.isTracking ? '⏹ Stop Tracking' : '▶ Analyze & Track Forward'}
                    </button>
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
