// Made by loxqcx on Discord.
import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { ArrowUpRight, Menu, X } from 'lucide-react';
import { siteConfig } from '../config/site';
import BrandMark from './BrandMark';

export default function SiteHeader() {
  const [open, setOpen] = useState(false);
  const primary = siteConfig.navigation.filter((item) => !item.menuOnly);
  const secondary = siteConfig.navigation.filter((item) => item.menuOnly);

  const close = () => setOpen(false);

  return (
    <>
      {siteConfig.announcement.enabled && (
        <div className="announcement">
          <span className="pulse-dot" />
          {siteConfig.announcement.text}
          <Link to="/contact">Book a call <ArrowUpRight size={14} /></Link>
        </div>
      )}
      <header className="site-header">
        <div className="container header-inner">
          <BrandMark />
          <nav className="desktop-nav" aria-label="Primary navigation">
            {primary.map((item) => (
              <NavLink key={item.path} to={item.path} className={({ isActive }) => isActive ? 'active' : ''}>
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="header-actions">
            <Link className="button button--dark button--compact" to="/contact">
              Start a project <ArrowUpRight size={17} />
            </Link>
            <button className="icon-button menu-button" type="button" aria-label={open ? 'Close menu' : 'Open menu'} onClick={() => setOpen(!open)}>
              {open ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </header>
      {open && (
        <div className="mobile-menu">
          <nav aria-label="Mobile navigation">
            {[...primary, ...secondary].map((item, index) => (
              <NavLink key={item.path} to={item.path} onClick={close}>
                <span>{String(index + 1).padStart(2, '0')}</span>{item.label}
              </NavLink>
            ))}
          </nav>
          <div className="mobile-menu-footer">
            <a href={siteConfig.brand.discordUrl} target="_blank" rel="noreferrer">Join Discord <ArrowUpRight size={18} /></a>
            <a href={`mailto:${siteConfig.brand.email}`}>{siteConfig.brand.email}</a>
          </div>
        </div>
      )}
    </>
  );
}
