// Made by loxqcx on Discord.
import { useMemo } from 'react';
import { Activity, ArrowUpRight, Eye, Gamepad2 } from 'lucide-react';
import PageHero from '../components/PageHero';
import { gamesConfig } from '../config/games';
import { siteConfig } from '../config/site';
import { formatGameStat, useGameStats } from '../hooks/useGameStats';

export default function PortfolioPage() {
  const live = useGameStats(gamesConfig.games, gamesConfig.refreshMs);
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
            <div><Activity size={19} /><strong>{formatGameStat(live.totals?.playing, loaded)}</strong><span>Playing now</span></div>
            <div><Eye size={19} /><strong>{formatGameStat(live.totals?.visits, loaded)}</strong><span>Total visits</span></div>
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
                  <span className="game-live-chip"><i /> {formatGameStat(game.stats?.playing, loaded)} live</span>
                </a>
                <div className="live-game-body">
                  <div className="live-game-heading">
                    <span>Game {String(index + 1).padStart(2, '0')}</span>
                    <h2>{game.name}</h2>
                  </div>
                  <p>{game.description}</p>
                  <div className="live-game-footer">
                    <div className="game-stat"><strong>{formatGameStat(game.stats?.playing, loaded)}</strong><span>Live CCU</span></div>
                    <div className="game-stat"><strong>{formatGameStat(game.stats?.visits, loaded)}</strong><span>Visits</span></div>
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
