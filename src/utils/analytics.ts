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
  topCountries: { code: string; name: string; count: number; pct: number }[];
  hourlyTraffic: { hour: string; visitors: number; concurrent: number }[];
  deviceBreakdown: { device: string; count: number; pct: number }[];
  browserBreakdown: { browser: string; count: number; pct: number }[];
  recentSessions: VisitorSession[];
}

const STORAGE_KEY_SESSIONS = 'roblox_analytics_sessions_v1';
const STORAGE_KEY_TOTAL_VISITS = 'roblox_analytics_total_visits';
const STORAGE_KEY_FIRST_VISIT = 'roblox_analytics_first_visit_ts';

const SAMPLE_COUNTRIES = [
  { code: 'DE', name: 'Germany' },
  { code: 'US', name: 'United States' },
  { code: 'AT', name: 'Austria' },
  { code: 'CH', name: 'Switzerland' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'FR', name: 'France' },
  { code: 'PL', name: 'Poland' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'BR', name: 'Brazil' },
  { code: 'CA', name: 'Canada' },
];

const SAMPLE_NAMES = [
  'SpyderFan99',
  'RobloxMaster_2026',
  'AlexProGamer',
  'ShadowNinjaX',
  'Blox_King',
  'ViperStrike9',
  'DiamondBuilder',
  'NeonGamerDE',
  'CyberWolf_77',
  'EpicCrafter',
  'Krono_RBLX',
  'UltraSpeedy',
];

function generateSeedSessions(): VisitorSession[] {
  const now = Date.now();
  const sessions: VisitorSession[] = [];

  // Generate 8-12 realistic concurrent and recent visitor sessions
  const count = 10;
  for (let i = 0; i < count; i++) {
    const isOnline = i < 5; // 5 currently online concurrent
    const isIdle = i >= 5 && i < 7;
    const country = SAMPLE_COUNTRIES[i % SAMPLE_COUNTRIES.length];
    const minsAgo = isOnline ? Math.floor(Math.random() * 5) : Math.floor(10 + Math.random() * 90);
    const joinedMinsAgo = minsAgo + Math.floor(2 + Math.random() * 25);
    const device: 'Desktop' | 'Mobile' | 'Tablet' = i % 3 === 0 ? 'Mobile' : i % 7 === 0 ? 'Tablet' : 'Desktop';
    const browser = i % 2 === 0 ? 'Chrome 128.0' : i % 5 === 0 ? 'Firefox 130' : 'Safari 18.0';
    const os = device === 'Mobile' ? 'iOS 18.2' : device === 'Tablet' ? 'iPadOS 18' : i % 4 === 0 ? 'macOS Sequoia' : 'Windows 11';

    sessions.push({
      id: `sess-${1000 + i}`,
      ipMasked: `${Math.floor(80 + Math.random() * 100)}.${Math.floor(10 + Math.random() * 200)}.***.***`,
      country: country.name,
      countryCode: country.code,
      device,
      browser,
      os,
      joinedAt: now - joinedMinsAgo * 60 * 1000,
      lastActiveAt: now - minsAgo * 60 * 1000,
      pageViews: Math.floor(2 + Math.random() * 8),
      simulatedRobuxSent: i % 2 === 0 ? Math.floor(500 + Math.random() * 9500) : 0,
      status: isOnline ? 'online' : isIdle ? 'idle' : 'left',
      referrer: i % 3 === 0 ? 'discord.gg/df2PB4mkHH' : i % 4 === 0 ? 'youtube.com/@SpyderAleks' : 'Direct Link',
      usernameSimulated: SAMPLE_NAMES[i % SAMPLE_NAMES.length],
    });
  }

  // Also prepend current user's session
  sessions.unshift({
    id: `sess-self`,
    ipMasked: '178.203.***.*** (You)',
    country: 'Germany',
    countryCode: 'DE',
    device: window.innerWidth < 768 ? 'Mobile' : 'Desktop',
    browser: 'Chrome / Modern Browser',
    os: 'Current Device',
    joinedAt: now - 3 * 60 * 1000,
    lastActiveAt: now,
    pageViews: 12,
    simulatedRobuxSent: 15000,
    status: 'online',
    referrer: 'Direct Visit',
    usernameSimulated: 'You (Admin / User)',
  });

  return sessions;
}

export function getAnalyticsData(): AnalyticsSummary {
  let storedSessions: VisitorSession[] = [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SESSIONS);
    if (raw) {
      storedSessions = JSON.parse(raw);
    }
  } catch {
    // fallback
  }

  if (!storedSessions || storedSessions.length === 0) {
    storedSessions = generateSeedSessions();
    try {
      localStorage.setItem(STORAGE_KEY_SESSIONS, JSON.stringify(storedSessions));
    } catch {
      // ignore
    }
  }

  // Increment total visits counter if needed
  let totalVisits = 1428;
  try {
    const rawVisits = localStorage.getItem(STORAGE_KEY_TOTAL_VISITS);
    if (rawVisits) {
      totalVisits = parseInt(rawVisits, 10);
    } else {
      localStorage.setItem(STORAGE_KEY_TOTAL_VISITS, totalVisits.toString());
    }
  } catch {
    // ignore
  }

  // Count active online visitors
  const currentConcurrent = storedSessions.filter(s => s.status === 'online').length;

  // Calculate stats
  const totalRobuxTransferred = storedSessions.reduce((acc, s) => acc + (s.simulatedRobuxSent || 0), 245000);
  const uniqueVisitors = Math.round(totalVisits * 0.72);

  // Hourly traffic past 8 hours
  const now = new Date();
  const currentHour = now.getHours();
  const hourlyTraffic = [];
  for (let i = 7; i >= 0; i--) {
    const h = (currentHour - i + 24) % 24;
    const hourStr = `${h.toString().padStart(2, '0')}:00`;
    const visitors = Math.floor(35 + Math.sin(i + 1) * 20 + (i === 0 ? currentConcurrent * 3 : Math.random() * 25));
    const concurrent = i === 0 ? currentConcurrent : Math.max(2, Math.floor(visitors / 8));
    hourlyTraffic.push({
      hour: hourStr,
      visitors,
      concurrent,
    });
  }

  // Top Countries breakdown
  const countryCounts: Record<string, { name: string; count: number }> = {
    DE: { name: 'Germany', count: Math.round(totalVisits * 0.44) },
    US: { name: 'United States', count: Math.round(totalVisits * 0.22) },
    AT: { name: 'Austria', count: Math.round(totalVisits * 0.12) },
    CH: { name: 'Switzerland', count: Math.round(totalVisits * 0.09) },
    FR: { name: 'France', count: Math.round(totalVisits * 0.05) },
    GB: { name: 'United Kingdom', count: Math.round(totalVisits * 0.04) },
    OTHER: { name: 'Other Countries', count: Math.round(totalVisits * 0.04) },
  };

  const topCountries = Object.entries(countryCounts).map(([code, data]) => ({
    code,
    name: data.name,
    count: data.count,
    pct: Math.round((data.count / totalVisits) * 100),
  }));

  const deviceBreakdown = [
    { device: 'Desktop / PC', count: Math.round(totalVisits * 0.58), pct: 58 },
    { device: 'Mobile Phones', count: Math.round(totalVisits * 0.35), pct: 35 },
    { device: 'Tablets / iPads', count: Math.round(totalVisits * 0.07), pct: 7 },
  ];

  const browserBreakdown = [
    { browser: 'Google Chrome', count: Math.round(totalVisits * 0.62), pct: 62 },
    { browser: 'Apple Safari', count: Math.round(totalVisits * 0.21), pct: 21 },
    { browser: 'Mozilla Firefox', count: Math.round(totalVisits * 0.11), pct: 11 },
    { browser: 'Microsoft Edge', count: Math.round(totalVisits * 0.06), pct: 6 },
  ];

  // Count generated keys from key system
  let keysGenerated = 284;
  try {
    const rawKeys = localStorage.getItem('valid_key_system_keys');
    if (rawKeys) {
      const parsed = JSON.parse(rawKeys);
      if (Array.isArray(parsed) && parsed.length > 0) {
        keysGenerated += parsed.length;
      }
    }
  } catch {
    // ignore
  }

  return {
    totalVisits,
    uniqueVisitors,
    currentConcurrent,
    totalRobuxTransferred,
    keysGenerated,
    averageSessionDurationSec: 285, // ~4m 45s
    topCountries,
    hourlyTraffic,
    deviceBreakdown,
    browserBreakdown,
    recentSessions: storedSessions,
  };
}

export function recordNewPageVisit(): void {
  try {
    const rawVisits = localStorage.getItem(STORAGE_KEY_TOTAL_VISITS);
    const count = rawVisits ? parseInt(rawVisits, 10) : 1428;
    localStorage.setItem(STORAGE_KEY_TOTAL_VISITS, (count + 1).toString());
  } catch {
    // ignore
  }
}
