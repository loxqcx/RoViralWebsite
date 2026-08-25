// Made by loxqcx on Discord.
import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import PageHero from '../components/PageHero';
import GraphicPanel from '../components/GraphicPanel';
import { siteConfig } from '../config/site';

export default function CaseStudiesPage() {
  return (
    <>
      <PageHero tone="dark" eyebrow="Case studies / 03" title={<>The work behind<br />the numbers.</>} body="A closer look at how strategy, creative, and community systems combine to move real game metrics." />
      <section className="case-list section-pad">
        <div className="container">
          {siteConfig.caseStudies.map((study, index) => (
            <article className="case-study" key={study.client}>
              <GraphicPanel item={siteConfig.portfolio[index]} />
              <div className="case-copy">
                <span>{study.number} / {study.client}</span>
                <h2>{study.headline}</h2>
                <p>{study.summary}</p>
                <div className="case-tags">{study.services.map((service) => <i key={service}>{service}</i>)}</div>
              </div>
              <div className="case-metric"><strong>{study.metric}</strong><span>{study.metricLabel}</span></div>
            </article>
          ))}
          <Link className="button button--dark case-cta" to="/contact">Build the next case study <ArrowUpRight size={18} /></Link>
        </div>
      </section>
    </>
  );
}
