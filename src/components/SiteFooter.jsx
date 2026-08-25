// Made by loxqcx on Discord.
import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import BrandMark from './BrandMark';
import { brandConfig, footerConfig } from '../config/brand';
import { navigationConfig } from '../config/navigation';

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container footer-top">
        <div className="footer-statement">
          <p className="eyebrow eyebrow--light">Ready when you are</p>
          <h2>Let’s build your<br />next growth <em>loop.</em></h2>
        </div>
        <Link to="/contact" className="round-cta" aria-label="Start a project">
          <ArrowUpRight size={34} />
          <span>Start a project</span>
        </Link>
      </div>
      <div className="container footer-grid">
        <div>
          <BrandMark inverse />
          <p>{footerConfig.blurb}</p>
        </div>
        <div className="footer-links">
          <strong>Explore</strong>
          {navigationConfig.map((item) => <Link key={item.path} to={item.path}>{item.label}</Link>)}
        </div>
        <div className="footer-links">
          <strong>Connect</strong>
          <a href={brandConfig.discordUrl} target="_blank" rel="noreferrer">Discord <ArrowUpRight size={13} /></a>
          <Link to="/contact">Project inquiry</Link>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>© {new Date().getFullYear()} {brandConfig.name}</span>
        <span>{footerConfig.legal}</span>
      </div>
    </footer>
  );
}
