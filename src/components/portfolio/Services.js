import Icon from './Icon';
import { Reveal, RevealItem } from './Reveal';
import SwipeDeck from './SwipeDeck';
import { services } from '@/data/portfolio';

export default function Services() {
  const { featured } = services;

  return (
    <section id="services" className="ol-section ol-services" aria-labelledby="ol-services-title">
      <div className="ol-container ol-services__inner">
        <Reveal className="ol-head-row">
          <div className="ol-head">
            <p className="ol-eyebrow">{services.eyebrow}</p>
            <h2 id="ol-services-title" className="ol-h2">
              {services.heading[0]}
              <br />
              {services.heading[1]}
            </h2>
          </div>
          <p className="ol-lead ol-services__intro">{services.intro}</p>
        </Reveal>

        {/* Grid on tablet/desktop; a thumb-swipe card deck below 768px. */}
        <SwipeDeck className="ol-bento" label="Services">
          <RevealItem className="ol-bento__wide">
            <div data-deck-slide className="ol-deck__slide">
              <article className="ol-feature ol-lift ol-fill">
                <svg aria-hidden="true" className="ol-feature__blob" width="300" height="220" viewBox="0 0 300 220">
                  <path d="M40 220 C 80 120, 180 80, 300 100 L 300 220 Z" fill="var(--ol-red)" />
                </svg>
                <div className="ol-feature__top">
                  <div className="ol-feature__icon">
                    <Icon name={featured.icon} size={30} color="#FFFFFF" strokeWidth={1.8} />
                  </div>
                  <p className="ol-feature__note">{featured.note}</p>
                </div>
                <div className="ol-feature__body">
                  <h3 className="ol-feature__title">{featured.title}</h3>
                  <p className="ol-feature__text">{featured.description}</p>
                  <ul className="ol-tags" aria-label="Stack">
                    {featured.tags.map((tag) => (
                      <li key={tag}>{tag}</li>
                    ))}
                  </ul>
                </div>
              </article>
            </div>
          </RevealItem>

          {services.items.map((item) => (
            <RevealItem key={item.title}>
              <div data-deck-slide className="ol-deck__slide">
                <article className={`ol-card ol-lift ol-fill${item.tone === 'red' ? ' ol-card--red' : ''}`}>
                  <div className="ol-card__icon">
                    <Icon name={item.icon} size={26} color="var(--ol-red)" strokeWidth={1.9} />
                  </div>
                  <h3 className="ol-card__title">{item.title}</h3>
                  <p className="ol-card__text">{item.description}</p>
                  {item.points?.length > 0 && (
                    <ul className="ol-card__points">
                      {item.points.map((point) => (
                        <li key={point}>
                          <Icon name="check" size={16} strokeWidth={3} />
                          {point}
                        </li>
                      ))}
                    </ul>
                  )}
                  <p className="ol-card__meta">{item.stack}</p>
                </article>
              </div>
            </RevealItem>
          ))}
        </SwipeDeck>
      </div>
    </section>
  );
}
