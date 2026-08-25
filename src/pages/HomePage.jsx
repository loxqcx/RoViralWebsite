// Made by loxqcx on Discord.
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import PackageCard from '../components/PackageCard';
import SectionHeading from '../components/SectionHeading';
import ServiceLogo from '../components/ServiceLogo';
import { homePageConfig } from '../config/home';
import { packagesPageConfig } from '../config/packages';
import { servicesPageConfig } from '../config/services';

export default function HomePage() {
  return (
    <>
      <section className="home-hero">
        <div className="container home-hero-inner">
          <div className="hero-copy">
            <p className="eyebrow">{homePageConfig.hero.eyebrow}</p>
            <h1>
              {homePageConfig.hero.titleLines.map((line, index) => (
                <span key={line} className={index === 1 ? 'outline-line' : ''}>{line}</span>
              ))}
            </h1>
            <p className="hero-body">{homePageConfig.hero.body}</p>
            <div className="button-row">
              <Link className="button button--lime" to={homePageConfig.hero.primaryCta.path}>{homePageConfig.hero.primaryCta.label}<ArrowUpRight size={18} /></Link>
              <Link className="text-link" to={homePageConfig.hero.secondaryCta.path}>{homePageConfig.hero.secondaryCta.label}<ArrowRight size={18} /></Link>
            </div>
          </div>
        </div>
        <div className="container hero-stats">
          {homePageConfig.hero.stats.map((stat) => <div key={stat.label}><strong>{stat.value}</strong><span>{stat.label}</span></div>)}
        </div>
      </section>

      <section className="home-services section-pad">
        <div className="container">
          <SectionHeading {...homePageConfig.servicesSection} />
          <div className="service-strips">
            {servicesPageConfig.services.map((service) => (
              <Link to="/services" className="service-strip" key={service.id}>
                <ServiceLogo service={service} variant="strip" />
                <h3>{service.title}</h3>
                <p>{service.description}</p>
                <ArrowUpRight />
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="home-packages packages-section section-pad">
        <div className="container">
          <SectionHeading {...homePageConfig.packagesSection} inverse />
          <div className="package-grid home-package-grid">
            {packagesPageConfig.packages.map((pkg, index) => <PackageCard pkg={pkg} index={index} key={pkg.name} />)}
          </div>
          <Link className="button button--light home-packages-button" to={homePageConfig.packagesSection.buttonPath}>{homePageConfig.packagesSection.buttonLabel} <ArrowUpRight size={18} /></Link>
        </div>
      </section>

      <section className="process-section section-pad">
        <div className="container">
          <SectionHeading eyebrow={homePageConfig.processSection.eyebrow} title={homePageConfig.processSection.title} />
          <div className="process-grid">
            {homePageConfig.processSection.items.map((item) => (
              <article key={item.step}>
                <span>{item.step}</span>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="home-cta">
        <div className="container home-cta-inner">
          <p className="eyebrow">{homePageConfig.cta.eyebrow}</p>
          <h2>{homePageConfig.cta.titleLines[0]}<br /><em>{homePageConfig.cta.titleLines[1]}</em></h2>
          <Link className="button button--dark" to={homePageConfig.cta.buttonPath}>{homePageConfig.cta.buttonLabel} <ArrowUpRight size={18} /></Link>
        </div>
      </section>
    </>
  );
}
