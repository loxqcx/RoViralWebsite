// Made by loxqcx on Discord.
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
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

export default defineConfig({
  plugins: [react(), localRobloxStats],
});
