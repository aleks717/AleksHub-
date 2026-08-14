import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, Plugin } from 'vite';

function robloxAvatarPlugin(): Plugin {
  return {
    name: 'roblox-avatar-middleware',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url || '';
        if (url.startsWith('/api/roblox/avatar') || url.startsWith('/api/roblox-avatar')) {
          try {
            const reqUrl = new URL(url, 'http://localhost');
            const username = reqUrl.searchParams.get('username');

            if (!username) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              return res.end(JSON.stringify({ error: 'Username parameter is required' }));
            }

            // 1. Get user ID from Roblox Users API
            let userId: number | null = null;
            let foundName = username.trim();
            let foundDisplay = username.trim();
            let hasVerifiedBadge = false;

            try {
              const userRes = await fetch('https://users.roblox.com/v1/usernames/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ usernames: [username.trim()], excludeBannedUsers: false }),
              });

              if (userRes.ok) {
                const userData = await userRes.json();
                if (userData.data && userData.data.length > 0) {
                  userId = userData.data[0].id;
                  foundName = userData.data[0].name;
                  foundDisplay = userData.data[0].displayName || userData.data[0].name;
                  hasVerifiedBadge = !!userData.data[0].hasVerifiedBadge;
                }
              }
            } catch {
              // Ignore
            }

            if (!userId) {
              const searchRes = await fetch(`https://users.roblox.com/v1/users/search?keyword=${encodeURIComponent(username.trim())}&limit=5`).catch(() => null);
              if (searchRes && searchRes.ok) {
                const sData = await searchRes.json();
                if (sData.data && sData.data.length > 0) {
                  userId = sData.data[0].id;
                  foundName = sData.data[0].name;
                  foundDisplay = sData.data[0].displayName || sData.data[0].name;
                  hasVerifiedBadge = !!sData.data[0].hasVerifiedBadge;
                }
              }
            }

            if (!userId) {
              res.setHeader('Content-Type', 'application/json');
              return res.end(JSON.stringify({
                username,
                displayName: username,
                id: null,
                hasVerifiedBadge: false,
                avatarUrl: `https://www.roblox.com/headshot-thumbnail/image?userId=1&width=420&height=420&format=png`,
              }));
            }

            // 2. Fetch thumbnail from Roblox Thumbnails API
            let avatarUrl = `https://www.roblox.com/headshot-thumbnail/image?userId=${userId}&width=420&height=420&format=png`;
            try {
              const thumbRes = await fetch(
                `https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${userId}&size=420x420&format=Png&isCircular=false`
              );
              if (thumbRes.ok) {
                const thumbData = await thumbRes.json();
                if (thumbData.data && thumbData.data.length > 0 && thumbData.data[0].imageUrl) {
                  avatarUrl = thumbData.data[0].imageUrl;
                }
              }
            } catch {
              // Keep direct headshot url
            }

            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify({
              userId,
              id: userId,
              username: foundName,
              displayName: foundDisplay,
              hasVerifiedBadge,
              imageUrl: avatarUrl,
              avatarUrl,
            }));
          } catch (error) {
            console.error('Roblox avatar proxy error:', error);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify({ error: 'Internal server error' }));
          }
        }

        if (url.startsWith('/api/roblox/search')) {
          try {
            const reqUrl = new URL(url, 'http://localhost');
            const query = reqUrl.searchParams.get('query') || '';
            const searchRes = await fetch(`https://users.roblox.com/v1/users/search?keyword=${encodeURIComponent(query)}&limit=10`).catch(() => null);
            if (searchRes && searchRes.ok) {
              const sData = await searchRes.json();
              const users = (sData.data || []).map((u: any) => ({
                id: u.id,
                username: u.name,
                displayName: u.displayName || u.name,
                hasVerifiedBadge: !!u.hasVerifiedBadge,
                avatarUrl: `https://www.roblox.com/headshot-thumbnail/image?userId=${u.id}&width=150&height=150&format=png`,
              }));
              res.setHeader('Content-Type', 'application/json');
              return res.end(JSON.stringify({ users }));
            }
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify({ users: [] }));
          } catch {
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify({ users: [] }));
          }
        }

        next();
      });
    },
  };
}

export default defineConfig(() => {
  return {
    base: './',
    plugins: [react(), tailwindcss(), robloxAvatarPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      proxy: {
        '/api/roblox-users': {
          target: 'https://users.roblox.com',
          changeOrigin: true,
          rewrite: (p) => p.replace(/^\/api\/roblox-users/, ''),
        },
        '/api/roblox-thumbs': {
          target: 'https://thumbnails.roblox.com',
          changeOrigin: true,
          rewrite: (p) => p.replace(/^\/api\/roblox-thumbs/, ''),
        },
      },
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
