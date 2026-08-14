const ROBLOX_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'application/json',
};

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const query = (req.query.query as string || '').trim();
    if (!query) {
      return res.status(200).json({ users: [] });
    }

    const userMap = new Map<number, { id: number; username: string; displayName: string; hasVerifiedBadge: boolean }>();

    // 1. Exact match
    try {
      const exactRes = await fetch('https://users.roblox.com/v1/usernames/users', {
        method: 'POST',
        headers: { ...ROBLOX_HEADERS, 'Content-Type': 'application/json' },
        body: JSON.stringify({ usernames: [query], excludeBannedUsers: false }),
      });

      if (exactRes.ok) {
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
    } catch {
      // Continue
    }

    // 2. Keyword search
    try {
      const searchRes = await fetch(
        `https://users.roblox.com/v1/users/search?keyword=${encodeURIComponent(query)}&limit=10`,
        { headers: ROBLOX_HEADERS }
      );

      if (searchRes.ok) {
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
    } catch {
      // Continue
    }

    const users = Array.from(userMap.values());
    if (users.length === 0) {
      return res.status(200).json({ users: [] });
    }

    // Fetch avatar thumbnails
    const userIds = users.map((u) => u.id).slice(0, 15).join(',');
    const thumbMap = new Map<number, string>();

    try {
      const thumbRes = await fetch(
        `https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${userIds}&size=150x150&format=Png&isCircular=false`,
        { headers: ROBLOX_HEADERS }
      );

      if (thumbRes.ok) {
        const tData = await thumbRes.json();
        if (tData.data) {
          for (const t of tData.data) {
            if (t.imageUrl) thumbMap.set(t.targetId, t.imageUrl);
          }
        }
      }
    } catch {
      // Continue
    }

    const enriched = users.map((u) => ({
      ...u,
      avatarUrl: thumbMap.get(u.id) || `https://www.roblox.com/headshot-thumbnail/image?userId=${u.id}&width=150&height=150&format=png`,
    }));

    return res.status(200).json({ users: enriched });
  } catch (error: any) {
    return res.status(500).json({ error: error?.message || 'Failed to search Roblox users' });
  }
}
