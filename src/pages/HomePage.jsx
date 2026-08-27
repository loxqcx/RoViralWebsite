// Made by loxqcx on Discord.
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import PackageCard from '../components/PackageCard';
import AnimatedMetric from '../components/AnimatedMetric';
import ReviewsSection from '../components/ReviewsSection';
import SectionHeading from '../components/SectionHeading';
import ServiceLogo from '../components/ServiceLogo';
import { homePageConfig } from '../config/home';
import { packagesPageConfig } from '../config/packages';
import { servicesPageConfig } from '../config/services';
import { useHomeMetrics } from '../hooks/useHomeMetrics';

export default function HomePage() {
  const metricValues = useHomeMetrics();

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
              <Link className="text-link" to={homePageConfig.hero.reviewsCta.path}>{homePageConfig.hero.reviewsCta.label}<ArrowRight size={18} /></Link>
            </div>
          </div>
        </div>
        <div className="container hero-stats">
          {homePageConfig.hero.stats.map((stat) => (
            <div key={stat.key}>
              <AnimatedMetric metric={stat} value={metricValues[stat.key]} />
              <span>{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="home-services section-pad">
        <div className="container">
          <SectionHeading {...homePageConfig.servicesSection} />
          <div className="service-strips">
            {servicesPageConfig.services.map((service) => (
              <Link to="/services" className="service-strip" key={service.id}>
                <ServiceLogo service={service} variant="strip" />
                <h3>{service.title}{service.status && <span className="service-status">{service.status}</span>}</h3>
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

      <ReviewsSection />
    </>
  );
}
