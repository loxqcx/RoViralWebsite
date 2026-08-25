import { Link } from 'react-router-dom';
import { siteConfig } from '../config/site';

export default function BrandMark({ inverse = false }) {
  return (
    <Link to="/" className={`brand-mark ${inverse ? 'brand-mark--inverse' : ''}`} aria-label={`${siteConfig.brand.name} home`}>
      <span className="brand-symbol" aria-hidden="true">
        <i />
        <i />
        <i />
      </span>
      <span>{siteConfig.brand.name}</span>
    </Link>
  );
}
