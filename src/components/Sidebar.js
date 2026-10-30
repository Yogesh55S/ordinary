'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import posthog from 'posthog-js';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  FileText,
  Calendar,
  Settings,
  X,
  Sun,
  Moon,
  History,
  MapPin,
  Briefcase,
  Truck,
  LayoutGrid,
} from 'lucide-react';
import BrandLogo from './BrandLogo';
import LogoutButton from './LogoutButton';

const WORKSPACE_HOME = '/workspace';

const NAV_GROUPS = [
  {
    label: 'Outreach',
    links: [
      { name: 'Dashboard', short: 'Home', href: WORKSPACE_HOME, icon: LayoutDashboard },
      { name: 'Clients', short: 'Clients', href: '/workspace/clients', icon: Users },
      { name: 'Prospect Finder', short: 'Prospects', href: '/workspace/prospect', icon: MapPin },
      { name: 'Templates', short: 'Templates', href: '/workspace/templates', icon: FileText },
      { name: 'Schedules', short: 'Schedules', href: '/workspace/schedules', icon: Calendar },
      { name: 'History', short: 'History', href: '/workspace/history', icon: History },
    ],
  },
  {
    label: 'Tools',
    links: [
      { name: 'Job Applications', short: 'Jobs', href: '/workspace/job-applications', icon: Briefcase },
      { name: 'Delivery Estimator', short: 'Delivery', href: '/workspace/delivery', icon: Truck },
    ],
  },
  {
    label: 'System',
    links: [{ name: 'WhatsApp Link', short: 'WhatsApp', href: '/workspace/settings', icon: Settings }],
  },
];

const ALL_LINKS = NAV_GROUPS.flatMap((group) => group.links);

// Most-used destinations get a permanent slot in the mobile tab bar.
const PRIMARY_MOBILE_HREFS = [WORKSPACE_HOME, '/workspace/clients', '/workspace/schedules', '/workspace/job-applications'];
const PRIMARY_MOBILE_LINKS = PRIMARY_MOBILE_HREFS.map((href) => ALL_LINKS.find((link) => link.href === href));

function isLinkActive(pathname, href) {
  return pathname === href || (href !== WORKSPACE_HOME && pathname.startsWith(`${href}/`));
}

function ThemeToggle({ theme, onToggle, compact = false }) {
  const Icon = theme === 'dark' ? Sun : Moon;
  if (compact) {
    return (
      <button
        type="button"
        onClick={onToggle}
        className="inline-flex h-10 w-10 items-center justify-center rounded-full text-slate-600 dark:text-slate-300 hover:bg-mist/50 dark:hover:bg-white/5 transition-colors"
        aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
      >
        <Icon className="h-5 w-5" />
      </button>
    );
  }
  return (
    <button
      type="button"
      onClick={onToggle}
      className="w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-mist/40 dark:hover:bg-white/5 rounded-xl transition-colors border border-mist dark:border-line"
    >
      <span className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-brand" />
        <span>{theme === 'dark' ? 'Light theme' : 'Dark theme'}</span>
      </span>
      <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Toggle</span>
    </button>
  );
}

export default function Sidebar({ distinctId }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [theme, setTheme] = useState('light');
  const closeButtonRef = useRef(null);

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_POSTHOG_KEY && process.env.NEXT_PUBLIC_POSTHOG_HOST) {
      posthog.identify(distinctId, { role: 'owner' });
    }
  }, [distinctId]);

  useEffect(() => {
    // Safely verify theme state on client mount
    const storedTheme = localStorage.theme;
    const isDark = storedTheme === 'dark' || (!storedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches);
    setTheme(isDark ? 'dark' : 'light');
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!isOpen) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setIsOpen(false);
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    closeButtonRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    localStorage.theme = nextTheme;
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const activeLink = ALL_LINKS.find((link) => isLinkActive(pathname, link.href));
  const isSecondaryActive = activeLink && !PRIMARY_MOBILE_HREFS.includes(activeLink.href);

  return (
    <>
      {/* Mobile Top Bar */}
      <header
        className="sticky top-0 z-40 flex items-center justify-between gap-3 px-4 py-2 md:hidden bg-canvas/85 dark:bg-ink-950/85 backdrop-blur-lg border-b border-mist/70 dark:border-line"
        style={{ paddingTop: 'calc(0.5rem + env(safe-area-inset-top))' }}
      >
        <Link href={WORKSPACE_HOME} aria-label="ordinary workspace home" className="flex items-center">
          <BrandLogo width={78} priority />
        </Link>
        <div className="flex items-center gap-1">
          <ThemeToggle theme={theme} onToggle={toggleTheme} compact />
          <LogoutButton compact />
        </div>
      </header>

      {/* Mobile Bottom Tab Bar */}
      <nav
        aria-label="Primary"
        className="fixed inset-x-0 bottom-0 z-40 md:hidden bg-white/92 dark:bg-ink-900/92 backdrop-blur-lg border-t border-mist dark:border-line"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <ul className="grid grid-cols-5">
          {PRIMARY_MOBILE_LINKS.map((link) => {
            const IconComponent = link.icon;
            const isActive = isLinkActive(pathname, link.href);
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  aria-current={isActive ? 'page' : undefined}
                  className={`flex h-16 flex-col items-center justify-center gap-1 text-[11px] font-semibold transition-colors ${
                    isActive ? 'text-brand' : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  <span
                    className={`flex h-7 w-12 items-center justify-center rounded-full transition-colors ${
                      isActive ? 'bg-brand/12 dark:bg-brand/20' : ''
                    }`}
                  >
                    <IconComponent className="h-5 w-5" strokeWidth={isActive ? 2.4 : 2} />
                  </span>
                  <span>{link.short}</span>
                </Link>
              </li>
            );
          })}
          <li>
            <button
              type="button"
              onClick={() => setIsOpen(true)}
              aria-haspopup="dialog"
              aria-expanded={isOpen}
              className={`flex h-16 w-full flex-col items-center justify-center gap-1 text-[11px] font-semibold transition-colors ${
                isSecondaryActive ? 'text-brand' : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              <span
                className={`flex h-7 w-12 items-center justify-center rounded-full ${
                  isSecondaryActive ? 'bg-brand/12 dark:bg-brand/20' : ''
                }`}
              >
                <LayoutGrid className="h-5 w-5" />
              </span>
              <span>More</span>
            </button>
          </li>
        </ul>
      </nav>

      {/* Mobile "More" Sheet */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end md:hidden" role="dialog" aria-modal="true" aria-label="All sections">
          <div onClick={() => setIsOpen(false)} className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" />

          <div
            className="relative w-full max-h-[85dvh] overflow-y-auto rounded-t-3xl bg-canvas dark:bg-ink-900 shadow-2xl border-t border-mist dark:border-line"
            style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom))' }}
          >
            <div className="sticky top-0 bg-canvas dark:bg-ink-900 pt-2.5 px-5 pb-3">
              <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-slate-300 dark:bg-slate-700" />
              <div className="flex items-center justify-between">
                <BrandLogo width={86} />
                <button
                  onClick={() => setIsOpen(false)}
                  ref={closeButtonRef}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full text-slate-600 dark:text-slate-300 hover:bg-mist/50 dark:hover:bg-white/5"
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="px-5 space-y-5">
              {NAV_GROUPS.map((group) => (
                <section key={group.label}>
                  <h2 className="mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">{group.label}</h2>
                  <div className="grid grid-cols-3 gap-2.5">
                    {group.links.map((link) => {
                      const IconComponent = link.icon;
                      const isActive = isLinkActive(pathname, link.href);
                      return (
                        <Link
                          key={link.href}
                          href={link.href}
                          onClick={() => setIsOpen(false)}
                          aria-current={isActive ? 'page' : undefined}
                          className={`flex flex-col items-center justify-center gap-2 rounded-2xl px-2 py-3.5 text-center text-xs font-semibold transition-colors border ${
                            isActive
                              ? 'bg-brand text-white border-brand'
                              : 'bg-white dark:bg-ink-800 text-slate-700 dark:text-slate-200 border-mist dark:border-line active:bg-mist/40'
                          }`}
                        >
                          <IconComponent className={`h-5 w-5 ${isActive ? 'text-white' : 'text-brand'}`} />
                          <span className="leading-tight">{link.name}</span>
                        </Link>
                      );
                    })}
                  </div>
                </section>
              ))}
              <ThemeToggle theme={theme} onToggle={toggleTheme} />
              <LogoutButton />
            </div>
          </div>
        </div>
      )}

      {/*
        Desktop Persistent Sidebar
        - md → xl (tablets / small laptops): compact 76px icon rail so tables keep their width
        - xl and up: full sidebar with labels and grouped sections
      */}
      <aside className="hidden md:flex flex-col w-[76px] xl:w-64 shrink-0 bg-white dark:bg-ink-900 border-r border-mist dark:border-line h-screen sticky top-0 transition-[width,colors] duration-200">
        <Link href={WORKSPACE_HOME} aria-label="ordinary workspace home" className="flex items-center justify-center xl:justify-start px-3 xl:px-6 pt-5 pb-4">
          <BrandLogo variant="mark" width={40} priority className="xl:hidden" />
          <span className="hidden xl:block">
            <BrandLogo width={118} priority />
          </span>
        </Link>

        <nav aria-label="Main" className="flex-1 px-3 pb-4 space-y-3 xl:space-y-5 overflow-y-auto no-scrollbar">
          {NAV_GROUPS.map((group, groupIndex) => (
            <div key={group.label}>
              <p className="hidden xl:block px-3 mb-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">{group.label}</p>
              {groupIndex > 0 && <div className="xl:hidden mx-3 mb-3 border-t border-mist dark:border-line" aria-hidden="true" />}
              <div className="space-y-1 xl:space-y-0.5">
                {group.links.map((link) => {
                  const IconComponent = link.icon;
                  const isActive = isLinkActive(pathname, link.href);
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      title={link.name}
                      aria-label={link.name}
                      aria-current={isActive ? 'page' : undefined}
                      className={`group relative flex items-center justify-center xl:justify-start gap-3 h-11 xl:h-auto px-0 xl:px-3 xl:py-2.5 rounded-xl text-sm transition-colors ${
                        isActive
                          ? 'bg-brand/10 dark:bg-brand/15 text-brand font-bold'
                          : 'font-medium text-slate-600 dark:text-slate-300 hover:bg-mist/45 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      {isActive && <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-brand" aria-hidden="true" />}
                      <IconComponent
                        className={`h-5 w-5 xl:h-[18px] xl:w-[18px] shrink-0 transition-colors ${
                          isActive ? 'text-brand' : 'text-slate-400 group-hover:text-brand'
                        }`}
                      />
                      <span className="hidden xl:inline truncate">{link.name}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="p-3 border-t border-mist dark:border-line space-y-2.5">
          <div className="flex justify-center xl:hidden">
            <ThemeToggle theme={theme} onToggle={toggleTheme} compact />
          </div>
          <div className="hidden xl:block">
            <ThemeToggle theme={theme} onToggle={toggleTheme} />
          </div>
          <div className="flex justify-center xl:hidden">
            <LogoutButton compact />
          </div>
          <div className="hidden xl:block">
            <LogoutButton />
          </div>
          <div className="flex items-center justify-center xl:justify-start gap-2 px-3.5 py-2" title="Active Session">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand opacity-60"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-brand"></span>
            </span>
            <span className="hidden xl:inline text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Active Session</span>
          </div>
        </div>
      </aside>
    </>
  );
}
