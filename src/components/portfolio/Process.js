import { Reveal, RevealGroup, RevealItem } from './Reveal';
import { workflow } from '@/data/portfolio';

export default function Process() {
  const last = workflow.steps.length - 1;

  return (
    <section id="process" className="ol-section ol-process" aria-labelledby="ol-process-title">
      <div className="ol-container ol-process__inner">
        <Reveal className="ol-head ol-head--center">
          <p className="ol-eyebrow">{workflow.eyebrow}</p>
          <h2 id="ol-process-title" className="ol-h2">
            {workflow.heading}
          </h2>
        </Reveal>

        <div className="ol-steps-wrap">
          <svg
            aria-hidden="true"
            className="ol-steps__line"
            viewBox="0 0 1200 20"
            preserveAspectRatio="none"
          >
            <path
              d="M40 10 C 300 0, 600 20, 1160 10"
              fill="none"
              stroke="var(--ol-red)"
              strokeWidth="3"
              strokeDasharray="10 12"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
          <RevealGroup as="ol" className="ol-steps">
            {workflow.steps.map((step, index) => {
              const position = index === 0 ? ' ol-step__num--first' : index === last ? ' ol-step__num--last' : '';
              return (
                <RevealItem as="li" key={step.title} className="ol-step">
                  <span className={`ol-step__num${position}`} aria-hidden="true">
                    {index + 1}
                  </span>
                  <div className={`ol-step__card ol-lift${index === last ? ' ol-step__card--dark' : ''}`}>
                    <h3 className="ol-step__title">
                      <span className="ol-sr-only">Step {index + 1}: </span>
                      {step.title}
                    </h3>
                    <p className="ol-step__text">{step.text}</p>
                  </div>
                </RevealItem>
              );
            })}
          </RevealGroup>
        </div>
      </div>
    </section>
  );
}
