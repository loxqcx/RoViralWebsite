// Made by loxqcx on Discord.
import { useEffect, useMemo, useState } from 'react';
import { Activity, ArrowUpRight, Eye, Gamepad2 } from 'lucide-react';
import PageHero from '../components/PageHero';
import { gamesConfig } from '../config/games';
import { siteConfig } from '../config/site';

const compactNumber = new Intl.NumberFormat('en-US', {
  notation: 'compact',
  maximumFractionDigits: 1,
});

const formatStat = (value, loaded) => loaded ? compactNumber.format(Number(value) || 0) : '--';

function usePortfolioStats() {
  const [state, setState] = useState({ status: 'loading', games: [], totals: null, updatedAt: null });
  const placeIds = useMemo(() => gamesConfig.games.map((game) => game.placeId).join(','), []);

  useEffect(() => {
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
    const timer = window.setInterval(load, gamesConfig.refreshMs);
    return () => {
      active = false;
      controller?.abort();
      window.clearInterval(timer);
    };
  }, [placeIds]);

  return state;
}

export default function PortfolioPage() {
  const live = usePortfolioStats();
  const loaded = live.status === 'live';
  const statsByPlace = useMemo(() => new Map(live.games.map((game) => [String(game.placeId), game])), [live.games]);
  const games = useMemo(() => {
    const configured = gamesConfig.games.map((game) => ({ ...game, stats: statsByPlace.get(String(game.placeId)) }));
    return gamesConfig.sortBy === 'ccu' && loaded
      ? configured.sort((a, b) => (b.stats?.playing || 0) - (a.stats?.playing || 0))
      : configured;
  }, [loaded, statsByPlace]);

  const statusCopy = live.status === 'live'
    ? `Live / refreshed ${new Date(live.updatedAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`
    : live.status === 'error' ? 'Live stats temporarily unavailable' : 'Connecting to Roblox';

  return (
    <>
      <PageHero
        tone="dark"
        eyebrow="Game portfolio / Live data"
        title={<>Games built<br />to keep moving.</>}
        body="A live view of the Roblox experiences in our portfolio, with current players and lifetime visits pulled directly from Roblox."
        aside="Stats refresh automatically every 60 seconds."
      />
      <section className="live-portfolio section-pad">
        <div className="container">
          <div className="portfolio-status-bar">
            <div className={`live-status live-status--${live.status}`} aria-live="polite">
              <span className="live-status-dot" />
              <span>{statusCopy}</span>
            </div>
            <span>Sorted by current players</span>
          </div>

          <div className="portfolio-totals">
            <div><Activity size={19} /><strong>{formatStat(live.totals?.playing, loaded)}</strong><span>Playing now</span></div>
            <div><Eye size={19} /><strong>{formatStat(live.totals?.visits, loaded)}</strong><span>Total visits</span></div>
            <div><Gamepad2 size={19} /><strong>{gamesConfig.games.length}</strong><span>Games tracked</span></div>
          </div>

          <div className="live-games-grid">
            {games.map((game, index) => (
              <article className="live-game-card" key={game.placeId}>
                <a className="live-game-media" href={game.robloxUrl} target="_blank" rel="noreferrer" aria-label={`Open ${game.name} on Roblox`}>
                  <img
                    src={game.thumbnail}
                    alt={`${game.name} Roblox game thumbnail`}
                    loading={index < 2 ? 'eager' : 'lazy'}
                    onError={(event) => {
                      event.currentTarget.onerror = null;
                      event.currentTarget.src = siteConfig.brand.heroImage;
                    }}
                  />
                  {game.badge && <span className="game-badge">{game.badge}</span>}
                  <span className="game-live-chip"><i /> {formatStat(game.stats?.playing, loaded)} live</span>
                </a>
                <div className="live-game-body">
                  <div className="live-game-heading">
                    <span>Game {String(index + 1).padStart(2, '0')}</span>
                    <h2>{game.name}</h2>
                  </div>
                  <p>{game.description}</p>
                  <div className="live-game-footer">
                    <div className="game-stat"><strong>{formatStat(game.stats?.playing, loaded)}</strong><span>Live CCU</span></div>
                    <div className="game-stat"><strong>{formatStat(game.stats?.visits, loaded)}</strong><span>Visits</span></div>
                    <a className="game-play-link" href={game.robloxUrl} target="_blank" rel="noreferrer" aria-label={`Play ${game.name} on Roblox`} title="Open on Roblox">
                      <ArrowUpRight size={22} />
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
