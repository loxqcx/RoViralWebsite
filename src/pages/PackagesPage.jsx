// Made by loxqcx on Discord.
import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
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
          <span>{packagesPageConfig.note.title}</span>
          <p>{packagesPageConfig.note.body}</p>
          <Link className="text-link" to={packagesPageConfig.note.linkPath}>{packagesPageConfig.note.linkLabel} <ArrowUpRight size={17} /></Link>
        </div>
      </section>
    </>
  );
}
