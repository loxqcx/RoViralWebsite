// Made by loxqcx on Discord.
import { ArrowUpRight } from 'lucide-react';
import PackageCard from '../components/PackageCard';
import PageHero from '../components/PageHero';
import { packagesPageConfig } from '../config/packages';

export default function PackagesPage() {
  return (
    <>
      <PageHero {...packagesPageConfig.hero} eyebrow={`${packagesPageConfig.hero.eyebrow} / ${String(packagesPageConfig.packages.length).padStart(2, '0')}`} />
      <section className="packages-section section-pad">
        <div className="container package-grid">
          {packagesPageConfig.packages.map((pkg, index) => (
            <PackageCard pkg={pkg} index={index} key={pkg.name} />
          ))}
        </div>
        <div className="container package-note">
          <span className="package-note-heading">
            <img className="package-note-icon" src={packagesPageConfig.note.icon} alt="Discord" />
            {packagesPageConfig.note.title}
          </span>
          <p>{packagesPageConfig.note.body}</p>
          <a className="text-link" href={packagesPageConfig.note.linkUrl} target="_blank" rel="noreferrer">
            {packagesPageConfig.note.linkLabel} <ArrowUpRight size={17} />
          </a>
        </div>
      </section>
    </>
  );
}
