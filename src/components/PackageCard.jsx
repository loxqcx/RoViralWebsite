// Made by loxqcx on Discord.
import { ArrowUpRight, Check } from 'lucide-react';
import { brandConfig } from '../config/brand';
import { packagesPageConfig } from '../config/packages';

export default function PackageCard({ pkg, index }) {
  return (
    <article className={`package-card ${pkg.featured ? 'package-card--featured' : ''}`}>
      {pkg.featured && <span className="package-badge">{packagesPageConfig.featuredLabel}</span>}
      <div className="package-index">0{index + 1}</div>
      <p className="package-kicker">{brandConfig.name} / {pkg.category}</p>
      <h2>{pkg.name}</h2>
      <p className="package-description">{pkg.description}</p>
      <div className="package-price">
        <div className="package-price-row">
          <strong>{pkg.price}</strong>
          <span className="package-currency">USD</span>
          <span className="package-price-gbp">{pkg.priceGbp} GBP</span>
        </div>
        <span className="package-price-cadence">{pkg.cadence}</span>
      </div>
      <ul>
        {pkg.includes.map((item) => <li key={item}><Check size={16} />{item}</li>)}
      </ul>
      <a className={`button ${pkg.featured ? 'button--lime' : 'button--dark'}`} href={brandConfig.discordUrl} target="_blank" rel="noreferrer">
        {packagesPageConfig.inquiryLabel} <ArrowUpRight size={18} />
      </a>
    </article>
  );
}
