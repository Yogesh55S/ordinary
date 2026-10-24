import Icon from './Icon';
import { Reveal, RevealGroup, RevealItem } from './Reveal';
import { experience } from '@/data/portfolio';

export default function Journey() {
  const { achievement } = experience;

  return (
    <section id="journey" className="ol-section ol-journey" aria-labelledby="ol-journey-title">
      <div className="ol-container ol-journey__inner">
        <Reveal className="ol-journey__intro">
          <p className="ol-eyebrow">{experience.eyebrow}</p>
          <h2 id="ol-journey-title" className="ol-h2">
            {experience.heading}
          </h2>
          <article className="ol-award ol-lift">
            <p className="ol-award__badge">{achievement.badge}</p>
            <Icon name="trophy" size={40} color="#FFFFFF" strokeWidth={1.8} />
            <h3 className="ol-award__title">{achievement.title}</h3>
            <p className="ol-award__text">{achievement.text}</p>
          </article>
        </Reveal>

        <RevealGroup as="ol" className="ol-roles">
          {experience.roles.map((role) => (
            <RevealItem as="li" key={`${role.title}-${role.period}`}>
              <div className="ol-role ol-lift">
                <p className="ol-role__period">
                  {role.period}
                  {role.active && (
                    <span className="ol-role__active">
                      <span aria-hidden="true" className="ol-dot ol-dot--sm" />
                      ACTIVE
                    </span>
                  )}
                </p>
                <div className="ol-role__body">
                  <h3 className="ol-role__title">{role.title}</h3>
                  <p className="ol-role__org">{role.org}</p>
                  <p className="ol-role__text">{role.text}</p>
                </div>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
