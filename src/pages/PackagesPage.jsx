// Made by loxqcx on Discord.
import { ArrowUpRight, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import PageHero from '../components/PageHero';
import { siteConfig } from '../config/site';

export default function PackagesPage() {
  return (
    <>
      <PageHero eyebrow="Packages / 03" title={<>Pick the pace.<br />We’ll build the system.</>} body="Three starting points, shaped around the stage of your game. Scope and pricing stay custom because your launch should not look like everyone else’s." aside="No long-term lock-in. Clear deliverables before kickoff." />
      <section className="packages-section section-pad">
        <div className="container package-grid">
          {siteConfig.packages.map((pkg, index) => (
            <article className={`package-card ${pkg.featured ? 'package-card--featured' : ''}`} key={pkg.name}>
              {pkg.featured && <span className="package-badge">Most popular</span>}
              <div className="package-index">0{index + 1}</div>
              <p className="package-kicker">{siteConfig.brand.name}</p>
              <h2>{pkg.name}</h2>
              <p className="package-description">{pkg.description}</p>
              <div className="package-price"><strong>{pkg.price}</strong><span>{pkg.cadence}</span></div>
              <ul>
                {pkg.includes.map((item) => <li key={item}><Check size={16} />{item}</li>)}
              </ul>
              <Link className={`button ${pkg.featured ? 'button--lime' : 'button--dark'}`} to={`/contact?package=${encodeURIComponent(pkg.name)}`}>
                Ask about {pkg.name} <ArrowUpRight size={18} />
              </Link>
            </article>
          ))}
        </div>
        <div className="container package-note">
          <span>Need a single service?</span>
          <p>Audits, trailers, and focused creative sprints are also available independently.</p>
          <Link className="text-link" to="/contact">Build a custom scope <ArrowUpRight size={17} /></Link>
        </div>
      </section>
    </>
  );
}
