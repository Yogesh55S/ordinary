import { Reveal, RevealGroup, RevealItem } from '../Reveal';

/** "What I built" copy followed by the numbered feature cards. */
export default function Overview({ project }) {
  const [lead, ...rest] = project.overview;

  return (
    <>
      <section className="ol-section ol-case-overview" aria-labelledby="ol-case-overview-title">
        <div className="ol-container ol-case-overview__inner">
          <Reveal className="ol-head ol-case-overview__head">
            <p className="ol-eyebrow">the project</p>
            <h2 id="ol-case-overview-title" className="ol-h2">
              What I built
            </h2>
          </Reveal>
          <Reveal className="ol-case-overview__body">
            <p className="ol-case-overview__lead">{lead}</p>
            {rest.map((text) => (
              <p key={text} className="ol-case-overview__text">
                {text}
              </p>
            ))}
          </Reveal>
        </div>
      </section>

      <section className="ol-section ol-case-features" aria-labelledby="ol-case-features-title">
        <div className="ol-container ol-case-features__inner">
          <Reveal className="ol-head">
            <p className="ol-eyebrow">highlights</p>
            <h2 id="ol-case-features-title" className="ol-h2 ol-h2--sm">
              Key features
            </h2>
          </Reveal>
          <RevealGroup className="ol-case-features__grid">
            {project.features.map((feature, index) => (
              <RevealItem key={feature.title}>
                <article className="ol-feature-card ol-lift ol-fill">
                  <p aria-hidden="true" className="ol-feature-card__num">
                    {String(index + 1).padStart(2, '0')}
                  </p>
                  <h3 className="ol-feature-card__title">{feature.title}</h3>
                  <p className="ol-feature-card__text">{feature.text}</p>
                </article>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>
    </>
  );
}
