import { skills } from '@/data/portfolio';

function Row({ items, hidden = false }) {
  return (
    <ul className="ol-marquee__row" aria-hidden={hidden || undefined}>
      {items.map((item) => (
        <li key={item}>
          {item} <span aria-hidden="true">✦</span>
        </li>
      ))}
    </ul>
  );
}

/**
 * Tilted red strip. Two identical rows translate -50% for a seamless loop.
 * Defaults to the home-page skills; case studies pass their own stack.
 */
export default function SkillsMarquee({ items = skills, label = 'Skills', className = '' }) {
  return (
    <section aria-label={label} className={`ol-marquee ol-on-red${className ? ` ${className}` : ''}`}>
      <div className="ol-marquee__track">
        <Row items={items} />
        <Row items={items} hidden />
      </div>
    </section>
  );
}
