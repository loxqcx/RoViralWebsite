// Made by loxqcx on Discord.
import { Link } from 'react-router-dom';
import { siteConfig } from '../config/site';

export default function BrandMark({ inverse = false }) {
  return (
    <Link to="/" className={`brand-mark ${inverse ? 'brand-mark--inverse' : ''}`} aria-label={`${siteConfig.brand.name} home`}>
      <img className="brand-logo" src={siteConfig.brand.logo} alt="" aria-hidden="true" />
      <span>{siteConfig.brand.name}</span>
    </Link>
  );
}
