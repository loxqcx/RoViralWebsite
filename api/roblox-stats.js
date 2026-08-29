// Made by loxqcx on Discord.
const MAX_PLACE_IDS = 50;
const THUMBNAIL_SIZE = '768x432';

export function parsePlaceIds(value) {
  const raw = Array.isArray(value) ? value.join(',') : String(value || '');
  return [...new Set(raw.split(',').map((id) => id.trim()).filter((id) => /^\d{1,20}$/.test(id)))].slice(0, MAX_PLACE_IDS);
}

async function getUniverseId(placeId, fetchImpl) {
  try {
    const response = await fetchImpl(`https://apis.roblox.com/universes/v1/places/${placeId}/universe`);
    if (!response.ok) return { placeId, universeId: null };
    const data = await response.json();
    return { placeId, universeId: data.universeId ? String(data.universeId) : null };
  } catch {
    return { placeId, universeId: null };
  }
}

export async function fetchPortfolioStats(placeIds, fetchImpl = fetch) {
  const universeLookups = await Promise.all(placeIds.map((placeId) => getUniverseId(placeId, fetchImpl)));
  const universeIds = universeLookups.map(({ universeId }) => universeId).filter(Boolean);

  let gamesByUniverse = new Map();
  let thumbnailsByUniverse = new Map();
  if (universeIds.length) {
    const response = await fetchImpl(`https://games.roblox.com/v1/games?universeIds=${universeIds.join(',')}`);
    if (!response.ok) throw new Error('Roblox games API request failed.');
    const payload = await response.json();
    gamesByUniverse = new Map((payload.data || []).map((game) => [String(game.id), game]));

    try {
      const thumbnailParams = new URLSearchParams({
        universeIds: universeIds.join(','),
        countPerUniverse: '10',
        defaults: 'true',
        size: THUMBNAIL_SIZE,
        format: 'Webp',
        isCircular: 'false',
      });
      const thumbnailResponse = await fetchImpl(`https://thumbnails.roblox.com/v1/games/multiget/thumbnails?${thumbnailParams}`);
      if (thumbnailResponse.ok) {
        const thumbnailPayload = await thumbnailResponse.json();
        thumbnailsByUniverse = new Map((thumbnailPayload.data || []).map((entry) => [
          String(entry.universeId),
          [...new Set((entry.thumbnails || [])
            .filter((thumbnail) => thumbnail.state === 'Completed' && thumbnail.imageUrl)
            .map((thumbnail) => thumbnail.imageUrl))],
        ]));
      }
    } catch {
      // Live stats remain available when Roblox's thumbnail service is unavailable.
    }
  }

  const games = universeLookups.map(({ placeId, universeId }) => {
    const game = universeId ? gamesByUniverse.get(universeId) : null;
    return {
      placeId,
      universeId,
      name: game?.name || null,
      playing: Number(game?.playing) || 0,
      visits: Number(game?.visits) || 0,
      thumbnailUrls: universeId ? thumbnailsByUniverse.get(universeId) || [] : [],
    };
  });

  const totals = games.reduce((result, game) => ({
    playing: result.playing + game.playing,
    visits: result.visits + game.visits,
    games: result.games + 1,
  }), { playing: 0, visits: 0, games: 0 });

  return { games, totals, updatedAt: new Date().toISOString() };
}

export default async function handler(request, response) {
  if (request.method !== 'GET') {
    response.setHeader('Allow', 'GET');
    return response.status(405).json({ error: 'Method not allowed.' });
  }

  const placeIds = parsePlaceIds(request.query?.placeIds);
  if (!placeIds.length) return response.status(400).json({ error: 'Provide at least one valid place ID.' });

  try {
    const data = await fetchPortfolioStats(placeIds);
    response.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=90');
    return response.status(200).json(data);
  } catch (error) {
    console.error('Roblox portfolio stats failed.', error);
    return response.status(502).json({ error: 'Live Roblox stats are temporarily unavailable.' });
  }
}
