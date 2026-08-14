import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

app.use(express.json());

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
