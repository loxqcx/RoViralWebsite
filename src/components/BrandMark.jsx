// Made by loxqcx on Discord.
import { Link } from 'react-router-dom';
import { brandConfig } from '../config/brand';

export default function BrandMark({ inverse = false }) {
  return (
    <Link to="/" className={`brand-mark ${inverse ? 'brand-mark--inverse' : ''}`} aria-label={`${brandConfig.name} home`}>
      <img className="brand-logo" src={brandConfig.logo} alt="" aria-hidden="true" />
      <span>{brandConfig.name}</span>
    </Link>
  );
}
