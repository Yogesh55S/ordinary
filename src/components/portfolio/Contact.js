import Icon from './Icon';
import ContactForm from './ContactForm';
import { Reveal } from './Reveal';
import { contact, site } from '@/data/portfolio';

export default function Contact() {
  return (
    <section id="contact" className="ol-section ol-contact ol-on-red" aria-labelledby="ol-contact-title">
      <svg aria-hidden="true" className="ol-contact__blob" width="520" height="360" viewBox="0 0 520 360">
        <path d="M80 360 C 140 220, 300 150, 520 170 L 520 360 Z" fill="var(--ol-ink)" />
        <path d="M0 330 C 150 200, 340 120, 520 140" fill="none" stroke="#FFFFFF" strokeWidth="1.5" />
      </svg>
      <div className="ol-container ol-contact__inner">
        <Reveal className="ol-contact__copy">
          <p className="ol-contact__eyebrow">{contact.eyebrow}</p>
          <h2 id="ol-contact-title" className="ol-contact__title">
            {contact.heading[0]}
            <br />
            {contact.heading[1]}
          </h2>
          <svg aria-hidden="true" className="ol-contact__brush" width="300" height="18" viewBox="0 0 300 18">
            <path d="M4 13 C 90 3, 200 2, 296 9" fill="none" stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" />
          </svg>
          <p className="ol-contact__intro">{contact.intro}</p>
          <div className="ol-contact__links">
            <a className="ol-contact__link" href={`mailto:${site.email}`}>
              <span className="ol-contact__link-icon">
                <Icon name="mail" size={20} color="var(--ol-red)" />
              </span>
              {site.email}
            </a>
            <a className="ol-contact__link" href={site.linkedin} target="_blank" rel="noopener noreferrer">
              <span className="ol-contact__link-icon">
                <Icon name="linkedin" size={20} color="var(--ol-red)" />
              </span>
              {site.linkedinLabel}
            </a>
          </div>
        </Reveal>

        <Reveal className="ol-form-wrap">
          <ContactForm />
        </Reveal>
      </div>
    </section>
  );
}
