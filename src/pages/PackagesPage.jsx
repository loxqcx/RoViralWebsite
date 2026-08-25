// Made by loxqcx on Discord.
import { ArrowUpRight, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import PageHero from '../components/PageHero';
import { brandConfig } from '../config/brand';
import { packagesPageConfig } from '../config/packages';

export default function PackagesPage() {
  return (
    <>
      <PageHero {...packagesPageConfig.hero} eyebrow={`${packagesPageConfig.hero.eyebrow} / ${String(packagesPageConfig.packages.length).padStart(2, '0')}`} />
      <section className="packages-section section-pad">
        <div className="container package-grid">
          {packagesPageConfig.packages.map((pkg, index) => (
            <article className={`package-card ${pkg.featured ? 'package-card--featured' : ''}`} key={pkg.name}>
              {pkg.featured && <span className="package-badge">{packagesPageConfig.featuredLabel}</span>}
              <div className="package-index">0{index + 1}</div>
              <p className="package-kicker">{brandConfig.name}</p>
              <h2>{pkg.name}</h2>
              <p className="package-description">{pkg.description}</p>
              <div className="package-price"><strong>{pkg.price}</strong><span>{pkg.cadence}</span></div>
              <ul>
                {pkg.includes.map((item) => <li key={item}><Check size={16} />{item}</li>)}
              </ul>
              <a className={`button ${pkg.featured ? 'button--lime' : 'button--dark'}`} href={brandConfig.discordUrl} target="_blank" rel="noreferrer">
                {packagesPageConfig.inquiryLabel} <ArrowUpRight size={18} />
              </a>
            </article>
          ))}
        </div>
        <div className="container package-note">
          <span>{packagesPageConfig.note.title}</span>
          <p>{packagesPageConfig.note.body}</p>
          <Link className="text-link" to={packagesPageConfig.note.linkPath}>{packagesPageConfig.note.linkLabel} <ArrowUpRight size={17} /></Link>
        </div>
      </section>
    </>
  );
}
