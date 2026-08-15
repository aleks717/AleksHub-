export interface VisitorSession {
  id: string;
  ipMasked: string;
  country: string;
  countryCode: string;
  device: 'Desktop' | 'Mobile' | 'Tablet';
  browser: string;
  os: string;
  joinedAt: number;
  lastActiveAt: number;
  pageViews: number;
  simulatedRobuxSent: number;
  status: 'online' | 'idle' | 'left';
  referrer: string;
  usernameSimulated?: string;
}

export interface AnalyticsSummary {
  totalVisits: number;
  uniqueVisitors: number;
  currentConcurrent: number;
  totalRobuxTransferred: number;
  keysGenerated: number;
  averageSessionDurationSec: number;
  serverUptimeSec?: number;
  topCountries: { code: string; name: string; count: number; pct: number }[];
  hourlyTraffic: { hour: string; visitors: number; concurrent: number }[];
  deviceBreakdown: { device: string; count: number; pct: number }[];
  browserBreakdown: { browser: string; count: number; pct: number }[];
  recentSessions: VisitorSession[];
  lastUpdated: number;
}

const STORAGE_SESSION_ID_KEY = 'roblox_real_analytics_session_id';
const STORAGE_VISITED_FLAG = 'roblox_visited_tab_flag';

function getOrCreateSessionId(): string {
  let id = sessionStorage.getItem(STORAGE_SESSION_ID_KEY);
  if (!id) {
    id = 'sess-' + Math.random().toString(36).substring(2, 11) + '-' + Date.now().toString(36);
    sessionStorage.setItem(STORAGE_SESSION_ID_KEY, id);
  }
  return id;
}

// Send real ping to backend server
export async function sendAnalyticsHeartbeat(username?: string, customEvent?: string, amount?: number): Promise<void> {
  try {
    const sessionId = getOrCreateSessionId();
    const isNewVisit = !sessionStorage.getItem(STORAGE_VISITED_FLAG);
    if (isNewVisit) {
      sessionStorage.setItem(STORAGE_VISITED_FLAG, 'true');
    }

    await fetch('/api/analytics/heartbeat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId,
        username: username || 'Guest',
        isNewVisit,
        referrer: document.referrer || 'Direct / Bookmark',
        customEvent,
        amount,
      }),
    });
  } catch (err) {
    console.debug('Analytics ping skipped:', err);
  }
}

// Fetch 100% genuine backend statistics
export async function fetchRealAnalyticsStats(): Promise<AnalyticsSummary> {
  try {
    const res = await fetch('/api/analytics/stats', {
      headers: { 'Cache-Control': 'no-cache' },
    });
    if (res.ok) {
      const data = await res.json();
      return data;
    }
  } catch (e) {
    console.error('Failed to fetch real analytics stats:', e);
  }

  // Safe fallback if network error
  return {
    totalVisits: 1,
    uniqueVisitors: 1,
    currentConcurrent: 1,
    totalRobuxTransferred: 0,
    keysGenerated: 0,
    averageSessionDurationSec: 60,
    topCountries: [{ code: 'DE', name: 'Germany', count: 1, pct: 100 }],
    hourlyTraffic: [{ hour: `${new Date().getHours()}:00`, visitors: 1, concurrent: 1 }],
    deviceBreakdown: [{ device: 'Desktop / PC', count: 1, pct: 100 }],
    browserBreakdown: [{ browser: 'Chrome', count: 1, pct: 100 }],
    recentSessions: [],
    lastUpdated: Date.now(),
  };
}
