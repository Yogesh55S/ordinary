import Icon from './Icon';
import { Reveal, RevealGroup, RevealItem } from './Reveal';
import { pricing } from '@/data/portfolio';

export default function Pricing() {
  return (
    <section id="pricing" className="ol-section ol-pricing" aria-labelledby="ol-pricing-title">
      <div className="ol-container ol-pricing__inner">
        <Reveal className="ol-head ol-head--center">
          <p className="ol-eyebrow">{pricing.eyebrow}</p>
          <h2 id="ol-pricing-title" className="ol-h2">
            {pricing.heading}
          </h2>
          <p className="ol-lead ol-pricing__intro">{pricing.intro}</p>
        </Reveal>

        <RevealGroup className="ol-plans">
          {pricing.plans.map((plan) => (
            <RevealItem key={plan.name}>
              <article className={`ol-plan ol-lift ol-fill${plan.featured ? ' ol-plan--featured ol-on-dark' : ''}`}>
                {plan.badge && <p className="ol-plan__badge">{plan.badge}</p>}
                <div className="ol-plan__head">
                  <h3 className="ol-plan__name">{plan.name}</h3>
                  <p className="ol-plan__summary">{plan.summary}</p>
                </div>
                <p className="ol-plan__price">
                  {plan.price}
                  <span className="ol-plan__unit">{plan.unit}</span>
                </p>
                <ul className="ol-plan__features">
                  {plan.features.map((feature) => (
                    <li key={feature}>
                      <Icon
                        name="check"
                        size={20}
                        strokeWidth={2.4}
                        color={plan.featured ? 'var(--ol-red-on-dark)' : 'var(--ol-red)'}
                      />
                      {feature}
                    </li>
                  ))}
                </ul>
                <a
                  className={`ol-btn ${plan.featured ? 'ol-btn--red ol-btn--paper-border' : 'ol-btn--white'}`}
                  href={plan.cta.href}
                >
                  {plan.cta.label}
                </a>
              </article>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
