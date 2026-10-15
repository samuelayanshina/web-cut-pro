import React, { useState } from 'react';
import { 
  X, 
  BookOpen, 
  Search, 
  Sparkles, 
  Film, 
  Scissors, 
  Palette, 
  Volume2, 
  Smartphone, 
  Share2, 
  CheckCircle2, 
  HelpCircle,
  ArrowRight,
  ExternalLink,
  Laptop
} from 'lucide-react';

interface TutorialGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TutorialGuideModal: React.FC<TutorialGuideModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'rosetta' | 'timeline' | 'media' | 'color' | 'mobile' | 'export'>('rosetta');
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const rosettaTranslations = [
    {
      tutorialSays: "Drag media into the Event / Library from Finder",
      inWebCutPro: "Click '+ Import Media' in Clips browser, or drag-and-drop any video/audio/photo directly into the window. Media is stored in your private browser sandbox (OPFS).",
      category: "Media & Import"
    },
    {
      tutorialSays: "Append clip to Primary Storyline (E)",
      inWebCutPro: "Click '+' on any thumbnail in the Clips browser or drag it into the magnetic spine track.",
      category: "Timeline"
    },
    {
      tutorialSays: "Connect clip / B-Roll above storyline (Q)",
      inWebCutPro: "Hover over any clip card in the browser and tap 'Connect (Q)' — it anchors as a connected b-roll lane above your primary footage.",
      category: "Timeline"
    },
    {
      tutorialSays: "Select Blade Tool (B) or Blade at Playhead (⌘B)",
      inWebCutPro: "Press 'B' or '⌘B' (or tap the Blade icon on the timeline bar). It makes an instant non-destructive cut exactly at the playhead.",
      category: "Cutting"
    },
    {
      tutorialSays: "Ripple Delete a clip (Delete / ⌫)",
      inWebCutPro: "Select any clip and press 'Delete' or 'Backspace'. The Magnetic Timeline automatically snaps following clips forward, closing any gap.",
      category: "Cutting"
    },
    {
      tutorialSays: "Insert a Gap Clip (⌥W)",
      inWebCutPro: "Press '⌥ + W' or tap 'Gap' on the timeline toolbar to insert a standard Final Cut Pro spacer clip.",
      category: "Timeline"
    },
    {
      tutorialSays: "Toggle Magnetic Snapping (N) and Skimmer (S)",
      inWebCutPro: "Press 'N' to toggle snapping and 'S' to toggle the skimmer line. Both icons are located on the timeline toolbar.",
      category: "Timeline"
    },
    {
      tutorialSays: "Open Video / Color / Audio Inspector (⌘4)",
      inWebCutPro: "Select any clip on the timeline — the right-side Inspector panel displays the identical 'Video', 'Color', and 'Audio' parameter tabs.",
      category: "Inspector"
    },
    {
      tutorialSays: "Color Wheels Grading (⌘6)",
      inWebCutPro: "In the Inspector, click the 'Color' tab and select 'Color Wheels'. You have authentic Shadows, Midtones, Highlights, and Master wheels with Lift/Gamma/Gain.",
      category: "Color"
    },
    {
      tutorialSays: "Smart Conform (Auto-Reframe to 9:16 vertical)",
      inWebCutPro: "Tap 'Reframe' on the top menu bar or check 'Auto Reframe' in the Video Inspector tab to instantly adapt to TikTok / Instagram Reels.",
      category: "Inspector"
    },
    {
      tutorialSays: "Apply Audio EQ & Voice Isolation",
      inWebCutPro: "Click the 'Audio' tab in the Inspector to tweak the 10-Band Logic Pro Parametric Equalizer, Brickwall Limiter, or toggle Voice Isolation.",
      category: "Audio"
    },
    {
      tutorialSays: "File > Share > Master File (⌘E)",
      inWebCutPro: "Click the blue 'Share' button in the top right to export your master file in Apple ProRes 422 or H.264 MP4 with hardware acceleration.",
      category: "Export"
    },
    {
      tutorialSays: "File > Export XML (.fcpxml) for DaVinci Resolve",
      inWebCutPro: "Click '•••' in the top header and select 'Export FCPXML...'. Generates a genuine FCPXML 1.11 file compatible with desktop Final Cut Pro and DaVinci Resolve.",
      category: "Export"
    }
  ];

  const filteredTranslations = rosettaTranslations.filter(item => 
    item.tutorialSays.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.inWebCutPro.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-6 select-none font-inter">
      <div className="bg-[#18181a] border border-[#2c2c2e] w-full max-w-4xl h-[90vh] max-h-[820px] rounded-3xl shadow-2xl flex flex-col overflow-hidden text-xs text-[#d1d1d6]">
        {/* Header */}
        <div className="px-6 py-4 bg-[#1c1c1e] border-b border-[#2c2c2e] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#0071e3]/10 text-[#0071e3] flex items-center justify-center border border-[#0071e3]/20">
              <BookOpen size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-poppins font-bold text-base text-white tracking-tight">
                  Final Cut Pro Tutorial Companion Guide
                </h2>
                <span className="text-[10px] font-semibold bg-[#2c2c2e] text-[#a1a1a6] px-2 py-0.5 rounded-full">
                  FCP v12.4 Compatible
                </span>
              </div>
              <p className="text-[11px] text-[#8e8e93]">
                Watch any Apple Final Cut Pro tutorial video on YouTube and follow along directly in Web Cut Pro.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-[#8e8e93] hover:text-white hover:bg-[#2c2c2e] rounded-xl transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Search & Segmented Navigation Tabs */}
        <div className="px-6 pt-4 pb-3 border-b border-[#2c2c2e] space-y-3 shrink-0 bg-[#18181a]">
          <div className="relative w-full">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8e8e93]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by tutorial action (e.g. 'blade', 'b-roll', 'color wheels', 'export', 'magnetic gap')..."
              className="w-full pl-9 pr-4 py-2 bg-[#121214] border border-[#2c2c2e] focus:border-[#0071e3] rounded-xl text-xs text-white placeholder:text-[#636366] outline-none transition-all"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
            <button
              onClick={() => setActiveTab('rosetta')}
              className={`px-3.5 py-1.5 rounded-lg font-medium transition-all shrink-0 ${
                activeTab === 'rosetta' ? 'bg-[#2c2c2e] text-white shadow-sm' : 'text-[#8e8e93] hover:text-white'
              }`}
            >
              Tutorial Translation Table
            </button>
            <button
              onClick={() => setActiveTab('timeline')}
              className={`px-3.5 py-1.5 rounded-lg font-medium transition-all shrink-0 ${
                activeTab === 'timeline' ? 'bg-[#2c2c2e] text-white shadow-sm' : 'text-[#8e8e93] hover:text-white'
              }`}
            >
              Magnetic Timeline & Blade
            </button>
            <button
              onClick={() => setActiveTab('media')}
              className={`px-3.5 py-1.5 rounded-lg font-medium transition-all shrink-0 ${
                activeTab === 'media' ? 'bg-[#2c2c2e] text-white shadow-sm' : 'text-[#8e8e93] hover:text-white'
              }`}
            >
              Media & Storage
            </button>
            <button
              onClick={() => setActiveTab('color')}
              className={`px-3.5 py-1.5 rounded-lg font-medium transition-all shrink-0 ${
                activeTab === 'color' ? 'bg-[#2c2c2e] text-white shadow-sm' : 'text-[#8e8e93] hover:text-white'
              }`}
            >
              Color & Audio DSP
            </button>
            <button
              onClick={() => setActiveTab('mobile')}
              className={`px-3.5 py-1.5 rounded-lg font-medium transition-all shrink-0 ${
                activeTab === 'mobile' ? 'bg-[#2c2c2e] text-white shadow-sm' : 'text-[#8e8e93] hover:text-white'
              }`}
            >
              Mobile / iPad Mode
            </button>
            <button
              onClick={() => setActiveTab('export')}
              className={`px-3.5 py-1.5 rounded-lg font-medium transition-all shrink-0 ${
                activeTab === 'export' ? 'bg-[#2c2c2e] text-white shadow-sm' : 'text-[#8e8e93] hover:text-white'
              }`}
            >
              Share & FCPXML
            </button>
          </div>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: ROSETTA STONE LOOKUP TABLE */}
          {activeTab === 'rosetta' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-[#1c1c1e] border border-[#2c2c2e] flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-white text-xs sm:text-sm">
                    Side-by-Side Tutorial Cheat Sheet
                  </h3>
                  <p className="text-[11px] text-[#8e8e93] mt-0.5">
                    Whenever an instructor in a video tutorial tells you to do an action, here is how you perform it in Web Cut Pro.
                  </p>
                </div>
                <span className="text-xs font-mono text-[#0071e3] bg-[#0071e3]/10 px-2.5 py-1 rounded-full border border-[#0071e3]/20">
                  {filteredTranslations.length} Mappings
                </span>
              </div>

              <div className="space-y-2.5">
                {filteredTranslations.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-[#141416] border border-[#242426] hover:border-[#38383a] transition-all space-y-2"
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-[#8e8e93] font-medium flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#0071e3]"></span>
                        <span>{item.category}</span>
                      </span>
                      <span className="text-[10px] text-[#636366] font-mono">Rule #{idx + 1}</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                      <div className="p-3 rounded-xl bg-[#1c1c1e] border border-[#2c2c2e]">
                        <div className="text-[10px] font-semibold uppercase tracking-wider text-[#a1a1a6] mb-1">
                          When Tutorial Video Says:
                        </div>
                        <div className="font-medium text-white text-xs leading-relaxed">
                          "{item.tutorialSays}"
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-[#0071e3]/10 border border-[#0071e3]/20">
                        <div className="text-[10px] font-semibold uppercase tracking-wider text-[#0071e3] mb-1">
                          In Web Cut Pro You Do:
                        </div>
                        <div className="text-white text-xs leading-relaxed">
                          {item.inWebCutPro}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: TIMELINE & BLADE */}
          {activeTab === 'timeline' && (
            <div className="space-y-6">
              <div className="p-5 rounded-2xl bg-[#1c1c1e] border border-[#2c2c2e] space-y-3">
                <div className="flex items-center gap-2 text-white font-semibold text-sm">
                  <Scissors size={16} className="text-[#0071e3]" />
                  <span>The Magnetic Timeline Explained</span>
                </div>
                <p className="text-xs text-[#a1a1a6] leading-relaxed">
                  Unlike traditional video editors (Premiere or Sony Vegas) that force you to patch tracks (V1, V2, A1, A2), Final Cut Pro and Web Cut Pro use a **Magnetic Primary Storyline**.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div className="p-3 bg-[#141416] border border-[#2c2c2e] rounded-xl space-y-1">
                    <div className="font-semibold text-white text-xs">1. Ripple Edits</div>
                    <p className="text-[11px] text-[#8e8e93]">
                      When you delete a clip with <kbd className="px-1 py-0.5 bg-[#2c2c2e] rounded text-white font-mono">⌫</kbd>, the gap automatically collapses. Clips stay in perfect sync.
                    </p>
                  </div>

                  <div className="p-3 bg-[#141416] border border-[#2c2c2e] rounded-xl space-y-1">
                    <div className="font-semibold text-white text-xs">2. Blading at Playhead</div>
                    <p className="text-[11px] text-[#8e8e93]">
                      Press <kbd className="px-1 py-0.5 bg-[#2c2c2e] rounded text-white font-mono">⌘B</kbd> anywhere on the timeline to perform an instant razor split.
                    </p>
                  </div>

                  <div className="p-3 bg-[#141416] border border-[#2c2c2e] rounded-xl space-y-1">
                    <div className="font-semibold text-white text-xs">3. Connected B-Roll</div>
                    <p className="text-[11px] text-[#8e8e93]">
                      Secondary clips, titles, and music lock above or below the spine with magnetic anchor points.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-[#1c1c1e] border border-[#2c2c2e] space-y-3">
                <h4 className="font-semibold text-white text-xs uppercase tracking-wider">
                  Universal J-K-L Transport Shortcuts
                </h4>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-3 bg-[#141416] border border-[#2c2c2e] rounded-xl">
                    <kbd className="text-sm font-bold font-mono text-white">J</kbd>
                    <div className="text-[11px] text-[#8e8e93] mt-1">Shuttle Reverse</div>
                  </div>
                  <div className="p-3 bg-[#141416] border border-[#2c2c2e] rounded-xl">
                    <kbd className="text-sm font-bold font-mono text-white">K</kbd>
                    <div className="text-[11px] text-[#8e8e93] mt-1">Pause / Stop</div>
                  </div>
                  <div className="p-3 bg-[#141416] border border-[#2c2c2e] rounded-xl">
                    <kbd className="text-sm font-bold font-mono text-white">L</kbd>
                    <div className="text-[11px] text-[#8e8e93] mt-1">Shuttle Forward</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: MEDIA & STORAGE */}
          {activeTab === 'media' && (
            <div className="space-y-6">
              <div className="p-5 rounded-2xl bg-[#1c1c1e] border border-[#2c2c2e] space-y-3">
                <div className="flex items-center gap-2 text-white font-semibold text-sm">
                  <Film size={16} className="text-[#0071e3]" />
                  <span>How Media Storage Differs From Desktop Final Cut Pro</span>
                </div>
                <p className="text-xs text-[#a1a1a6] leading-relaxed">
                  In desktop Final Cut Pro, video files live on your Mac's SSD or an external Thunderbolt drive inside a <code className="text-[#0071e3]">.fcpbundle</code> package.
                </p>
                <div className="p-4 bg-[#141416] border border-[#2c2c2e] rounded-xl space-y-2">
                  <div className="font-semibold text-white text-xs">In Web Cut Pro:</div>
                  <p className="text-xs text-[#8e8e93] leading-relaxed">
                    Your files are stored in your browser's private **Origin Private File System (OPFS)**. They are never uploaded to any server or cloud database. You have full privacy, zero upload wait times, and instant local playback.
                  </p>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-[#1c1c1e] border border-[#2c2c2e] space-y-3">
                <h4 className="font-semibold text-white text-xs uppercase tracking-wider">
                  Importing Your Own Footage
                </h4>
                <ol className="list-decimal list-inside space-y-2 text-xs text-[#a1a1a6]">
                  <li>Click the **Clips** tab in the top-left browser.</li>
                  <li>Click **Import Media** or simply drag files from your computer into the window.</li>
                  <li>Your videos instantly appear with duration badges, ready to edit!</li>
                </ol>
              </div>
            </div>
          )}

          {/* TAB 4: COLOR & AUDIO DSP */}
          {activeTab === 'color' && (
            <div className="space-y-6">
              <div className="p-5 rounded-2xl bg-[#1c1c1e] border border-[#2c2c2e] space-y-3">
                <div className="flex items-center gap-2 text-white font-semibold text-sm">
                  <Palette size={16} className="text-[#0071e3]" />
                  <span>3-Way Color Wheels & Grading</span>
                </div>
                <p className="text-xs text-[#a1a1a6] leading-relaxed">
                  When a colorist tutorial talks about adjusting Lift, Gamma, and Gain, click the **Color** tab in the Inspector:
                </p>
                <ul className="text-xs text-[#8e8e93] space-y-2 list-disc list-inside">
                  <li><strong>Shadows (Lift):</strong> Controls dark areas and black levels.</li>
                  <li><strong>Midtones (Gamma):</strong> Adjusts skin tones and overall luminance balance.</li>
                  <li><strong>Highlights (Gain):</strong> Controls sky, clouds, and bright highlight roll-off.</li>
                  <li><strong>3D LUTs:</strong> Apply built-in cinematic LUTs (Teal & Orange, Arri Alexa, Blackmagic Film, Vintage Film).</li>
                </ul>
              </div>

              <div className="p-5 rounded-2xl bg-[#1c1c1e] border border-[#2c2c2e] space-y-3">
                <div className="flex items-center gap-2 text-white font-semibold text-sm">
                  <Volume2 size={16} className="text-[#34c759]" />
                  <span>Logic Pro Audio DSP & Voice Isolation</span>
                </div>
                <p className="text-xs text-[#a1a1a6] leading-relaxed">
                  Web Cut Pro integrates Apple's Web Audio DSP architecture:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="p-3 bg-[#141416] border border-[#2c2c2e] rounded-xl">
                    <span className="font-semibold text-white text-xs">10-Band Parametric EQ</span>
                    <p className="text-[11px] text-[#8e8e93] mt-1">Boost vocal presence, cut muddy low frequencies, and sweeten highs.</p>
                  </div>
                  <div className="p-3 bg-[#141416] border border-[#2c2c2e] rounded-xl">
                    <span className="font-semibold text-white text-xs">Brickwall Limiter</span>
                    <p className="text-[11px] text-[#8e8e93] mt-1">Prevents harsh digital audio clipping past 0 dBFS automatically.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: MOBILE & TABLET MODE */}
          {activeTab === 'mobile' && (
            <div className="space-y-6">
              <div className="p-5 rounded-2xl bg-[#1c1c1e] border border-[#2c2c2e] space-y-3">
                <div className="flex items-center gap-2 text-white font-semibold text-sm">
                  <Smartphone size={16} className="text-[#af52de]" />
                  <span>Following Tutorials on Mobile & iPad</span>
                </div>
                <p className="text-xs text-[#a1a1a6] leading-relaxed">
                  Final Cut Pro tutorials usually show a giant 3-monitor desktop Mac setup. If you are using Web Cut Pro on an iPad or iPhone, we automatically switch into **Adaptive Segmented Mode**:
                </p>
                <div className="p-4 bg-[#141416] border border-[#2c2c2e] rounded-xl space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-[#2c2c2e] text-white font-mono text-[11px]">Timeline</span>
                    <span className="text-xs text-[#8e8e93]">Expands the full multi-lane magnetic spine for precision cuts.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-[#2c2c2e] text-white font-mono text-[11px]">Clips</span>
                    <span className="text-xs text-[#8e8e93]">Shows your media browser with large touch thumbnails.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-[#2c2c2e] text-white font-mono text-[11px]">Inspector</span>
                    <span className="text-xs text-[#8e8e93]">Full touch-friendly sliders for transform, color, and volume.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-[#2c2c2e] text-white font-mono text-[11px]">Effects</span>
                    <span className="text-xs text-[#8e8e93]">1-tap cinematic optical flares, halation, and grain.</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: EXPORT & FCPXML */}
          {activeTab === 'export' && (
            <div className="space-y-6">
              <div className="p-5 rounded-2xl bg-[#1c1c1e] border border-[#2c2c2e] space-y-3">
                <div className="flex items-center gap-2 text-white font-semibold text-sm">
                  <Share2 size={16} className="text-[#0071e3]" />
                  <span>Exporting & Round-Tripping With Desktop Apps</span>
                </div>
                <p className="text-xs text-[#a1a1a6] leading-relaxed">
                  You can start an edit in Web Cut Pro on your browser and hand it off to professional Hollywood colorists:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="p-4 bg-[#141416] border border-[#2c2c2e] rounded-xl space-y-1.5">
                    <div className="font-semibold text-white text-xs">Direct Video Render</div>
                    <p className="text-xs text-[#8e8e93] leading-relaxed">
                      Click the blue **Share** button in the top-right corner. Choose **Apple ProRes 422** or **H.264 MP4**. Renders locally at 60 fps.
                    </p>
                  </div>

                  <div className="p-4 bg-[#141416] border border-[#2c2c2e] rounded-xl space-y-1.5">
                    <div className="font-semibold text-white text-xs">FCPXML 1.11 Interchange</div>
                    <p className="text-xs text-[#8e8e93] leading-relaxed">
                      Click **•••** &gt; **Export FCPXML...**. Download the XML file and open it directly in desktop Final Cut Pro, DaVinci Resolve, or Adobe Premiere.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-[#141416] border-t border-[#2c2c2e] flex flex-col sm:flex-row items-center justify-between gap-2 shrink-0">
          <div className="text-[11px] text-[#8e8e93]">
            Tip: You can keep this guide open or press <kbd className="px-1.5 py-0.5 bg-[#242426] text-white rounded font-mono">⌘/</kbd> for keyboard shortcuts anytime.
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#0071e3] hover:bg-[#0077ed] text-white font-medium text-xs rounded-xl shadow-sm transition-all"
          >
            Got it, Let's Edit
          </button>
        </div>
      </div>
    </div>
  );
};
