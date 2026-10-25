import Image from 'next/image';
import { hero } from '@/data/portfolio';

/**
 * Minimal wordmark hero. Every animation is a CSS keyframe (not JS), so the intro
 * starts with the first paint — no waiting for hydration, which keeps LCP fast.
 */
export default function Hero() {
  const { wordmark } = hero;

  return (
    <section id="top" className="ol-section ol-hero" aria-label={wordmark.alt}>
      <div aria-hidden="true" className="ol-hero__grid" />
      <svg aria-hidden="true" className="ol-hero__stroke ol-hero__stroke--tl" width="620" height="300" viewBox="0 0 620 300">
        <path d="M0 290 C 120 180, 260 120, 420 70 C 500 45, 560 20, 620 0" fill="none" stroke="var(--ol-red)" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
      <svg aria-hidden="true" className="ol-hero__stroke ol-hero__stroke--tr" width="560" height="300" viewBox="0 0 560 300">
        <path d="M0 0 C 90 70, 200 90, 320 110 C 420 128, 500 180, 560 300" fill="none" stroke="#BDB6AE" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
      <svg aria-hidden="true" className="ol-hero__stroke ol-hero__stroke--br" width="560" height="260" viewBox="0 0 560 260">
        <path d="M0 260 C 120 170, 260 150, 380 120 C 460 100, 520 60, 560 0" fill="none" stroke="var(--ol-ink)" strokeWidth="1.2" strokeLinecap="round" />
      </svg>

      <div className="ol-hero__stage">
        <h1 className="ol-hero__title">
          <span className="ol-mark ol-in">
            <Image
              className="ol-mark__word"
              src={wordmark.src}
              width={wordmark.width}
              height={wordmark.height}
              alt={wordmark.alt}
              priority
              sizes="(min-width: 968px) 920px, calc(100vw - 32px)"
            />
            {hero.whiskers.map(({ src, side, box: [left, top, width, height], origin, pop, whisk }) => (
              <span
                key={src}
                aria-hidden="true"
                className={`ol-mark__whisker ol-mark__whisker--${side}`}
                style={{ left: `${left}%`, top: `${top}%`, width: `${width}%`, height: `${height}%` }}
              >
                <span className="ol-mark__pop" style={{ animationDelay: `${pop}s` }}>
                  {/* Tiny PNGs (<4 KB) — served as-is, the optimizer would only add a round-trip. */}
                  <Image
                    src={src}
                    alt=""
                    width={64}
                    height={64}
                    unoptimized
                    style={{ transformOrigin: origin, animationDelay: `${whisk}s` }}
                  />
                </span>
              </span>
            ))}
          </span>
        </h1>
      </div>

      <div className="ol-hero__foot ol-in">
        <p className="ol-hero__tagline">
          {hero.tagline}
          <span aria-hidden="true">…</span>
        </p>
      </div>
    </section>
  );
}
