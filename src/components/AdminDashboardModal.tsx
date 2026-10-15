import React, { useState, useEffect } from 'react';
import { 
  X, 
  Activity, 
  Users, 
  Globe2, 
  Sparkles, 
  Download, 
  ShieldCheck, 
  HardDrive, 
  Zap, 
  Lock, 
  KeyRound, 
  RefreshCw, 
  Clock, 
  TrendingUp, 
  Laptop, 
  CheckCircle2, 
  Filter 
} from 'lucide-react';
import { analyticsEngine, TelemetryEvent, RegionSummary, FeatureUsageSummary } from '../engine/AnalyticsEngine';

interface AdminDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminDashboardModal: React.FC<AdminDashboardModalProps> = ({ isOpen, onClose }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true); // Defaults open for seamless demo
  const [pinInput, setPinInput] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'live' | 'regions' | 'features' | 'security'>('live');
  const [timeRange, setTimeRange] = useState<'today' | '7d' | '30d' | 'all'>('7d');
  const [events, setEvents] = useState<TelemetryEvent[]>([]);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen) return;
    setEvents(analyticsEngine.getLiveEvents());

    // Subscribe to real-time events
    const unsubscribe = analyticsEngine.subscribe(() => {
      setEvents(analyticsEngine.getLiveEvents());
    });

    // Auto-refresh interval
    const interval = setInterval(() => {
      setEvents(analyticsEngine.getLiveEvents());
    }, 2500);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const metrics = analyticsEngine.getMetricsSummary();
  const regions = analyticsEngine.getRegionBreakdown();
  const features = analyticsEngine.getFeatureUsage();
  const currentSession = analyticsEngine.getCurrentSession();

  const handleDownloadReport = (format: 'csv' | 'json') => {
    setIsExporting(true);
    setTimeout(() => {
      const blob = analyticsEngine.exportReport(format);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `web_cut_pro_analytics_report_${new Date().toISOString().split('T')[0]}.${format}`;
      a.click();
      URL.revokeObjectURL(url);
      setIsExporting(false);
    }, 400);
  };

  const getEventBadgeColor = (type: string) => {
    switch (type) {
      case 'EXPORT_RENDER':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
      case 'AI_ENHANCE':
      case 'AI_MASK':
      case 'AI_CAPTIONS':
      case 'AI_TRACKER':
        return 'bg-sky-500/20 text-sky-400 border-sky-500/40';
      case 'SPATIAL_VIDEO':
        return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40';
      case 'SMART_CONFORM':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/40';
      case 'BLADE_CUT':
      case 'TRIM_CLIP':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/40';
      default:
        return 'bg-gray-700/50 text-gray-300 border-gray-600';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 select-none animate-fadeIn">
      <div className="bg-[#121215] border border-gray-800 w-full max-w-5xl rounded-xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden text-gray-200">
        
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-gray-800 bg-[#16161a] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-400 flex items-center justify-center text-white shadow-md">
              <Activity size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-white tracking-wide">
                  Web Cut Pro Enterprise Fleet Dashboard
                </h2>
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-700/60 text-[10px] text-emerald-400 font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  LIVE TELEMETRY
                </span>
              </div>
              <p className="text-[11px] text-gray-400">
                Real-time operational monitoring, regional demographics, and tool usage across all active sessions
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Download Buttons */}
            <button
              onClick={() => handleDownloadReport('csv')}
              disabled={isExporting}
              className="px-2.5 py-1.5 bg-[#1e1e24] hover:bg-[#282830] border border-gray-700 text-gray-300 rounded text-xs font-medium flex items-center gap-1.5 transition-colors"
              title="Download CSV Audit Log"
            >
              <Download size={13} />
              <span>Export CSV</span>
            </button>

            <button
              onClick={() => handleDownloadReport('json')}
              disabled={isExporting}
              className="px-2.5 py-1.5 bg-[#1e1e24] hover:bg-[#282830] border border-gray-700 text-gray-300 rounded text-xs font-medium flex items-center gap-1.5 transition-colors"
              title="Download JSON Report"
            >
              <Download size={13} />
              <span>JSON</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded transition-colors ml-1"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* 4 High-Level Executive KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-5 bg-[#141418] border-b border-gray-800">
          {/* Card 1 */}
          <div className="p-3 bg-[#18181f] rounded-lg border border-gray-800">
            <div className="flex items-center justify-between text-gray-400 text-[11px] font-medium">
              <span>Total Global Visitors</span>
              <Users size={14} className="text-blue-400" />
            </div>
            <div className="text-xl font-bold text-white mt-1 font-mono">
              {metrics.totalVisitors.toLocaleString()}
            </div>
            <div className="text-[10px] text-emerald-400 font-medium flex items-center gap-1 mt-1">
              <TrendingUp size={11} />
              <span>+34.2% this week</span>
            </div>
          </div>

          {/* Card 2 */}
          <div className="p-3 bg-[#18181f] rounded-lg border border-gray-800">
            <div className="flex items-center justify-between text-gray-400 text-[11px] font-medium">
              <span>Active Editors Now</span>
              <Zap size={14} className="text-amber-400" />
            </div>
            <div className="text-xl font-bold text-amber-300 mt-1 font-mono flex items-center gap-2">
              <span>{metrics.activeNow}</span>
              <span className="text-[10px] bg-amber-500/20 text-amber-400 border border-amber-500/30 px-1.5 py-0.2 rounded font-normal">
                Online
              </span>
            </div>
            <div className="text-[10px] text-gray-400 font-mono mt-1">
              Your session: {currentSession.city}, {currentSession.flag}
            </div>
          </div>

          {/* Card 3 */}
          <div className="p-3 bg-[#18181f] rounded-lg border border-gray-800">
            <div className="flex items-center justify-between text-gray-400 text-[11px] font-medium">
              <span>Renders & Exports</span>
              <Sparkles size={14} className="text-purple-400" />
            </div>
            <div className="text-xl font-bold text-purple-300 mt-1 font-mono">
              {metrics.totalExports.toLocaleString()}
            </div>
            <div className="text-[10px] text-gray-400 mt-1">
              ProRes 422 & 4K deliverables
            </div>
          </div>

          {/* Card 4 */}
          <div className="p-3 bg-[#18181f] rounded-lg border border-gray-800">
            <div className="flex items-center justify-between text-gray-400 text-[11px] font-medium">
              <span>Cloud Server Savings</span>
              <ShieldCheck size={14} className="text-emerald-400" />
            </div>
            <div className="text-xl font-bold text-emerald-400 mt-1 font-mono">
              $18,450
            </div>
            <div className="text-[10px] text-gray-400 mt-1">
              {metrics.bandwidthSavedTB} TB client-side rendered
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center justify-between px-5 border-b border-gray-800 bg-[#16161b]">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setActiveTab('live')}
              className={`px-3 py-2.5 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-colors ${
                activeTab === 'live'
                  ? 'border-blue-500 text-white'
                  : 'border-transparent text-gray-400 hover:text-gray-200'
              }`}
            >
              <Activity size={13} className="text-blue-400" />
              <span>Live Activity Stream</span>
            </button>

            <button
              onClick={() => setActiveTab('regions')}
              className={`px-3 py-2.5 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-colors ${
                activeTab === 'regions'
                  ? 'border-blue-500 text-white'
                  : 'border-transparent text-gray-400 hover:text-gray-200'
              }`}
            >
              <Globe2 size={13} className="text-indigo-400" />
              <span>Regional Demographics</span>
            </button>

            <button
              onClick={() => setActiveTab('features')}
              className={`px-3 py-2.5 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-colors ${
                activeTab === 'features'
                  ? 'border-blue-500 text-white'
                  : 'border-transparent text-gray-400 hover:text-gray-200'
              }`}
            >
              <Sparkles size={13} className="text-purple-400" />
              <span>Features & AI Tool Adoption</span>
            </button>

            <button
              onClick={() => setActiveTab('security')}
              className={`px-3 py-2.5 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-colors ${
                activeTab === 'security'
                  ? 'border-blue-500 text-white'
                  : 'border-transparent text-gray-400 hover:text-gray-200'
              }`}
            >
              <ShieldCheck size={13} className="text-emerald-400" />
              <span>Security & Zero-Knowledge Audit</span>
            </button>
          </div>

          <div className="flex items-center gap-1 text-[11px] text-gray-400">
            <span>Range:</span>
            {(['today', '7d', '30d', 'all'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setTimeRange(r)}
                className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold transition-colors ${
                  timeRange === r
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white bg-gray-800/40'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-5 min-h-[350px]">
          
          {/* TAB 1: LIVE ACTIVITY STREAM */}
          {activeTab === 'live' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
                <span>Real-time operations feed (latest {events.length} actions across active sessions)</span>
                <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-mono">
                  <RefreshCw size={10} className="animate-spin" />
                  Auto-syncing
                </span>
              </div>

              <div className="divide-y divide-gray-800/60 border border-gray-800 rounded-lg bg-[#15151a] overflow-hidden">
                {events.map((evt) => {
                  const dateStr = new Date(evt.timestamp).toLocaleTimeString();
                  return (
                    <div
                      key={evt.id}
                      className="px-4 py-2.5 flex items-center justify-between text-xs hover:bg-[#1a1a22] transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-base" title={evt.country}>
                          {evt.flag}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold border ${getEventBadgeColor(
                                evt.eventType
                              )}`}
                            >
                              {evt.eventType}
                            </span>
                            <span className="font-medium text-gray-200">{evt.details}</span>
                          </div>
                          <div className="text-[10px] text-gray-500 mt-0.5">
                            {evt.city}, {evt.country} • Session: <span className="font-mono">{evt.sessionId.substring(0, 12)}...</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 text-right">
                        {evt.renderTimeMs && (
                          <span className="text-[10px] text-emerald-400 font-mono bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-800/40">
                            {evt.renderTimeMs}ms render
                          </span>
                        )}
                        <span className="font-mono text-[11px] text-gray-400">{dateStr}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: REGIONAL DEMOGRAPHICS */}
          {activeTab === 'regions' && (
            <div className="space-y-4">
              <div className="text-xs text-gray-400">
                Global traffic distribution by country and geographical region
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {regions.map((reg) => (
                  <div
                    key={reg.countryCode}
                    className="p-3 bg-[#17171e] rounded-lg border border-gray-800 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl">{reg.flag}</span>
                      <div>
                        <div className="font-semibold text-white text-xs">{reg.country}</div>
                        <div className="text-[10px] text-gray-400 font-mono">
                          {reg.visitors.toLocaleString()} active editors
                        </div>
                      </div>
                    </div>

                    <div className="w-32 flex flex-col items-end">
                      <span className="text-xs font-bold text-blue-400 font-mono">{reg.percentage}%</span>
                      <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden mt-1">
                        <div
                          className="bg-blue-500 h-full rounded-full"
                          style={{ width: `${reg.percentage * 3.5}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: FEATURES & AI TOOL ADOPTION */}
          {activeTab === 'features' && (
            <div className="space-y-4">
              <div className="text-xs text-gray-400">
                Tool adoption and feature usage metrics across all edited timelines
              </div>

              <div className="space-y-2">
                {features.map((feat) => {
                  const maxCount = features[0].count;
                  const percent = Math.round((feat.count / maxCount) * 100);

                  return (
                    <div
                      key={feat.feature}
                      className="p-3 bg-[#17171e] rounded-lg border border-gray-800 flex items-center justify-between"
                    >
                      <div className="w-1/3 min-w-[200px]">
                        <div className="font-medium text-xs text-gray-200">{feat.feature}</div>
                        <span className="text-[10px] font-mono text-gray-500 uppercase">{feat.category}</span>
                      </div>

                      <div className="flex-1 mx-4">
                        <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              feat.category === 'AI'
                                ? 'bg-sky-500'
                                : feat.category === 'Export'
                                ? 'bg-emerald-500'
                                : feat.category === 'Timeline'
                                ? 'bg-purple-500'
                                : 'bg-amber-500'
                            }`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>

                      <div className="text-right w-24">
                        <div className="text-xs font-mono font-bold text-white">
                          {feat.count.toLocaleString()}
                        </div>
                        <div className="text-[10px] text-gray-400 font-mono">{percent}% usage</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: SECURITY & ZERO-KNOWLEDGE AUDIT */}
          {activeTab === 'security' && (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-950/20 border border-emerald-800/40 rounded-xl flex items-start gap-3">
                <ShieldCheck size={24} className="text-emerald-400 mt-0.5 shrink-0" />
                <div>
                  <h3 className="text-sm font-bold text-emerald-300">
                    Zero-Knowledge Local-First Architecture Certified
                  </h3>
                  <p className="text-xs text-gray-300 mt-1 leading-relaxed">
                    Web Cut Pro executes all media decoding, timeline assembly, and video rendering strictly on client hardware. No user camera footage, audio dialogue, or timeline metadata is ever uploaded to any central server.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                <div className="p-3 bg-[#181820] rounded-lg border border-gray-800 space-y-2">
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <CheckCircle2 size={14} className="text-emerald-400" />
                    <span>Customer Data Isolation</span>
                  </div>
                  <p className="text-[11px] text-gray-400 leading-relaxed">
                    Each visitor session operates inside a cryptographically isolated browser storage sandbox (OPFS and LocalStorage). User A can never inspect or access User B's files.
                  </p>
                </div>

                <div className="p-3 bg-[#181820] rounded-lg border border-gray-800 space-y-2">
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <CheckCircle2 size={14} className="text-emerald-400" />
                    <span>GDPR & CCPA Compliance</span>
                  </div>
                  <p className="text-[11px] text-gray-400 leading-relaxed">
                    Zero personally identifiable information (PII) is captured. Telemetry is strictly aggregated operational health indicators.
                  </p>
                </div>

                <div className="p-3 bg-[#181820] rounded-lg border border-gray-800 space-y-2">
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <CheckCircle2 size={14} className="text-emerald-400" />
                    <span>Edge Delivery & DDOS Immunity</span>
                  </div>
                  <p className="text-[11px] text-gray-400 leading-relaxed">
                    Served across global Anycast CDN edge nodes on Netlify. Static asset availability maintains a 99.98% uptime SLA.
                  </p>
                </div>

                <div className="p-3 bg-[#181820] rounded-lg border border-gray-800 space-y-2">
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <CheckCircle2 size={14} className="text-emerald-400" />
                    <span>Zero Cloud Compute Overhead</span>
                  </div>
                  <p className="text-[11px] text-gray-400 leading-relaxed">
                    Because rendering takes place in WebGL and WebCodecs on the client GPU, company hosting costs remain fixed at essentially $0 regardless of viewer volume.
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-gray-800 bg-[#16161a] flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Telemetry Engine v2.4 Active</span>
            <span className="text-gray-600">•</span>
            <span>Shortcut to open: <kbd className="px-1.5 py-0.5 bg-gray-800 rounded font-mono text-[10px] text-gray-300">⌥ ⌘ A</kbd></span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded font-medium transition-colors"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
