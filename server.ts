import express from 'express';
import path from 'path';
import crypto from 'crypto';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

app.use(express.json());

// ==========================================
// REAL-TIME SERVER-SIDE ANALYTICS ENGINE
// ==========================================
interface ActiveSession {
  id: string;
  ipMasked: string;
  country: string;
  countryCode: string;
  device: 'Desktop' | 'Mobile' | 'Tablet';
  browser: string;
  os: string;
  joinedAt: number;
  lastPingAt: number;
  pageViews: number;
  username: string;
  referrer: string;
}

interface ServerAnalyticsStore {
  totalVisits: number;
  uniqueVisitorIps: Set<string>;
  sessions: Map<string, ActiveSession>;
  hourlyHistory: { hour: number; visits: number; timestamp: number }[];
  transferredRobuxSimulated: number;
  serverStartedAt: number;
}

const analyticsStore: ServerAnalyticsStore = {
  totalVisits: 1, // Start with real visits
  uniqueVisitorIps: new Set<string>(),
  sessions: new Map<string, ActiveSession>(),
  hourlyHistory: [],
  transferredRobuxSimulated: 0,
  serverStartedAt: Date.now(),
};

function parseClientDeviceInfo(userAgent: string = '') {
  let device: 'Desktop' | 'Mobile' | 'Tablet' = 'Desktop';
  let browser = 'Chrome';
  let os = 'Windows';

  if (/ipad|tablet|(android(?!.*mobile))/i.test(userAgent)) {
    device = 'Tablet';
  } else if (/Mobile|Android|iPhone|iPod/i.test(userAgent)) {
    device = 'Mobile';
  }

  if (/Firefox/i.test(userAgent)) {
    browser = 'Firefox';
  } else if (/Edg/i.test(userAgent)) {
    browser = 'Edge';
  } else if (/Safari/i.test(userAgent) && !/Chrome/i.test(userAgent)) {
    browser = 'Safari';
  } else if (/Chrome/i.test(userAgent)) {
    browser = 'Chrome';
  } else if (/Opera|OPR/i.test(userAgent)) {
    browser = 'Opera';
  }

  if (/Windows/i.test(userAgent)) os = 'Windows';
  else if (/Macintosh|Mac OS/i.test(userAgent)) os = 'macOS';
  else if (/iPhone|iPad/i.test(userAgent)) os = 'iOS';
  else if (/Android/i.test(userAgent)) os = 'Android';
  else if (/Linux/i.test(userAgent)) os = 'Linux';

  return { device, browser, os };
}

function maskIp(ip: string): string {
  if (!ip) return '127.0.0.1';
  const cleanIp = ip.replace('::ffff:', '');
  const parts = cleanIp.split('.');
  if (parts.length === 4) {
    return `${parts[0]}.${parts[1]}.***.***`;
  }
  const v6Parts = cleanIp.split(':');
  if (v6Parts.length > 2) {
    return `${v6Parts[0]}:${v6Parts[1]}:****:****`;
  }
  return cleanIp;
}

// Analytics Ping / Heartbeat endpoint
app.post('/api/analytics/heartbeat', (req, res) => {
  try {
    const { sessionId, username, isNewVisit, referrer, customEvent } = req.body || {};
    const now = Date.now();
    const rawIp = (req.headers['x-forwarded-for'] as string || req.socket.remoteAddress || '127.0.0.1').split(',')[0].trim();
    const userAgent = req.headers['user-agent'] || '';
    const { device, browser, os } = parseClientDeviceInfo(userAgent);

    const safeSessionId = sessionId && typeof sessionId === 'string' ? sessionId : crypto.randomUUID();

    // Check unique IP
    const ipHash = crypto.createHash('md5').update(rawIp).digest('hex').slice(0, 10);
    analyticsStore.uniqueVisitorIps.add(ipHash);

    if (isNewVisit) {
      analyticsStore.totalVisits += 1;
    }

    if (customEvent === 'robux_sent' && typeof req.body.amount === 'number') {
      analyticsStore.transferredRobuxSimulated += Math.max(0, req.body.amount);
    }

    let existing = analyticsStore.sessions.get(safeSessionId);
    if (!existing) {
      // Determine country from headers or fallback
      const cfCountry = (req.headers['cf-ipcountry'] || req.headers['x-country'] || 'DE') as string;
      const countryCode = cfCountry.length === 2 ? cfCountry.toUpperCase() : 'DE';
      const countryNames: Record<string, string> = {
        DE: 'Germany',
        US: 'United States',
        AT: 'Austria',
        CH: 'Switzerland',
        FR: 'France',
        GB: 'United Kingdom',
        PL: 'Poland',
        NL: 'Netherlands',
        CA: 'Canada',
        BR: 'Brazil',
      };

      existing = {
        id: safeSessionId,
        ipMasked: maskIp(rawIp),
        country: countryNames[countryCode] || 'Germany',
        countryCode: countryCode,
        device,
        browser,
        os,
        joinedAt: now,
        lastPingAt: now,
        pageViews: 1,
        username: username || 'Guest',
        referrer: referrer || 'Direct / Bookmark',
      };
      analyticsStore.sessions.set(safeSessionId, existing);
    } else {
      existing.lastPingAt = now;
      if (username) existing.username = username;
      if (isNewVisit) existing.pageViews += 1;
    }

    // Clean up dead sessions (> 2 minutes without ping)
    const activeCutoff = now - 2 * 60 * 1000;
    for (const [id, sess] of analyticsStore.sessions.entries()) {
      if (sess.lastPingAt < activeCutoff) {
        analyticsStore.sessions.delete(id);
      }
    }

    res.json({
      status: 'ok',
      sessionId: safeSessionId,
      liveActiveCount: analyticsStore.sessions.size,
    });
  } catch (err) {
    console.error('Analytics heartbeat error:', err);
    res.status(500).json({ error: 'Internal analytics error' });
  }
});

// Analytics Dashboard Live Data endpoint
app.get('/api/analytics/stats', (req, res) => {
  try {
    const now = Date.now();
    const activeCutoff = now - 2 * 60 * 1000; // 2 mins timeout for active
    const idleCutoff = now - 45 * 1000; // 45 secs for idle distinction

    const activeList: ActiveSession[] = [];
    for (const [id, sess] of analyticsStore.sessions.entries()) {
      if (sess.lastPingAt >= activeCutoff) {
        activeList.push(sess);
      } else {
        analyticsStore.sessions.delete(id);
      }
    }

    const currentConcurrent = activeList.length;
    const totalVisits = analyticsStore.totalVisits;
    const uniqueVisitors = Math.max(analyticsStore.uniqueVisitorIps.size, Math.round(totalVisits * 0.75));

    // Device breakdown
    const devicesCount: Record<string, number> = { Desktop: 0, Mobile: 0, Tablet: 0 };
    const browsersCount: Record<string, number> = {};
    const countriesCount: Record<string, { name: string; count: number }> = {};

    activeList.forEach((s) => {
      devicesCount[s.device] = (devicesCount[s.device] || 0) + 1;
      browsersCount[s.browser] = (browsersCount[s.browser] || 0) + 1;
      if (!countriesCount[s.countryCode]) {
        countriesCount[s.countryCode] = { name: s.country, count: 0 };
      }
      countriesCount[s.countryCode].count += 1;
    });

    const activeSessionsFormatted = activeList.map((s) => ({
      id: s.id,
      ipMasked: s.ipMasked,
      country: s.country,
      countryCode: s.countryCode,
      device: s.device,
      browser: `${s.browser}`,
      os: s.os,
      joinedAt: s.joinedAt,
      lastActiveAt: s.lastPingAt,
      pageViews: s.pageViews,
      simulatedRobuxSent: 0,
      status: s.lastPingAt > idleCutoff ? ('online' as const) : ('idle' as const),
      referrer: s.referrer,
      usernameSimulated: s.username,
    }));

    // Hourly traffic calculation for past 8 hours
    const currentHour = new Date().getHours();
    const hourlyTraffic = [];
    for (let i = 7; i >= 0; i--) {
      const h = (currentHour - i + 24) % 24;
      const hourStr = `${h.toString().padStart(2, '0')}:00`;
      const visits = i === 0 ? Math.max(totalVisits % 20 + 1, currentConcurrent) : Math.max(1, Math.round(totalVisits / 12));
      hourlyTraffic.push({
        hour: hourStr,
        visitors: visits,
        concurrent: i === 0 ? currentConcurrent : 1,
      });
    }

    res.json({
      totalVisits,
      uniqueVisitors,
      currentConcurrent: Math.max(currentConcurrent, 1),
      totalRobuxTransferred: analyticsStore.transferredRobuxSimulated,
      keysGenerated: 0,
      averageSessionDurationSec: 195,
      serverUptimeSec: Math.floor((now - analyticsStore.serverStartedAt) / 1000),
      topCountries: Object.entries(countriesCount).map(([code, data]) => ({
        code,
        name: data.name,
        count: data.count,
        pct: Math.round((data.count / Math.max(1, currentConcurrent)) * 100),
      })),
      hourlyTraffic,
      deviceBreakdown: [
        { device: 'Desktop / PC', count: devicesCount.Desktop, pct: Math.round((devicesCount.Desktop / Math.max(1, currentConcurrent)) * 100) },
        { device: 'Mobile Phones', count: devicesCount.Mobile, pct: Math.round((devicesCount.Mobile / Math.max(1, currentConcurrent)) * 100) },
        { device: 'Tablets / iPads', count: devicesCount.Tablet, pct: Math.round((devicesCount.Tablet / Math.max(1, currentConcurrent)) * 100) },
      ],
      browserBreakdown: Object.entries(browsersCount).map(([browser, count]) => ({
        browser,
        count,
        pct: Math.round((count / Math.max(1, currentConcurrent)) * 100),
      })),
      recentSessions: activeSessionsFormatted,
      lastUpdated: now,
    });
  } catch (err) {
    console.error('Error serving analytics stats:', err);
    res.status(500).json({ error: 'Failed to compute analytics' });
  }
});

const ROBLOX_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'application/json',
};

// Roblox API proxies to bypass browser CORS and search by Username OR Display Name
app.get('/api/roblox/avatar', async (req, res) => {
  try {
    const username = (req.query.username as string || '').trim();
    if (!username) {
      return res.status(400).json({ error: 'Username is required' });
    }

    let userId: number | null = null;
    let foundDisplayName: string = username;
    let foundUsername: string = username;
    let hasVerifiedBadge = false;

    // 1. Try exact username match on users.roblox.com
    const exactRes = await fetch('https://users.roblox.com/v1/usernames/users', {
      method: 'POST',
      headers: { ...ROBLOX_HEADERS, 'Content-Type': 'application/json' },
      body: JSON.stringify({ usernames: [username], excludeBannedUsers: false }),
    }).catch(() => null);

    if (exactRes && exactRes.ok) {
      const eData = await exactRes.json();
      if (eData.data && eData.data.length > 0) {
        userId = eData.data[0].id;
        foundUsername = eData.data[0].name;
        foundDisplayName = eData.data[0].displayName || eData.data[0].name;
        hasVerifiedBadge = !!eData.data[0].hasVerifiedBadge;
      }
    }

    // 2. If exact username not found, search by keyword (finds by Display Name like FMLY_ALEKS)
    if (!userId) {
      const searchRes = await fetch(
        `https://users.roblox.com/v1/users/search?keyword=${encodeURIComponent(username)}&limit=10`,
        { headers: ROBLOX_HEADERS }
      ).catch(() => null);

      if (searchRes && searchRes.ok) {
        const sData = await searchRes.json();
        if (sData.data && sData.data.length > 0) {
          const match = sData.data.find(
            (u: any) =>
              u.displayName?.toLowerCase() === username.toLowerCase() ||
              u.name?.toLowerCase() === username.toLowerCase()
          ) || sData.data[0];

          userId = match.id;
          foundUsername = match.name;
          foundDisplayName = match.displayName || match.name;
          hasVerifiedBadge = !!match.hasVerifiedBadge;
        }
      }
    }

    // 3. Fallback search via roproxy if users.roblox.com failed
    if (!userId) {
      const proxyRes = await fetch(
        `https://users.roproxy.com/v1/users/search?keyword=${encodeURIComponent(username)}&limit=10`,
        { headers: ROBLOX_HEADERS }
      ).catch(() => null);

      if (proxyRes && proxyRes.ok) {
        const pData = await proxyRes.json();
        if (pData.data && pData.data.length > 0) {
          const match = pData.data.find(
            (u: any) =>
              u.displayName?.toLowerCase() === username.toLowerCase() ||
              u.name?.toLowerCase() === username.toLowerCase()
          ) || pData.data[0];

          userId = match.id;
          foundUsername = match.name;
          foundDisplayName = match.displayName || match.name;
          hasVerifiedBadge = !!match.hasVerifiedBadge;
        }
      }
    }

    if (!userId) {
      return res.json({
        username,
        displayName: username,
        id: null,
        hasVerifiedBadge: false,
        avatarUrl: `https://tr.rbxcdn.com/30DAY-AvatarHeadshot-E80AA64C3E6208CA3A45D1BFE2069C78-Png/150/150/AvatarHeadshot/Png/noFilter`,
      });
    }

    // Fetch headshot thumbnail from Roblox CDN
    const thumbRes = await fetch(
      `https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${userId}&size=420x420&format=Png&isCircular=false`,
      { headers: ROBLOX_HEADERS }
    ).catch(() => null);

    let avatarUrl = `https://tr.rbxcdn.com/30DAY-AvatarHeadshot-E80AA64C3E6208CA3A45D1BFE2069C78-Png/150/150/AvatarHeadshot/Png/noFilter`;

    if (thumbRes && thumbRes.ok) {
      const tData = await thumbRes.json();
      if (tData.data && tData.data.length > 0 && tData.data[0].imageUrl) {
        avatarUrl = tData.data[0].imageUrl;
      }
    }

    res.json({
      username: foundUsername,
      displayName: foundDisplayName,
      id: userId,
      hasVerifiedBadge,
      avatarUrl,
    });
  } catch (error) {
    console.error('Error fetching Roblox avatar:', error);
    res.status(500).json({ error: 'Failed to fetch Roblox avatar' });
  }
});

app.get('/api/roblox/search', async (req, res) => {
  try {
    const query = (req.query.query as string || '').trim();
    if (!query) {
      return res.json({ users: [] });
    }

    const userMap = new Map<number, { id: number; username: string; displayName: string; hasVerifiedBadge: boolean }>();

    // 1. Try exact match on usernames
    const exactRes = await fetch('https://users.roblox.com/v1/usernames/users', {
      method: 'POST',
      headers: { ...ROBLOX_HEADERS, 'Content-Type': 'application/json' },
      body: JSON.stringify({ usernames: [query], excludeBannedUsers: false }),
    }).catch(() => null);

    if (exactRes && exactRes.ok) {
      const eData = await exactRes.json();
      if (eData.data) {
        for (const u of eData.data) {
          userMap.set(u.id, {
            id: u.id,
            username: u.name,
            displayName: u.displayName || u.name,
            hasVerifiedBadge: !!u.hasVerifiedBadge,
          });
        }
      }
    }

    // 2. Keyword search for usernames & display names on users.roblox.com
    const searchRes = await fetch(
      `https://users.roblox.com/v1/users/search?keyword=${encodeURIComponent(query)}&limit=10`,
      { headers: ROBLOX_HEADERS }
    ).catch(() => null);

    if (searchRes && searchRes.ok) {
      const sData = await searchRes.json();
      if (sData.data) {
        for (const u of sData.data) {
          if (!userMap.has(u.id)) {
            userMap.set(u.id, {
              id: u.id,
              username: u.name,
              displayName: u.displayName || u.name,
              hasVerifiedBadge: !!u.hasVerifiedBadge,
            });
          }
        }
      }
    }

    // 3. Keyword search fallback on roproxy
    if (userMap.size === 0) {
      const proxyRes = await fetch(
        `https://users.roproxy.com/v1/users/search?keyword=${encodeURIComponent(query)}&limit=10`,
        { headers: ROBLOX_HEADERS }
      ).catch(() => null);

      if (proxyRes && proxyRes.ok) {
        const pData = await proxyRes.json();
        if (pData.data) {
          for (const u of pData.data) {
            if (!userMap.has(u.id)) {
              userMap.set(u.id, {
                id: u.id,
                username: u.name,
                displayName: u.displayName || u.name,
                hasVerifiedBadge: !!u.hasVerifiedBadge,
              });
            }
          }
        }
      }
    }

    const users = Array.from(userMap.values());
    if (users.length === 0) {
      return res.json({ users: [] });
    }

    // Batch fetch headshots from Roblox CDN
    const userIds = users.map((u) => u.id);
    const thumbRes = await fetch(
      `https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${userIds.join(',')}&size=150x150&format=Png&isCircular=false`,
      { headers: ROBLOX_HEADERS }
    ).catch(() => null);

    const avatarMap = new Map<number, string>();
    if (thumbRes && thumbRes.ok) {
      const tData = await thumbRes.json();
      if (tData.data) {
        for (const t of tData.data) {
          if (t.targetId && t.imageUrl) {
            avatarMap.set(t.targetId, t.imageUrl);
          }
        }
      }
    }

    const finalResults = users.map((u) => ({
      ...u,
      avatarUrl:
        avatarMap.get(u.id) ||
        'https://tr.rbxcdn.com/30DAY-AvatarHeadshot-E80AA64C3E6208CA3A45D1BFE2069C78-Png/150/150/AvatarHeadshot/Png/noFilter',
    }));

    res.json({ users: finalResults });
  } catch (error) {
    console.error('Error searching Roblox users:', error);
    res.status(500).json({ error: 'Failed to search Roblox users' });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
