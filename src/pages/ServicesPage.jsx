// Made by loxqcx on Discord.
import { ArrowUpRight, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import PageHero from '../components/PageHero';
import ServiceLogo from '../components/ServiceLogo';
import { servicesPageConfig } from '../config/services';

export default function ServicesPage() {
  return (
    <>
      <PageHero {...servicesPageConfig.hero} eyebrow={`${servicesPageConfig.hero.eyebrow} / ${String(servicesPageConfig.services.length).padStart(2, '0')}`} />
      <section className="services-page section-pad">
        <div className="container service-detail-list">
          {servicesPageConfig.services.map((service) => (
            <article className={`service-detail accent-${service.accent}`} key={service.id}>
              <ServiceLogo service={service} variant="detail" />
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
