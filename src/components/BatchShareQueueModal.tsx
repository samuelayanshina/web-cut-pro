import React, { useState } from 'react';
import { X, Play, Download, CheckCircle2, AlertCircle, Clock, Film, Copy, Check, Layers } from 'lucide-react';
import { FCPProject, MediaAsset, ExportPreset, ExportJob } from '../types/fcp';
import { ExportEngine } from '../engine/ExportEngine';

interface BatchShareQueueModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: FCPProject;
  assets: MediaAsset[];
}

export const BatchShareQueueModal: React.FC<BatchShareQueueModalProps> = ({
  isOpen,
  onClose,
  project,
  assets
}) => {
  const [selectedPreset, setSelectedPreset] = useState<ExportPreset>('prores_master');
  const [jobs, setJobs] = useState<ExportJob[]>([]);
  const [isRendering, setIsRendering] = useState(false);
  const [copiedChapters, setCopiedChapters] = useState(false);

  if (!isOpen) return null;

  const totalDuration = Math.max(1, project.spine.reduce((acc, c) => acc + c.duration, 0));
  const presetDetails = ExportEngine.getPresetDetails(selectedPreset);
  const estimatedSize = ExportEngine.estimateFileSize(totalDuration, selectedPreset);
  const chapterList = ExportEngine.generateChapterList(project.markers, project.format.frameRate);

  const handleCopyChapters = () => {
    navigator.clipboard.writeText(chapterList);
    setCopiedChapters(true);
    setTimeout(() => setCopiedChapters(false), 2000);
  };

  const handleStartRender = async () => {
    const newJob: ExportJob = {
      id: `job_${Date.now()}`,
      projectName: project.name,
      preset: selectedPreset,
      resolution: selectedPreset === 'instagram_reel_9_16' ? '1080x1920' : `${project.format.width}x${project.format.height}`,
      format: presetDetails.extension as any,
      status: 'rendering',
      progress: 0,
      estimatedSizeMb: estimatedSize,
      createdAt: Date.now()
    };

    setJobs(prev => [newJob, ...prev]);
    setIsRendering(true);

    try {
      const blob = await ExportEngine.renderProject(
        project,
        assets,
        selectedPreset,
        (progress) => {
          setJobs(prev =>
            prev.map(j => (j.id === newJob.id ? { ...j, progress } : j))
          );
        }
      );

      const downloadUrl = URL.createObjectURL(blob);
      setJobs(prev =>
        prev.map(j =>
          j.id === newJob.id
            ? { ...j, status: 'completed', progress: 100, downloadUrl }
            : j
        )
      );
    } catch (err: any) {
      setJobs(prev =>
        prev.map(j =>
          j.id === newJob.id
            ? { ...j, status: 'failed', error: err.message || 'Render failed' }
            : j
        )
      );
    } finally {
      setIsRendering(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm">
      <div className="w-[820px] max-h-[85vh] bg-[#1e1e1e] border border-[#3a3a3a] rounded-lg shadow-2xl flex flex-col text-[#cccccc] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-[#333333] bg-[#252525]">
          <div className="flex items-center gap-2">
            <Film className="w-5 h-5 text-blue-400" />
            <h2 className="text-sm font-semibold tracking-wide text-white">Final Cut Pro Share Destinations & Batch Queue</h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-[#333333] rounded text-[#888888] hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 grid grid-cols-12 gap-5">
          {/* Left Column: Preset Destination Selection */}
          <div className="col-span-7 flex flex-col gap-4">
            <div>
              <label className="text-xs font-semibold text-[#888888] uppercase tracking-wider block mb-2">
                Destination Preset
              </label>
              <div className="space-y-2">
                {[
                  { id: 'prores_master', name: 'Master File (Apple ProRes 422)', tag: 'Broadcast Master' },
                  { id: 'apple_devices_4k', name: 'Apple Devices 4K (HEVC / H.265)', tag: 'Apple TV / Mac Retina' },
                  { id: 'apple_devices_1080p', name: 'Apple Devices 1080p (H.264)', tag: 'iPhone / iPad' },
                  { id: 'youtube_1080p', name: 'YouTube & Facebook (Web Optimized)', tag: 'Social Media' },
                  { id: 'instagram_reel_9_16', name: 'Vertical Video (TikTok / Shorts / Reels 9:16)', tag: '9:16 Socials' },
                  { id: 'broadcast_wav', name: 'Audio Only (Broadcast WAV 48kHz)', tag: 'Stem Master' }
                ].map(p => (
                  <div
                    key={p.id}
                    onClick={() => setSelectedPreset(p.id as ExportPreset)}
                    className={`p-3 rounded border cursor-pointer transition-all flex items-center justify-between ${
                      selectedPreset === p.id
                        ? 'bg-blue-600/15 border-blue-500 text-white'
                        : 'bg-[#262626] border-[#333333] hover:border-[#444444] text-[#aaaaaa]'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-medium text-white">{p.name}</div>
                      <div className="text-[10px] text-[#777777] mt-0.5">{p.tag}</div>
                    </div>
                    {selectedPreset === p.id && (
                      <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Destination Specs Card */}
            <div className="p-3 bg-[#181818] border border-[#2e2e2e] rounded text-xs space-y-1.5">
              <div className="text-white font-medium">{presetDetails.title}</div>
              <p className="text-[#888888] text-[11px] leading-relaxed">{presetDetails.description}</p>
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#262626] text-[11px] text-[#999999]">
                <div>Estimated Size: <span className="text-white font-semibold">{estimatedSize} MB</span></div>
                <div>Format Container: <span className="text-white font-semibold">.{presetDetails.extension.toUpperCase()}</span></div>
              </div>
            </div>

            {/* Chapter Markers */}
            <div className="p-3 bg-[#181818] border border-[#2e2e2e] rounded">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-medium text-white">YouTube / Vimeo Chapters ({project.markers.length})</span>
                <button
                  onClick={handleCopyChapters}
                  className="flex items-center gap-1 text-[11px] px-2 py-0.5 bg-[#2a2a2a] hover:bg-[#333333] rounded text-[#cccccc]"
                >
                  {copiedChapters ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                  {copiedChapters ? 'Copied!' : 'Copy Timestamps'}
                </button>
              </div>
              <pre className="text-[10px] font-mono bg-[#111111] p-2 rounded max-h-20 overflow-y-auto text-[#888888]">
                {chapterList}
              </pre>
            </div>
          </div>

          {/* Right Column: Live Batch Queue & Status */}
          <div className="col-span-5 flex flex-col bg-[#181818] border border-[#2e2e2e] rounded p-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#2a2a2a] mb-3">
              <div className="flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-semibold text-white">Batch Share Queue</span>
              </div>
              <span className="text-[10px] bg-[#2a2a2a] px-1.5 py-0.5 rounded text-[#888888]">
                {jobs.length} Jobs
              </span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 min-h-[220px]">
              {jobs.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-[#666666] text-xs py-8">
                  <Clock className="w-8 h-8 mb-2 opacity-40" />
                  <span>No active export jobs</span>
                  <span className="text-[10px] text-[#555555] mt-1">Select a destination and click Start Render</span>
                </div>
              ) : (
                jobs.map(job => (
                  <div key={job.id} className="p-2.5 bg-[#222222] border border-[#333333] rounded flex flex-col gap-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-white truncate max-w-[140px]">{job.projectName}</span>
                      <span className={`text-[10px] uppercase font-bold px-1.5 py-0.2 rounded ${
                        job.status === 'completed'
                          ? 'bg-green-900/40 text-green-400'
                          : job.status === 'rendering'
                          ? 'bg-blue-900/40 text-blue-400 animate-pulse'
                          : 'bg-red-900/40 text-red-400'
                      }`}>
                        {job.status}
                      </span>
                    </div>

                    <div className="text-[10px] text-[#777777]">
                      {job.resolution} • {job.format.toUpperCase()} • {job.estimatedSizeMb} MB
                    </div>

                    {job.status === 'rendering' && (
                      <div className="w-full bg-[#333333] h-1.5 rounded-full overflow-hidden mt-1">
                        <div
                          className="bg-blue-500 h-full transition-all duration-150"
                          style={{ width: `${job.progress}%` }}
                        ></div>
                      </div>
                    )}

                    {job.status === 'completed' && job.downloadUrl && (
                      <a
                        href={job.downloadUrl}
                        download={`${job.projectName}.${job.format}`}
                        className="mt-1 flex items-center justify-center gap-1.5 py-1 px-2 bg-green-600 hover:bg-green-500 text-white rounded text-[11px] font-medium"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Download Rendered File
                      </a>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Action Button */}
            <div className="pt-3 border-t border-[#2a2a2a] mt-2">
              <button
                disabled={isRendering}
                onClick={handleStartRender}
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                {isRendering ? 'Rendering Hardware Frames...' : 'Start Render & Share'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
