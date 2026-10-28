import Icon from './Icon';
import { Reveal, RevealGroup, RevealItem } from './Reveal';
import { about } from '@/data/portfolio';

const ICON_COLOR = { red: '#FFFFFF', light: 'var(--ol-red)', dark: 'var(--ol-red-on-dark)' };

function CodeValue({ value, kind }) {
  if (kind === 'list') {
    return (
      <>
        [
        {value.map((item, index) => (
          <span key={item}>
            {index > 0 && ', '}
            <span className="ol-code__str">&apos;{item}&apos;</span>
          </span>
        ))}
        ]
      </>
    );
  }
  if (kind === 'number') return <span className="ol-code__num">{value}</span>;
  return <span className="ol-code__str">{value}</span>;
}

/** The typed-out "lancer.config.js" card; lines reveal one after another. */
function CodeCard() {
  const { code } = about;
  const last = code.lines.length - 1;
  return (
    <div className="ol-code ol-lift ol-fill">
      <div className="ol-code__bar">
        <span aria-hidden="true" className="ol-browser__dots ol-browser__dots--code">
          <span />
          <span />
          <span />
        </span>
        <p className="ol-code__file">{code.file}</p>
      </div>
      <div role="img" aria-label={code.label} className="ol-code__body">
        <p className="ol-code__line" style={{ '--d': '0.2s' }}>
          <span className="ol-code__kw">const</span> lancer = {'{'}
        </p>
        {code.lines.map(([key, value, kind], index) => (
          <p key={key} className="ol-code__line ol-code__line--indent" style={{ '--d': `${0.7 + index * 0.5}s` }}>
            {key}: <CodeValue value={value} kind={kind} />
            {index < last ? ',' : null}
            {kind === 'cursor' && <span className="ol-code__cursor" />}
          </p>
        ))}
        <p className="ol-code__line" style={{ '--d': `${0.7 + code.lines.length * 0.5}s` }}>
          {'};'}
        </p>
      </div>
      <div className="ol-code__now">
        <p className="ol-code__now-label">
          <span aria-hidden="true" className="ol-dot ol-dot--sm ol-dot--bright" />
          {code.nowLabel}
        </p>
        <p className="ol-code__now-role">{code.now}</p>
        <p className="ol-code__now-note">{code.nowNote}</p>
      </div>
    </div>
  );
}

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
            <div className="ol-about__ctas">
              <a className="ol-btn ol-btn--ink ol-btn--compact" href={about.cta.href} target="_blank" rel="noopener noreferrer">
                {about.cta.label}
              </a>
            </div>
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

        <Reveal>
          <CodeCard />
        </Reveal>

        <Reveal className="ol-toolbox">
          <div className="ol-toolbox__head">
            <div>
              <p className="ol-eyebrow">{about.toolbox.eyebrow}</p>
              <h2 className="ol-toolbox__title">{about.toolbox.heading}</h2>
            </div>
            <p className="ol-toolbox__intro">{about.toolbox.intro}</p>
          </div>
          <RevealGroup as="ul" className="ol-tgroups">
            {about.toolbox.groups.map((group) => (
              <RevealItem as="li" key={group.title} className="ol-tgroup">
                <div className="ol-tgroup__head">
                  <span className="ol-tgroup__icon" aria-hidden="true">
                    <Icon name={group.icon} size={20} strokeWidth={2} />
                  </span>
                  <h3 className="ol-tgroup__title">{group.title}</h3>
                  <span className="ol-tgroup__count" aria-label={`${group.tools.length} tools`}>
                    {String(group.tools.length).padStart(2, '0')}
                  </span>
                </div>
                <ul className="ol-tgroup__tools">
                  {group.tools.map((tool) => (
                    <li key={tool} className="ol-pill">
                      {tool}
                    </li>
                  ))}
                </ul>
              </RevealItem>
            ))}
          </RevealGroup>
        </Reveal>
      </div>
    </section>
  );
}
