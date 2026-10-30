'use client';
// Ordinary Lancer — site loader
// anime.js counter + brush reveal of the wordmark + curtain wipe.
// Deps: npm i animejs@3.2.2
// Asset: the 866x344 brush wordmark the hero also uses (WORDMARK_SRC below).
import { useEffect, useRef, useState } from 'react';
import anime from 'animejs';
import './Loader.css';

const WORDMARK_SRC = '/brand/wordmark-full.png';

// Timings (ms). CURTAIN_MS must match the ol-curtain animation in Loader.css.
const PROGRESS_MS = 5000;
const CURTAIN_MS = 1600;
const INK_DELAY_MS = 100;
// The red sheet covers the screen at 42% of its keyframes: swap the page underneath then.
const COVERED_MS = Math.round(CURTAIN_MS * 0.42) + 30;

const message = (p) =>
  p < 30 ? 'warming up the code…' : p < 60 ? 'mixing the red paint…' : p < 90 ? 'brushing the logo…' : 'almost there…';

export default function Loader({ onDone, oncePerSession = true }) {
  const [pct, setPct] = useState(0);
  // The reveal, cursor and bar follow the exact (fractional) progress every frame via
  // direct style writes; only the counter text goes through React, once per whole percent.
  const clipRef = useRef(null);
  const cursorRef = useRef(null);
  const barRef = useRef(null);
  // load  = counter + brush reveal
  // exit  = only the curtain is drawn (transparent), the real hero shows underneath
  // hidden = loader removed
  const [phase, setPhase] = useState('load');
  const [curtain, setCurtain] = useState(false);

  // Skip on repeat visits in the same session
  useEffect(() => {
    if (oncePerSession && typeof window !== 'undefined') {
      try {
        if (sessionStorage.getItem('ol-loaded')) { setPhase('hidden'); onDone?.(); }
      } catch (e) {}
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // anime.js progress → reveal → curtain → done
  useEffect(() => {
    try { if (oncePerSession && sessionStorage.getItem('ol-loaded')) return; } catch (e) {}
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const p = { v: 0 };
    const timers = [];
    let last = -1;

    const finish = () => {
      try { sessionStorage.setItem('ol-loaded', '1'); } catch (e) {}
      if (reduce) { setPhase('hidden'); onDone?.(); return; }
      setCurtain(true);
      // screen is fully covered → swap to the real page underneath
      timers.push(setTimeout(() => { setPhase('exit'); onDone?.(); }, COVERED_MS));
      timers.push(setTimeout(() => { setCurtain(false); setPhase('hidden'); }, INK_DELAY_MS + CURTAIN_MS + 50));
    };

    const a = anime({
      targets: p,
      v: [0, 100],
      duration: reduce ? 600 : PROGRESS_MS,
      delay: 300,
      easing: 'cubicBezier(.7,0,.25,1)',
      update: () => {
        const v = p.v;
        if (clipRef.current) clipRef.current.style.clipPath = `inset(0 ${100 - v}% 0 0)`;
        if (cursorRef.current) cursorRef.current.style.left = `${v}%`;
        if (barRef.current) barRef.current.style.transform = `scaleX(${v / 100})`;
        const r = Math.floor(v);
        if (r !== last) { last = r; setPct(r); }
      },
      complete: finish,
    });

    return () => { a.pause(); timers.forEach(clearTimeout); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (phase === 'hidden') return null;

  const curtainEls = curtain && (
    <>
      <div className="ol-loader__curtain ol-loader__curtain--red" aria-hidden="true" />
      <div className="ol-loader__curtain ol-loader__curtain--ink" aria-hidden="true">
        <p>hey there :)</p>
      </div>
    </>
  );

  // One tree for both phases: the curtain keeps its position across load → exit, so React
  // doesn't remount it (a remount would restart its wipe and play it twice).
  return (
    <div className={phase === 'exit' ? 'ol-loader ol-loader--exit' : 'ol-loader'}>
      {phase === 'load' && (
        <>
          <svg className="ol-loader__grain" aria-hidden="true" width="100%" height="100%">
            <filter id="ol-grain">
              <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" stitchTiles="stitch" />
              <feColorMatrix type="matrix" values="0 0 0 0 0.42  0 0 0 0 0.38  0 0 0 0 0.34  0 0 0 0.09 0" />
            </filter>
            <rect width="100%" height="100%" filter="url(#ol-grain)" />
          </svg>

          <div className="ol-loader__top">
            <span className="ol-loader__live"><i />LOADING</span>
          </div>

          <div className="ol-loader__center">
            <div className="ol-loader__mark">
              <img src={WORDMARK_SRC} alt="" aria-hidden="true" className="ol-loader__ghost" />
              <div ref={clipRef} className="ol-loader__clip" style={{ clipPath: 'inset(0 100% 0 0)' }}>
                <img src={WORDMARK_SRC} alt="Ordinary Lancer" />
              </div>
              <span ref={cursorRef} className="ol-loader__cursor" style={{ left: 0 }} aria-hidden="true" />
            </div>
          </div>

          <div className="ol-loader__bottom" role="status" aria-live="polite">
            <p className="ol-loader__msg">{message(pct)}</p>
            <p className="ol-loader__count">
              {String(pct).padStart(3, '0')}
              <span>%</span>
            </p>
          </div>
          <div className="ol-loader__bar" aria-hidden="true">
            <div ref={barRef} />
          </div>
        </>
      )}

      {curtainEls}
    </div>
  );
}
