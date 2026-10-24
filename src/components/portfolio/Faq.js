'use client';

import { useId, useState } from 'react';
import { AnimatePresence, m, useReducedMotion } from 'framer-motion';
import Icon from './Icon';
import { Reveal, RevealGroup, RevealItem } from './Reveal';
import { faq } from '@/data/portfolio';

/**
 * Accordion (WAI-ARIA pattern): each question is a heading wrapping a real
 * <button> with aria-expanded/aria-controls; answers are labelled regions.
 * Enter/Space toggle natively; Up/Down/Home/End move between questions.
 */
export default function Faq() {
  const [openIndex, setOpenIndex] = useState(0);
  const reduce = useReducedMotion();
  const baseId = useId();

  const onKeyDown = (event) => {
    const keys = ['ArrowDown', 'ArrowUp', 'Home', 'End'];
    if (!keys.includes(event.key)) return;
    const buttons = Array.from(event.currentTarget.querySelectorAll('[data-faq-button]'));
    const current = buttons.indexOf(document.activeElement);
    if (current === -1) return;
    event.preventDefault();
    const last = buttons.length - 1;
    const next =
      event.key === 'Home' ? 0 : event.key === 'End' ? last : event.key === 'ArrowDown' ? (current + 1) % buttons.length : (current - 1 + buttons.length) % buttons.length;
    buttons[next].focus();
  };

  return (
    <section id="faq" className="ol-section ol-faq" aria-labelledby="ol-faq-title">
      <div className="ol-container ol-faq__inner">
        <Reveal className="ol-faq__intro">
          <p className="ol-eyebrow">{faq.eyebrow}</p>
          <h2 id="ol-faq-title" className="ol-h2">
            {faq.heading}
          </h2>
          <p className="ol-lead">{faq.intro}</p>
        </Reveal>

        <RevealGroup className="ol-faq__list" onKeyDown={onKeyDown}>
          {faq.items.map((item, index) => {
            const open = index === openIndex;
            const buttonId = `${baseId}-q-${index}`;
            const panelId = `${baseId}-a-${index}`;
            return (
              <RevealItem key={item.q} className="ol-faq__item">
                <h3 className="ol-faq__q">
                  <button
                    id={buttonId}
                    type="button"
                    data-faq-button
                    className="ol-faq__button"
                    aria-expanded={open}
                    aria-controls={panelId}
                    onClick={() => setOpenIndex(open ? -1 : index)}
                  >
                    <span>{item.q}</span>
                    <span className="ol-faq__icon" aria-hidden="true">
                      <Icon name={open ? 'minus' : 'plus'} size={18} strokeWidth={2.6} />
                    </span>
                  </button>
                </h3>
                <AnimatePresence initial={false}>
                  {open && (
                    <m.div
                      id={panelId}
                      role="region"
                      aria-labelledby={buttonId}
                      initial={reduce ? false : { opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={reduce ? undefined : { opacity: 0, transition: { duration: 0.12 } }}
                      transition={{ duration: 0.35, ease: [0.2, 0.7, 0.2, 1] }}
                    >
                      <p className="ol-faq__answer">{item.a}</p>
                    </m.div>
                  )}
                </AnimatePresence>
              </RevealItem>
            );
          })}
        </RevealGroup>
      </div>
    </section>
  );
}
