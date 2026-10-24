import { Reveal, RevealGroup, RevealItem } from '../Reveal';

export default function StackGrid({ project }) {
  return (
    <section className="ol-section ol-case-stack ol-on-dark" aria-labelledby="ol-case-stack-title">
      <div className="ol-container ol-case-stack__inner">
        <Reveal className="ol-head ol-case-stack__head">
          <p className="ol-eyebrow">under the hood</p>
          <h2 id="ol-case-stack-title" className="ol-h2">
            Tech stack
          </h2>
          <p className="ol-case-stack__note">The tools that power {project.name}.</p>
        </Reveal>
        <RevealGroup as="ul" className="ol-case-stack__list">
          {project.stack.map((tool) => (
            <RevealItem as="li" key={tool} className="ol-stack-pill ol-pill">
              <span aria-hidden="true" className="ol-stack-pill__mark" />
              {tool}
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
