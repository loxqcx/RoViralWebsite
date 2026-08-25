// Made by loxqcx on Discord.
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { fetchDiscordProfiles, parseDiscordUserIds } from './api/discord-users.js';
import { fetchPortfolioStats, parsePlaceIds } from './api/roblox-stats.js';

const localRobloxStats = {
  name: 'local-roblox-stats',
  configureServer(server) {
    server.middlewares.use('/api/roblox-stats', async (request, response) => {
      const url = new URL(request.url || '', 'http://localhost');
      const placeIds = parsePlaceIds(url.searchParams.get('placeIds'));
      response.setHeader('Content-Type', 'application/json');
      if (!placeIds.length) {
        response.statusCode = 400;
        response.end(JSON.stringify({ error: 'Provide at least one valid place ID.' }));
        return;
      }
      try {
        response.end(JSON.stringify(await fetchPortfolioStats(placeIds)));
      } catch {
        response.statusCode = 502;
        response.end(JSON.stringify({ error: 'Live Roblox stats are temporarily unavailable.' }));
      }
    });
  },
};

const localDiscordProfiles = (token) => ({
  name: 'local-discord-profiles',
  configureServer(server) {
    server.middlewares.use('/api/discord-users', async (request, response) => {
      const url = new URL(request.url || '', 'http://localhost');
      const userIds = parseDiscordUserIds(url.searchParams.get('ids'));
      response.setHeader('Content-Type', 'application/json');
      if (!userIds.length) {
        response.statusCode = 400;
        response.end(JSON.stringify({ error: 'Provide at least one valid Discord user ID.' }));
        return;
      }
      if (!token) {
        response.end(JSON.stringify({
          profiles: userIds.map((id) => ({ id, available: false })),
          configured: false,
        }));
        return;
      }
      try {
        response.end(JSON.stringify(await fetchDiscordProfiles(userIds, token)));
      } catch {
        response.statusCode = 502;
        response.end(JSON.stringify({ error: 'Discord profiles are temporarily unavailable.' }));
      }
    });
  },
});

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return { plugins: [react(), localRobloxStats, localDiscordProfiles(env.DISCORD_BOT_TOKEN)] };
});
