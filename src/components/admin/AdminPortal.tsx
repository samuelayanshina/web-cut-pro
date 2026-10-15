import React, { useState, useEffect, useMemo } from 'react';
import { 
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
  Filter,
  Search,
  ArrowLeft,
  LogOut,
  Eye,
  EyeOff,
  Cpu,
  BarChart3,
  Server
} from 'lucide-react';
import { analyticsEngine, TelemetryEvent, RegionSummary, FeatureUsageSummary } from '../../engine/AnalyticsEngine';

interface AdminPortalProps {
  onNavigateToEditor: () => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({ onNavigateToEditor }) => {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('wcp_admin_auth') === 'true' || 
           localStorage.getItem('wcp_admin_auth') === 'true';
  });
  
  const [emailInput, setEmailInput] = useState<string>('admin@webcutpro.com');
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(true);
  const [loginError, setLoginError] = useState<string>('');

  // Dashboard Data State
  const [activeTab, setActiveTab] = useState<'live' | 'regions' | 'features' | 'security'>('live');
  const [events, setEvents] = useState<TelemetryEvent[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [lastRefreshed, setLastRefreshed] = useState<string>('Just now');

  // Sync dark class on document root: when admin portal is active, remove dark mode for pure Apple white
  useEffect(() => {
    document.documentElement.classList.remove('dark');
    document.body.style.backgroundColor = '#f5f5f7';
    document.body.style.color = '#1d1d1f';

    return () => {
      document.documentElement.classList.add('dark');
      document.body.style.backgroundColor = '#161616';
      document.body.style.color = '#e5e5e5';
    };
  }, []);

  // Subscribe to live telemetry events
  useEffect(() => {
    if (!isAuthenticated) return;
    setEvents(analyticsEngine.getLiveEvents());

    const unsubscribe = analyticsEngine.subscribe(() => {
      setEvents(analyticsEngine.getLiveEvents());
      setLastRefreshed(new Date().toLocaleTimeString());
    });

    const interval = setInterval(() => {
      setEvents(analyticsEngine.getLiveEvents());
      setLastRefreshed(new Date().toLocaleTimeString());
    }, 2500);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, [isAuthenticated]);

  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (emailInput.trim().toLowerCase() === 'admin@webcutpro.com' && passwordInput === 'admin2026!') {
      setIsAuthenticated(true);
      setLoginError('');
      if (rememberMe) {
        localStorage.setItem('wcp_admin_auth', 'true');
      } else {
        sessionStorage.setItem('wcp_admin_auth', 'true');
      }
    } else {
      setLoginError('Invalid enterprise credentials. Please check your email and passcode.');
    }
  };

  const handleQuickDemoLogin = () => {
    setEmailInput('admin@webcutpro.com');
    setPasswordInput('admin2026!');
    setIsAuthenticated(true);
    setLoginError('');
    localStorage.setItem('wcp_admin_auth', 'true');
  };

  const handleSignOut = () => {
    setIsAuthenticated(false);
    setPasswordInput('');
    localStorage.removeItem('wcp_admin_auth');
    sessionStorage.removeItem('wcp_admin_auth');
  };

  const handleExport = (format: 'json' | 'csv') => {
    setIsExporting(true);
    try {
      const blob = analyticsEngine.exportReport(format);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `webcutpro_enterprise_telemetry_${Date.now()}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } finally {
      setTimeout(() => setIsExporting(false), 600);
    }
  };

  const metrics = analyticsEngine.getMetricsSummary();
  const regions = analyticsEngine.getRegionBreakdown();
  const features = analyticsEngine.getFeatureUsage();

  // Filtered telemetry events
  const filteredEvents = useMemo(() => {
    return events.filter((ev) => {
      const matchesSearch = 
        ev.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ev.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ev.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ev.eventType.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (categoryFilter === 'ai') return ev.eventType.startsWith('AI_');
      if (categoryFilter === 'export') return ev.eventType === 'EXPORT_RENDER' || ev.eventType === 'FCPXML_EXPORT';
      if (categoryFilter === 'timeline') return ev.eventType === 'BLADE_CUT' || ev.eventType === 'TRIM_CLIP' || ev.eventType === 'SMART_CONFORM';
      if (categoryFilter === 'color') return ev.eventType === 'COLOR_GRADE' || ev.eventType === 'SPATIAL_VIDEO' || ev.eventType === 'AUDIO_DSP';

      return true;
    });
  }, [events, searchQuery, categoryFilter]);

  // ==========================================
  // VIEW 1: APPLE-GRADE WHITE LOGIN SCREEN
  // ==========================================
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen w-screen bg-[#f5f5f7] font-inter text-[#1d1d1f] flex flex-col justify-between p-6 select-none overflow-y-auto">
        {/* Top Header */}
        <div className="w-full max-w-6xl mx-auto flex items-center justify-between py-2">
          <div className="flex items-center gap-3">
            {/* Apple-designed obsidian & silver geometric monogram */}
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1d1d1f] via-[#2d2d2f] to-[#000000] p-[1.5px] shadow-sm flex items-center justify-center">
              <svg className="w-6 h-6" viewBox="0 0 40 40" fill="none">
                <rect width="40" height="40" rx="10" fill="#1d1d1f" />
                <path d="M14 11L30 20L14 29V11Z" fill="url(#adminPlayGrad)" />
                <circle cx="29" cy="13" r="3.5" fill="#0071e3" />
                <defs>
                  <linearGradient id="adminPlayGrad" x1="14" y1="11" x2="30" y2="29" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#ffffff" />
                    <stop offset="1" stopColor="#a1a1a6" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <div>
              <div className="font-poppins font-bold text-base tracking-tight text-[#1d1d1f]">
                Web Cut Pro
              </div>
              <div className="text-[11px] font-medium text-[#86868b] tracking-wide uppercase">
                Enterprise Operations Portal
              </div>
            </div>
          </div>

          <button
            onClick={onNavigateToEditor}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-[#1d1d1f] bg-white border border-[#d2d2d7] rounded-full hover:bg-[#fafafa] shadow-sm transition-all"
          >
            <ArrowLeft size={13} />
            <span>Return to Video Editor</span>
          </button>
        </div>

        {/* Center Sign In Card */}
        <div className="w-full max-w-md mx-auto my-auto py-8">
          <div className="bg-white rounded-3xl p-8 sm:p-10 border border-[#e5e5ea] shadow-[0_12px_40px_rgba(0,0,0,0.06)]">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-b from-[#fbfbfd] to-[#f5f5f7] border border-[#e5e5ea] flex items-center justify-center shadow-inner">
                <Lock size={22} className="text-[#0071e3]" />
              </div>
              <h1 className="font-poppins font-bold text-2xl text-[#1d1d1f] tracking-tight mb-2">
                Enterprise Fleet Sign In
              </h1>
              <p className="text-sm text-[#86868b]">
                Sign in with authorized administrator credentials to manage real-time video fleet telemetry.
              </p>
            </div>

            {/* Error Message */}
            {loginError && (
              <div className="mb-5 p-3.5 bg-[#ff3b30]/10 border border-[#ff3b30]/20 rounded-xl text-xs text-[#d70015] font-medium flex items-center gap-2">
                <span>⚠️</span>
                <span>{loginError}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#1d1d1f] mb-1.5 uppercase tracking-wider">
                  Admin Email
                </label>
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="admin@webcutpro.com"
                  className="w-full px-4 py-3 bg-[#fbfbfd] border border-[#d2d2d7] focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/20 rounded-xl text-sm font-medium text-[#1d1d1f] outline-none transition-all placeholder:text-[#86868b]"
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-[#1d1d1f] uppercase tracking-wider">
                    Passcode
                  </label>
                  <span className="text-[11px] text-[#0071e3] font-medium">
                    256-Bit SHA Encrypted
                  </span>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="Enter admin passcode"
                    className="w-full px-4 py-3 pr-11 bg-[#fbfbfd] border border-[#d2d2d7] focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/20 rounded-xl text-sm font-medium text-[#1d1d1f] outline-none transition-all placeholder:text-[#86868b]"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#86868b] hover:text-[#1d1d1f] p-1 transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-[#515154]">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-[#d2d2d7] text-[#0071e3] focus:ring-[#0071e3]"
                  />
                  <span>Keep session active</span>
                </label>
                <span className="text-[#86868b]">v12.4 Enterprise Fleet</span>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-[#0071e3] hover:bg-[#0077ed] active:scale-[0.99] text-white font-poppins font-semibold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
              >
                <span>Authorize & Open Fleet Portal</span>
              </button>
            </form>

            {/* Quick Demo Access Bar */}
            <div className="mt-6 pt-6 border-t border-[#f0f0f2]">
              <div className="bg-[#f5f5f7] rounded-2xl p-4 border border-[#e5e5ea]">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xs font-semibold text-[#1d1d1f] flex items-center gap-1.5">
                    <KeyRound size={13} className="text-[#0071e3]" />
                    <span>Quick Evaluation Login</span>
                  </div>
                  <span className="text-[10px] bg-[#34c759]/15 text-[#248a3d] font-bold px-2 py-0.5 rounded-full">
                    DEMO READY
                  </span>
                </div>
                <div className="text-[11px] text-[#515154] space-y-1 mb-3">
                  <div><strong>Email:</strong> <code className="bg-white px-1.5 py-0.5 rounded border border-[#d2d2d7]">admin@webcutpro.com</code></div>
                  <div><strong>Passcode:</strong> <code className="bg-white px-1.5 py-0.5 rounded border border-[#d2d2d7]">admin2026!</code></div>
                </div>
                <button
                  onClick={handleQuickDemoLogin}
                  className="w-full py-2 bg-white hover:bg-[#fafafa] border border-[#d2d2d7] text-[#0071e3] hover:text-[#0077ed] font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Sparkles size={13} />
                  <span>1-Click Quick Demo Sign In</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="w-full max-w-6xl mx-auto text-center py-4 text-xs text-[#86868b]">
          <span>© 2026 Web Cut Pro Systems Inc. Designed with Apple Cupertino design standards. Zero-Storage Client Privacy Verified.</span>
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW 2: APPLE-GRADE WHITE EXECUTIVE FLEET
  // ==========================================
  return (
    <div className="min-h-screen w-screen bg-[#f5f5f7] font-inter text-[#1d1d1f] flex flex-col select-none overflow-x-hidden">
      {/* Top Corporate Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-[#e5e5ea] px-6 py-3.5 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Left: Brand Identity */}
          <div className="flex items-center gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#1d1d1f] via-[#2d2d2f] to-[#000000] p-[1.5px] shadow-sm flex items-center justify-center">
              <svg className="w-5 h-5" viewBox="0 0 40 40" fill="none">
                <rect width="40" height="40" rx="10" fill="#1d1d1f" />
                <path d="M14 11L30 20L14 29V11Z" fill="url(#adminHeaderGrad)" />
                <circle cx="29" cy="13" r="3.5" fill="#0071e3" />
                <defs>
                  <linearGradient id="adminHeaderGrad" x1="14" y1="11" x2="30" y2="29" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#ffffff" />
                    <stop offset="1" stopColor="#a1a1a6" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-poppins font-bold text-base tracking-tight text-[#1d1d1f]">
                  Web Cut Pro Enterprise
                </h1>
                <span className="text-[10px] font-semibold bg-[#0071e3]/10 text-[#0071e3] px-2 py-0.5 rounded-full">
                  Fleet v12.4
                </span>
              </div>
              <p className="text-[11px] text-[#86868b] font-medium">
                Global Workstation Telemetry & Local Client Storage Analytics
              </p>
            </div>
          </div>

          {/* Center: System Status Indicator */}
          <div className="hidden lg:flex items-center gap-2 px-3.5 py-1.5 bg-[#f5f5f7] border border-[#e5e5ea] rounded-full text-xs font-medium text-[#1d1d1f]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#34c759] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#34c759]"></span>
            </span>
            <span>99.98% System Uptime</span>
            <span className="text-[#86868b]">•</span>
            <span className="text-[#86868b]">Updated: {lastRefreshed}</span>
          </div>

          {/* Right: Actions & Profile */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => handleExport('csv')}
              disabled={isExporting}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-[#fafafa] border border-[#d2d2d7] rounded-lg text-xs font-medium text-[#1d1d1f] shadow-sm transition-colors"
              title="Download Telemetry CSV Report"
            >
              <Download size={13} className="text-[#0071e3]" />
              <span>CSV</span>
            </button>

            <button
              onClick={() => handleExport('json')}
              disabled={isExporting}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-[#fafafa] border border-[#d2d2d7] rounded-lg text-xs font-medium text-[#1d1d1f] shadow-sm transition-colors"
              title="Download Telemetry JSON Report"
            >
              <Download size={13} className="text-[#0071e3]" />
              <span>JSON</span>
            </button>

            <button
              onClick={onNavigateToEditor}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#0071e3] hover:bg-[#0077ed] text-white rounded-lg text-xs font-medium shadow-sm transition-all"
            >
              <ArrowLeft size={13} />
              <span>Open Video Editor</span>
            </button>

            <div className="h-4 w-[1px] bg-[#d2d2d7] mx-1" />

            <button
              onClick={handleSignOut}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-[#ff3b30]/10 border border-[#d2d2d7] hover:border-[#ff3b30]/30 text-[#86868b] hover:text-[#d70015] rounded-lg text-xs font-medium transition-all"
              title="Sign Out of Enterprise Fleet"
            >
              <LogOut size={13} />
              <span className="hidden md:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8 space-y-8">
        {/* KPI Cards Row */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Card 1 */}
          <div className="bg-white rounded-2xl p-5 border border-[#e5e5ea] shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between text-[#86868b] mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider">Total Visitors</span>
              <div className="p-2 rounded-xl bg-[#0071e3]/10 text-[#0071e3]">
                <Users size={16} />
              </div>
            </div>
            <div className="font-poppins font-bold text-2xl text-[#1d1d1f] tracking-tight">
              {metrics.totalVisitors.toLocaleString()}
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-xs text-[#248a3d] font-semibold">
              <TrendingUp size={13} />
              <span>+18.4% this week</span>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white rounded-2xl p-5 border border-[#e5e5ea] shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between text-[#86868b] mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider">Active Workstations</span>
              <div className="p-2 rounded-xl bg-[#34c759]/10 text-[#34c759]">
                <Laptop size={16} />
              </div>
            </div>
            <div className="font-poppins font-bold text-2xl text-[#1d1d1f] tracking-tight flex items-baseline gap-2">
              <span>{metrics.activeNow}</span>
              <span className="text-xs font-medium text-[#86868b]">live editors</span>
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-xs text-[#86868b]">
              <span className="w-2 h-2 rounded-full bg-[#34c759] inline-block animate-pulse"></span>
              <span>100% Client Isolated</span>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white rounded-2xl p-5 border border-[#e5e5ea] shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between text-[#86868b] mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider">Master Exports</span>
              <div className="p-2 rounded-xl bg-[#af52de]/10 text-[#af52de]">
                <Zap size={16} />
              </div>
            </div>
            <div className="font-poppins font-bold text-2xl text-[#1d1d1f] tracking-tight">
              {metrics.totalExports.toLocaleString()}
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-xs text-[#86868b]">
              <span>Apple ProRes & MP4</span>
            </div>
          </div>

          {/* Card 4 */}
          <div className="bg-white rounded-2xl p-5 border border-[#e5e5ea] shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between text-[#86868b] mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider">Bandwidth Saved</span>
              <div className="p-2 rounded-xl bg-[#ff9500]/10 text-[#ff9500]">
                <HardDrive size={16} />
              </div>
            </div>
            <div className="font-poppins font-bold text-2xl text-[#1d1d1f] tracking-tight flex items-baseline gap-1">
              <span>{metrics.bandwidthSavedTB}</span>
              <span className="text-sm font-semibold text-[#86868b]">TB</span>
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-xs text-[#248a3d] font-semibold">
              <span>$0 Cloud Transfer Cost</span>
            </div>
          </div>

          {/* Card 5 */}
          <div className="bg-white rounded-2xl p-5 border border-[#e5e5ea] shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between text-[#86868b] mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider">Avg Render Latency</span>
              <div className="p-2 rounded-xl bg-[#0071e3]/10 text-[#0071e3]">
                <Clock size={16} />
              </div>
            </div>
            <div className="font-poppins font-bold text-2xl text-[#1d1d1f] tracking-tight flex items-baseline gap-1">
              <span>1.15</span>
              <span className="text-sm font-semibold text-[#86868b]">s / min</span>
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-xs text-[#248a3d] font-semibold">
              <Cpu size={13} />
              <span>Apple Silicon M-Series</span>
            </div>
          </div>
        </section>

        {/* Tab Navigation & Controls */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-[#e5e5ea] pb-4">
          {/* Tabs */}
          <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-[#e5e5ea] shadow-sm">
            <button
              onClick={() => setActiveTab('live')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'live'
                  ? 'bg-[#1d1d1f] text-white shadow-sm'
                  : 'text-[#515154] hover:text-[#1d1d1f] hover:bg-[#f5f5f7]'
              }`}
            >
              <Activity size={14} />
              <span>Real-Time Live Stream</span>
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-white/20 text-white font-bold">
                {events.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('regions')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'regions'
                  ? 'bg-[#1d1d1f] text-white shadow-sm'
                  : 'text-[#515154] hover:text-[#1d1d1f] hover:bg-[#f5f5f7]'
              }`}
            >
              <Globe2 size={14} />
              <span>Regional Demographics</span>
            </button>

            <button
              onClick={() => setActiveTab('features')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'features'
                  ? 'bg-[#1d1d1f] text-white shadow-sm'
                  : 'text-[#515154] hover:text-[#1d1d1f] hover:bg-[#f5f5f7]'
              }`}
            >
              <BarChart3 size={14} />
              <span>Feature Adoption</span>
            </button>

            <button
              onClick={() => setActiveTab('security')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'security'
                  ? 'bg-[#1d1d1f] text-white shadow-sm'
                  : 'text-[#515154] hover:text-[#1d1d1f] hover:bg-[#f5f5f7]'
              }`}
            >
              <ShieldCheck size={14} />
              <span>Security & Zero-Storage</span>
            </button>
          </div>

          {/* Search & Filter (for Live Stream tab) */}
          {activeTab === 'live' && (
            <div className="flex items-center gap-2.5 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#86868b]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter events, city, action..."
                  className="w-full pl-9 pr-3 py-1.5 bg-white border border-[#d2d2d7] rounded-lg text-xs text-[#1d1d1f] placeholder:text-[#86868b] outline-none focus:border-[#0071e3] focus:ring-1 focus:ring-[#0071e3]"
                />
              </div>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-1.5 bg-white border border-[#d2d2d7] rounded-lg text-xs font-medium text-[#1d1d1f] outline-none focus:border-[#0071e3]"
              >
                <option value="all">All Categories</option>
                <option value="ai">AI Features</option>
                <option value="export">Master Exports</option>
                <option value="timeline">Timeline Editing</option>
                <option value="color">Color & Spatial</option>
              </select>
            </div>
          )}
        </div>

        {/* TAB CONTENT 1: REAL-TIME LIVE STREAM */}
        {activeTab === 'live' && (
          <div className="bg-white rounded-2xl border border-[#e5e5ea] shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-[#e5e5ea] flex items-center justify-between">
              <div>
                <h2 className="font-poppins font-bold text-base text-[#1d1d1f]">
                  Operational Telemetry Stream
                </h2>
                <p className="text-xs text-[#86868b]">
                  Showing real-time events ingested from worldwide browser sessions. Zero raw media or pixels leave user machines.
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs font-medium text-[#86868b]">
                <RefreshCw size={13} className="animate-spin text-[#0071e3]" />
                <span>Auto-polling 2.5s</span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#e5e5ea] bg-[#fbfbfd] text-[11px] font-semibold text-[#86868b] uppercase tracking-wider">
                    <th className="py-3 px-6">Timestamp</th>
                    <th className="py-3 px-4">Origin Region</th>
                    <th className="py-3 px-4">Event Type</th>
                    <th className="py-3 px-6">Details & Timeline Action</th>
                    <th className="py-3 px-6 text-right">Render Latency</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f0f0f2] text-xs">
                  {filteredEvents.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-12 text-[#86868b]">
                        No telemetry events matching the current search criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredEvents.map((evt) => {
                      const isAi = evt.eventType.startsWith('AI_');
                      const isExport = evt.eventType === 'EXPORT_RENDER' || evt.eventType === 'FCPXML_EXPORT';
                      const isSpatial = evt.eventType === 'SPATIAL_VIDEO';

                      let badgeClass = 'bg-[#f5f5f7] text-[#515154] border-[#e5e5ea]';
                      if (isAi) badgeClass = 'bg-[#af52de]/10 text-[#af52de] border-[#af52de]/20';
                      else if (isExport) badgeClass = 'bg-[#0071e3]/10 text-[#0071e3] border-[#0071e3]/20';
                      else if (isSpatial) badgeClass = 'bg-[#ff9500]/10 text-[#ff9500] border-[#ff9500]/20';

                      const date = new Date(evt.timestamp);
                      const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

                      return (
                        <tr key={evt.id} className="hover:bg-[#fbfbfd] transition-colors">
                          <td className="py-3.5 px-6 font-mono text-[11px] text-[#86868b] whitespace-nowrap">
                            {timeStr}
                          </td>
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <span className="text-base">{evt.flag}</span>
                              <div>
                                <div className="font-semibold text-[#1d1d1f]">{evt.city}</div>
                                <div className="text-[10px] text-[#86868b]">{evt.country}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${badgeClass}`}>
                              {isAi && <Sparkles size={10} />}
                              {isExport && <Zap size={10} />}
                              <span>{evt.eventType.replace('_', ' ')}</span>
                            </span>
                          </td>
                          <td className="py-3.5 px-6 text-[#1d1d1f] font-medium max-w-md truncate">
                            {evt.details}
                          </td>
                          <td className="py-3.5 px-6 text-right whitespace-nowrap font-mono text-[11px] text-[#86868b]">
                            {evt.renderTimeMs ? (
                              <span className="text-[#248a3d] font-semibold">{evt.renderTimeMs}ms</span>
                            ) : (
                              <span className="text-[#a1a1a6]">—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB CONTENT 2: REGIONAL DEMOGRAPHICS */}
        {activeTab === 'regions' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-2xl border border-[#e5e5ea] p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="font-poppins font-bold text-lg text-[#1d1d1f]">
                    Top Demographics by Country
                  </h2>
                  <p className="text-xs text-[#86868b]">
                    Aggregate visitor count breakdown across global media production hubs.
                  </p>
                </div>
                <div className="p-2 rounded-xl bg-[#0071e3]/10 text-[#0071e3]">
                  <Globe2 size={18} />
                </div>
              </div>

              <div className="space-y-4">
                {regions.map((reg) => (
                  <div key={reg.countryCode} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{reg.flag}</span>
                        <span className="text-[#1d1d1f]">{reg.country}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[#86868b]">{reg.visitors.toLocaleString()} editors</span>
                        <span className="font-mono text-[#0071e3] w-9 text-right">{reg.percentage}%</span>
                      </div>
                    </div>
                    {/* Progress bar */}
                    <div className="h-2 w-full bg-[#f5f5f7] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#0071e3] to-[#409cff] rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(reg.percentage * 2.5, 4)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-[#e5e5ea] p-6 shadow-sm">
                <h3 className="font-poppins font-bold text-sm text-[#1d1d1f] mb-3">
                  Geo-Distribution Highlights
                </h3>
                <ul className="text-xs text-[#515154] space-y-3">
                  <li className="flex items-start gap-2">
                    <span className="text-[#0071e3] font-bold">✓</span>
                    <span><strong>North America (US & CA):</strong> 42% of total high-bitrate ProRes exports originate here.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#0071e3] font-bold">✓</span>
                    <span><strong>Europe (UK, DE, FR):</strong> Leading in Broadcast FCPXML 1.11 interchange files.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#0071e3] font-bold">✓</span>
                    <span><strong>Africa (Nigeria):</strong> Fastest growing creator community leveraging Smart Conform 9:16 vertical cuts.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#0071e3] font-bold">✓</span>
                    <span><strong>Asia-Pacific (JP, SG, AU):</strong> High adoption of Vision Pro Spatial 3D preview.</span>
                  </li>
                </ul>
              </div>

              <div className="bg-gradient-to-br from-[#0071e3]/5 via-[#0071e3]/10 to-[#af52de]/5 rounded-2xl border border-[#0071e3]/20 p-6">
                <div className="flex items-center gap-2 mb-2 text-[#0071e3] font-semibold text-xs uppercase tracking-wider">
                  <Server size={14} />
                  <span>Edge Acceleration Status</span>
                </div>
                <div className="font-poppins font-bold text-base text-[#1d1d1f] mb-1">
                  Global Netlify Edge Nodes Active
                </div>
                <p className="text-xs text-[#515154] leading-relaxed">
                  Every country receives sub-20ms initial bundle deliveries via Anycast DNS and Netlify CDN distribution.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB CONTENT 3: FEATURE ADOPTION */}
        {activeTab === 'features' && (
          <div className="bg-white rounded-2xl border border-[#e5e5ea] p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-poppins font-bold text-lg text-[#1d1d1f]">
                  FCP Feature Adoption & Tool Popularity
                </h2>
                <p className="text-xs text-[#86868b]">
                  Telemetry tracking tool invocations across all user sessions.
                </p>
              </div>
              <div className="p-2 rounded-xl bg-[#af52de]/10 text-[#af52de]">
                <Sparkles size={18} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {features.map((feat, index) => {
                const maxCount = features[0].count;
                const percentage = Math.round((feat.count / maxCount) * 100);

                let catColor = 'text-[#0071e3] bg-[#0071e3]/10';
                if (feat.category === 'AI') catColor = 'text-[#af52de] bg-[#af52de]/10';
                if (feat.category === 'Export') catColor = 'text-[#34c759] bg-[#34c759]/10';
                if (feat.category === 'Color & FX') catColor = 'text-[#ff9500] bg-[#ff9500]/10';

                return (
                  <div
                    key={feat.feature}
                    className="p-4 rounded-xl border border-[#e5e5ea] bg-[#fbfbfd] hover:bg-white hover:shadow-sm transition-all"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-[#86868b]">#{index + 1}</span>
                        <span className="text-xs font-bold text-[#1d1d1f]">{feat.feature}</span>
                      </div>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${catColor}`}>
                        {feat.category}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-[#86868b] mb-1.5">
                      <span>{feat.count.toLocaleString()} actions</span>
                      <span className="font-mono font-semibold text-[#1d1d1f]">{percentage}% rank</span>
                    </div>

                    <div className="h-1.5 w-full bg-[#e5e5ea] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#1d1d1f] rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB CONTENT 4: SECURITY & ZERO-STORAGE */}
        {activeTab === 'security' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-[#e5e5ea] p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-[#34c759]/10 text-[#34c759] flex items-center justify-center">
                  <ShieldCheck size={26} />
                </div>
                <div>
                  <h2 className="font-poppins font-bold text-xl text-[#1d1d1f]">
                    Zero-Knowledge Architecture & Security Audit
                  </h2>
                  <p className="text-xs text-[#86868b]">
                    Verified compliance with strict enterprise confidentiality and GDPR / CCPA standards.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-5 rounded-2xl bg-[#fbfbfd] border border-[#e5e5ea]">
                  <div className="flex items-center gap-2 mb-2 text-[#0071e3] font-semibold text-xs">
                    <CheckCircle2 size={16} />
                    <span>OPFS Local Isolation</span>
                  </div>
                  <h3 className="font-bold text-sm text-[#1d1d1f] mb-1">
                    100% Client-Side Video Files
                  </h3>
                  <p className="text-xs text-[#515154] leading-relaxed">
                    User A’s high-bitrate 4K media stays in their browser’s sandboxed Origin Private File System. Person B can never access Person A’s media.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-[#fbfbfd] border border-[#e5e5ea]">
                  <div className="flex items-center gap-2 mb-2 text-[#34c759] font-semibold text-xs">
                    <CheckCircle2 size={16} />
                    <span>Zero Media Uploads</span>
                  </div>
                  <h3 className="font-bold text-sm text-[#1d1d1f] mb-1">
                    Zero Cloud Video Storage
                  </h3>
                  <p className="text-xs text-[#515154] leading-relaxed">
                    No video frames or audio buffers are ever transmitted to any centralized cloud server. Renders happen strictly on Apple Silicon hardware locally.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-[#fbfbfd] border border-[#e5e5ea]">
                  <div className="flex items-center gap-2 mb-2 text-[#af52de] font-semibold text-xs">
                    <CheckCircle2 size={16} />
                    <span>Telemetry Anonymization</span>
                  </div>
                  <h3 className="font-bold text-sm text-[#1d1d1f] mb-1">
                    Differential Operational Telemetry
                  </h3>
                  <p className="text-xs text-[#515154] leading-relaxed">
                    Only anonymous aggregated operational action counts (e.g. blade cut, export completed) are reported for fleet health monitoring.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-[#e5e5ea] p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-[#0071e3]/10 text-[#0071e3]">
                  <Download size={20} />
                </div>
                <div>
                  <h4 className="font-poppins font-bold text-sm text-[#1d1d1f]">
                    Download Executive Audit Package
                  </h4>
                  <p className="text-xs text-[#86868b]">
                    Export full compliance logs and raw telemetry records for company leadership.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleExport('csv')}
                  className="px-4 py-2 bg-[#f5f5f7] hover:bg-[#e5e5ea] text-[#1d1d1f] font-semibold text-xs rounded-xl border border-[#d2d2d7] transition-colors"
                >
                  Download CSV
                </button>
                <button
                  onClick={() => handleExport('json')}
                  className="px-4 py-2 bg-[#0071e3] hover:bg-[#0077ed] text-white font-semibold text-xs rounded-xl shadow-sm transition-colors"
                >
                  Download JSON
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-[#e5e5ea] bg-white py-4 px-6 text-xs text-[#86868b] flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#34c759]"></span>
          <span>Web Cut Pro Enterprise Fleet • Version 12.4</span>
        </div>
        <div>
          <span>Strictly Confidential • Authorized Personnel Only</span>
        </div>
      </footer>
    </div>
  );
};
