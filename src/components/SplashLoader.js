'use client';

import { useState, useEffect } from 'react';
import BrandLogo from './BrandLogo';

const SESSION_KEY = 'ordinary:splash-seen';
const VISIBLE_MS = 1100;
const FADE_MS = 400;

/**
 * Brand splash shown once per browser session. It used to block every hard
 * load for 5s, which made the app feel slow (especially on phones); now it is
 * a short brand moment on first open and is skipped on subsequent reloads.
 */
export default function SplashLoader() {
  const [visible, setVisible] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem(SESSION_KEY) === '1';
      sessionStorage.setItem(SESSION_KEY, '1');
    } catch (_) {
      // Storage can be unavailable (private mode); fall back to showing once.
    }

    if (seen) {
      setVisible(false);
      return undefined;
    }

    const fadeTimer = setTimeout(() => setFadeOut(true), VISIBLE_MS);
    const unmountTimer = setTimeout(() => setVisible(false), VISIBLE_MS + FADE_MS);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(unmountTimer);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center gap-6 bg-canvas dark:bg-ink-950 transition-opacity ease-in-out ${
        fadeOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      style={{ transitionDuration: `${FADE_MS}ms` }}
    >
      <BrandLogo width={220} priority className="animate-[pulse_1.6s_ease-in-out_infinite]" />
      <span className="h-1 w-24 overflow-hidden rounded-full bg-mist dark:bg-white/10">
        <span className="block h-full w-1/2 rounded-full bg-brand animate-[splash-bar_1.1s_ease-in-out_infinite]" />
      </span>
    </div>
  );
}
