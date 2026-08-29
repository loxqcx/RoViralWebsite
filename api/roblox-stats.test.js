// Made by loxqcx on Discord.
import { describe, expect, it } from 'vitest';
import { fetchPortfolioStats, parsePlaceIds } from './roblox-stats';

describe('Roblox portfolio stats', () => {
  it('accepts unique numeric place IDs only', () => {
    expect(parsePlaceIds('123, bad,456,123')).toEqual(['123', '456']);
  });

  it('maps universe stats back to their place IDs', async () => {
    const responses = new Map([
      ['https://apis.roblox.com/universes/v1/places/123/universe', { universeId: 9001 }],
      ['https://apis.roblox.com/universes/v1/places/456/universe', { universeId: 9002 }],
      ['https://games.roblox.com/v1/games?universeIds=9001,9002', { data: [
        { id: 9001, name: 'One', playing: 12, visits: 1200 },
        { id: 9002, name: 'Two', playing: 8, visits: 800 },
      ] }],
    ]);
    const fetchMock = async (url) => {
      if (url.startsWith('https://thumbnails.roblox.com/v1/games/multiget/thumbnails?')) {
        return { ok: true, json: async () => ({ data: [
          { universeId: 9001, thumbnails: [
            { state: 'Completed', imageUrl: 'https://tr.rbxcdn.com/one.webp' },
            { state: 'Pending', imageUrl: 'https://tr.rbxcdn.com/pending.webp' },
          ] },
          { universeId: 9002, thumbnails: [{ state: 'Completed', imageUrl: 'https://tr.rbxcdn.com/two.webp' }] },
        ] }) };
      }
      return { ok: responses.has(url), json: async () => responses.get(url) };
    };
    const result = await fetchPortfolioStats(['123', '456'], fetchMock);
    expect(result.games[0]).toMatchObject({
      placeId: '123',
      playing: 12,
      visits: 1200,
      thumbnailUrls: ['https://tr.rbxcdn.com/one.webp'],
    });
    expect(result.totals).toEqual({ playing: 20, visits: 2000, games: 2 });
  });
});
