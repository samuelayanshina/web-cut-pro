import React, { useState } from 'react';
import { X, Download, Share2, Film, FileCode, CheckCircle, Loader2 } from 'lucide-react';
import { FCPProject, MediaAsset } from '../types/fcp';
import { FcpXmlEngine } from '../engine/FcpXml';
import { compositor } from '../engine/Compositor';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: FCPProject;
  assets: MediaAsset[];
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  project,
  assets,
}) => {
  const [resolution, setResolution] = useState<'1080p' | '720p' | '4k'>('1080p');
  const [codec, setCodec] = useState<'webm' | 'mp4'>('webm');
  const [isRendering, setIsRendering] = useState(false);
  const [renderProgress, setRenderProgress] = useState(0);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  if (!isOpen) return null;

  const totalDuration = project.spine.reduce((acc, c) => acc + c.duration, 0);

  // Client-side render to video file
  const handleStartRender = async () => {
    setIsRendering(true);
    setRenderProgress(0);
    setDownloadUrl(null);

    // Setup an offscreen canvas
    const offCanvas = document.createElement('canvas');
    offCanvas.width = resolution === '4k' ? 3840 : resolution === '720p' ? 1280 : 1920;
    offCanvas.height = resolution === '4k' ? 2160 : resolution === '720p' ? 720 : 1080;

    const stream = offCanvas.captureStream(project.format.frameRate);
    const mimeType = codec === 'mp4' && MediaRecorder.isTypeSupported('video/mp4')
      ? 'video/mp4'
      : 'video/webm;codecs=vp9';

    const recorder = new MediaRecorder(stream, { mimeType });
    const chunks: Blob[] = [];

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };

    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: mimeType });
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
      setIsRendering(false);
    };

    recorder.start();

    // Step through timeline frame by frame
    const fps = project.format.frameRate;
    const totalFrames = Math.max(1, Math.round(totalDuration * fps));
    const dt = 1 / fps;

    let frame = 0;
    const renderNextFrame = () => {
      if (frame >= totalFrames) {
        recorder.stop();
        return;
      }

      const t = frame * dt;
      compositor.renderFrame(offCanvas, project.spine, assets, t, project.format);
      frame++;
      setRenderProgress(Math.round((frame / totalFrames) * 100));

      // Use requestAnimationFrame or setTimeout for render loop
      setTimeout(renderNextFrame, 16);
    };

    renderNextFrame();
  };

  const handleDownloadFcpXml = () => {
    const xml = FcpXmlEngine.exportToFcpXml(project, assets);
    const blob = new Blob([xml], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.name.replace(/\s+/g, '_')}.fcpxml`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#202020] border border-gray-700 w-full max-w-md rounded-xl shadow-2xl overflow-hidden select-none text-xs">
        {/* Header */}
        <div className="px-4 py-3 bg-[#262626] border-b border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Share2 size={16} className="text-fcp-accent" />
            <span className="font-bold text-white text-sm">Export & Share Project</span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1 rounded-md transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-4">
          <div>
            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
              Master File Export
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-gray-400 block mb-1">Resolution</label>
                <select
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value as any)}
                  disabled={isRendering}
                  className="w-full bg-[#181818] border border-gray-700 rounded p-1.5 text-white"
                >
                  <option value="1080p">1080p Full HD (1920×1080)</option>
                  <option value="720p">720p HD (1280×720)</option>
                  <option value="4k">4K Ultra HD (3840×2160)</option>
                </select>
              </div>

              <div>
                <label className="text-gray-400 block mb-1">Container</label>
                <select
                  value={codec}
                  onChange={(e) => setCodec(e.target.value as any)}
                  disabled={isRendering}
                  className="w-full bg-[#181818] border border-gray-700 rounded p-1.5 text-white"
                >
                  <option value="webm">WebM (VP9 Broadcast)</option>
                  <option value="mp4">MP4 (H.264 / AAC)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Render Progress or Download Button */}
          {isRendering ? (
            <div className="p-3 bg-[#181818] rounded-lg border border-gray-700 space-y-2">
              <div className="flex justify-between text-gray-300 font-medium">
                <span className="flex items-center gap-1.5">
                  <Loader2 size={13} className="animate-spin text-fcp-accent" />
                  Rendering Video Frames...
                </span>
                <span className="font-mono text-fcp-accent">{renderProgress}%</span>
              </div>
              <div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden">
                <div
                  className="h-full bg-fcp-accent transition-all duration-150"
                  style={{ width: `${renderProgress}%` }}
                />
              </div>
            </div>
          ) : downloadUrl ? (
            <div className="p-3 bg-emerald-950/40 border border-emerald-600/60 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-300">
                <CheckCircle size={16} />
                <span className="font-medium">Video Rendered Successfully!</span>
              </div>
              <a
                href={downloadUrl}
                download={`${project.name.replace(/\s+/g, '_')}.${codec}`}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-medium shadow flex items-center gap-1.5 transition-colors"
              >
                <Download size={13} />
                <span>Save Video</span>
              </a>
            </div>
          ) : (
            <button
              onClick={handleStartRender}
              className="w-full py-2 bg-fcp-accent hover:bg-fcp-accentHover text-white rounded font-semibold flex items-center justify-center gap-2 shadow-md transition-colors"
            >
              <Film size={14} />
              <span>Render & Download Video</span>
            </button>
          )}

          {/* Apple Final Cut Pro XML Export Option */}
          <div className="pt-3 border-t border-gray-700">
            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
              Apple NLE Interchange
            </div>
            <div className="flex items-center justify-between p-3 bg-[#181818] rounded-lg border border-gray-700">
              <div>
                <div className="font-medium text-white flex items-center gap-1.5">
                  <FileCode size={14} className="text-amber-400" />
                  <span>Final Cut Pro XML (.fcpxml)</span>
                </div>
                <div className="text-[10px] text-gray-400 mt-0.5">
                  Standard FCPXML 1.10 file ready to import directly into Apple Final Cut Pro.
                </div>
              </div>
              <button
                onClick={handleDownloadFcpXml}
                className="px-3 py-1.5 bg-[#2d2d2d] hover:bg-[#3d3d3d] border border-gray-600 rounded text-gray-200 font-medium transition-colors ml-2"
              >
                Download
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
