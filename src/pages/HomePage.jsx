// Made by loxqcx on Discord.
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { siteConfig } from '../config/site';
import ProjectCard from '../components/ProjectCard';
import SectionHeading from '../components/SectionHeading';

export default function HomePage() {
  return (
    <>
      <section className="home-hero">
        <div className="container home-hero-inner">
          <div className="hero-copy">
            <p className="eyebrow">{siteConfig.hero.eyebrow}</p>
            <h1>
              {siteConfig.hero.titleLines.map((line, index) => (
                <span key={line} className={index === 1 ? 'outline-line' : ''}>{line}</span>
              ))}
            </h1>
            <p className="hero-body">{siteConfig.hero.body}</p>
            <div className="button-row">
              <Link className="button button--lime" to={siteConfig.hero.primaryCta.path}>{siteConfig.hero.primaryCta.label}<ArrowUpRight size={18} /></Link>
              <Link className="text-link" to={siteConfig.hero.secondaryCta.path}>{siteConfig.hero.secondaryCta.label}<ArrowRight size={18} /></Link>
            </div>
          </div>
        </div>
        <div className="container hero-stats">
          {siteConfig.hero.stats.map((stat) => <div key={stat.label}><strong>{stat.value}</strong><span>{stat.label}</span></div>)}
        </div>
      </section>

      <section className="home-services section-pad">
        <div className="container">
          <SectionHeading eyebrow="What we do" title={<>One team. Every<br />attention lever.</>} body="We connect the parts that usually get scattered across freelancers, creators, and community teams." />
          <div className="service-strips">
            {siteConfig.services.map((service) => (
              <Link to="/services" className="service-strip" key={service.id}>
                <span>{service.id}</span>
                <h3>{service.title}</h3>
                <p>{service.description}</p>
                <ArrowUpRight />
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="selected-work section-pad">
        <div className="container">
          <SectionHeading eyebrow="Selected work" title={<>Built for the<br />scroll and the server.</>} inverse />
          <div className="project-grid">
            {siteConfig.portfolio.slice(0, 2).map((item, index) => <ProjectCard key={item.slug} item={item} index={index} />)}
          </div>
          <Link className="button button--light work-button" to="/portfolio">View all work <ArrowUpRight size={18} /></Link>
        </div>
      </section>

      <section className="process-section section-pad">
        <div className="container">
          <SectionHeading eyebrow="How we work" title={<>Fast enough for culture.<br />Rigorous enough for growth.</>} />
          <div className="process-grid">
            {siteConfig.process.map((item) => (
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
          <p className="eyebrow">Got a game worth noticing?</p>
          <h2>Bring the game.<br /><em>We’ll bring the signal.</em></h2>
          <Link className="button button--dark" to="/contact">Tell us about it <ArrowUpRight size={18} /></Link>
        </div>
      </section>
    </>
  );
}
