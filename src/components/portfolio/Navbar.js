'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Icon from './Icon';
import { sectionHref } from './links';
import { nav, site } from '@/data/portfolio';

const DESKTOP_QUERY = '(min-width: 960px)';

/** `base` is '' on the home page and '/' on other pages so section links point home. */
export default function Navbar({ base = '' }) {
  const [open, setOpen] = useState(false);
  const toggleRef = useRef(null);
  const menuRef = useRef(null);

  // While open: lock page scroll, close on Escape / desktop width, keep Tab inside the sheet.
  useEffect(() => {
    if (!open) return undefined;

    const menu = menuRef.current;
    const toggle = toggleRef.current;
    const desktop = window.matchMedia(DESKTOP_QUERY);
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    menu?.querySelector('button')?.focus({ preventScroll: true });

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        setOpen(false);
        return;
      }
      if (event.key !== 'Tab' || !menu) return;
      const focusables = menu.querySelectorAll('a[href], button:not([disabled])');
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    const onDesktop = (event) => {
      if (event.matches) setOpen(false);
    };

    document.addEventListener('keydown', onKeyDown);
    desktop.addEventListener('change', onDesktop);
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener('keydown', onKeyDown);
      desktop.removeEventListener('change', onDesktop);
      toggle?.focus({ preventScroll: true });
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <>
      <header className="ol-header">
        <nav aria-label="Main" className="ol-nav">
          <a href={base || '#top'} aria-label={`${site.name} home`} className="ol-nav__logo">
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
              <a key={link.href} className="ol-nav__link" href={sectionHref(base, link.href)}>
                {link.label}
              </a>
            ))}
            <a className="ol-btn ol-btn--red ol-btn--sm" href={sectionHref(base, nav.cta.href)}>
              {nav.cta.label} <Icon name="arrowUpRight" size={16} strokeWidth={2.4} />
            </a>
          </div>

          <div className="ol-nav__mobile-actions">
            <a className="ol-btn ol-btn--red ol-btn--sm" href={sectionHref(base, nav.cta.href)}>
              {nav.cta.label}
            </a>
            <button
              ref={toggleRef}
              type="button"
              className="ol-nav__toggle"
              aria-expanded={open}
              aria-controls="ol-mobile-menu"
              aria-label="Open menu"
              onClick={() => setOpen(true)}
            >
              <Icon name="menu" size={22} strokeWidth={2.4} />
            </button>
          </div>
        </nav>
      </header>

      {/* Full-screen sheet, rendered outside <header> so the header's backdrop-filter can't trap it. */}
      {open && (
        <div
          ref={menuRef}
          id="ol-mobile-menu"
          className="ol-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
        >
          <div className="ol-menu__header">
            <a href={base || '#top'} aria-label={`${site.name} home`} className="ol-nav__logo" onClick={close}>
              <Image
                src={site.logo.onLight.src}
                width={site.logo.onLight.width}
                height={site.logo.onLight.height}
                alt={site.name}
                sizes="90px"
              />
            </a>
            <button type="button" className="ol-nav__toggle ol-nav__toggle--ink" onClick={close} aria-label="Close menu">
              <Icon name="close" size={22} strokeWidth={2.4} />
            </button>
          </div>

          <nav aria-label="Mobile" className="ol-menu__body">
            <p className="ol-menu__eyebrow">where to?</p>
            <ol className="ol-menu__links">
              {nav.links.map((link, index) => (
                <li key={link.href} style={{ '--i': index }}>
                  <a href={sectionHref(base, link.href)} onClick={close}>
                    <span className="ol-menu__num">{String(index + 1).padStart(2, '0')}</span>
                    <span className="ol-menu__label">{link.label}</span>
                    <Icon name="arrowUpRight" size={22} strokeWidth={2.2} className="ol-menu__arrow" />
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          <div className="ol-menu__foot" style={{ '--i': nav.links.length }}>
            <a className="ol-btn ol-btn--red ol-btn--md" href={sectionHref(base, nav.cta.href)} onClick={close}>
              {nav.cta.label} <Icon name="arrowUpRight" size={18} strokeWidth={2.4} />
            </a>
            <div className="ol-menu__contact">
              <a href={`mailto:${site.email}`}>
                <Icon name="mail" size={18} strokeWidth={2} /> Email
              </a>
              <a href={site.linkedin} target="_blank" rel="noopener noreferrer">
                <Icon name="linkedin" size={18} strokeWidth={2} /> LinkedIn
              </a>
            </div>
            <p className="ol-menu__tagline">{site.tagline}</p>
          </div>
        </div>
      )}
    </>
  );
}
