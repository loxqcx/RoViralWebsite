// Made by loxqcx on Discord.
import { ArrowUpRight, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import PageHero from '../components/PageHero';
import { siteConfig } from '../config/site';

export default function ServicesPage() {
  return (
    <>
      <PageHero eyebrow="Services / 06" title={<>From first view<br />to daily player.</>} body="Acquisition only works when the promise, content, and community reinforce each other. Our services are designed as one connected growth system." aside="Available as focused sprints or ongoing partnerships." />
      <section className="services-page section-pad">
        <div className="container service-detail-list">
          {siteConfig.services.map((service) => (
            <article className={`service-detail accent-${service.accent}`} key={service.id}>
              <div className="service-detail-number">{service.id}</div>
              <div className="service-detail-main">
                <span>{service.shortTitle}</span>
                <h2>{service.title}</h2>
                <p>{service.description}</p>
              </div>
              <ul>
                {service.deliverables.map((item) => <li key={item}><Check size={16} />{item}</li>)}
              </ul>
              <Link to="/contact" aria-label={`Ask about ${service.title}`}><ArrowUpRight /></Link>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
