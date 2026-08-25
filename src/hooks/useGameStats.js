// Made by loxqcx on Discord.
import { useEffect, useMemo, useState } from 'react';

const compactNumber = new Intl.NumberFormat('en-US', {
  notation: 'compact',
  maximumFractionDigits: 1,
});

export const formatGameStat = (value, loaded) => loaded ? compactNumber.format(Number(value) || 0) : '--';

export function useGameStats(games, refreshMs) {
  const [state, setState] = useState({ status: 'loading', games: [], totals: null, updatedAt: null });
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
        if (active) setState({ status: 'live', games: data.games || [], totals: data.totals || null, updatedAt: data.updatedAt || null });
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
