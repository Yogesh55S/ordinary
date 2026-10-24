import Icon from './Icon';
import { Reveal, RevealGroup, RevealItem } from './Reveal';
import { about } from '@/data/portfolio';

const ICON_COLOR = { red: '#FFFFFF', light: 'var(--ol-red)', dark: 'var(--ol-red-on-dark)' };

export default function About() {
  return (
    <section id="about" className="ol-section ol-about" aria-labelledby="ol-about-title">
      <div className="ol-container ol-about__grid">
        <Reveal>
          <div className="ol-about__story">
            <p className="ol-eyebrow">{about.eyebrow}</p>
            <h2 id="ol-about-title" className="ol-about__title">
              {about.heading.before}
              <em>{about.heading.highlight}</em>
              {about.heading.after}
            </h2>
            {about.paragraphs.map((text) => (
              <p key={text} className="ol-about__text">
                {text}
              </p>
            ))}
            <a className="ol-btn ol-btn--ink" href={about.cta.href} target="_blank" rel="noopener noreferrer">
              {about.cta.label} <Icon name="arrowUpRight" size={14} strokeWidth={2.4} />
            </a>
          </div>
        </Reveal>

        <RevealGroup className="ol-reasons">
          {about.reasons.map((reason) => (
            <RevealItem key={reason.title}>
              <div className={`ol-reason ol-lift ol-fill${reason.tone === 'light' ? '' : ` ol-reason--${reason.tone}`}`}>
                <Icon name={reason.icon} size={34} color={ICON_COLOR[reason.tone]} strokeWidth={1.9} />
                <h3 className="ol-reason__title">{reason.title}</h3>
                <p className="ol-reason__text">{reason.text}</p>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>

        <Reveal className="ol-toolbox">
          <div className="ol-toolbox__head">
            <p className="ol-eyebrow">{about.toolbox.eyebrow}</p>
            <h2 className="ol-toolbox__title">{about.toolbox.heading}</h2>
          </div>
          <ul className="ol-tools">
            {about.toolbox.tools.map((tool) => (
              <li key={tool} className="ol-pill">
                {tool}
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
