'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Icon from './Icon';
import { nav, site } from '@/data/portfolio';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const toggleRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    const onResize = () => {
      if (window.innerWidth >= 960) setOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('resize', onResize);
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <header className="ol-header">
      <nav aria-label="Main" className="ol-nav">
        <a href="#top" aria-label={`${site.name} home`} className="ol-nav__logo">
          <Image
            src={site.logo.onLight.src}
            width={site.logo.onLight.width}
            height={site.logo.onLight.height}
            alt={site.name}
            priority
            sizes="90px"
          />
        </a>

        <div className="ol-nav__links">
          {nav.links.map((link) => (
            <a key={link.href} className="ol-nav__link" href={link.href}>
              {link.label}
            </a>
          ))}
          <a className="ol-btn ol-btn--red ol-btn--sm" href={nav.cta.href}>
            {nav.cta.label} <Icon name="arrowUpRight" size={16} strokeWidth={2.4} />
          </a>
        </div>

        <div className="ol-nav__mobile-actions">
          <a className="ol-btn ol-btn--red ol-btn--sm" href={nav.cta.href}>
            {nav.cta.label}
          </a>
          <button
            ref={toggleRef}
            type="button"
            className="ol-nav__toggle"
            aria-expanded={open}
            aria-controls="ol-mobile-menu"
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen((value) => !value)}
          >
            <Icon name={open ? 'close' : 'menu'} size={22} strokeWidth={2.4} />
          </button>
        </div>
      </nav>

      {open && (
        <div id="ol-mobile-menu" className="ol-menu">
          {nav.links.map((link) => (
            <a key={link.href} href={link.href} onClick={close}>
              {link.label}
            </a>
          ))}
        </div>
      )}
    </header>
  );
}
