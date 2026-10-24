import Link from 'next/link';
import Icon from '../Icon';
import { Reveal } from '../Reveal';

export default function CaseCta({ heading }) {
  return (
    <section className="ol-section ol-case-cta" aria-labelledby="ol-case-cta-title">
      <Reveal className="ol-container">
        <div className="ol-cta-band ol-on-red">
          <svg aria-hidden="true" className="ol-cta-band__blob" width="360" height="240" viewBox="0 0 360 240">
            <path d="M60 240 C 100 140, 220 90, 360 110 L 360 240 Z" fill="var(--ol-ink)" />
          </svg>
          <div className="ol-cta-band__copy">
            <p className="ol-cta-band__eyebrow">like what you see?</p>
            <h2 id="ol-case-cta-title" className="ol-cta-band__title">
              {heading}
            </h2>
          </div>
          <Link className="ol-btn ol-btn--white ol-btn--lg ol-cta-band__btn" href="/#contact">
            Start a project <Icon name="arrowRight" size={18} strokeWidth={2.4} />
          </Link>
        </div>
      </Reveal>
    </section>
  );
}
