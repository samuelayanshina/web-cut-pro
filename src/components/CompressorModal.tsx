import React, { useState } from 'react';
import { X, Sliders, Cpu, HardDrive, Check, Play, Film } from 'lucide-react';
import { FCPProject, MediaAsset } from '../types/fcp';
import { ExportEngine } from '../engine/ExportEngine';

interface CompressorModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: FCPProject;
  assets: MediaAsset[];
}

export const CompressorModal: React.FC<CompressorModalProps> = ({
  isOpen,
  onClose,
  project,
  assets
}) => {
  const [videoCodec, setVideoCodec] = useState<'prores_422' | 'hevc_h265' | 'avc_h264' | 'vp9'>('hevc_h265');
  const [bitrateMode, setBitrateMode] = useState<'vbr_2pass' | 'cbr'>('vbr_2pass');
  const [targetBitrateMbps, setTargetBitrateMbps] = useState<number>(24);
  const [gopSize, setGopSize] = useState<number>(30);
  const [audioSampleRate, setAudioSampleRate] = useState<number>(48000);
  const [audioBitDepth, setAudioBitDepth] = useState<number>(24);
  const [colorTransfer, setColorTransfer] = useState<'rec709' | 'rec2020_hlg' | 'rec2020_pq'>('rec709');

  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportProgress, setExportProgress] = useState<number>(0);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  if (!isOpen) return null;

  const totalDuration = Math.max(1, project.spine.reduce((acc, c) => acc + c.duration, 0));
  const estimatedSizeMb = Math.round((totalDuration * (targetBitrateMbps * 1_000_000) / 8 / (1024 * 1024)) * 10) / 10;

  const handleStartCompressorRender = async () => {
    setIsExporting(true);
    setExportProgress(0);
    setDownloadUrl(null);

    try {
      const blob = await ExportEngine.renderProject(
        project,
        assets,
        videoCodec === 'prores_422' ? 'prores_master' : 'apple_devices_4k',
        (progress) => setExportProgress(progress)
      );

      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
    } catch (e) {
      console.error('Compressor render failed', e);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md">
      <div className="w-[740px] max-h-[90vh] bg-[#1e1e1e] border border-[#3e3e3e] rounded-lg shadow-2xl flex flex-col text-gray-300 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-[#333333] bg-[#272727]">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-indigo-400" />
            <div>
              <h2 className="text-sm font-semibold text-white tracking-wide">Apple Compressor Web Settings Engine</h2>
              <div className="text-[10px] text-gray-400">Custom Transcoding, GOP Structure, 2-Pass VBR, and Gamma Primaries</div>
            </div>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-[#383838] rounded text-gray-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Settings Body */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4 text-xs">
          {/* Codec & Bitrate */}
          <div className="p-3 bg-[#181818] border border-[#2c2c2c] rounded-md space-y-3">
            <div className="font-semibold text-white flex items-center justify-between">
              <span>Video Compression Profile</span>
              <span className="text-[10px] text-indigo-400 font-mono">Hardware Encoding</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-gray-400 block mb-1">Target Codec</label>
                <select
                  value={videoCodec}
                  onChange={(e) => setVideoCodec(e.target.value as any)}
                  className="w-full bg-[#121212] border border-gray-700 rounded px-2.5 py-1.5 text-white"
                >
                  <option value="hevc_h265">HEVC / H.265 (High Dynamic Range)</option>
                  <option value="avc_h264">H.264 / AVC (Broadcast Universal)</option>
                  <option value="prores_422">Apple ProRes 422 (Post Master)</option>
                  <option value="vp9">Google VP9 (Ultra Web Stream)</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-gray-400 block mb-1">Rate Control Mode</label>
                <select
                  value={bitrateMode}
                  onChange={(e) => setBitrateMode(e.target.value as any)}
                  className="w-full bg-[#121212] border border-gray-700 rounded px-2.5 py-1.5 text-white"
                >
                  <option value="vbr_2pass">Two-Pass Variable Bitrate (VBR)</option>
                  <option value="cbr">Constant Bitrate (CBR)</option>
                </select>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-gray-300">Target Video Bitrate</span>
                <span className="text-indigo-400 font-mono font-bold">{targetBitrateMbps} Mbps</span>
              </div>
              <input
                type="range"
                min={4}
                max={80}
                value={targetBitrateMbps}
                onChange={(e) => setTargetBitrateMbps(Number(e.target.value))}
                className="w-full accent-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1 border-t border-[#262626]">
              <div>
                <label className="text-[10px] text-gray-400 block mb-1">GOP Keyframe Interval</label>
                <input
                  type="number"
                  value={gopSize}
                  onChange={(e) => setGopSize(Number(e.target.value))}
                  className="w-full bg-[#121212] border border-gray-700 rounded px-2.5 py-1 text-white font-mono"
                />
              </div>

              <div>
                <label className="text-[10px] text-gray-400 block mb-1">Color Transfer Function</label>
                <select
                  value={colorTransfer}
                  onChange={(e) => setColorTransfer(e.target.value as any)}
                  className="w-full bg-[#121212] border border-gray-700 rounded px-2.5 py-1 text-white"
                >
                  <option value="rec709">Rec. 709 (SDR Standard)</option>
                  <option value="rec2020_hlg">Rec. 2020 HLG (Hybrid Log-Gamma HDR)</option>
                  <option value="rec2020_pq">Rec. 2020 PQ (HDR10 Master)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Audio Bit Depth & Sample Rate */}
          <div className="p-3 bg-[#181818] border border-[#2c2c2c] rounded-md space-y-2">
            <div className="font-semibold text-white">Audio Stream Specification</div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-gray-400 block mb-1">Sample Rate</label>
                <select
                  value={audioSampleRate}
                  onChange={(e) => setAudioSampleRate(Number(e.target.value))}
                  className="w-full bg-[#121212] border border-gray-700 rounded px-2.5 py-1 text-white"
                >
                  <option value={48000}>48,000 Hz (Cinema / Broadcast)</option>
                  <option value={96000}>96,000 Hz (High-Resolution Studio Master)</option>
                  <option value={44100}>44,100 Hz (CD Audio)</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-gray-400 block mb-1">Bit Depth</label>
                <select
                  value={audioBitDepth}
                  onChange={(e) => setAudioBitDepth(Number(e.target.value))}
                  className="w-full bg-[#121212] border border-gray-700 rounded px-2.5 py-1 text-white"
                >
                  <option value={24}>24-bit Linear PCM</option>
                  <option value={32}>32-bit Floating Point</option>
                  <option value={16}>16-bit Standard</option>
                </select>
              </div>
            </div>
          </div>

          {/* Render Stats Card */}
          <div className="p-3 bg-[#141414] border border-[#222222] rounded text-[11px] grid grid-cols-3 gap-2 text-gray-400">
            <div>Duration: <span className="text-white font-mono">{Math.round(totalDuration)}s</span></div>
            <div>Estimated Size: <span className="text-indigo-400 font-bold">{estimatedSizeMb} MB</span></div>
            <div>Container: <span className="text-white font-mono">.MP4 / .MOV</span></div>
          </div>

          {/* Progress Bar */}
          {isExporting && (
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] text-gray-400">
                <span>Compressor Hardware Rendering...</span>
                <span>{exportProgress}%</span>
              </div>
              <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-indigo-500 h-full transition-all duration-150"
                  style={{ width: `${exportProgress}%` }}
                />
              </div>
            </div>
          )}

          {downloadUrl && (
            <a
              href={downloadUrl}
              download={`${project.name}_Compressor.${videoCodec === 'prores_422' ? 'mov' : 'mp4'}`}
              className="w-full py-2.5 bg-green-600 hover:bg-green-500 text-white rounded font-medium flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" />
              Download Master Deliverable ({estimatedSizeMb} MB)
            </a>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[#333333] bg-[#222222] flex items-center justify-between">
          <button onClick={onClose} className="px-3 py-1.5 hover:bg-[#333333] rounded text-gray-400 hover:text-white">
            Cancel
          </button>
          <button
            disabled={isExporting}
            onClick={handleStartCompressorRender}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium rounded flex items-center gap-2 shadow-lg shadow-indigo-900/30"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{isExporting ? 'Compressing...' : 'Render via Compressor'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
