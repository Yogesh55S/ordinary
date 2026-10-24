import Link from 'next/link';
import Icon from '../Icon';

export default function CaseHero({ project }) {
  const facts = [
    { label: 'TYPE', value: project.type },
    { label: 'PLATFORM', value: project.platform },
    { label: 'MY ROLE', value: project.role },
    { label: 'STATUS', value: project.status, live: true },
  ];

  return (
    <section className="ol-section ol-case-hero" aria-labelledby="ol-case-title">
      <svg aria-hidden="true" className="ol-case-hero__blob" width="460" height="320" viewBox="0 0 460 320">
        <path d="M120 0 C 170 100, 280 160, 460 140 L 460 0 Z" fill="var(--ol-red)" />
        <path d="M60 0 C 120 120, 260 190, 460 175" fill="none" stroke="var(--ol-ink)" strokeWidth="1.5" />
      </svg>
      <div className="ol-container ol-case-hero__inner">
        <nav aria-label="Breadcrumb" className="ol-crumbs ol-in">
          <Link className="ol-btn ol-btn--white ol-btn--crumb" href="/#work">
            <Icon name="arrowLeft" size={16} strokeWidth={2.4} />
            All projects
          </Link>
          <ol className="ol-crumbs__trail">
            <li>Work</li>
            <li aria-current="page">{project.name}</li>
          </ol>
        </nav>

        <div className="ol-case-hero__grid">
          <div className="ol-case-hero__copy ol-in">
            <p className="ol-case-hero__kicker">{project.kicker}</p>
            <h1 id="ol-case-title" className="ol-case-hero__title">
              {project.name}
            </h1>
            <svg aria-hidden="true" className="ol-case-hero__underline" width="360" height="18" viewBox="0 0 340 18">
              <path d="M4 13 C 90 3, 220 2, 336 9" fill="none" stroke="var(--ol-red)" strokeWidth="6" strokeLinecap="round" />
            </svg>
            <p className="ol-case-hero__subtitle">{project.subtitle}</p>
            <div className="ol-hero__ctas">
              {project.live && (
                <a className="ol-btn ol-btn--red" href={project.live} target="_blank" rel="noopener noreferrer">
                  {project.liveLabel} <Icon name="arrowUpRight" size={16} strokeWidth={2.4} />
                </a>
              )}
              <Link className="ol-btn ol-btn--white" href="/#contact">
                Build something similar
              </Link>
            </div>
          </div>

          <dl className="ol-facts ol-in ol-in--late">
            {facts.map((fact) => (
              <div key={fact.label} className="ol-facts__item">
                <dt>{fact.label}</dt>
                <dd>
                  {fact.live && <span aria-hidden="true" className="ol-dot" />}
                  {fact.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
