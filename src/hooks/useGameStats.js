// Made by loxqcx on Discord.
import { useEffect, useMemo, useRef, useState } from 'react';
import { chooseRotatingThumbnail } from '../utils/gameThumbnails';

const compactNumber = new Intl.NumberFormat('en-US', {
  notation: 'compact',
  maximumFractionDigits: 1,
});

export const formatGameStat = (value, loaded) => loaded ? compactNumber.format(Number(value) || 0) : '--';

export function useGameStats(games, refreshMs) {
  const [state, setState] = useState({ status: 'loading', games: [], totals: null, updatedAt: null });
  const selectedThumbnails = useRef(new Map());
  const placeIds = useMemo(() => games.map((game) => game.placeId).join(','), [games]);

  useEffect(() => {
    if (!placeIds) {
      setState({ status: 'idle', games: [], totals: { playing: 0, visits: 0, games: 0 }, updatedAt: null });
      return undefined;
    }

    let active = true;
    let controller;

    const load = async () => {
      controller?.abort();
      controller = new AbortController();

      try {
        const response = await fetch(`/api/roblox-stats?placeIds=${encodeURIComponent(placeIds)}`, { signal: controller.signal });
        if (!response.ok) throw new Error('Stats request failed.');
        const data = await response.json();
        const resolvedGames = (data.games || []).map((game) => {
          const existing = selectedThumbnails.current.get(String(game.placeId));
          if (existing && game.thumbnailUrls?.includes(existing)) return { ...game, thumbnail: existing };

          const storageKey = `roviral-game-thumbnail-${game.placeId}`;
          let previous = '';
          try { previous = window.localStorage.getItem(storageKey) || ''; } catch { /* Storage can be disabled. */ }
          const thumbnail = chooseRotatingThumbnail(game.thumbnailUrls, previous);
          selectedThumbnails.current.set(String(game.placeId), thumbnail);
          try { if (thumbnail) window.localStorage.setItem(storageKey, thumbnail); } catch { /* Storage can be disabled. */ }
          return { ...game, thumbnail };
        });
        if (active) setState({
          status: 'live',
          games: resolvedGames,
          totals: data.totals || null,
          updatedAt: data.updatedAt || null,
        });
      } catch (error) {
        if (active && error.name !== 'AbortError') setState((current) => ({ ...current, status: 'error' }));
      }
    };

    load();
    const timer = window.setInterval(load, refreshMs);

    return () => {
      active = false;
      controller?.abort();
      window.clearInterval(timer);
    };
  }, [placeIds, refreshMs]);

  return state;
}
