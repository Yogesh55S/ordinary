import Image from 'next/image';
import Link from 'next/link';
import Icon from './Icon';
import { getProject, hero, projectHref, site } from '@/data/portfolio';

/**
 * Hero intro runs on CSS keyframes (not JS) so it starts with the first paint —
 * no waiting for hydration, which keeps LCP fast.
 */
export default function Hero() {
  // The track repeats the first word at the end so the loop seams invisibly.
  const words = [...hero.rotatingWords, hero.rotatingWords[0]];
  const brands = hero.brands.map(getProject).filter(Boolean);

  return (
    <section id="top" className="ol-section ol-hero" aria-labelledby="ol-hero-title">
      <div aria-hidden="true" className="ol-hero__dots" />
      <p aria-hidden="true" className="ol-hero__ghost">
        LANCER
      </p>
      <svg aria-hidden="true" className="ol-hero__blob-left" width="560" height="380" viewBox="0 0 560 380">
        <path d="M0 130 C 130 40, 280 70, 350 170 C 420 270, 500 320, 560 380 L 0 380 Z" fill="var(--ol-red)" />
        <path d="M0 80 C 150 0, 320 30, 400 160 C 460 250, 520 300, 560 340" fill="none" stroke="var(--ol-ink)" strokeWidth="1.5" />
      </svg>
      <svg aria-hidden="true" className="ol-hero__blob-right" width="420" height="300" viewBox="0 0 420 300">
        <path d="M60 0 C 120 110, 250 170, 420 160" fill="none" stroke="var(--ol-red)" strokeWidth="1.5" />
      </svg>

      <div className="ol-container ol-hero__inner">
        <div className="ol-hero__grid">
          <div className="ol-hero__copy ol-in">
            <h1 id="ol-hero-title" className="ol-hero__title">
              {hero.headingLines[0]}
              <br />
              {hero.headingLines[1]}{' '}
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

            <p className="ol-hero__intro">{hero.intro}</p>
            <div className="ol-hero__ctas">
              <a className="ol-btn ol-btn--red ol-btn--lg" href={hero.primaryCta.href}>
                {hero.primaryCta.label} <Icon name="arrowRight" size={18} strokeWidth={2.4} />
              </a>
              <a className="ol-btn ol-btn--white ol-btn--lg" href={hero.secondaryCta.href}>
                {hero.secondaryCta.label}
              </a>
            </div>
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
                  sizes="(min-width: 1024px) 370px, (min-width: 640px) 60vw, 80vw"
                />
              </div>
              <p className="ol-sticky" aria-hidden="true">
                {hero.stickyNote[0]}
                <br />
                {hero.stickyNote[1]}
              </p>
              <p aria-hidden="true" className="ol-code-chip">
                &lt;<span>Build</span> /&gt;
              </p>
            </div>
          </div>
        </div>

        <ul className="ol-stats ol-in ol-in--later">
          {hero.stats.map((stat) => (
            <li key={stat.value} className="ol-stat">
              <span className={`ol-stat__value${stat.accent ? ' ol-stat__value--red' : ''}`}>{stat.value}</span>
              <span className="ol-stat__label">
                {stat.label[0]}
                <br />
                {stat.label[1]}
              </span>
            </li>
          ))}
        </ul>

        <div className="ol-brands ol-in ol-in--last">
          <p className="ol-brands__label">{hero.brandsLabel}</p>
          <ul className="ol-brands__list">
            {brands.map((brand) => (
              <li key={brand.slug}>
                <Link className="ol-brands__link" href={projectHref(brand.slug)}>
                  {brand.shortName}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
