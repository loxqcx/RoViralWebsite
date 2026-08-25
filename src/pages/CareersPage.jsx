// Made by loxqcx on Discord.
import { ArrowUpRight } from 'lucide-react';
import PageHero from '../components/PageHero';
import { siteConfig } from '../config/site';

export default function CareersPage() {
  return (
    <>
      <PageHero tone="dark" eyebrow="Careers / Remote" title={<>Make the internet<br />care about games.</>} body="We're building a small network of editors, content creator managers, and clippers with sharp taste and zero fear of iteration." aside="Contract-first. Remote. Portfolio over credentials." />
      <section className="careers-list section-pad">
        <div className="container">
          {siteConfig.careers.map((role, index) => (
            <article className="career-row" key={role.title}>
              <span>0{index + 1}</span>
              <div><h2>{role.title}</h2><p>{role.description}</p></div>
              <div className="role-skills">{role.skills.map((skill) => <i key={skill}>{skill}</i>)}</div>
              <div><small>{role.type}</small><a className="career-apply" href={siteConfig.brand.discordUrl} target="_blank" rel="noreferrer">Apply now <ArrowUpRight size={17} /></a></div>
            </article>
          ))}
          <div className="career-note"><strong>Don't see your exact role?</strong><p>Join the Discord and send a tight intro with your best work. We keep a short list of people worth calling when the right project arrives.</p></div>
        </div>
      </section>
    </>
  );
}
