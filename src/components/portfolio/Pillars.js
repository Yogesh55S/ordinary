import Icon from './Icon';
import { Reveal } from './Reveal';
import { pillars, site } from '@/data/portfolio';

export default function Pillars() {
  return (
    <section aria-label={`What ${site.name} stands for`} className="ol-section ol-pillars-section">
      <Reveal className="ol-container">
        <ul className="ol-pillars">
          {pillars.map((pillar) => (
            <li key={pillar.lines.join(' ')} className="ol-pillar">
              <Icon name={pillar.icon} size={42} color="var(--ol-ink)" strokeWidth={1.6} />
              <span>
                {pillar.lines[0]}
                <br />
                {pillar.lines[1]}
              </span>
            </li>
          ))}
        </ul>
      </Reveal>
    </section>
  );
}
