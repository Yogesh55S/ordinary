import Image from 'next/image';
import Icon from './Icon';
import { hero, site } from '@/data/portfolio';

/**
 * Hero intro runs on CSS keyframes (not JS) so it starts with the first paint —
 * no waiting for hydration, which keeps LCP fast.
 */
export default function Hero() {
  // The track repeats the first word at the end so the loop seams invisibly.
  const words = [...hero.rotatingWords, hero.rotatingWords[0]];

  return (
    <section id="top" className="ol-section ol-hero" aria-labelledby="ol-hero-title">
      <svg aria-hidden="true" className="ol-hero__blob-left" width="560" height="380" viewBox="0 0 560 380">
        <path d="M0 130 C 130 40, 280 70, 350 170 C 420 270, 500 320, 560 380 L 0 380 Z" fill="var(--ol-red)" />
        <path d="M0 80 C 150 0, 320 30, 400 160 C 460 250, 520 300, 560 340" fill="none" stroke="var(--ol-ink)" strokeWidth="1.5" />
      </svg>
      <svg aria-hidden="true" className="ol-hero__blob-right" width="420" height="300" viewBox="0 0 420 300">
        <path d="M120 0 C 160 90, 260 150, 420 130 L 420 0 Z" fill="var(--ol-ink)" opacity="0.06" />
        <path d="M60 0 C 120 110, 250 170, 420 160" fill="none" stroke="var(--ol-red)" strokeWidth="1.5" />
      </svg>

      <div className="ol-container ol-hero__grid">
        <div className="ol-hero__copy ol-in">
          <p className="ol-badge">
            <span aria-hidden="true" className="ol-badge__dot" />
            {hero.badge}
          </p>
          <p className="ol-hero__greeting">{hero.greeting}</p>
          <h1 id="ol-hero-title" className="ol-hero__title">
            {hero.headingLead}{' '}
            <span className="ol-sr-only">{hero.rotatingWords.join(', ')}</span>
            <span className="ol-rotator" aria-hidden="true">
              <span className="ol-rotator__track">
                {words.map((word, index) => (
                  <span key={`${word}-${index}`} className="ol-rotator__word">
                    {word}
                  </span>
                ))}
              </span>
            </span>
          </h1>
          <svg aria-hidden="true" className="ol-hero__underline" width="340" height="18" viewBox="0 0 340 18">
            <path d="M4 13 C 90 3, 220 2, 336 9" fill="none" stroke="var(--ol-ink)" strokeWidth="5" strokeLinecap="round" />
          </svg>
          <p className="ol-hero__intro">{hero.intro}</p>
          <div className="ol-hero__ctas">
            <a className="ol-btn ol-btn--red" href={hero.primaryCta.href}>
              {hero.primaryCta.label} <Icon name="arrowRight" size={18} strokeWidth={2.4} />
            </a>
            <a className="ol-btn ol-btn--white" href={hero.secondaryCta.href}>
              {hero.secondaryCta.label}
            </a>
          </div>
          <ul className="ol-trust">
            {hero.trust.map((item) => (
              <li key={item}>
                <Icon name="check" size={22} color="var(--ol-red)" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="ol-hero__visual ol-in ol-in--late">
          <div className="ol-avatar">
            <div className="ol-avatar__shadow" aria-hidden="true" />
            <div className="ol-avatar__card">
              <Image
                src={site.avatar.src}
                width={site.avatar.width}
                height={site.avatar.height}
                alt={site.avatar.alt}
                priority
                sizes="(min-width: 1024px) 380px, (min-width: 640px) 60vw, 85vw"
              />
            </div>
            <p className="ol-sticky" aria-hidden="true">
              {hero.stickyNote[0]}
              <br />
              {hero.stickyNote[1]}
            </p>
            <div className="ol-spin-badge" aria-hidden="true">
              <svg className="ol-spin-badge__ring" width="120" height="120" viewBox="0 0 120 120">
                <defs>
                  <path id="ol-circle" d="M60 60 m-46 0 a46 46 0 1 1 92 0 a46 46 0 1 1 -92 0" />
                </defs>
                <text fill="var(--ol-ink)">
                  <textPath href="#ol-circle">{hero.circleBadge}</textPath>
                </text>
              </svg>
              <Icon name="brackets" size={34} color="var(--ol-red)" strokeWidth={2.2} />
            </div>
            <svg aria-hidden="true" className="ol-hero__arrow" width="90" height="70" viewBox="0 0 90 70">
              <path d="M10 10 C 0 40, 30 60, 70 50" fill="none" stroke="var(--ol-red)" strokeWidth="3" strokeLinecap="round" />
              <path d="M60 40 L72 50 L58 58" fill="none" stroke="var(--ol-red)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}
