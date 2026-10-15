import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FCPProject, TimelineClip, MediaAsset, ToolType, AudioRole, Marker, ProjectFormat, TransitionType } from './types/fcp';
import { SAMPLE_ASSETS } from './engine/SampleMedia';
import { MagneticTimelineEngine } from './engine/MagneticTimeline';
import { MenuBar } from './components/MenuBar';
import { MediaBrowser } from './components/MediaBrowser';
import { Viewer } from './components/Viewer';
import { Inspector } from './components/Inspector';
import { Timeline } from './components/Timeline';
import { ExportModal } from './components/ExportModal';
import { ShortcutsModal } from './components/ShortcutsModal';
import { SmartConformModal } from './components/SmartConformModal';
import { audioEngine } from './engine/AudioEngine';
import { audioDspEngine } from './engine/AudioDspEngine';
import { OPFSStorageEngine } from './engine/OPFSStorageEngine';
import { ProxyEngine } from './engine/ProxyEngine';
import { SceneCutDetector } from './engine/SceneCutDetector';
import { SubtitleEngine } from './engine/SubtitleEngine';
import { SubFrameAudioEngine } from './engine/SubFrameAudioEngine';
import { BatchShareQueueModal } from './components/BatchShareQueueModal';
import { EffectsBrowser } from './components/EffectsBrowser';
import { CompressorModal } from './components/CompressorModal';
import { TutorialGuideModal } from './components/TutorialGuideModal';
import { FcpXmlEngine } from './engine/FcpXml';
import { AdminPortal } from './components/admin/AdminPortal';
import { analyticsEngine } from './engine/AnalyticsEngine';
import { Timecode } from './engine/Timecode';
import { Film, Folder, Sliders, Sparkles } from 'lucide-react';

const initialWheels = {
  shadows: { hueX: 0, hueY: 0, luma: 0 },
  midtones: { hueX: 0, hueY: 0, luma: 0 },
  highlights: { hueX: 0, hueY: 0, luma: 0 },
  global: { hueX: 0, hueY: 0, luma: 0 },
};

const initialRetiming = {
  speed: 1.0,
  reverse: false,
  opticalFlow: true,
  preservePitch: true,
};

const initialKenBurns = {
  enabled: false,
  start: { x: 0, y: 0, scale: 1.0 },
  end: { x: 0, y: 0, scale: 1.2 },
};

const initialSmartConform = {
  enabled: false,
  targetAspectRatio: '16:9' as const,
  trackingFocusX: 0,
};

const initialDsp = {
  eqLowGain: 3,
  eqMidGain: -1,
  eqHighGain: 2,
  eq10Bands: [0, 1, 2, 0, -1, 0, 1, 3, 2, 0],
  compressorThreshold: -20,
  compressorRatio: 4,
  reverbMix: 0.15,
  voiceIsolation: false,
  limiterCeiling: 0,
};

const createInitialProject = (): FCPProject => {
  const spineClips: TimelineClip[] = [
    {
      id: 'clip-drone-1',
      name: 'Coastal Aerial 4K',
      assetId: 'asset-nature-drone',
      type: 'video',
      role: 'dialogue',
      timelineIn: 0,
      duration: 6.0,
      sourceIn: 1.0,
      sourceOut: 7.0,
      retiming: initialRetiming,
      kenBurns: {
        enabled: true,
        start: { x: -5, y: -5, scale: 1.0 },
        end: { x: 5, y: 5, scale: 1.15 },
      },
      smartConform: initialSmartConform,
      spatialConform: 'fit',
      volume: 0.9,
      pan: 0,
      muted: false,
      dsp: initialDsp,
      opacity: 1.0,
      blendMode: 'normal',
      transform: { posX: 0, posY: 0, scale: 1.0, rotation: 0, anchorX: 0.5, anchorY: 0.5 },
      colorGrading: {
        exposure: 0.1,
        contrast: 1.1,
        saturation: 1.2,
        temperature: 15,
        tint: 0,
        shadows: 0,
        midtones: 0,
        highlights: 0,
        wheels: {
          shadows: { hueX: -0.15, hueY: 0.1, luma: -0.05 },
          midtones: { hueX: 0.05, hueY: -0.05, luma: 0.0 },
          highlights: { hueX: 0.12, hueY: -0.1, luma: 0.08 },
          global: { hueX: 0, hueY: 0, luma: 0 },
        },
      },
      effects: ['vignette', 'filmgrain'],
      keyframes: {
        scale: [
          { id: 'k1', timeOffset: 0, value: 1.0, easing: 'easeInOut' },
          { id: 'k2', timeOffset: 5.5, value: 1.15, easing: 'easeInOut' },
        ],
      },
      auditions: [
        {
          id: 'take-1',
          name: 'Take 1: Golden Hour Drone',
          assetId: 'asset-nature-drone',
          sourceIn: 1.0,
          sourceOut: 7.0,
          colorGrading: {
            exposure: 0.1,
            contrast: 1.1,
            saturation: 1.2,
            temperature: 20,
            tint: 5,
            shadows: 0,
            midtones: 0,
            highlights: 0,
            wheels: initialWheels,
          },
        },
        {
          id: 'take-2',
          name: 'Take 2: Coastal Swell B-Roll',
          assetId: 'asset-surf-broll',
          sourceIn: 0.0,
          sourceOut: 6.0,
          colorGrading: {
            exposure: -0.1,
            contrast: 1.3,
            saturation: 0.9,
            temperature: -15,
            tint: 0,
            shadows: 0,
            midtones: 0,
            highlights: 0,
            wheels: initialWheels,
          },
        },
      ],
      activeAuditionIndex: 0,
      connectedClips: [
        {
          id: 'title-opening',
          name: 'PACIFIC HORIZONS',
          assetId: '',
          type: 'title',
          role: 'dialogue',
          timelineIn: 0,
          duration: 3.5,
          sourceIn: 0,
          sourceOut: 3.5,
          retiming: initialRetiming,
          kenBurns: initialKenBurns,
          smartConform: initialSmartConform,
          spatialConform: 'fit',
          volume: 0,
          pan: 0,
          muted: true,
          dsp: initialDsp,
          opacity: 0.95,
          blendMode: 'normal',
          transform: { posX: 0, posY: 0, scale: 1.0, rotation: 0, anchorX: 0.5, anchorY: 0.5 },
          colorGrading: { exposure: 0, contrast: 1, saturation: 1, temperature: 0, tint: 0, shadows: 0, midtones: 0, highlights: 0, wheels: initialWheels },
          effects: [],
          keyframes: {},
          connectedClips: [],
          titleProps: {
            text: 'PACIFIC HORIZONS',
            fontSize: 44,
            fontFamily: '-apple-system',
            fontWeight: 'bold',
            color: '#ffffff',
            align: 'center',
            posY: 45,
            shadow: true,
            outline: false,
            outlineColor: '#000000',
            animationStyle: 'slideUp',
          },
          lane: 1,
          anchorOffset: 1.0,
        },
      ],
      transitionOut: {
        type: 'glitch',
        duration: 0.8,
      },
    },
    {
      id: 'clip-city-2',
      name: 'Tokyo Night Drive',
      assetId: 'asset-city-timelapse',
      type: 'video',
      role: 'dialogue',
      timelineIn: 6.0,
      duration: 5.5,
      sourceIn: 2.0,
      sourceOut: 7.5,
      retiming: { ...initialRetiming, speed: 1.5 },
      kenBurns: initialKenBurns,
      smartConform: initialSmartConform,
      spatialConform: 'fit',
      volume: 1.0,
      pan: 0,
      muted: false,
      dsp: initialDsp,
      opacity: 1.0,
      blendMode: 'normal',
      transform: { posX: 0, posY: 0, scale: 1.0, rotation: 0, anchorX: 0.5, anchorY: 0.5 },
      colorGrading: {
        exposure: -0.1,
        contrast: 1.25,
        saturation: 1.3,
        temperature: -20,
        tint: 10,
        shadows: 0,
        midtones: 0,
        highlights: 0,
        wheels: initialWheels,
        lutName: 'Teal & Orange',
      },
      effects: ['chromatic'],
      keyframes: {},
      connectedClips: [
        {
          id: 'sfx-ambient',
          name: 'Cinematic Ambient Score',
          assetId: 'asset-soundtrack',
          type: 'audio',
          role: 'music',
          timelineIn: 0,
          duration: 10.0,
          sourceIn: 0,
          sourceOut: 10.0,
          retiming: initialRetiming,
          kenBurns: initialKenBurns,
          smartConform: initialSmartConform,
          spatialConform: 'fit',
          volume: 0.7,
          pan: 0,
          muted: false,
          dsp: initialDsp,
          opacity: 1,
          blendMode: 'normal',
          transform: { posX: 0, posY: 0, scale: 1, rotation: 0, anchorX: 0.5, anchorY: 0.5 },
          colorGrading: { exposure: 0, contrast: 1, saturation: 1, temperature: 0, tint: 0, shadows: 0, midtones: 0, highlights: 0, wheels: initialWheels },
          effects: [],
          keyframes: {},
          connectedClips: [],
          lane: -1,
          anchorOffset: 0,
        },
      ],
    },
    {
      id: 'clip-compound-3',
      name: 'Compound: Ocean Macro Montage',
      assetId: 'asset-surf-broll',
      type: 'compound',
      role: 'dialogue',
      timelineIn: 11.5,
      duration: 6.0,
      sourceIn: 0,
      sourceOut: 6.0,
      retiming: initialRetiming,
      kenBurns: initialKenBurns,
      smartConform: initialSmartConform,
      spatialConform: 'fit',
      volume: 0.8,
      pan: 0,
      muted: false,
      dsp: initialDsp,
      opacity: 1.0,
      blendMode: 'normal',
      transform: { posX: 0, posY: 0, scale: 1.0, rotation: 0, anchorX: 0.5, anchorY: 0.5 },
      colorGrading: { exposure: 0.15, contrast: 1.1, saturation: 1.2, temperature: 10, tint: 0, shadows: 0, midtones: 0, highlights: 0, wheels: initialWheels },
      effects: ['vignette'],
      keyframes: {},
      connectedClips: [],
      subSpine: [
        {
          id: 'sub-1',
          name: 'Ocean Swell Wave',
          assetId: 'asset-surf-broll',
          type: 'video',
          role: 'dialogue',
          timelineIn: 0,
          duration: 3.0,
          sourceIn: 1.0,
          sourceOut: 4.0,
          retiming: initialRetiming,
          kenBurns: initialKenBurns,
          smartConform: initialSmartConform,
          spatialConform: 'fit',
          volume: 1,
          pan: 0,
          muted: false,
          dsp: initialDsp,
          opacity: 1,
          blendMode: 'normal',
          transform: { posX: 0, posY: 0, scale: 1, rotation: 0, anchorX: 0.5, anchorY: 0.5 },
          colorGrading: { exposure: 0, contrast: 1, saturation: 1, temperature: 0, tint: 0, shadows: 0, midtones: 0, highlights: 0, wheels: initialWheels },
          effects: [],
          keyframes: {},
          connectedClips: []
        },
        {
          id: 'sub-2',
          name: 'Wildlife Close-Up',
          assetId: 'asset-wildlife-macro',
          type: 'video',
          role: 'dialogue',
          timelineIn: 3.0,
          duration: 3.0,
          sourceIn: 0.5,
          sourceOut: 3.5,
          retiming: initialRetiming,
          kenBurns: initialKenBurns,
          smartConform: initialSmartConform,
          spatialConform: 'fit',
          volume: 1,
          pan: 0,
          muted: false,
          dsp: initialDsp,
          opacity: 1,
          blendMode: 'normal',
          transform: { posX: 0, posY: 0, scale: 1, rotation: 0, anchorX: 0.5, anchorY: 0.5 },
          colorGrading: { exposure: 0, contrast: 1.1, saturation: 1.2, temperature: 10, tint: 0, shadows: 0, midtones: 0, highlights: 0, wheels: initialWheels },
          effects: [],
          keyframes: {},
          connectedClips: []
        }
      ]
    },
  ];

  const initialMarkers: Marker[] = [
    { id: 'm1', time: 2.5, label: 'Color grade intro shot', color: '#f59e0b', type: 'todo', completed: false },
    { id: 'm2', time: 6.0, label: 'Chapter: Tokyo Night Transition', color: '#3b82f6', type: 'chapter' },
  ];

  return {
    id: 'fcp-project-1',
    name: 'Commercial Cinema Edit',
    format: {
      name: '1080p Cinema',
      width: 1920,
      height: 1080,
      aspectRatio: '16:9',
      frameRate: 30,
      colorSpace: 'Rec. 709',
    },
    spine: MagneticTimelineEngine.recalculateSpine(spineClips),
    markers: initialMarkers,
    useProxyMedia: false,
    activeRoleMutes: {
      dialogue: false,
      music: false,
      effects: false,
    },
  };
};

const LOCAL_STORAGE_PROJECT_KEY = 'web_cut_pro_project_v2';
const LOCAL_STORAGE_ASSETS_KEY = 'web_cut_pro_assets_v2';

const loadPersistedProject = (): FCPProject => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_PROJECT_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.spine) && parsed.format) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to load persisted project:', e);
  }
  return createInitialProject();
};

const loadPersistedAssets = (): MediaAsset[] => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_ASSETS_KEY);
    if (raw) {
      const custom = JSON.parse(raw);
      if (Array.isArray(custom)) {
        const existingIds = new Set(SAMPLE_ASSETS.map((a) => a.id));
        const nonDuplicateCustom = custom.filter((c: MediaAsset) => !existingIds.has(c.id));
        return [...nonDuplicateCustom, ...SAMPLE_ASSETS];
      }
    }
  } catch (e) {
    console.warn('Failed to load persisted assets:', e);
  }
  return SAMPLE_ASSETS;
};

export const App: React.FC = () => {
  const [project, setProject] = useState<FCPProject>(loadPersistedProject);
  const [assets, setAssets] = useState<MediaAsset[]>(loadPersistedAssets);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [selectedClipId, setSelectedClipId] = useState<string | null>('clip-drone-1');
  const [activeTool, setActiveTool] = useState<ToolType>('select');
  const [snappingEnabled, setSnappingEnabled] = useState<boolean>(true);
  const [skimmerEnabled, setSkimmerEnabled] = useState<boolean>(true);
  const [activeMulticamAngle, setActiveMulticamAngle] = useState<number>(0);

  // Modals
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isBatchQueueOpen, setIsBatchQueueOpen] = useState(false);
  const [isEffectsBrowserOpen, setIsEffectsBrowserOpen] = useState(false);
  const [isCompressorOpen, setIsCompressorOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isTutorialGuideOpen, setIsTutorialGuideOpen] = useState(false);
  const [isSmartConformOpen, setIsSmartConformOpen] = useState(false);
  const [mobileTab, setMobileTab] = useState<'timeline' | 'media' | 'inspector' | 'effects'>('timeline');
  // Client-side route for /admin enterprise portal
  const [currentRoute, setCurrentRoute] = useState<'editor' | 'admin'>(() => {
    if (typeof window !== 'undefined') {
      return window.location.pathname.startsWith('/admin') || window.location.hash === '#admin'
        ? 'admin'
        : 'editor';
    }
    return 'editor';
  });

  useEffect(() => {
    const handlePopState = () => {
      const isAdm = window.location.pathname.startsWith('/admin') || window.location.hash === '#admin';
      setCurrentRoute(isAdm ? 'admin' : 'editor');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateToEditor = useCallback(() => {
    window.history.pushState(null, '', '/');
    setCurrentRoute('editor');
  }, []);

  const navigateToAdmin = useCallback(() => {
    window.history.pushState(null, '', '/admin');
    setCurrentRoute('admin');
  }, []);

  const lastTimeRef = useRef<number | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const totalDuration = MagneticTimelineEngine.getTotalDuration(project.spine);

  useEffect(() => {
    SAMPLE_ASSETS.forEach(async (asset) => {
      if (asset.url && (asset.type === 'video' || asset.type === 'audio')) {
        const peaks = await audioDspEngine.extractWaveformPeaks(asset.url, 48);
        setAssets((prev) =>
          prev.map((a) => (a.id === asset.id ? { ...a, waveformPeaks: peaks } : a))
        );
      }
    });
  }, []);

  const getSelectedClip = useCallback((): TimelineClip | null => {
    if (!selectedClipId) return null;
    for (const c of project.spine) {
      if (c.id === selectedClipId) return c;
      if (c.connectedClips) {
        for (const conn of c.connectedClips) {
          if (conn.id === selectedClipId) return conn;
        }
      }
    }
    return null;
  }, [selectedClipId, project.spine]);

  // Undo / Redo Multi-Level History Stack
  const [, setHistoryVersion] = useState(0);
  const undoStackRef = useRef<FCPProject[]>([]);
  const redoStackRef = useRef<FCPProject[]>([]);

  const pushUndoState = useCallback((curr: FCPProject) => {
    undoStackRef.current.push(JSON.parse(JSON.stringify(curr)));
    if (undoStackRef.current.length > 50) {
      undoStackRef.current.shift();
    }
    redoStackRef.current = [];
    setHistoryVersion((v) => v + 1);
  }, []);

  const handleUndo = useCallback(() => {
    if (undoStackRef.current.length === 0) return;
    const prev = undoStackRef.current.pop()!;
    redoStackRef.current.push(JSON.parse(JSON.stringify(project)));
    setProject(prev);
    setHistoryVersion((v) => v + 1);
  }, [project]);

  const handleRedo = useCallback(() => {
    if (redoStackRef.current.length === 0) return;
    const next = redoStackRef.current.pop()!;
    undoStackRef.current.push(JSON.parse(JSON.stringify(project)));
    setProject(next);
    setHistoryVersion((v) => v + 1);
  }, [project]);

  // Auto-save project state to local browser sandbox
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_PROJECT_KEY, JSON.stringify(project));
    } catch (e) {
      console.warn('Project auto-save error:', e);
    }
  }, [project]);

  // Auto-save custom assets
  useEffect(() => {
    try {
      const customAssets = assets.filter((a) => a.id.startsWith('local-'));
      if (customAssets.length > 0) {
        localStorage.setItem(LOCAL_STORAGE_ASSETS_KEY, JSON.stringify(customAssets));
      }
    } catch (e) {
      console.warn('Assets auto-save error:', e);
    }
  }, [assets]);

  // Master Playback Loop
  useEffect(() => {
    const loop = (timestamp: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = timestamp;
      const deltaSec = (timestamp - lastTimeRef.current) / 1000;
      lastTimeRef.current = timestamp;

      setCurrentTime((prev) => {
        const next = prev + deltaSec;
        if (next >= totalDuration) {
          setIsPlaying(false);
          return 0;
        }
        return next;
      });

      animFrameRef.current = requestAnimationFrame(loop);
    };

    if (isPlaying) {
      audioEngine.resume();
      lastTimeRef.current = performance.now();
      animFrameRef.current = requestAnimationFrame(loop);
    } else {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      lastTimeRef.current = null;
    }

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlaying, totalDuration]);

  const handleSwitchMulticamAngle = (angleIndex: number) => {
    setActiveMulticamAngle(angleIndex);
    const videoAssets = assets.filter((a) => a.type === 'video');
    const targetAsset = videoAssets[angleIndex];
    if (targetAsset && selectedClipId) {
      setProject((prev) => ({
        ...prev,
        spine: prev.spine.map((c) =>
          c.id === selectedClipId
            ? { ...c, assetId: targetAsset.id, name: targetAsset.name.replace(/\.[^/.]+$/, '') }
            : c
        ),
      }));
    }
  };

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) {
        return;
      }

      if ((e.metaKey || e.ctrlKey) && (e.key === 'z' || e.key === 'Z')) {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      } else if ((e.metaKey || e.ctrlKey) && (e.key === 't' || e.key === 'T')) {
        e.preventDefault();
        handleApplyDefaultTransition();
      } else if (['1', '2', '3', '4'].includes(e.key)) {
        handleSwitchMulticamAngle(parseInt(e.key, 10) - 1);
      } else if (e.key === 'm' || e.key === 'M') {
        const newMarker: Marker = {
          id: `marker-${Date.now()}`,
          time: currentTime,
          label: `Marker ${project.markers.length + 1}`,
          color: '#3b82f6',
          type: 'standard',
        };
        pushUndoState(project);
        setProject((prev) => ({ ...prev, markers: [...prev.markers, newMarker] }));
      } else if (e.code === 'Space') {
        e.preventDefault();
        setIsPlaying((p) => !p);
      } else if (e.key === 'k' || e.key === 'K') {
        setIsPlaying(false);
      } else if (e.key === 'j' || e.key === 'J' || e.code === 'ArrowLeft') {
        e.preventDefault();
        setIsPlaying(false);
        setCurrentTime((t) => Math.max(0, t - 1 / project.format.frameRate));
      } else if (e.key === 'l' || e.key === 'L' || e.code === 'ArrowRight') {
        e.preventDefault();
        setIsPlaying(false);
        setCurrentTime((t) => Math.min(totalDuration, t + 1 / project.format.frameRate));
      } else if (e.key === 'a' || e.key === 'A') {
        setActiveTool('select');
      } else if (e.key === 'b' || e.key === 'B') {
        if (e.metaKey || e.ctrlKey) {
          e.preventDefault();
          handleBladeAtPlayhead();
        } else {
          setActiveTool('blade');
        }
      } else if (e.key === 't' || e.key === 'T') {
        setActiveTool('trim');
      } else if (e.key === 'h' || e.key === 'H') {
        setActiveTool('hand');
      } else if (e.key === 'n' || e.key === 'N') {
        setSnappingEnabled((s) => !s);
      } else if (e.key === 's' || e.key === 'S') {
        setSkimmerEnabled((sk) => !sk);
      } else if (e.altKey && (e.key === 'w' || e.key === 'W')) {
        e.preventDefault();
        handleInsertGap();
      } else if (e.code === 'Backspace' || e.code === 'Delete') {
        if (selectedClipId) {
          e.preventDefault();
          handleDeleteClip(selectedClipId);
        }
      } else if ((e.metaKey || e.ctrlKey) && (e.key === '5')) {
        e.preventDefault();
        setIsEffectsBrowserOpen((prev) => !prev);
      } else if (e.key === '?' || ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === '/')) {
        e.preventDefault();
        setIsTutorialGuideOpen((prev) => !prev);
      } else if ((e.metaKey || e.ctrlKey) && e.altKey && (e.key === 'a' || e.key === 'A')) {
        e.preventDefault();
        navigateToAdmin();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  const handleApplyDefaultTransition = () => {
    if (!selectedClipId) return;
    pushUndoState(project);
    const newSpine = project.spine.map((c) => {
      if (c.id === selectedClipId) {
        return {
          ...c,
          transitionOut: {
            type: 'dissolve' as const,
            duration: 1.0,
          },
        };
      }
      return c;
    });
    setProject((prev) => ({ ...prev, spine: newSpine }));
    analyticsEngine.track('COLOR_GRADE', 'Applied default Cross Dissolve transition (1.0s)');
  };

  const handleUpdateSpine = (newSpine: TimelineClip[]) => {
    pushUndoState(project);
    setProject((prev) => ({
      ...prev,
      spine: newSpine,
    }));
  };

  const handleUpdateClip = (updatedClip: TimelineClip) => {
    pushUndoState(project);
    setProject((prev) => {
      const onSpine = prev.spine.some((c) => c.id === updatedClip.id);
      if (onSpine) {
        return {
          ...prev,
          spine: prev.spine.map((c) => (c.id === updatedClip.id ? updatedClip : c)),
        };
      }

      const newSpine = prev.spine.map((parent) => ({
        ...parent,
        connectedClips: (parent.connectedClips || []).map((conn) =>
          conn.id === updatedClip.id ? updatedClip : conn
        ),
      }));

      return { ...prev, spine: newSpine };
    });
  };

  const handleDeleteClip = (clipId: string) => {
    pushUndoState(project);
    const newSpine = MagneticTimelineEngine.deleteClip(project.spine, clipId);
    setProject((prev) => ({ ...prev, spine: newSpine }));
    if (selectedClipId === clipId) {
      setSelectedClipId(null);
    }
    analyticsEngine.track('TRIM_CLIP', `Deleted clip from primary storyline`);
  };

  const handleBladeAtPlayhead = () => {
    pushUndoState(project);
    const newSpine = MagneticTimelineEngine.bladeClipAtTime(project.spine, currentTime);
    setProject((prev) => ({ ...prev, spine: newSpine }));
    analyticsEngine.track('BLADE_CUT', `Bladed clip at timecode ${Timecode.formatSMPTE(currentTime, project.format.frameRate)}`);
  };

  const handleInsertGap = () => {
    pushUndoState(project);
    const target = MagneticTimelineEngine.getClipAtTime(project.spine, currentTime);
    const insertIdx = target ? target.index + 1 : project.spine.length;
    const newSpine = MagneticTimelineEngine.insertGapClip(project.spine, insertIdx, 3.0);
    setProject((prev) => ({ ...prev, spine: newSpine }));
    analyticsEngine.track('BLADE_CUT', 'Inserted 3.0s Gap clip on storyline (⌥W)');
  };

  const handleToggleRoleMute = (role: AudioRole) => {
    setProject((prev) => {
      const isMuted = !prev.activeRoleMutes[role];
      const updatedMutes = { ...prev.activeRoleMutes, [role]: isMuted };

      const updateClipMutes = (clips: TimelineClip[]): TimelineClip[] =>
        clips.map((c) => ({
          ...c,
          muted: c.role === role ? isMuted : c.muted,
          connectedClips: updateClipMutes(c.connectedClips || []),
        }));

      return {
        ...prev,
        activeRoleMutes: updatedMutes,
        spine: updateClipMutes(prev.spine),
      };
    });
  };

  const handleToggleMarkerComplete = (markerId: string) => {
    setProject((prev) => ({
      ...prev,
      markers: prev.markers.map((m) =>
        m.id === markerId ? { ...m, completed: !m.completed } : m
      ),
    }));
  };

  // AI Scene Cut Detection Action
  const handleRunSceneDetection = async () => {
    const activeClip = getSelectedClip();
    const asset = assets.find((a) => a.id === activeClip?.assetId);
    if (!asset || !asset.url) return;

    const cuts = await SceneCutDetector.detectCuts(asset.url);
    if (cuts.length > 0) {
      let currentSpine = [...project.spine];
      for (const cutTime of cuts) {
        currentSpine = MagneticTimelineEngine.bladeClipAtTime(currentSpine, cutTime);
      }
      handleUpdateSpine(currentSpine);
    }
  };

  // Auto Generate Captions Action
  const handleGenerateCaptions = () => {
    const captions = SubtitleEngine.generateCaptions(totalDuration);
    if (project.spine.length > 0) {
      const firstClip = project.spine[0];
      const updatedFirst = {
        ...firstClip,
        connectedClips: [...(firstClip.connectedClips || []), ...captions],
      };
      const newSpine = [...project.spine];
      newSpine[0] = updatedFirst;
      handleUpdateSpine(newSpine);
    }
  };

  // Detach Audio Action (Shift+Cmd+S)
  const handleDetachAudio = (clip: TimelineClip) => {
    const { updatedVideoClip, detachedAudioClip } = SubFrameAudioEngine.detachAudio(clip);
    const newSpine = project.spine.map((c) => (c.id === clip.id ? updatedVideoClip : c));
    handleUpdateSpine(newSpine);
  };

  // Import Apple FCPXML 1.11 File Action
  const handleImportFcpXml = async (file: File) => {
    try {
      const text = await file.text();
      const imported = FcpXmlEngine.importFromFcpXml(text);
      if (imported.spine.length > 0) {
        const fullClips: TimelineClip[] = imported.spine.map((c, idx) => ({
          id: c.id || `imp_${Date.now()}_${idx}`,
          name: c.name || `Clip ${idx + 1}`,
          assetId: c.assetId || (assets[0] ? assets[0].id : ''),
          type: c.type || 'video',
          role: c.role || 'dialogue',
          timelineIn: c.timelineIn || 0,
          duration: c.duration || 5,
          sourceIn: c.sourceIn || 0,
          sourceOut: (c.sourceIn || 0) + (c.duration || 5),
          retiming: initialRetiming,
          kenBurns: initialKenBurns,
          smartConform: initialSmartConform,
          spatialConform: 'fit',
          volume: 1,
          pan: 0,
          muted: false,
          dsp: initialDsp,
          opacity: 1,
          blendMode: 'normal',
          transform: { posX: 0, posY: 0, scale: 1, rotation: 0, anchorX: 0.5, anchorY: 0.5 },
          colorGrading: { exposure: 0, contrast: 1, saturation: 1, temperature: 0, tint: 0, shadows: 0, midtones: 0, highlights: 0, wheels: initialWheels },
          effects: [],
          keyframes: {},
          connectedClips: []
        }));

        setProject((prev) => ({
          ...prev,
          name: imported.projectName,
          format: {
            ...prev.format,
            width: imported.width,
            height: imported.height,
            frameRate: imported.fps
          },
          spine: MagneticTimelineEngine.recalculateSpine(fullClips),
          markers: imported.markers.length > 0 ? imported.markers : prev.markers
        }));
      }
    } catch (e) {
      console.error('Failed to import FCPXML', e);
    }
  };

  const handleApplyEffect = (effectId: string) => {
    if (!selectedClipId) return;
    setProject((prev) => ({
      ...prev,
      spine: prev.spine.map((c) => {
        if (c.id === selectedClipId) {
          const has = c.effects.includes(effectId);
          const effects = has ? c.effects.filter((e) => e !== effectId) : [...c.effects, effectId];
          return { ...c, effects };
        }
        return c;
      }),
    }));
  };

  const handleApplyTransition = (type: TransitionType) => {
    if (!selectedClipId) return;
    setProject((prev) => ({
      ...prev,
      spine: prev.spine.map((c) => {
        if (c.id === selectedClipId) {
          return {
            ...c,
            transitionOut: { type, duration: 1.0 },
          };
        }
        return c;
      }),
    }));
  };

  const handleApplyBehavior = (type: 'wiggle' | 'oscillate' | 'overshoot' | 'pulse') => {
    if (!selectedClipId) return;
    setProject((prev) => ({
      ...prev,
      spine: prev.spine.map((c) => {
        if (c.id === selectedClipId) {
          return {
            ...c,
            behavior: { type, rate: 2, amount: 1 },
          };
        }
        return c;
      }),
    }));
  };

  const handleAddSfxAudio = (name: string, duration: number) => {
    const target = MagneticTimelineEngine.getClipAtTime(project.spine, currentTime);
    if (!target) return;
    const { clip: parentClip, index } = target;
    const anchorOffset = Math.max(0, currentTime - parentClip.timelineIn);

    const sfxClip: TimelineClip = {
      id: `sfx-${Date.now()}`,
      name,
      assetId: '',
      type: 'audio',
      role: 'effects',
      timelineIn: 0,
      duration,
      sourceIn: 0,
      sourceOut: duration,
      retiming: initialRetiming,
      kenBurns: initialKenBurns,
      smartConform: initialSmartConform,
      spatialConform: 'fit',
      volume: 1.0,
      pan: 0,
      muted: false,
      dsp: initialDsp,
      opacity: 1.0,
      blendMode: 'normal',
      transform: { posX: 0, posY: 0, scale: 1.0, rotation: 0, anchorX: 0.5, anchorY: 0.5 },
      colorGrading: { exposure: 0, contrast: 1, saturation: 1, temperature: 0, tint: 0, shadows: 0, midtones: 0, highlights: 0, wheels: initialWheels },
      effects: [],
      keyframes: {},
      connectedClips: [],
      lane: -1,
      anchorOffset,
    };

    const updatedParent: TimelineClip = {
      ...parentClip,
      connectedClips: [...(parentClip.connectedClips || []), sfxClip],
    };

    const newSpine = [...project.spine];
    newSpine[index] = updatedParent;
    handleUpdateSpine(newSpine);
    setSelectedClipId(sfxClip.id);
  };

  const handleAddAssetToSpine = (asset: MediaAsset) => {
    const newClip: TimelineClip = {
      id: `clip-${asset.id}-${Date.now()}`,
      name: asset.name.replace(/\.[^/.]+$/, ''),
      assetId: asset.id,
      type: asset.type,
      role: asset.type === 'audio' ? 'music' : 'dialogue',
      timelineIn: 0,
      duration: Math.min(5.0, asset.duration || 5.0),
      sourceIn: 0,
      sourceOut: Math.min(5.0, asset.duration || 5.0),
      retiming: initialRetiming,
      kenBurns: initialKenBurns,
      smartConform: initialSmartConform,
      spatialConform: 'fit',
      volume: 1.0,
      pan: 0,
      muted: false,
      dsp: initialDsp,
      opacity: 1.0,
      blendMode: 'normal',
      transform: { posX: 0, posY: 0, scale: 1.0, rotation: 0, anchorX: 0.5, anchorY: 0.5 },
      colorGrading: { exposure: 0, contrast: 1, saturation: 1, temperature: 0, tint: 0, shadows: 0, midtones: 0, highlights: 0, wheels: initialWheels },
      effects: [],
      keyframes: {},
      connectedClips: [],
      generatorColor: asset.color,
    };

    const newSpine = MagneticTimelineEngine.recalculateSpine([...project.spine, newClip]);
    handleUpdateSpine(newSpine);
    setSelectedClipId(newClip.id);
  };

  const handleConnectAsset = (asset: MediaAsset) => {
    const target = MagneticTimelineEngine.getClipAtTime(project.spine, currentTime);
    if (!target) return;

    const { clip: parentClip, index } = target;
    const anchorOffset = Math.max(0, currentTime - parentClip.timelineIn);

    const connectedClip: TimelineClip = {
      id: `conn-${asset.id}-${Date.now()}`,
      name: asset.name.replace(/\.[^/.]+$/, ''),
      assetId: asset.id,
      type: asset.type,
      role: asset.type === 'audio' ? 'music' : 'dialogue',
      timelineIn: 0,
      duration: Math.min(4.0, asset.duration || 4.0),
      sourceIn: 0,
      sourceOut: Math.min(4.0, asset.duration || 4.0),
      retiming: initialRetiming,
      kenBurns: initialKenBurns,
      smartConform: initialSmartConform,
      spatialConform: 'fit',
      volume: 1.0,
      pan: 0,
      muted: false,
      dsp: initialDsp,
      opacity: 1.0,
      blendMode: 'normal',
      transform: { posX: 0, posY: 0, scale: 1.0, rotation: 0, anchorX: 0.5, anchorY: 0.5 },
      colorGrading: { exposure: 0, contrast: 1, saturation: 1, temperature: 0, tint: 0, shadows: 0, midtones: 0, highlights: 0, wheels: initialWheels },
      effects: [],
      keyframes: {},
      connectedClips: [],
      lane: asset.type === 'audio' ? -1 : 1,
      anchorOffset,
    };

    const updatedParent: TimelineClip = {
      ...parentClip,
      connectedClips: [...(parentClip.connectedClips || []), connectedClip],
    };

    const newSpine = [...project.spine];
    newSpine[index] = updatedParent;
    handleUpdateSpine(newSpine);
    setSelectedClipId(connectedClip.id);
  };

  const handleAddTitle = (titleText: string, type: 'lowerThird' | 'center') => {
    const target = MagneticTimelineEngine.getClipAtTime(project.spine, currentTime);
    if (!target) return;

    const { clip: parentClip, index } = target;
    const anchorOffset = Math.max(0, currentTime - parentClip.timelineIn);

    const titleClip: TimelineClip = {
      id: `title-${Date.now()}`,
      name: titleText,
      assetId: '',
      type: 'title',
      role: 'dialogue',
      timelineIn: 0,
      duration: 3.5,
      sourceIn: 0,
      sourceOut: 3.5,
      retiming: initialRetiming,
      kenBurns: initialKenBurns,
      smartConform: initialSmartConform,
      spatialConform: 'fit',
      volume: 0,
      pan: 0,
      muted: true,
      dsp: initialDsp,
      opacity: 1.0,
      blendMode: 'normal',
      transform: { posX: 0, posY: 0, scale: 1.0, rotation: 0, anchorX: 0.5, anchorY: 0.5 },
      colorGrading: { exposure: 0, contrast: 1, saturation: 1, temperature: 0, tint: 0, shadows: 0, midtones: 0, highlights: 0, wheels: initialWheels },
      effects: [],
      keyframes: {},
      connectedClips: [],
      lane: 1,
      anchorOffset,
      titleProps: {
        text: titleText,
        fontSize: type === 'center' ? 44 : 26,
        fontFamily: '-apple-system',
        fontWeight: type === 'center' ? 'bold' : '600',
        color: type === 'center' ? '#ffd700' : '#ffffff',
        align: type === 'center' ? 'center' : 'left',
        posY: type === 'center' ? 50 : 80,
        shadow: true,
        outline: false,
        outlineColor: '#000000',
        animationStyle: 'fade',
        motion3D: type === 'center' ? {
          is3D: true,
          depth: 35,
          bevel: 6,
          material: 'matteGold',
          rotationX: 12,
          rotationY: -15,
          rotationZ: 0,
          lightIntensity: 1.2,
          lightAngle: 45,
          specular: 0.7
        } : undefined,
        motionRig: type === 'lowerThird' ? {
          enabled: true,
          templateName: 'Kinetic Lower Third 3D',
          parameters: [
            { id: 'barWidth', name: 'Accent Bar Width', type: 'slider', value: 380, min: 100, max: 800 },
            { id: 'glowIntensity', name: 'Neon Glow Intensity', type: 'slider', value: 0.8, min: 0, max: 2 },
            { id: 'showSubtitle', name: 'Show Role / Subtitle', type: 'toggle', value: true },
            { id: 'themeColor', name: 'Motion Theme', type: 'popup', value: 'Electric Cyan', options: ['Electric Cyan', 'FCP Gold', 'Sunset Magenta', 'Monochrome'] }
          ]
        } : undefined
      },
    };

    const updatedParent: TimelineClip = {
      ...parentClip,
      connectedClips: [...(parentClip.connectedClips || []), titleClip],
    };

    const newSpine = [...project.spine];
    newSpine[index] = updatedParent;
    handleUpdateSpine(newSpine);
    setSelectedClipId(titleClip.id);
  };

  const handleImportCustomFiles = async (files: FileList) => {
    const newAssets: MediaAsset[] = [];
    for (const file of Array.from(files)) {
      const opfsPath = await OPFSStorageEngine.saveFile(file.name, file);
      const isAudio = file.type.startsWith('audio');
      const blobUrl = URL.createObjectURL(file);

      const asset: MediaAsset = {
        id: `local-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        name: file.name,
        type: isAudio ? 'audio' : 'video',
        url: blobUrl,
        opfsPath,
        duration: 10.0,
        fps: 30,
      };

      if (!isAudio) {
        ProxyEngine.generateProxy(blobUrl).then((proxyUrl) => {
          setAssets((prev) =>
            prev.map((a) => (a.id === asset.id ? { ...a, proxyUrl, isProxyGenerated: true } : a))
          );
        });
      }

      newAssets.push(asset);
    }
    setAssets((prev) => [...newAssets, ...prev]);
  };

  if (currentRoute === 'admin') {
    return <AdminPortal onNavigateToEditor={navigateToEditor} />;
  }

  const selectedClip = getSelectedClip();

  // Shared subcomponent elements for desktop and responsive mobile
  const mediaBrowserElement = (
    <MediaBrowser
      assets={assets}
      onAddAssetToSpine={handleAddAssetToSpine}
      onConnectAsset={handleConnectAsset}
      onAddTitle={handleAddTitle}
      onImportCustomFiles={handleImportCustomFiles}
    />
  );

  const viewerElement = (
    <Viewer
      project={project}
      assets={assets}
      currentTime={currentTime}
      isPlaying={isPlaying}
      totalDuration={totalDuration}
      activeMulticamAngle={activeMulticamAngle}
      onTogglePlay={() => setIsPlaying((p) => !p)}
      onSeek={(t) => {
        setIsPlaying(false);
        setCurrentTime(t);
      }}
      onStepFrame={(delta) => {
        setIsPlaying(false);
        setCurrentTime((t) =>
          Math.max(0, Math.min(totalDuration, t + delta / project.format.frameRate))
        );
      }}
      onToggleProxyMedia={() =>
        setProject((prev) => ({ ...prev, useProxyMedia: !prev.useProxyMedia }))
      }
      onSwitchMulticamAngle={handleSwitchMulticamAngle}
    />
  );

  const inspectorElement = (
    <Inspector
      selectedClip={selectedClip}
      project={project}
      currentTime={currentTime}
      onUpdateClip={handleUpdateClip}
      onDeleteClip={handleDeleteClip}
      onDetachAudio={handleDetachAudio}
    />
  );

  const effectsBrowserElement = (
    <EffectsBrowser
      isOpen={true}
      onClose={() => setIsEffectsBrowserOpen(false)}
      selectedClip={selectedClip}
      onApplyEffect={handleApplyEffect}
      onApplyTransition={handleApplyTransition}
      onApplyBehavior={handleApplyBehavior}
      onAddSfxAudio={handleAddSfxAudio}
    />
  );

  const timelineElement = (
    <Timeline
      project={project}
      assets={assets}
      currentTime={currentTime}
      totalDuration={totalDuration}
      selectedClipId={selectedClipId}
      activeTool={activeTool}
      snappingEnabled={snappingEnabled}
      skimmerEnabled={skimmerEnabled}
      onSelectClip={(clip) => setSelectedClipId(clip ? clip.id : null)}
      onSeek={(t) => setCurrentTime(t)}
      onUpdateSpine={handleUpdateSpine}
      onSetActiveTool={setActiveTool}
      onToggleSnapping={() => setSnappingEnabled((s) => !s)}
      onToggleSkimmer={() => setSkimmerEnabled((s) => !s)}
      onBladeAtPlayhead={handleBladeAtPlayhead}
      onInsertGap={handleInsertGap}
      onToggleRoleMute={handleToggleRoleMute}
      onToggleMarkerComplete={handleToggleMarkerComplete}
    />
  );

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#161618] select-none text-xs">
      <MenuBar
        project={project}
        currentTime={currentTime}
        onUndo={handleUndo}
        onRedo={handleRedo}
        canUndo={undoStackRef.current.length > 0}
        canRedo={redoStackRef.current.length > 0}
        onExportVideo={() => setIsExportOpen(true)}
        onOpenBatchQueue={() => setIsBatchQueueOpen(true)}
        onOpenCompressor={() => setIsCompressorOpen(true)}
        onToggleEffectsBrowser={() => setIsEffectsBrowserOpen((prev) => !prev)}
        onExportFcpXml={() => setIsExportOpen(true)}
        onImportFcpXml={handleImportFcpXml}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
        onOpenTutorialGuide={() => setIsTutorialGuideOpen(true)}
        onResetDemo={() => {
          try {
            localStorage.removeItem(LOCAL_STORAGE_PROJECT_KEY);
            localStorage.removeItem(LOCAL_STORAGE_ASSETS_KEY);
          } catch {}
          setProject(createInitialProject());
          setAssets(SAMPLE_ASSETS);
          setCurrentTime(0);
          setSelectedClipId('clip-drone-1');
        }}
        onOpenSmartConform={() => setIsSmartConformOpen(true)}
        onRunSceneDetection={handleRunSceneDetection}
        onGenerateCaptions={handleGenerateCaptions}
      />

      {/* 1. DESKTOP 3-PANE WORKSPACE (>= 1024px) */}
      <div className="hidden lg:flex flex-col flex-1 min-h-0">
        <div className="flex-1 flex min-h-0">
          <div className="w-1/4 min-w-[280px] max-w-[360px] h-full border-r border-[#2c2c2e]">
            {mediaBrowserElement}
          </div>

          <div className="flex-1 h-full min-w-0">
            {viewerElement}
          </div>

          {/* Right Dock: Inspector & Effects */}
          <div className="flex h-full border-l border-[#2c2c2e]">
            {isEffectsBrowserOpen && (
              <div className="w-80 h-full border-r border-[#2c2c2e]">
                {effectsBrowserElement}
              </div>
            )}

            <div className="w-[340px] min-w-[300px] h-full">
              {inspectorElement}
            </div>
          </div>
        </div>

        {/* Timeline Bottom Dock */}
        <div className="h-[290px] border-t border-[#2c2c2e]">
          {timelineElement}
        </div>
      </div>

      {/* 2. MOBILE & TABLET ADAPTIVE WORKSPACE (< 1024px) */}
      <div className="flex lg:hidden flex-col flex-1 min-h-0 bg-[#161618]">
        {/* Upper: Video Viewer */}
        <div className="h-[46%] min-h-[200px] max-h-[420px] w-full">
          {viewerElement}
        </div>

        {/* Apple Segmented Tab Switcher Bar */}
        <nav className="h-11 bg-[#18181a] border-y border-[#2c2c2e] flex items-center justify-around px-2 select-none shrink-0">
          <button
            onClick={() => setMobileTab('timeline')}
            className={`flex-1 py-1.5 flex items-center justify-center gap-1.5 rounded-md text-xs font-medium transition-all ${
              mobileTab === 'timeline'
                ? 'bg-[#2c2c2e] text-white shadow-sm'
                : 'text-[#8e8e93] hover:text-[#d1d1d6]'
            }`}
          >
            <Film size={13} />
            <span>Timeline</span>
          </button>

          <button
            onClick={() => setMobileTab('media')}
            className={`flex-1 py-1.5 flex items-center justify-center gap-1.5 rounded-md text-xs font-medium transition-all ${
              mobileTab === 'media'
                ? 'bg-[#2c2c2e] text-white shadow-sm'
                : 'text-[#8e8e93] hover:text-[#d1d1d6]'
            }`}
          >
            <Folder size={13} />
            <span>Clips</span>
          </button>

          <button
            onClick={() => setMobileTab('inspector')}
            className={`flex-1 py-1.5 flex items-center justify-center gap-1.5 rounded-md text-xs font-medium transition-all ${
              mobileTab === 'inspector'
                ? 'bg-[#2c2c2e] text-white shadow-sm'
                : 'text-[#8e8e93] hover:text-[#d1d1d6]'
            }`}
          >
            <Sliders size={13} />
            <span>Inspector</span>
          </button>

          <button
            onClick={() => setMobileTab('effects')}
            className={`flex-1 py-1.5 flex items-center justify-center gap-1.5 rounded-md text-xs font-medium transition-all ${
              mobileTab === 'effects'
                ? 'bg-[#2c2c2e] text-white shadow-sm'
                : 'text-[#8e8e93] hover:text-[#d1d1d6]'
            }`}
          >
            <Sparkles size={13} />
            <span>Effects</span>
          </button>
        </nav>

        {/* Lower: Active Tab Workspace */}
        <div className="flex-1 min-h-0 overflow-y-auto">
          {mobileTab === 'timeline' && timelineElement}
          {mobileTab === 'media' && mediaBrowserElement}
          {mobileTab === 'inspector' && inspectorElement}
          {mobileTab === 'effects' && effectsBrowserElement}
        </div>
      </div>

      {/* MODALS */}
      <SmartConformModal
        isOpen={isSmartConformOpen}
        onClose={() => setIsSmartConformOpen(false)}
        currentFormat={project.format}
        onApplyFormat={(newFormat) => setProject((prev) => ({ ...prev, format: newFormat }))}
      />

      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        project={project}
        assets={assets}
      />

      <BatchShareQueueModal
        isOpen={isBatchQueueOpen}
        onClose={() => setIsBatchQueueOpen(false)}
        project={project}
        assets={assets}
      />

      <CompressorModal
        isOpen={isCompressorOpen}
        onClose={() => setIsCompressorOpen(false)}
        project={project}
        assets={assets}
      />

      <ShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />

      <TutorialGuideModal
        isOpen={isTutorialGuideOpen}
        onClose={() => setIsTutorialGuideOpen(false)}
      />
    </div>
  );
};
export default App;
