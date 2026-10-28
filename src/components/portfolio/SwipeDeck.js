'use client';

import { useEffect, useRef } from 'react';
import { RevealGroup } from './Reveal';

/**
 * A grid on wide screens; below `query` CSS turns it into a native scroll-snap row
 * and this component tucks the neighbouring cards behind the centred one like a deck.
 *
 * Swiping is plain browser scrolling (momentum + snap), so it stays smooth and needs
 * no gesture library. JS only writes transform / z-index once per animation frame.
 * Each direct child must wrap its card in an element with `data-deck-slide`.
 */
export default function SwipeDeck({ className, label, query = '(max-width: 767px)', children }) {
  const trackRef = useRef(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return undefined;

    const mobile = window.matchMedia(query);
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0;

    const items = () => Array.from(track.children);

    const reset = () => {
      for (const item of items()) {
        item.style.zIndex = '';
        const slide = item.querySelector('[data-deck-slide]');
        if (slide) slide.style.transform = '';
      }
    };

    const paint = () => {
      frame = 0;
      const center = track.scrollLeft + track.clientWidth / 2;
      for (const item of items()) {
        const slide = item.querySelector('[data-deck-slide]');
        if (!slide) continue;
        // -1 … 1 = one card to the left … one card to the right of centre.
        const offset = (item.offsetLeft + item.offsetWidth / 2 - center) / item.offsetWidth;
        const distance = Math.min(Math.abs(offset), 1.5);
        // Side cards shrink and slide ~30% inward so they sit behind the centred one.
        const scale = 1 - Math.min(distance, 1) * 0.12;
        const shift = -Math.sign(offset) * Math.min(distance, 1) * 30;
        slide.style.transform = `translate3d(${shift}%, 0, 0) scale(${scale})`;
        item.style.zIndex = String(10 - Math.round(distance * 4));
      }
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(paint);
    };

    const sync = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      track.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (mobile.matches && !reduce.matches) {
        track.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', onScroll);
        paint();
      } else {
        reset();
      }
    };

    sync();
    mobile.addEventListener('change', sync);
    reduce.addEventListener('change', sync);
    return () => {
      cancelAnimationFrame(frame);
      mobile.removeEventListener('change', sync);
      reduce.removeEventListener('change', sync);
      track.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      reset();
    };
  }, [query]);

  return (
    <RevealGroup ref={trackRef} className={className} role="region" aria-label={label}>
      {children}
    </RevealGroup>
  );
}
