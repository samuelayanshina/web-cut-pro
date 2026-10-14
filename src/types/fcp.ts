export type MediaType = 'video' | 'audio' | 'title' | 'generator' | 'gap' | 'compound' | 'caption';

export type ToolType = 'select' | 'trim' | 'blade' | 'hand' | 'range';

export type ScopeMode = 'off' | 'waveform' | 'parade' | 'vectorscope' | 'histogram';

export type AudioRole = 'dialogue' | 'effects' | 'music';

export type AspectRatioType = '16:9' | '9:16' | '1:1' | '4:5';

export type BlendMode =
  | 'normal'
  | 'screen'
  | 'multiply'
  | 'overlay'
  | 'lighten'
  | 'darken'
  | 'color-dodge'
  | 'color-burn'
  | 'hard-light'
  | 'soft-light'
  | 'difference'
  | 'exclusion'
  | 'hue'
  | 'saturation'
  | 'color'
  | 'luminosity';

export interface Marker {
  id: string;
  time: number;
  label: string;
  name?: string;
  comment?: string;
  color: string;
  type: 'standard' | 'todo' | 'chapter';
  completed?: boolean;
}

export interface KenBurnsRect {
  x: number;
  y: number;
  scale: number;
}

export interface KenBurnsProps {
  enabled: boolean;
  start: KenBurnsRect;
  end: KenBurnsRect;
}

export interface RetimingProps {
  speed: number;
  reverse: boolean;
  opticalFlow: boolean;
  preservePitch: boolean;
}

export interface SmartConformProps {
  enabled: boolean;
  targetAspectRatio: AspectRatioType;
  trackingFocusX: number; // -50 to +50% automatic tracking offset
}

export interface ProjectFormat {
  name: string;
  width: number;
  height: number;
  aspectRatio: AspectRatioType;
  frameRate: number;
  colorSpace: 'Rec. 709' | 'Wide Gamut HDR (Rec. 2020 HLG)' | 'Wide Gamut HDR (Rec. 2020 PQ)' | 'Apple Log' | 'Sony S-Log3';
}

export interface MediaAsset {
  id: string;
  name: string;
  type: MediaType;
  url: string;
  proxyUrl?: string;
  isProxyGenerated?: boolean;
  opfsPath?: string;
  duration: number;
  width?: number;
  height?: number;
  thumbnailUrl?: string;
  color?: string;
  fps?: number;
  waveformPeaks?: number[];
}

export interface Keyframe<T = number> {
  id: string;
  timeOffset: number;
  value: T;
  easing: 'linear' | 'easeIn' | 'easeOut' | 'easeInOut';
}

export interface KeyframeTracks {
  opacity?: Keyframe<number>[];
  scale?: Keyframe<number>[];
  posX?: Keyframe<number>[];
  posY?: Keyframe<number>[];
  volume?: Keyframe<number>[];
}

export interface AudioDspSettings {
  eqLowGain: number;
  eqMidGain: number;
  eqHighGain: number;
  eq10Bands: number[]; // 10 bands from 32Hz to 16kHz
  compressorThreshold: number;
  compressorRatio: number;
  reverbMix: number;
  voiceIsolation: boolean;
  limiterCeiling: number; // 0.0 dB brickwall limit
}

export interface ColorWheelItem {
  hueX: number;
  hueY: number;
  luma: number;
}

export interface ThreeWayColorWheels {
  shadows: ColorWheelItem;
  midtones: ColorWheelItem;
  highlights: ColorWheelItem;
  global: ColorWheelItem;
}

export interface ColorGrading {
  exposure: number;
  contrast: number;
  saturation: number;
  temperature: number;
  tint: number;
  shadows: number;
  midtones: number;
  highlights: number;
  wheels: ThreeWayColorWheels;
  lutName?: string;
}

export interface TransformProps {
  posX: number;
  posY: number;
  scale: number;
  rotation: number;
  anchorX: number;
  anchorY: number;
}

export type MaterialPreset = 'plastic' | 'brushedMetal' | 'polishedChrome' | 'matteGold' | 'neonGlass' | 'carbonFiber';

export interface Motion3DProps {
  is3D: boolean;
  depth: number; // Extrusion depth 0 - 100
  bevel: number; // Edge bevel size 0 - 20
  material: MaterialPreset;
  rotationX: number; // Pitch
  rotationY: number; // Yaw
  rotationZ: number; // Roll
  lightIntensity: number; // 0.1 - 2.0
  lightAngle: number; // degrees 0 - 360
  specular: number; // 0 - 1
}

export interface MotionRigParameter {
  id: string;
  name: string;
  type: 'slider' | 'toggle' | 'popup';
  value: number | boolean | string;
  min?: number;
  max?: number;
  options?: string[];
}

export interface MotionRigProps {
  enabled: boolean;
  templateName: string;
  parameters: MotionRigParameter[];
}

export interface TitleProps {
  text: string;
  fontSize: number;
  fontFamily: string;
  fontWeight: string;
  color: string;
  align: 'left' | 'center' | 'right';
  posY: number;
  shadow: boolean;
  outline: boolean;
  outlineColor: string;
  animationStyle?: 'none' | 'fade' | 'typewriter' | 'slideUp' | 'glitch';
  motion3D?: Motion3DProps;
  motionRig?: MotionRigProps;
}

export interface FilmOpticsProps {
  halation?: number; // 0 to 1
  anamorphicFlare?: number; // 0 to 1
  gateWeave?: number; // 0 to 2
  cameraShake?: number; // 0 to 2
  lightLeak?: number; // 0 to 1
}

export type TransitionType =
  | 'dissolve'
  | 'fadeToBlack'
  | 'slideLeft'
  | 'wipeRight'
  | 'glitch'
  | 'whipPan'
  | 'lightLeak'
  | 'zoomBlur';

export interface Transition {
  type: TransitionType;
  duration: number;
}

export interface AuditionTake {
  id: string;
  name: string;
  assetId: string;
  sourceIn: number;
  sourceOut: number;
  colorGrading: ColorGrading;
}

export interface MulticamAngle {
  id: string;
  name: string;
  assetId: string;
}

export interface TimelineClip {
  id: string;
  name: string;
  assetId: string;
  type: MediaType;
  role: AudioRole;
  timelineIn: number;
  duration: number;
  sourceIn: number;
  sourceOut: number;

  retiming: RetimingProps;
  kenBurns: KenBurnsProps;
  smartConform: SmartConformProps;
  spatialConform: 'fit' | 'fill' | 'none';

  volume: number;
  pan: number;
  muted: boolean;
  dsp: AudioDspSettings;

  opacity: number;
  blendMode: BlendMode;
  transform: TransformProps;
  colorGrading: ColorGrading;
  effects: string[];
  filmOptics?: FilmOpticsProps;
  behavior?: { type: 'none' | 'wiggle' | 'oscillate' | 'overshoot' | 'pulse'; rate: number; amount: number };
  keyframes: KeyframeTracks;

  titleProps?: TitleProps;
  generatorColor?: string;

  connectedClips: TimelineClip[];
  lane?: number;
  anchorOffset?: number;

  transitionIn?: Transition;
  transitionOut?: Transition;

  auditions?: AuditionTake[];
  activeAuditionIndex?: number;

  subSpine?: TimelineClip[];
  multicamAngles?: MulticamAngle[];
  activeMulticamAngleIndex?: number;
}

export interface FCPProject {
  id: string;
  name: string;
  format: ProjectFormat;
  spine: TimelineClip[];
  markers: Marker[];
  inPoint?: number;
  outPoint?: number;
  useProxyMedia: boolean;
  activeRoleMutes: Record<AudioRole, boolean>;
}

export interface FCPSmartCollection {
  id: string;
  name: string;
  filterType: 'all_video' | 'all_audio' | 'favorites' | 'dialogue' | 'music' | 'effects' | 'high_fps';
  badgeCount?: number;
}

export interface FCPEvent {
  id: string;
  name: string;
  date: string;
  projects: FCPProject[];
  mediaAssetIds: string[];
}

export interface FCPLibrary {
  id: string;
  name: string; // e.g., "Web Cut Pro Library.fcpbundle"
  colorProcessing: 'standard' | 'wide_gamut_hdr';
  events: FCPEvent[];
  smartCollections: FCPSmartCollection[];
  activeEventId: string;
  activeProjectId: string;
}

export type ExportPreset =
  | 'prores_master'
  | 'apple_devices_4k'
  | 'apple_devices_1080p'
  | 'youtube_1080p'
  | 'instagram_reel_9_16'
  | 'broadcast_wav';

export interface ExportJob {
  id: string;
  projectName: string;
  preset: ExportPreset;
  resolution: string;
  format: 'mp4' | 'mov' | 'webm' | 'wav';
  status: 'queued' | 'rendering' | 'completed' | 'failed';
  progress: number;
  estimatedSizeMb: number;
  createdAt: number;
  downloadUrl?: string;
  error?: string;
}

