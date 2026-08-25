// Made by loxqcx on Discord.
import PageHero from '../components/PageHero';
import { siteConfig } from '../config/site';

export default function TeamPage() {
  return (
    <>
      <PageHero eyebrow="Our team / Small by design" title={<>Game people.<br />Growth discipline.</>} body="A senior, hands-on team that understands both the culture around Roblox and the operational detail behind consistent marketing." />
      <section className="team-section section-pad">
        <div className="container team-grid">
          {siteConfig.team.map((person, index) => (
            <article className={`team-card accent-${person.accent}`} key={person.name}>
              <div className="team-portrait">
                <span>{person.initials}</span>
                <i>0{index + 1}</i>
              </div>
              <h2>{person.name}</h2>
              <strong>{person.role}</strong>
              <p>{person.bio}</p>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
