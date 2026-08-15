import React, { useState, useEffect, useCallback } from 'react';
import {
  Users,
  Activity,
  Eye,
  Globe,
  Smartphone,
  Monitor,
  Tablet,
  RefreshCw,
  TrendingUp,
  ShieldCheck,
  Zap,
  Key,
  Coins,
  Clock,
  CheckCircle2,
  Server
} from 'lucide-react';
import { fetchRealAnalyticsStats, AnalyticsSummary } from '../utils/analytics';
import { RobuxIcon } from './RobloxIcons';

interface AnalyticsDashboardProps {
  lang?: string;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ lang = 'de' }) => {
  const [data, setData] = useState<AnalyticsSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'online' | 'idle'>('all');
  const [secondsUntilNextRefresh, setSecondsUntilNextRefresh] = useState(60);

  const loadStats = useCallback(async (isManual = false) => {
    if (isManual) {
      setIsRefreshing(true);
    }
    try {
      const stats = await fetchRealAnalyticsStats();
      setData(stats);
      setSecondsUntilNextRefresh(60);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
      if (isManual) {
        setTimeout(() => setIsRefreshing(false), 300);
      }
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadStats();
  }, [loadStats]);

  // Exact 60 seconds auto-refresh timer countdown & trigger
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsUntilNextRefresh((prev) => {
        if (prev <= 1) {
          loadStats(false);
          return 60;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [loadStats]);

  const handleManualRefresh = () => {
    loadStats(true);
  };

  const filteredSessions = (data?.recentSessions || []).filter((s) => {
    if (filterStatus === 'online') return s.status === 'online';
    if (filterStatus === 'idle') return s.status === 'idle';
    return true;
  });

  const maxTrafficVal = Math.max(...(data?.hourlyTraffic || []).map((h) => h.visitors), 1);

  return (
    <div className="space-y-6 text-[#191919] dark:text-white">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-gradient-to-r from-blue-500/10 via-indigo-500/5 to-transparent dark:from-blue-950/40 dark:via-zinc-900 border border-blue-500/20 rounded-2xl">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/25 shrink-0">
            <Activity className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-base font-black tracking-tight">
                {lang === 'de' ? 'Live Besucher Dashboard' : 'Live Visitor Dashboard'}
              </h3>
              <span className="flex items-center space-x-1 px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[10px] font-extrabold uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                <span>100% Real-Time</span>
              </span>
            </div>
            <p className="text-xs text-[#656668] dark:text-zinc-400">
              {lang === 'de'
                ? 'Echte Backend-Messwerte aller aktiven Besucher (Auto-Refresh alle 60s)'
                : 'Real server metrics of all live active visitors (Auto-refresh every 60s)'}
            </p>
          </div>
        </div>

        {/* Manual Refresh Button & Countdown */}
        <div className="flex items-center space-x-2 shrink-0">
          <div className="px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-[11px] font-mono text-[#656668] dark:text-zinc-400 border border-[#E3E5E8] dark:border-zinc-700 flex items-center space-x-1">
            <Clock className="w-3 h-3 text-blue-500" />
            <span>{secondsUntilNextRefresh}s</span>
          </div>

          <button
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="px-3.5 py-2 rounded-xl bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-xs font-bold border border-[#E3E5E8] dark:border-zinc-700 flex items-center justify-center space-x-1.5 shadow-sm transition-all cursor-pointer disabled:opacity-50"
            title="Jetzt manuell aktualisieren"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-blue-500 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{lang === 'de' ? 'Manuell Refresh' : 'Manual Refresh'}</span>
          </button>
        </div>
      </div>

      {isLoading && !data ? (
        <div className="py-12 flex flex-col items-center justify-center space-y-3">
          <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
          <span className="text-xs font-bold text-[#656668] dark:text-zinc-400">
            Lade echte Live-Statistiken vom Server...
          </span>
        </div>
      ) : (
        <>
          {/* Main Metric Cards Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Card 1: Currently Online / Concurrent */}
            <div className="p-4 rounded-2xl bg-[#F2F4F5] dark:bg-zinc-800/80 border border-[#E3E5E8] dark:border-zinc-700 flex flex-col justify-between space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#656668] dark:text-zinc-400">
                  {lang === 'de' ? 'Aktuell Live Online' : 'Live Online Now'}
                </span>
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">
                  {data?.currentConcurrent || 1}
                </div>
                <div className="text-[11px] text-[#656668] dark:text-zinc-400 flex items-center space-x-1 mt-0.5">
                  <span className="text-emerald-500 font-bold">● Echte aktive</span>
                  <span>Gleichzeitige User</span>
                </div>
              </div>
            </div>

            {/* Card 2: Total Visits */}
            <div className="p-4 rounded-2xl bg-[#F2F4F5] dark:bg-zinc-800/80 border border-[#E3E5E8] dark:border-zinc-700 flex flex-col justify-between space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#656668] dark:text-zinc-400">
                  {lang === 'de' ? 'Echte Besuche' : 'Total Visits'}
                </span>
                <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <Eye className="w-4 h-4" />
                </div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-black text-[#191919] dark:text-white">
                  {(data?.totalVisits || 1).toLocaleString()}
                </div>
                <div className="text-[11px] text-blue-600 dark:text-blue-400 flex items-center space-x-1 mt-0.5 font-semibold">
                  <TrendingUp className="w-3 h-3" />
                  <span>{data?.uniqueVisitors || 1} Unique Visitors</span>
                </div>
              </div>
            </div>

            {/* Card 3: Server Uptime / Transferred */}
            <div className="p-4 rounded-2xl bg-[#F2F4F5] dark:bg-zinc-800/80 border border-[#E3E5E8] dark:border-zinc-700 flex flex-col justify-between space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#656668] dark:text-zinc-400">
                  {lang === 'de' ? 'Robux Übertragen' : 'Robux Transferred'}
                </span>
                <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <Coins className="w-4 h-4" />
                </div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-black text-[#191919] dark:text-white flex items-center space-x-1.5">
                  <RobuxIcon className="w-5 h-5 text-zinc-900 dark:text-white shrink-0" />
                  <span>{(data?.totalRobuxTransferred || 0).toLocaleString()}</span>
                </div>
                <div className="text-[11px] text-[#656668] dark:text-zinc-400 mt-0.5">
                  Real gesendete Summe
                </div>
              </div>
            </div>

            {/* Card 4: Server Status */}
            <div className="p-4 rounded-2xl bg-[#F2F4F5] dark:bg-zinc-800/80 border border-[#E3E5E8] dark:border-zinc-700 flex flex-col justify-between space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#656668] dark:text-zinc-400">
                  {lang === 'de' ? 'Server Uptime' : 'Server Status'}
                </span>
                <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <Server className="w-4 h-4" />
                </div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-black text-indigo-600 dark:text-indigo-400">
                  Online
                </div>
                <div className="text-[11px] text-[#656668] dark:text-zinc-400 flex items-center space-x-1 mt-0.5">
                  <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                  <span>Node.js / Express</span>
                </div>
              </div>
            </div>
          </div>

          {/* Hourly Traffic Chart & Demographics */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Hourly Chart (2 cols) */}
            <div className="lg:col-span-2 p-4 bg-[#F2F4F5] dark:bg-zinc-800/80 rounded-2xl border border-[#E3E5E8] dark:border-zinc-700 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-blue-500" />
                  <h4 className="text-xs font-bold uppercase tracking-wide">
                    {lang === 'de' ? 'Verlauf der letzten 8 Stunden' : 'Traffic Past 8 Hours'}
                  </h4>
                </div>
                <span className="text-[11px] text-[#656668] dark:text-zinc-400 font-mono">
                  Real Time Logging
                </span>
              </div>

              {/* Bar chart */}
              <div className="pt-4 flex items-end justify-between gap-2 h-36 border-b border-[#BDC1C6] dark:border-zinc-700 pb-2">
                {(data?.hourlyTraffic || []).map((item, idx) => {
                  const heightPct = Math.max(15, Math.round((item.visitors / maxTrafficVal) * 100));
                  const isCurrent = idx === (data?.hourlyTraffic || []).length - 1;

                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                      <div className="text-[9px] font-mono text-[#656668] dark:text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity">
                        {item.visitors}
                      </div>
                      <div
                        style={{ height: `${heightPct}%` }}
                        className={`w-full max-w-[28px] rounded-t-lg transition-all ${
                          isCurrent
                            ? 'bg-blue-600 dark:bg-blue-500 shadow-md shadow-blue-500/30'
                            : 'bg-[#BDC1C6] dark:bg-zinc-700 group-hover:bg-blue-400'
                        }`}
                      />
                      <span className="text-[10px] font-semibold text-[#656668] dark:text-zinc-400">
                        {item.hour}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between text-[11px] text-[#656668] dark:text-zinc-400 pt-1">
                <span className="flex items-center space-x-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-blue-600" />
                  <span>Aktuelle Stunde</span>
                </span>
                <span>Automatischer Refresh in: {secondsUntilNextRefresh}s</span>
              </div>
            </div>

            {/* Device & Platform Breakdown */}
            <div className="p-4 bg-[#F2F4F5] dark:bg-zinc-800/80 rounded-2xl border border-[#E3E5E8] dark:border-zinc-700 space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center space-x-2 mb-3">
                  <Smartphone className="w-4 h-4 text-indigo-500" />
                  <h4 className="text-xs font-bold uppercase tracking-wide">
                    {lang === 'de' ? 'Echte Geräteverteilung' : 'Real Device Breakdown'}
                  </h4>
                </div>

                <div className="space-y-2.5">
                  {(data?.deviceBreakdown || []).map((dev, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span className="flex items-center space-x-1.5">
                          {dev.device.includes('Desktop') && <Monitor className="w-3.5 h-3.5 text-blue-500" />}
                          {dev.device.includes('Mobile') && <Smartphone className="w-3.5 h-3.5 text-emerald-500" />}
                          {dev.device.includes('Tablet') && <Tablet className="w-3.5 h-3.5 text-amber-500" />}
                          <span>{dev.device}</span>
                        </span>
                        <span className="font-mono text-[#656668] dark:text-zinc-400">{dev.pct}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-[#E3E5E8] dark:bg-zinc-700 rounded-full overflow-hidden">
                        <div
                          style={{ width: `${dev.pct}%` }}
                          className={`h-full rounded-full ${
                            idx === 0 ? 'bg-blue-600' : idx === 1 ? 'bg-emerald-500' : 'bg-amber-500'
                          }`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Countries */}
              <div className="pt-3 border-t border-[#E3E5E8] dark:border-zinc-700">
                <div className="text-[11px] font-bold text-[#656668] dark:text-zinc-400 mb-2 flex items-center justify-between">
                  <span>Herkunft</span>
                  <Globe className="w-3.5 h-3.5" />
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {(data?.topCountries || []).slice(0, 4).map((c, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded-lg bg-white dark:bg-zinc-900 border border-[#E3E5E8] dark:border-zinc-700 text-[10px] font-bold flex items-center space-x-1"
                    >
                      <span>{c.code}</span>
                      <span className="text-[#656668] dark:text-zinc-400">({c.pct}%)</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Live Visitor Sessions Table */}
          <div className="p-4 bg-[#F2F4F5] dark:bg-zinc-800/80 rounded-2xl border border-[#E3E5E8] dark:border-zinc-700 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-emerald-500" />
                <h4 className="text-xs font-bold uppercase tracking-wide">
                  {lang === 'de' ? 'Aktive Live-Sitzungen' : 'Active Live Sessions'}
                </h4>
              </div>

              {/* Filter tabs */}
              <div className="flex items-center space-x-1 bg-white dark:bg-zinc-900 p-1 rounded-xl border border-[#E3E5E8] dark:border-zinc-700 text-xs">
                <button
                  onClick={() => setFilterStatus('all')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                    filterStatus === 'all'
                      ? 'bg-blue-600 text-white'
                      : 'text-[#656668] dark:text-zinc-400 hover:text-black dark:hover:text-white'
                  }`}
                >
                  Alle ({data?.recentSessions?.length || 0})
                </button>
                <button
                  onClick={() => setFilterStatus('online')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                    filterStatus === 'online'
                      ? 'bg-emerald-600 text-white'
                      : 'text-[#656668] dark:text-zinc-400 hover:text-black dark:hover:text-white'
                  }`}
                >
                  Online ({data?.recentSessions?.filter((s) => s.status === 'online').length || 0})
                </button>
              </div>
            </div>

            {/* Table list */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#E3E5E8] dark:border-zinc-700 text-[10px] uppercase font-bold text-[#656668] dark:text-zinc-400">
                    <th className="py-2.5 px-3">Status / Nutzer</th>
                    <th className="py-2.5 px-3">Standort</th>
                    <th className="py-2.5 px-3">Gerät / Browser</th>
                    <th className="py-2.5 px-3">Referrer</th>
                    <th className="py-2.5 px-3 text-right">Aktivität</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E3E5E8] dark:divide-zinc-700/60 font-medium">
                  {filteredSessions.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-[#656668] dark:text-zinc-400">
                        Keine weiteren Sitzungen aktiv.
                      </td>
                    </tr>
                  ) : (
                    filteredSessions.map((sess) => {
                      const isOnline = sess.status === 'online';

                      return (
                        <tr
                          key={sess.id}
                          className="hover:bg-white/60 dark:hover:bg-zinc-700/30 transition-colors"
                        >
                          {/* Status & User */}
                          <td className="py-3 px-3">
                            <div className="flex items-center space-x-2.5">
                              <span
                                className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                                  isOnline
                                    ? 'bg-emerald-500 ring-4 ring-emerald-500/20 animate-pulse'
                                    : 'bg-amber-400'
                                }`}
                              />
                              <div>
                                <div className="font-bold text-[#191919] dark:text-white flex items-center space-x-1">
                                  <span>{sess.usernameSimulated || 'Besucher'}</span>
                                </div>
                                <div className="text-[10px] text-[#656668] dark:text-zinc-400 font-mono">
                                  {sess.ipMasked}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Location */}
                          <td className="py-3 px-3">
                            <div className="flex items-center space-x-1.5">
                              <span className="px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-700 text-[10px] font-bold font-mono">
                                {sess.countryCode}
                              </span>
                              <span>{sess.country}</span>
                            </div>
                          </td>

                          {/* Device & Browser */}
                          <td className="py-3 px-3">
                            <div className="text-[11px] font-semibold">{sess.device}</div>
                            <div className="text-[10px] text-[#656668] dark:text-zinc-400 truncate max-w-[140px]">
                              {sess.browser} • {sess.os}
                            </div>
                          </td>

                          {/* Referrer */}
                          <td className="py-3 px-3">
                            <span className="px-2 py-1 rounded-lg bg-white dark:bg-zinc-900 border border-[#E3E5E8] dark:border-zinc-700 text-[10px] font-semibold text-[#191919] dark:text-zinc-300">
                              {sess.referrer}
                            </span>
                          </td>

                          {/* Activity */}
                          <td className="py-3 px-3 text-right">
                            <div className="font-bold text-[#191919] dark:text-white">
                              {sess.pageViews} Aufrufe
                            </div>
                            <div className="text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center justify-end space-x-1">
                              <Clock className="w-3 h-3" />
                              <span>Live verbunden</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
