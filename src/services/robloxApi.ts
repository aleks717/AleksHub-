// Service for fetching authentic Roblox avatar headshots and searching users via Roblox public APIs
const avatarCache = new Map<string, string>();

// Real Roblox avatar headshots directly hosted on Roblox CDN (tr.rbxcdn.com)
const REAL_ROBLOX_CDN_AVATARS = [
  'https://tr.rbxcdn.com/30DAY-AvatarHeadshot-E80AA64C3E6208CA3A45D1BFE2069C78-Png/150/150/AvatarHeadshot/Png/noFilter',
  'https://tr.rbxcdn.com/30DAY-AvatarHeadshot-882C70E071E5997E51F8CB373002AFC3-Png/150/150/AvatarHeadshot/Png/noFilter',
  'https://tr.rbxcdn.com/30DAY-AvatarHeadshot-310966282D3529E36976BF6B07B1DC90-Png/150/150/AvatarHeadshot/Png/noFilter',
  'https://tr.rbxcdn.com/30DAY-AvatarHeadshot-66806183DAF483A57973BBE027B482B0-Png/150/150/AvatarHeadshot/Png/noFilter',
  'https://tr.rbxcdn.com/30DAY-AvatarHeadshot-ACCF91F734E311F4A0EF23C3EDA54284-Png/150/150/AvatarHeadshot/Png/noFilter',
  'https://tr.rbxcdn.com/30DAY-AvatarHeadshot-75E9BA6D5C4AEBB654423B3CF72651B1-Png/150/150/AvatarHeadshot/Png/noFilter',
  'https://tr.rbxcdn.com/30DAY-AvatarHeadshot-61F7E4CC6BCE73CBEA96F7E1F3A970E4-Png/150/150/AvatarHeadshot/Png/noFilter',
];

export function getFallbackRobloxAvatar(username: string): string {
  const hash = username.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return REAL_ROBLOX_CDN_AVATARS[Math.abs(hash) % REAL_ROBLOX_CDN_AVATARS.length];
}

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

export async function fetchRobloxUserInfo(username: string): Promise<RobloxUserInfo> {
  const cleanUsername = username.trim();
  if (!cleanUsername) {
    return {
      username: 'FMLY_ALEKS',
      displayName: 'FMLY_ALEKS',
      id: null,
      hasVerifiedBadge: false,
      avatarUrl: REAL_ROBLOX_CDN_AVATARS[0],
    };
  }

  try {
    const res = await fetch(`/api/roblox/avatar?username=${encodeURIComponent(cleanUsername)}`);
    if (res.ok) {
      const data = await res.json();
      if (data && data.avatarUrl) {
        avatarCache.set(cleanUsername.toLowerCase(), data.avatarUrl);
        if (data.username) avatarCache.set(data.username.toLowerCase(), data.avatarUrl);
        return {
          username: data.username || cleanUsername,
          displayName: data.displayName || data.username || cleanUsername,
          id: data.id || null,
          hasVerifiedBadge: !!data.hasVerifiedBadge,
          avatarUrl: data.avatarUrl,
        };
      }
    }
  } catch (error) {
    console.warn(`Could not fetch Roblox user info for ${cleanUsername}:`, error);
  }

  const fallbackUrl = getFallbackRobloxAvatar(cleanUsername);
  return {
    username: cleanUsername,
    displayName: cleanUsername,
    id: null,
    hasVerifiedBadge: false,
    avatarUrl: fallbackUrl,
  };
}

export async function fetchRobloxAvatarUrl(username: string): Promise<string> {
  const cleanUsername = username.trim();
  if (!cleanUsername) return REAL_ROBLOX_CDN_AVATARS[0];

  const lowerName = cleanUsername.toLowerCase();

  if (avatarCache.has(lowerName)) {
    return avatarCache.get(lowerName) || getFallbackRobloxAvatar(cleanUsername);
  }

  try {
    const res = await fetch(`/api/roblox/avatar?username=${encodeURIComponent(cleanUsername)}`);
    if (res.ok) {
      const data = await res.json();
      if (data && data.avatarUrl) {
        avatarCache.set(lowerName, data.avatarUrl);
        return data.avatarUrl;
      }
    }
  } catch (error) {
    console.warn(`Could not fetch Roblox avatar via API for ${cleanUsername}:`, error);
  }

  // Fallback to deterministic real Roblox avatar headshot from tr.rbxcdn.com
  const fallbackUrl = getFallbackRobloxAvatar(cleanUsername);
  avatarCache.set(lowerName, fallbackUrl);
  return fallbackUrl;
}

// Search all existing Roblox users directly via backend server API
export async function searchRobloxUsers(query: string): Promise<RobloxUserSearchResult[]> {
  const cleanQuery = query.trim();
  if (!cleanQuery) return [];

  try {
    const res = await fetch(`/api/roblox/search?query=${encodeURIComponent(cleanQuery)}`);
    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data.users)) {
        for (const u of data.users) {
          if (u.username && u.avatarUrl) {
            avatarCache.set(u.username.toLowerCase(), u.avatarUrl);
          }
          if (u.displayName && u.avatarUrl) {
            avatarCache.set(u.displayName.toLowerCase(), u.avatarUrl);
          }
        }
        return data.users;
      }
    }
  } catch (err) {
    console.warn('Error searching Roblox users via API:', err);
  }

  return [];
}


