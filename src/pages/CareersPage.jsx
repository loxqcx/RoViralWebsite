// Made by loxqcx on Discord.
import { ArrowUpRight } from 'lucide-react';
import PageHero from '../components/PageHero';
import { brandConfig } from '../config/brand';
import { careersPageConfig } from '../config/careers';

export default function CareersPage() {
  return (
    <>
      <PageHero tone="dark" {...careersPageConfig.hero} />
      <section className="careers-list section-pad">
        <div className="container">
          {careersPageConfig.roles.map((role) => (
            <article className="career-row" key={role.title}>
              <span className="career-icon" aria-hidden="true"><img src={role.icon} alt="" /></span>
              <div><h2>{role.title}</h2><p>{role.description}</p></div>
              <div className="role-skills">{role.skills.map((skill) => <i key={skill}>{skill}</i>)}</div>
              <div><small>{role.type}</small><a className="career-apply" href={brandConfig.discordUrl} target="_blank" rel="noreferrer">{careersPageConfig.applyLabel} <ArrowUpRight size={17} /></a></div>
            </article>
          ))}
          <div className="career-note"><strong>{careersPageConfig.note.title}</strong><p>{careersPageConfig.note.body}</p></div>
        </div>
      </section>
    </>
  );
}
