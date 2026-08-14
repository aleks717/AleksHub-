import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, Plugin } from 'vite';

function robloxAvatarPlugin(): Plugin {
  return {
    name: 'roblox-avatar-middleware',
    configureServer(server) {
      server.middlewares.use('/api/roblox-avatar', async (req, res) => {
        try {
          const reqUrl = new URL(req.url || '', 'http://localhost');
          const username = reqUrl.searchParams.get('username');

          if (!username) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify({ error: 'Username parameter is required' }));
          }

          // 1. Get user ID from Roblox Users API
          const userRes = await fetch('https://users.roblox.com/v1/usernames/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ usernames: [username.trim()], excludeBannedUsers: false }),
          });

          if (!userRes.ok) {
            res.statusCode = userRes.status;
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify({ error: 'Failed to contact Roblox users API' }));
          }

          const userData = await userRes.json();
          if (!userData.data || userData.data.length === 0) {
            res.statusCode = 404;
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify({ error: 'Roblox user not found' }));
          }

          const userId = userData.data[0].id;

          // 2. Fetch thumbnail from Roblox Thumbnails API
          const thumbRes = await fetch(
            `https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${userId}&size=150x150&format=Png&isCircular=false`
          );

          if (!thumbRes.ok) {
            res.statusCode = thumbRes.status;
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify({ error: 'Failed to contact Roblox thumbnails API' }));
          }

          const thumbData = await thumbRes.json();
          if (thumbData.data && thumbData.data.length > 0 && thumbData.data[0].imageUrl) {
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify({
              userId,
              username: userData.data[0].name,
              displayName: userData.data[0].displayName,
              imageUrl: thumbData.data[0].imageUrl,
            }));
          }

          res.statusCode = 404;
          res.setHeader('Content-Type', 'application/json');
          return res.end(JSON.stringify({ error: 'Thumbnail not found' }));
        } catch (error) {
          console.error('Roblox avatar proxy error:', error);
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          return res.end(JSON.stringify({ error: 'Internal server error' }));
        }
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
