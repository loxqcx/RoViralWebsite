// Made by loxqcx on Discord.
import { Activity, ArrowUpRight, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import PageHero from '../components/PageHero';
import { gamesConfig } from '../config/games';
import { siteConfig } from '../config/site';
import { formatGameStat, useGameStats } from '../hooks/useGameStats';

const caseStudyGames = gamesConfig.games.filter((game) => game.caseStudies === true);

export default function CaseStudiesPage() {
  const live = useGameStats(caseStudyGames, gamesConfig.refreshMs);
  const loaded = live.status === 'live';
  const statsByPlace = new Map(live.games.map((game) => [String(game.placeId), game]));
  const count = String(caseStudyGames.length).padStart(2, '0');

  return (
    <>
      <PageHero
        tone="dark"
        eyebrow={`Case studies / ${count}`}
        title={<>Success you can<br />see live.</>}
        body="The Roblox games where focused creative, community, and growth work turned attention into measurable momentum."
        aside="Player counts and lifetime visits are pulled directly from Roblox."
      />
      <section className="case-list section-pad">
        <div className="container">
          <div className="case-study-status">
            <div className={`live-status live-status--${live.status}`} aria-live="polite">
              <span className="live-status-dot" />
              <span>{loaded ? 'Live Roblox data' : live.status === 'error' ? 'Live stats temporarily unavailable' : 'Connecting to Roblox'}</span>
            </div>
            <span>{count} selected game{caseStudyGames.length === 1 ? '' : 's'}</span>
          </div>

          <div className="case-study-grid">
            {caseStudyGames.map((game, index) => {
              const stats = statsByPlace.get(String(game.placeId));

              return (
                <article className="live-case-study" key={game.placeId}>
                  <a className="case-study-media" href={game.robloxUrl} target="_blank" rel="noreferrer" aria-label={`Open ${game.name} on Roblox`}>
                    <img
                      src={game.thumbnail}
                      alt={`${game.name} Roblox game thumbnail`}
                      onError={(event) => {
                        event.currentTarget.onerror = null;
                        event.currentTarget.src = siteConfig.brand.heroImage;
                      }}
                    />
                    <span className="game-badge">Case study {String(index + 1).padStart(2, '0')}</span>
                    <span className="game-live-chip"><i /> {formatGameStat(stats?.playing, loaded)} live</span>
                  </a>

                  <div className="case-study-content">
                    <span className="case-study-kicker">Successful game / Live results</span>
                    <h2>{game.name}</h2>
                    <p>{game.description}</p>

                    <div className="case-study-stats">
                      <div><Activity size={18} /><strong>{formatGameStat(stats?.playing, loaded)}</strong><span>Current players</span></div>
                      <div><Eye size={18} /><strong>{formatGameStat(stats?.visits, loaded)}</strong><span>Lifetime visits</span></div>
                    </div>

                    <div className="case-study-actions">
                      <a className="button button--lime" href={game.robloxUrl} target="_blank" rel="noreferrer">View on Roblox <ArrowUpRight size={18} /></a>
                      <Link className="button button--outline" to="/contact">Start a project <ArrowUpRight size={18} /></Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          {caseStudyGames.length === 0 && (
            <div className="case-study-empty">
              <span>No case studies selected</span>
              <p>Enable a game in the games config to display it here.</p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
