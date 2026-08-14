// Service for fetching authentic Roblox avatar headshots and searching users via Roblox public APIs & proxies

export interface RobloxUserSearchResult {
  id: number;
  username: string;
  displayName: string;
  hasVerifiedBadge: boolean;
  avatarUrl: string;
}

export interface RobloxUserInfo {
  username: string;
  displayName: string;
  id: number | null;
  hasVerifiedBadge: boolean;
  avatarUrl: string;
}

// In-memory & LocalStorage cache for fast instant rendering
const avatarCache = new Map<string, string>();
const infoCache = new Map<string, RobloxUserInfo>();

// Initialize cache from localStorage
try {
  const stored = localStorage.getItem('roblox_avatar_cache_v2');
  if (stored) {
    const parsed = JSON.parse(stored);
    Object.entries(parsed).forEach(([key, val]) => {
      if (typeof val === 'string' && val.startsWith('http')) {
        avatarCache.set(key.toLowerCase(), val);
      }
    });
  }
} catch {
  // Ignore storage errors
}

function saveAvatarToStorage(username: string, url: string) {
  if (!username || !url || !url.startsWith('http')) return;
  const key = username.toLowerCase();
  avatarCache.set(key, url);
  try {
    const current: Record<string, string> = {};
    let count = 0;
    avatarCache.forEach((v, k) => {
      if (count < 100) {
        current[k] = v;
        count++;
      }
    });
    localStorage.setItem('roblox_avatar_cache_v2', JSON.stringify(current));
  } catch {
    // Ignore storage quota errors
  }
}

// High quality verified Roblox headshots (Roblox official headshot CDN URLs & permanent direct image links)
const POPULAR_HEADSHOTS = [
  'https://www.roblox.com/headshot-thumbnail/image?userId=1&width=420&height=420&format=png',
  'https://www.roblox.com/headshot-thumbnail/image?userId=261&width=420&height=420&format=png',
  'https://www.roblox.com/headshot-thumbnail/image?userId=156&width=420&height=420&format=png',
  'https://www.roblox.com/headshot-thumbnail/image?userId=1619&width=420&height=420&format=png',
  'https://www.roblox.com/headshot-thumbnail/image?userId=123456&width=420&height=420&format=png',
  'https://www.roblox.com/headshot-thumbnail/image?userId=8765432&width=420&height=420&format=png',
];

export function getFallbackRobloxAvatar(username: string): string {
  if (!username) return POPULAR_HEADSHOTS[0];
  const hash = Math.abs(username.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0));
  return POPULAR_HEADSHOTS[hash % POPULAR_HEADSHOTS.length];
}

/**
 * Fetch full Roblox user info (ID, display name, verified badge, real headshot avatar)
 */
export async function fetchRobloxUserInfo(username: string): Promise<RobloxUserInfo> {
  const cleanUsername = username.trim();
  if (!cleanUsername) {
    return {
      username: 'FMLY_ALEKS',
      displayName: 'FMLY_ALEKS',
      id: null,
      hasVerifiedBadge: false,
      avatarUrl: getFallbackRobloxAvatar('FMLY_ALEKS'),
    };
  }

  const lower = cleanUsername.toLowerCase();
  if (infoCache.has(lower)) {
    return infoCache.get(lower)!;
  }

  // 1. Try local API proxy (Works in Vite dev, Express server, and Vercel serverless)
  try {
    const res = await fetch(`/api/roblox/avatar?username=${encodeURIComponent(cleanUsername)}`);
    if (res.ok) {
      const data = await res.json();
      if (data && data.avatarUrl && !data.avatarUrl.includes('error')) {
        const info: RobloxUserInfo = {
          username: data.username || cleanUsername,
          displayName: data.displayName || data.username || cleanUsername,
          id: data.id || null,
          hasVerifiedBadge: !!data.hasVerifiedBadge,
          avatarUrl: data.avatarUrl,
        };
        saveAvatarToStorage(cleanUsername, data.avatarUrl);
        if (data.username) saveAvatarToStorage(data.username, data.avatarUrl);
        infoCache.set(lower, info);
        return info;
      }
    }
  } catch (error) {
    console.warn(`Local API unavailable for ${cleanUsername}, falling back to direct resolution:`, error);
  }

  // 2. Direct client-side Roblox proxy via roproxy & public CORS endpoints (works on GitHub Pages & static hosting)
  try {
    const userRes = await fetch('https://users.roproxy.com/v1/usernames/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usernames: [cleanUsername], excludeBannedUsers: false }),
    });

    if (userRes.ok) {
      const uData = await userRes.json();
      if (uData.data && uData.data.length > 0) {
        const u = uData.data[0];
        const userId = u.id;
        const foundName = u.name;
        const foundDisplayName = u.displayName || u.name;
        const hasVerified = !!u.hasVerifiedBadge;

        // Fetch headshot thumbnail
        let avatarUrl = `https://www.roblox.com/headshot-thumbnail/image?userId=${userId}&width=420&height=420&format=png`;

        try {
          const thumbRes = await fetch(
            `https://thumbnails.roproxy.com/v1/users/avatar-headshot?userIds=${userId}&size=420x420&format=Png&isCircular=false`
          );
          if (thumbRes.ok) {
            const tData = await thumbRes.json();
            if (tData.data && tData.data.length > 0 && tData.data[0].imageUrl) {
              avatarUrl = tData.data[0].imageUrl;
            }
          }
        } catch {
          // Keep headshot thumbnail fallback
        }

        const info: RobloxUserInfo = {
          username: foundName,
          displayName: foundDisplayName,
          id: userId,
          hasVerifiedBadge: hasVerified,
          avatarUrl,
        };

        saveAvatarToStorage(cleanUsername, avatarUrl);
        saveAvatarToStorage(foundName, avatarUrl);
        infoCache.set(lower, info);
        return info;
      }
    }
  } catch (err) {
    console.warn(`Direct roproxy fetch failed for ${cleanUsername}:`, err);
  }

  // 3. Fallback search by keyword if exact username failed
  try {
    const searchRes = await fetch(`https://users.roproxy.com/v1/users/search?keyword=${encodeURIComponent(cleanUsername)}&limit=5`);
    if (searchRes.ok) {
      const sData = await searchRes.json();
      if (sData.data && sData.data.length > 0) {
        const u = sData.data.find(
          (item: any) =>
            item.name?.toLowerCase() === lower || item.displayName?.toLowerCase() === lower
        ) || sData.data[0];

        const avatarUrl = `https://www.roblox.com/headshot-thumbnail/image?userId=${u.id}&width=420&height=420&format=png`;
        const info: RobloxUserInfo = {
          username: u.name,
          displayName: u.displayName || u.name,
          id: u.id,
          hasVerifiedBadge: !!u.hasVerifiedBadge,
          avatarUrl,
        };

        saveAvatarToStorage(cleanUsername, avatarUrl);
        saveAvatarToStorage(u.name, avatarUrl);
        infoCache.set(lower, info);
        return info;
      }
    }
  } catch {
    // Ignore
  }

  // 4. Default graceful fallback
  const fallbackUrl = getFallbackRobloxAvatar(cleanUsername);
  return {
    username: cleanUsername,
    displayName: cleanUsername,
    id: null,
    hasVerifiedBadge: false,
    avatarUrl: fallbackUrl,
  };
}

/**
 * Fast resolution of avatar URL for any Roblox username
 */
export async function fetchRobloxAvatarUrl(username: string): Promise<string> {
  const clean = username.trim();
  if (!clean) return POPULAR_HEADSHOTS[0];

  const lower = clean.toLowerCase();

  // Return cached immediately if available
  if (avatarCache.has(lower)) {
    return avatarCache.get(lower)!;
  }

  try {
    const info = await fetchRobloxUserInfo(clean);
    if (info && info.avatarUrl) {
      return info.avatarUrl;
    }
  } catch (error) {
    console.warn(`Error fetching avatar URL for ${clean}:`, error);
  }

  return getFallbackRobloxAvatar(clean);
}

/**
 * Search all existing Roblox users with live avatars
 */
export async function searchRobloxUsers(query: string): Promise<RobloxUserSearchResult[]> {
  const cleanQuery = query.trim();
  if (!cleanQuery) return [];

  // 1. Try local server API
  try {
    const res = await fetch(`/api/roblox/search?query=${encodeURIComponent(cleanQuery)}`);
    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data.users) && data.users.length > 0) {
        for (const u of data.users) {
          if (u.username && u.avatarUrl) saveAvatarToStorage(u.username, u.avatarUrl);
          if (u.displayName && u.avatarUrl) saveAvatarToStorage(u.displayName, u.avatarUrl);
        }
        return data.users;
      }
    }
  } catch (err) {
    console.warn('Local search API failed, falling back to direct search:', err);
  }

  // 2. Direct roproxy search
  try {
    const searchRes = await fetch(
      `https://users.roproxy.com/v1/users/search?keyword=${encodeURIComponent(cleanQuery)}&limit=8`
    );

    if (searchRes.ok) {
      const data = await searchRes.json();
      if (data && Array.isArray(data.data) && data.data.length > 0) {
        const users: RobloxUserSearchResult[] = data.data.map((u: any) => {
          const avatarUrl = `https://www.roblox.com/headshot-thumbnail/image?userId=${u.id}&width=150&height=150&format=png`;
          saveAvatarToStorage(u.name, avatarUrl);
          return {
            id: u.id,
            username: u.name,
            displayName: u.displayName || u.name,
            hasVerifiedBadge: !!u.hasVerifiedBadge,
            avatarUrl,
          };
        });
        return users;
      }
    }
  } catch (err) {
    console.warn('Direct user search failed:', err);
  }

  return [];
}
