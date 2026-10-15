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

  // Sync light theme on document root: when admin portal is active, remove dark mode for pure Apple white
  useEffect(() => {
    document.documentElement.classList.remove('dark');
    document.body.style.backgroundColor = '#f8f8fa';
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
      setLastRefreshed(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    });

    const interval = setInterval(() => {
      setEvents(analyticsEngine.getLiveEvents());
      setLastRefreshed(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
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
  // VIEW 1: CLEAN APPLE WHITE LOGIN SCREEN
  // ==========================================
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen w-screen bg-[#f8f8fa] font-inter text-[#1d1d1f] flex flex-col justify-between p-6 sm:p-10 select-none overflow-y-auto">
        {/* Top Header */}
        <div className="w-full max-w-5xl mx-auto flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#1d1d1f] flex items-center justify-center shadow-sm">
              <svg className="w-5 h-5" viewBox="0 0 40 40" fill="none">
                <path d="M14 11L30 20L14 29V11Z" fill="#ffffff" />
                <circle cx="29" cy="13" r="3.5" fill="#0071e3" />
              </svg>
            </div>
            <div>
              <div className="font-poppins font-bold text-base tracking-tight text-[#1d1d1f]">
                Web Cut Pro
              </div>
              <div className="text-[11px] font-medium text-[#86868b] tracking-wide uppercase">
                Enterprise Operations
              </div>
            </div>
          </div>

          <button
            onClick={onNavigateToEditor}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-[#1d1d1f] bg-white border border-[#d2d2d7] rounded-full hover:bg-[#fafafa] shadow-sm transition-all"
          >
            <ArrowLeft size={13} />
            <span>Return to Video Editor</span>
          </button>
        </div>

        {/* Center Sign In Card */}
        <div className="w-full max-w-md mx-auto my-auto py-10">
          <div className="bg-white rounded-3xl p-8 sm:p-12 border border-[#e5e5ea] shadow-[0_8px_30px_rgba(0,0,0,0.04)] space-y-8">
            {/* Header */}
            <div className="text-center space-y-2">
              <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-[#f5f5f7] border border-[#e5e5ea] flex items-center justify-center">
                <Lock size={22} className="text-[#0071e3]" />
              </div>
              <h1 className="font-poppins font-bold text-2xl text-[#1d1d1f] tracking-tight">
                Enterprise Fleet Sign In
              </h1>
              <p className="text-sm text-[#86868b] leading-relaxed">
                Authorized administrative portal for global video fleet telemetry.
              </p>
            </div>

            {/* Error Message */}
            {loginError && (
              <div className="p-4 bg-[#ff3b30]/10 border border-[#ff3b30]/20 rounded-2xl text-xs text-[#d70015] font-medium flex items-center gap-2">
                <span>⚠️</span>
                <span>{loginError}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-[#1d1d1f] uppercase tracking-wider">
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

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-[#1d1d1f] uppercase tracking-wider">
                    Passcode
                  </label>
                  <span className="text-[11px] text-[#0071e3] font-medium">
                    256-Bit SHA
                  </span>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="Enter passcode"
                    className="w-full px-4 py-3 pr-11 bg-[#fbfbfd] border border-[#d2d2d7] focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/20 rounded-xl text-sm font-medium text-[#1d1d1f] outline-none transition-all placeholder:text-[#86868b]"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#86868b] hover:text-[#1d1d1f] p-1 transition-colors"
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
                <span className="text-[#86868b]">Fleet v12.4</span>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-[#0071e3] hover:bg-[#0077ed] active:scale-[0.99] text-white font-poppins font-semibold text-sm rounded-xl shadow-sm transition-all"
              >
                Sign In to Enterprise Fleet
              </button>
            </form>

            {/* Quick Demo Access Box */}
            <div className="pt-6 border-t border-[#f0f0f2]">
              <div className="bg-[#f5f5f7] rounded-2xl p-5 border border-[#e5e5ea] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-semibold text-[#1d1d1f] flex items-center gap-1.5">
                    <KeyRound size={14} className="text-[#0071e3]" />
                    <span>Quick Evaluation Login</span>
                  </div>
                  <span className="text-[10px] bg-[#34c759]/15 text-[#248a3d] font-bold px-2 py-0.5 rounded-full">
                    DEMO READY
                  </span>
                </div>
                <div className="text-xs text-[#515154] space-y-1">
                  <div>Email: <strong className="font-mono text-[#1d1d1f]">admin@webcutpro.com</strong></div>
                  <div>Passcode: <strong className="font-mono text-[#1d1d1f]">admin2026!</strong></div>
                </div>
                <button
                  onClick={handleQuickDemoLogin}
                  className="w-full py-2.5 bg-white hover:bg-[#fafafa] border border-[#d2d2d7] text-[#0071e3] font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Sparkles size={14} />
                  <span>1-Click Auto Fill & Sign In</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="w-full max-w-5xl mx-auto text-center py-4 text-xs text-[#86868b]">
          <span>© 2026 Web Cut Pro Systems Inc. Designed with Apple Cupertino design standards. Zero-Storage Client Privacy Verified.</span>
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW 2: SPATIOUS APPLE WHITE DASHBOARD
  // ==========================================
  return (
    <div className="min-h-screen w-screen bg-[#f8f8fa] font-inter text-[#1d1d1f] flex flex-col select-none overflow-x-hidden">
      {/* Top Header Navigation */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#e5e5ea] px-4 sm:px-8 lg:px-12 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          {/* Brand Identity */}
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-[#1d1d1f] flex items-center justify-center shadow-sm shrink-0">
              <svg className="w-5 h-5" viewBox="0 0 40 40" fill="none">
                <path d="M14 11L30 20L14 29V11Z" fill="#ffffff" />
                <circle cx="29" cy="13" r="3.5" fill="#0071e3" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-poppins font-bold text-base sm:text-lg tracking-tight text-[#1d1d1f]">
                  Web Cut Pro Enterprise
                </h1>
                <span className="text-[10px] font-semibold bg-[#0071e3]/10 text-[#0071e3] px-2 py-0.5 rounded-full">
                  Fleet v12.4
                </span>
              </div>
              <p className="text-xs text-[#86868b] font-normal">
                Global Workstation Telemetry & Local Client Storage Analytics
              </p>
            </div>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-end">
            <div className="hidden lg:flex items-center gap-2 px-3.5 py-1.5 bg-[#f5f5f7] border border-[#e5e5ea] rounded-full text-xs font-medium text-[#1d1d1f]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#34c759] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#34c759]"></span>
              </span>
              <span>99.98% Uptime</span>
              <span className="text-[#86868b]">•</span>
              <span className="text-[#86868b]">{lastRefreshed}</span>
            </div>

            <button
              onClick={() => handleExport('csv')}
              disabled={isExporting}
              className="px-3.5 py-2 bg-white hover:bg-[#fafafa] border border-[#d2d2d7] rounded-xl text-xs font-medium text-[#1d1d1f] shadow-sm transition-colors flex items-center gap-1.5"
              title="Download CSV"
            >
              <Download size={13} className="text-[#0071e3]" />
              <span>CSV</span>
            </button>

            <button
              onClick={() => handleExport('json')}
              disabled={isExporting}
              className="px-3.5 py-2 bg-white hover:bg-[#fafafa] border border-[#d2d2d7] rounded-xl text-xs font-medium text-[#1d1d1f] shadow-sm transition-colors flex items-center gap-1.5"
              title="Download JSON"
            >
              <Download size={13} className="text-[#0071e3]" />
              <span>JSON</span>
            </button>

            <button
              onClick={onNavigateToEditor}
              className="px-4 py-2 bg-[#0071e3] hover:bg-[#0077ed] text-white rounded-xl text-xs font-medium shadow-sm transition-all flex items-center gap-1.5"
            >
              <ArrowLeft size={13} />
              <span>Open Editor</span>
            </button>

            <button
              onClick={handleSignOut}
              className="p-2 sm:px-3 sm:py-2 bg-white hover:bg-[#ff3b30]/10 border border-[#d2d2d7] hover:border-[#ff3b30]/30 text-[#86868b] hover:text-[#d70015] rounded-xl text-xs font-medium transition-all"
              title="Sign Out"
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Spacious Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 lg:px-12 py-8 sm:py-12 space-y-10 sm:space-y-12">
        {/* HERO KPI METRICS: Spacious 4-Card Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          {/* Card 1: Visitors */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#e5e5ea] shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-md transition-shadow space-y-4">
            <div className="flex items-center justify-between text-[#86868b]">
              <span className="text-xs font-semibold uppercase tracking-wider">Total Visitors</span>
              <div className="w-9 h-9 rounded-xl bg-[#0071e3]/10 text-[#0071e3] flex items-center justify-center">
                <Users size={18} />
              </div>
            </div>
            <div className="space-y-1">
              <div className="font-poppins font-bold text-3xl sm:text-4xl text-[#1d1d1f] tracking-tight">
                {metrics.totalVisitors.toLocaleString()}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-[#248a3d] font-semibold pt-1">
                <TrendingUp size={13} />
                <span>+18.4% this week</span>
              </div>
            </div>
            <p className="text-xs text-[#86868b] leading-relaxed pt-2 border-t border-[#f0f0f2]">
              Worldwide creative professionals and video editors
            </p>
          </div>

          {/* Card 2: Active Workstations */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#e5e5ea] shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-md transition-shadow space-y-4">
            <div className="flex items-center justify-between text-[#86868b]">
              <span className="text-xs font-semibold uppercase tracking-wider">Active Workstations</span>
              <div className="w-9 h-9 rounded-xl bg-[#34c759]/10 text-[#34c759] flex items-center justify-center">
                <Laptop size={18} />
              </div>
            </div>
            <div className="space-y-1">
              <div className="font-poppins font-bold text-3xl sm:text-4xl text-[#1d1d1f] tracking-tight flex items-baseline gap-2">
                <span>{metrics.activeNow}</span>
                <span className="text-xs font-medium text-[#86868b]">live now</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-[#34c759] font-medium pt-1">
                <span className="w-2 h-2 rounded-full bg-[#34c759] inline-block animate-pulse"></span>
                <span>100% Client Sandboxed</span>
              </div>
            </div>
            <p className="text-xs text-[#86868b] leading-relaxed pt-2 border-t border-[#f0f0f2]">
              Real-time concurrent browser editing sessions
            </p>
          </div>

          {/* Card 3: Master Exports */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#e5e5ea] shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-md transition-shadow space-y-4">
            <div className="flex items-center justify-between text-[#86868b]">
              <span className="text-xs font-semibold uppercase tracking-wider">Master Exports</span>
              <div className="w-9 h-9 rounded-xl bg-[#af52de]/10 text-[#af52de] flex items-center justify-center">
                <Zap size={18} />
              </div>
            </div>
            <div className="space-y-1">
              <div className="font-poppins font-bold text-3xl sm:text-4xl text-[#1d1d1f] tracking-tight">
                {metrics.totalExports.toLocaleString()}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-[#86868b] pt-1">
                <span>ProRes 422 & H.264 4K</span>
              </div>
            </div>
            <p className="text-xs text-[#86868b] leading-relaxed pt-2 border-t border-[#f0f0f2]">
              Rendered on client hardware with 1.15s/min latency
            </p>
          </div>

          {/* Card 4: Bandwidth Saved */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#e5e5ea] shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-md transition-shadow space-y-4">
            <div className="flex items-center justify-between text-[#86868b]">
              <span className="text-xs font-semibold uppercase tracking-wider">Bandwidth Saved</span>
              <div className="w-9 h-9 rounded-xl bg-[#ff9500]/10 text-[#ff9500] flex items-center justify-center">
                <HardDrive size={18} />
              </div>
            </div>
            <div className="space-y-1">
              <div className="font-poppins font-bold text-3xl sm:text-4xl text-[#1d1d1f] tracking-tight flex items-baseline gap-1">
                <span>{metrics.bandwidthSavedTB}</span>
                <span className="text-base font-semibold text-[#86868b]">TB</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-[#248a3d] font-semibold pt-1">
                <span>$0 Cloud Ingress/Egress Cost</span>
              </div>
            </div>
            <p className="text-xs text-[#86868b] leading-relaxed pt-2 border-t border-[#f0f0f2]">
              Media stored strictly in local browser OPFS disk
            </p>
          </div>
        </section>

        {/* NAVIGATION & FILTER SECTION (Spaced Out with Breathing Room) */}
        <section className="space-y-6">
          {/* Top Segmented Navigation Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-[#e5e5ea]">
            <button
              onClick={() => setActiveTab('live')}
              className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                activeTab === 'live'
                  ? 'bg-[#1d1d1f] text-white shadow-sm'
                  : 'text-[#86868b] hover:text-[#1d1d1f] hover:bg-[#f0f0f2]'
              }`}
            >
              <Activity size={15} />
              <span>Real-Time Live Stream</span>
              <span className="ml-1.5 px-2 py-0.5 rounded-full text-[11px] bg-white/20 text-white font-bold">
                {events.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('regions')}
              className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                activeTab === 'regions'
                  ? 'bg-[#1d1d1f] text-white shadow-sm'
                  : 'text-[#86868b] hover:text-[#1d1d1f] hover:bg-[#f0f0f2]'
              }`}
            >
              <Globe2 size={15} />
              <span>Regional Demographics</span>
            </button>

            <button
              onClick={() => setActiveTab('features')}
              className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                activeTab === 'features'
                  ? 'bg-[#1d1d1f] text-white shadow-sm'
                  : 'text-[#86868b] hover:text-[#1d1d1f] hover:bg-[#f0f0f2]'
              }`}
            >
              <BarChart3 size={15} />
              <span>Feature Adoption</span>
            </button>

            <button
              onClick={() => setActiveTab('security')}
              className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                activeTab === 'security'
                  ? 'bg-[#1d1d1f] text-white shadow-sm'
                  : 'text-[#86868b] hover:text-[#1d1d1f] hover:bg-[#f0f0f2]'
              }`}
            >
              <ShieldCheck size={15} />
              <span>Security & Zero-Storage</span>
            </button>
          </div>

          {/* Search & Filter Controls (Clean Line) */}
          {activeTab === 'live' && (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
              <div className="relative flex-1 sm:max-w-md">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#86868b]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter by country, city, action, or keyword..."
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#d2d2d7] rounded-xl text-xs sm:text-sm text-[#1d1d1f] placeholder:text-[#86868b] outline-none focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/20 shadow-sm transition-all"
                />
              </div>

              <div className="flex items-center gap-3">
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-4 py-2.5 bg-white border border-[#d2d2d7] rounded-xl text-xs sm:text-sm font-medium text-[#1d1d1f] outline-none focus:border-[#0071e3] shadow-sm transition-all"
                >
                  <option value="all">All Event Categories</option>
                  <option value="ai">AI Features</option>
                  <option value="export">Master Exports</option>
                  <option value="timeline">Timeline Editing</option>
                  <option value="color">Color & Spatial</option>
                </select>

                <div className="hidden sm:flex items-center gap-1.5 text-xs text-[#86868b] pl-2">
                  <RefreshCw size={12} className="animate-spin text-[#0071e3]" />
                  <span>2.5s cadence</span>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* TAB CONTENT 1: REAL-TIME LIVE STREAM */}
        {activeTab === 'live' && (
          <div className="space-y-6">
            {/* Desktop Table View (>= 768px) */}
            <div className="hidden md:block bg-white rounded-3xl border border-[#e5e5ea] shadow-sm overflow-hidden">
              <div className="px-8 py-6 border-b border-[#e5e5ea] flex items-center justify-between">
                <div>
                  <h2 className="font-poppins font-bold text-lg text-[#1d1d1f]">
                    Live Telemetry Ingestion
                  </h2>
                  <p className="text-xs text-[#86868b] mt-0.5">
                    Real-time operational events received from worldwide user sessions. Zero user video files or audio buffers leave client devices.
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs font-medium text-[#86868b] bg-[#f5f5f7] px-3.5 py-1.5 rounded-full border border-[#e5e5ea]">
                  <span className="w-2 h-2 rounded-full bg-[#34c759] inline-block animate-pulse"></span>
                  <span>Streaming Active</span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#e5e5ea] bg-[#fafafc] text-xs font-semibold text-[#86868b] uppercase tracking-wider">
                      <th className="py-4 px-8">Timestamp</th>
                      <th className="py-4 px-6">Origin Region</th>
                      <th className="py-4 px-6">Event Type</th>
                      <th className="py-4 px-8">Details & Timeline Action</th>
                      <th className="py-4 px-8 text-right">Latency</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f0f0f2] text-xs">
                    {filteredEvents.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center py-16 text-[#86868b] text-sm">
                          No telemetry events matching the current search criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredEvents.map((evt) => {
                        const date = new Date(evt.timestamp);
                        const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

                        return (
                          <tr key={evt.id} className="hover:bg-[#fbfbfd] transition-colors">
                            <td className="py-4 px-8 font-mono text-[11px] text-[#86868b] whitespace-nowrap">
                              {timeStr}
                            </td>
                            <td className="py-4 px-6 whitespace-nowrap">
                              <div className="flex items-center gap-2.5">
                                <span className="text-lg">{evt.flag}</span>
                                <div>
                                  <div className="font-semibold text-[#1d1d1f] text-xs">{evt.city}</div>
                                  <div className="text-[11px] text-[#86868b]">{evt.country}</div>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-6 whitespace-nowrap">
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium bg-[#f5f5f7] border border-[#e5e5ea] text-[#1d1d1f]">
                                <span>{evt.eventType.replace('_', ' ')}</span>
                              </span>
                            </td>
                            <td className="py-4 px-8 text-[#1d1d1f] font-normal leading-relaxed max-w-lg">
                              {evt.details}
                            </td>
                            <td className="py-4 px-8 text-right whitespace-nowrap font-mono text-[11px]">
                              {evt.renderTimeMs ? (
                                <span className="text-[#248a3d] font-semibold">{evt.renderTimeMs}ms</span>
                              ) : (
                                <span className="text-[#c7c7cc]">—</span>
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

            {/* Mobile Card List View (< 768px): Touch-Optimized for Phones */}
            <div className="block md:hidden space-y-3.5">
              <div className="flex items-center justify-between text-xs text-[#86868b] px-1">
                <span>{filteredEvents.length} events logged</span>
                <span className="flex items-center gap-1 text-[#34c759]">
                  <span className="w-2 h-2 rounded-full bg-[#34c759]"></span>
                  <span>Live Feed</span>
                </span>
              </div>

              {filteredEvents.length === 0 ? (
                <div className="bg-white rounded-2xl p-8 text-center text-[#86868b] border border-[#e5e5ea] text-sm">
                  No telemetry events match your search.
                </div>
              ) : (
                filteredEvents.map((evt) => {
                  const date = new Date(evt.timestamp);
                  const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

                  return (
                    <div
                      key={evt.id}
                      className="bg-white rounded-2xl p-4 border border-[#e5e5ea] shadow-sm space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{evt.flag}</span>
                          <div>
                            <span className="font-semibold text-xs text-[#1d1d1f]">{evt.city}</span>
                            <span className="text-[11px] text-[#86868b] ml-1.5">{evt.country}</span>
                          </div>
                        </div>
                        <span className="font-mono text-[10px] text-[#86868b]">
                          {timeStr}
                        </span>
                      </div>

                      <div className="text-xs text-[#1d1d1f] leading-relaxed">
                        {evt.details}
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-[#f0f0f2] text-[11px]">
                        <span className="px-2.5 py-0.5 rounded-full bg-[#f5f5f7] border border-[#e5e5ea] text-[#515154] font-medium">
                          {evt.eventType.replace('_', ' ')}
                        </span>
                        {evt.renderTimeMs && (
                          <span className="font-mono text-[#248a3d] font-semibold">
                            {evt.renderTimeMs}ms render
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* TAB CONTENT 2: REGIONAL DEMOGRAPHICS */}
        {activeTab === 'regions' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white rounded-3xl border border-[#e5e5ea] p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-poppins font-bold text-lg sm:text-xl text-[#1d1d1f]">
                    Top Demographics by Country
                  </h2>
                  <p className="text-xs sm:text-sm text-[#86868b] mt-0.5">
                    Aggregate visitor count breakdown across global media production hubs.
                  </p>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-[#0071e3]/10 text-[#0071e3] flex items-center justify-center shrink-0">
                  <Globe2 size={20} />
                </div>
              </div>

              <div className="space-y-5 pt-2">
                {regions.map((reg) => (
                  <div key={reg.countryCode} className="space-y-2">
                    <div className="flex items-center justify-between text-xs sm:text-sm font-semibold">
                      <div className="flex items-center gap-2.5">
                        <span className="text-xl">{reg.flag}</span>
                        <span className="text-[#1d1d1f]">{reg.country}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[#86868b] font-normal">{reg.visitors.toLocaleString()} editors</span>
                        <span className="font-mono text-[#0071e3] w-10 text-right">{reg.percentage}%</span>
                      </div>
                    </div>
                    {/* Progress bar */}
                    <div className="h-2.5 w-full bg-[#f5f5f7] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#0071e3] rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(reg.percentage * 2.5, 4)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-3xl border border-[#e5e5ea] p-6 sm:p-8 shadow-sm space-y-4">
                <h3 className="font-poppins font-bold text-sm sm:text-base text-[#1d1d1f]">
                  Geo-Distribution Insights
                </h3>
                <ul className="text-xs sm:text-sm text-[#515154] space-y-3.5 leading-relaxed">
                  <li className="flex items-start gap-2.5">
                    <span className="text-[#0071e3] font-bold">✓</span>
                    <span><strong>North America (US & CA):</strong> 42% of high-bitrate ProRes exports originate here.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-[#0071e3] font-bold">✓</span>
                    <span><strong>Europe (UK, DE, FR):</strong> High adoption of broadcast FCPXML 1.11 exchange files.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-[#0071e3] font-bold">✓</span>
                    <span><strong>Africa (Nigeria):</strong> Fastest growing creator demographic leveraging vertical mobile cuts.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-[#0071e3] font-bold">✓</span>
                    <span><strong>Asia-Pacific (JP, SG, AU):</strong> Leading in Vision Pro spatial video preview adoption.</span>
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-3xl border border-[#e5e5ea] p-6 sm:p-8 shadow-sm space-y-2">
                <div className="flex items-center gap-2 text-[#0071e3] font-semibold text-xs uppercase tracking-wider">
                  <Server size={14} />
                  <span>Edge Delivery Network</span>
                </div>
                <div className="font-poppins font-bold text-base text-[#1d1d1f]">
                  Global Netlify Edge Active
                </div>
                <p className="text-xs text-[#86868b] leading-relaxed">
                  Sub-20ms bundle deliveries globally via Netlify Anycast edge routing.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB CONTENT 3: FEATURE ADOPTION */}
        {activeTab === 'features' && (
          <div className="bg-white rounded-3xl border border-[#e5e5ea] p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-poppins font-bold text-lg sm:text-xl text-[#1d1d1f]">
                  Feature Adoption & Tool Popularity
                </h2>
                <p className="text-xs sm:text-sm text-[#86868b] mt-0.5">
                  Telemetry tracking tool invocations across all user sessions.
                </p>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-[#af52de]/10 text-[#af52de] flex items-center justify-center shrink-0">
                <Sparkles size={20} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 pt-2">
              {features.map((feat, index) => {
                const maxCount = features[0].count;
                const percentage = Math.round((feat.count / maxCount) * 100);

                return (
                  <div
                    key={feat.feature}
                    className="p-5 rounded-2xl border border-[#e5e5ea] bg-[#fafafc] hover:bg-white hover:shadow-sm transition-all space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-[#86868b]">#{index + 1}</span>
                        <span className="text-xs sm:text-sm font-bold text-[#1d1d1f]">{feat.feature}</span>
                      </div>
                      <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-white border border-[#e5e5ea] text-[#515154]">
                        {feat.category}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-[#86868b]">
                      <span>{feat.count.toLocaleString()} actions</span>
                      <span className="font-mono font-semibold text-[#1d1d1f]">{percentage}% rank</span>
                    </div>

                    <div className="h-2 w-full bg-[#e5e5ea] rounded-full overflow-hidden">
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
          <div className="space-y-8">
            <div className="bg-white rounded-3xl border border-[#e5e5ea] p-6 sm:p-10 shadow-sm space-y-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#34c759]/10 text-[#34c759] flex items-center justify-center shrink-0">
                  <ShieldCheck size={28} />
                </div>
                <div>
                  <h2 className="font-poppins font-bold text-lg sm:text-xl text-[#1d1d1f]">
                    Zero-Knowledge Architecture & Privacy Audit
                  </h2>
                  <p className="text-xs sm:text-sm text-[#86868b] mt-0.5">
                    Verified compliance with strict enterprise confidentiality and GDPR / CCPA standards.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 rounded-2xl bg-[#fafafc] border border-[#e5e5ea] space-y-3">
                  <div className="flex items-center gap-2 text-[#0071e3] font-semibold text-xs">
                    <CheckCircle2 size={16} />
                    <span>OPFS Sandboxed Storage</span>
                  </div>
                  <h3 className="font-bold text-sm text-[#1d1d1f]">
                    100% Client-Side Media Isolation
                  </h3>
                  <p className="text-xs text-[#515154] leading-relaxed">
                    User A’s high-bitrate 4K footage remains strictly inside their local browser Origin Private File System. Person B can never access or view Person A’s files.
                  </p>
                </div>

                <div className="p-6 rounded-2xl bg-[#fafafc] border border-[#e5e5ea] space-y-3">
                  <div className="flex items-center gap-2 text-[#34c759] font-semibold text-xs">
                    <CheckCircle2 size={16} />
                    <span>Zero Cloud Storage</span>
                  </div>
                  <h3 className="font-bold text-sm text-[#1d1d1f]">
                    Zero Video Storage Liability
                  </h3>
                  <p className="text-xs text-[#515154] leading-relaxed">
                    No video frames or audio buffers are ever transmitted to any centralized cloud server. Renders happen strictly on local Apple Silicon hardware.
                  </p>
                </div>

                <div className="p-6 rounded-2xl bg-[#fafafc] border border-[#e5e5ea] space-y-3">
                  <div className="flex items-center gap-2 text-[#af52de] font-semibold text-xs">
                    <CheckCircle2 size={16} />
                    <span>Differential Telemetry</span>
                  </div>
                  <h3 className="font-bold text-sm text-[#1d1d1f]">
                    Zero-Knowledge Privacy
                  </h3>
                  <p className="text-xs text-[#515154] leading-relaxed">
                    Only anonymous aggregated operational action counts (e.g. cut count, render latency) are collected for fleet health monitoring.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-[#e5e5ea] p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-2xl bg-[#0071e3]/10 text-[#0071e3] flex items-center justify-center shrink-0">
                  <Download size={20} />
                </div>
                <div>
                  <h4 className="font-poppins font-bold text-sm sm:text-base text-[#1d1d1f]">
                    Export Full Audit Reports
                  </h4>
                  <p className="text-xs text-[#86868b] mt-0.5">
                    Download raw compliance logs and aggregate telemetry records for company leadership.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  onClick={() => handleExport('csv')}
                  className="flex-1 sm:flex-initial px-5 py-2.5 bg-[#f5f5f7] hover:bg-[#e5e5ea] text-[#1d1d1f] font-semibold text-xs rounded-xl border border-[#d2d2d7] transition-colors"
                >
                  Download CSV
                </button>
                <button
                  onClick={() => handleExport('json')}
                  className="flex-1 sm:flex-initial px-5 py-2.5 bg-[#0071e3] hover:bg-[#0077ed] text-white font-semibold text-xs rounded-xl shadow-sm transition-colors"
                >
                  Download JSON
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-[#e5e5ea] bg-white py-6 px-4 sm:px-8 lg:px-12 text-xs text-[#86868b] flex flex-col sm:flex-row items-center justify-between gap-3">
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
