import { skills } from '@/data/portfolio';

function Row({ hidden = false }) {
  return (
    <ul className="ol-marquee__row" aria-hidden={hidden || undefined}>
      {skills.map((skill) => (
        <li key={skill}>
          {skill} <span aria-hidden="true">✦</span>
        </li>
      ))}
    </ul>
  );
}

/** Tilted red skills strip. Two identical rows translate -50% for a seamless loop. */
export default function SkillsMarquee() {
  return (
    <section aria-label="Skills" className="ol-marquee ol-on-red">
      <div className="ol-marquee__track">
        <Row />
        <Row hidden />
      </div>
    </section>
  );
}
