// Made by loxqcx on Discord.
import PageHero from '../components/PageHero';
import { teamPageConfig } from '../config/team';

export default function TeamPage() {
  return (
    <>
      <PageHero {...teamPageConfig.hero} />
      <section className="team-section section-pad">
        <div className="container team-grid">
          {teamPageConfig.members.map((person, index) => (
            <article className={`team-card accent-${person.accent}`} key={person.name}>
              <div className="team-portrait">
                <span>{person.initials}</span>
                <i>{String(index + 1).padStart(2, '0')}</i>
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
