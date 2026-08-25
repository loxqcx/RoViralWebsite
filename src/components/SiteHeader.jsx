// Made by loxqcx on Discord.
import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { ArrowUpRight, Menu, X } from 'lucide-react';
import { announcementConfig, brandConfig } from '../config/brand';
import { navigationConfig } from '../config/navigation';
import BrandMark from './BrandMark';

export default function SiteHeader() {
  const [open, setOpen] = useState(false);
  const primary = navigationConfig.filter((item) => !item.menuOnly);
  const secondary = navigationConfig.filter((item) => item.menuOnly);

  const close = () => setOpen(false);

  return (
    <>
      {announcementConfig.enabled && (
        <div className="announcement">
          <span className="pulse-dot" />
          {announcementConfig.text}
          <Link to="/contact">Book a call <ArrowUpRight size={14} /></Link>
        </div>
      )}
      <header className="site-header">
        <div className="container header-inner">
          <BrandMark />
          <nav className="desktop-nav" aria-label="Primary navigation">
            {primary.map((item) => (
              item.anchor
                ? <Link key={item.path} to={item.path}>{item.label}</Link>
                : <NavLink key={item.path} to={item.path} className={({ isActive }) => isActive ? 'active' : ''}>{item.label}</NavLink>
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
              <Link key={item.path} to={item.path} onClick={close}>
                <span>{String(index + 1).padStart(2, '0')}</span>{item.label}
              </Link>
            ))}
          </nav>
          <div className="mobile-menu-footer">
            <a href={brandConfig.discordUrl} target="_blank" rel="noreferrer">Join Discord <ArrowUpRight size={18} /></a>
          </div>
        </div>
      )}
    </>
  );
}
