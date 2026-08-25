// Made by loxqcx on Discord.
import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import PageHero from '../components/PageHero';
import { aboutPageConfig } from '../config/about';

export default function AboutPage() {
  return (
    <>
      <PageHero {...aboutPageConfig.hero} />
      <section className="manifesto section-pad">
        <div className="container manifesto-grid">
          <p className="eyebrow">{aboutPageConfig.manifesto.eyebrow}</p>
          <div>
            <h2>{aboutPageConfig.manifesto.title}</h2>
            <p>{aboutPageConfig.manifesto.body}</p>
          </div>
        </div>
        <div className="container values-grid">
          {aboutPageConfig.values.map((value) => (
            <article key={value.number}><span>{value.number}</span><h3>{value.title}</h3><p>{value.body}</p></article>
          ))}
        </div>
      </section>
      <section className="about-team-cta">
        <div className="container">
          <h2>{aboutPageConfig.cta.title[0]}<br />{aboutPageConfig.cta.title[1]}</h2>
          <Link className="button button--lime" to={aboutPageConfig.cta.path}>{aboutPageConfig.cta.label} <ArrowUpRight size={18} /></Link>
        </div>
      </section>
    </>
  );
}
