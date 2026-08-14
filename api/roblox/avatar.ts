const ROBLOX_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'application/json',
};

export default async function handler(req: any, res: any) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

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
    try {
      const exactRes = await fetch('https://users.roblox.com/v1/usernames/users', {
        method: 'POST',
        headers: { ...ROBLOX_HEADERS, 'Content-Type': 'application/json' },
        body: JSON.stringify({ usernames: [username], excludeBannedUsers: false }),
      });

      if (exactRes.ok) {
        const eData = await exactRes.json();
        if (eData.data && eData.data.length > 0) {
          userId = eData.data[0].id;
          foundUsername = eData.data[0].name;
          foundDisplayName = eData.data[0].displayName || eData.data[0].name;
          hasVerifiedBadge = !!eData.data[0].hasVerifiedBadge;
        }
      }
    } catch {
      // Continue to next method
    }

    // 2. If exact not found, try search keyword (handles Display Names)
    if (!userId) {
      try {
        const searchRes = await fetch(
          `https://users.roblox.com/v1/users/search?keyword=${encodeURIComponent(username)}&limit=10`,
          { headers: ROBLOX_HEADERS }
        );

        if (searchRes.ok) {
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
      } catch {
        // Continue to roproxy fallback
      }
    }

    // 3. Fallback to roproxy
    if (!userId) {
      try {
        const proxyRes = await fetch(
          `https://users.roproxy.com/v1/users/search?keyword=${encodeURIComponent(username)}&limit=10`,
          { headers: ROBLOX_HEADERS }
        );

        if (proxyRes.ok) {
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
      } catch {
        // Ignore
      }
    }

    if (!userId) {
      return res.status(200).json({
        username,
        displayName: username,
        id: null,
        hasVerifiedBadge: false,
        avatarUrl: `https://www.roblox.com/headshot-thumbnail/image?userId=1&width=420&height=420&format=png`,
      });
    }

    // 4. Fetch headshot thumbnail
    let avatarUrl = '';
    try {
      const thumbRes = await fetch(
        `https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${userId}&size=420x420&format=Png&isCircular=false`,
        { headers: ROBLOX_HEADERS }
      );

      if (thumbRes.ok) {
        const tData = await thumbRes.json();
        if (tData.data && tData.data.length > 0 && tData.data[0].imageUrl) {
          avatarUrl = tData.data[0].imageUrl;
        }
      }
    } catch {
      // Fallback
    }

    if (!avatarUrl) {
      try {
        const proxyThumb = await fetch(
          `https://thumbnails.roproxy.com/v1/users/avatar-headshot?userIds=${userId}&size=420x420&format=Png&isCircular=false`,
          { headers: ROBLOX_HEADERS }
        );
        if (proxyThumb.ok) {
          const ptData = await proxyThumb.json();
          if (ptData.data && ptData.data.length > 0 && ptData.data[0].imageUrl) {
            avatarUrl = ptData.data[0].imageUrl;
          }
        }
      } catch {
        // Ignore
      }
    }

    if (!avatarUrl) {
      avatarUrl = `https://www.roblox.com/headshot-thumbnail/image?userId=${userId}&width=420&height=420&format=png`;
    }

    return res.status(200).json({
      username: foundUsername,
      displayName: foundDisplayName,
      id: userId,
      hasVerifiedBadge,
      avatarUrl,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error?.message || 'Failed to fetch Roblox avatar' });
  }
}
