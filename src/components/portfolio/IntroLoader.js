'use client';

import { useCallback, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// anime.js stays out of the main bundle; the page paints without it.
const Loader = dynamic(() => import('@/components/Loader/Loader'), { ssr: false });

const INTRO_ATTR = 'olIntro';

function releaseIntro() {
  delete document.documentElement.dataset[INTRO_ATTR];
}

/**
 * Mounts the site loader on every full page load of the portfolio home (refresh included).
 *
 * The decision is made before first paint by the inline script in the root layout:
 * it sets <html data-ol-intro="wait"> (motion allowed),
 * which covers the page and holds the hero intro. This component only follows that
 * flag, so client-side navigations back to "/" never replay the loader.
 */
export default function IntroLoader() {
  const [active, setActive] = useState(false);

  useEffect(() => {
    // Hydrated in time: cancel the layout script's "JS never loaded" fallback.
    clearTimeout(window.__olIntroTimer);
    if (document.documentElement.dataset[INTRO_ATTR] !== 'wait') return undefined;
    setActive(true);
    // Leaving mid-load must not strand the cover on the next page.
    return releaseIntro;
  }, []);

  // Fires when the curtain fully covers the screen: the hero intro starts underneath.
  const handleDone = useCallback(() => releaseIntro(), []);

  return active ? <Loader onDone={handleDone} oncePerSession={false} /> : null;
}
