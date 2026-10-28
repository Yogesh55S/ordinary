'use client';

import { useEffect, useRef } from 'react';
import { m, useReducedMotion, useScroll, useSpring } from 'framer-motion';
import Icon from './Icon';
import { Reveal } from './Reveal';
import { workflow } from '@/data/portfolio';

const EASE = [0.2, 0.7, 0.2, 1];
// A step "lights up" once it reaches the middle of the screen.
const STEP_VIEWPORT = { once: true, margin: '0px 0px -45% 0px' };

const cardVariants = {
  idle: { opacity: 0, x: 28 },
  on: { opacity: 1, x: 0, transition: { duration: 0.7, ease: EASE } },
};
const fillVariants = {
  idle: { scale: 0, opacity: 0 },
  on: { scale: 1, opacity: 1, transition: { type: 'spring', stiffness: 420, damping: 22, delay: 0.1 } },
};

/**
 * "How we'll work" timeline.
 * < 1100px: vertical rail on the left; its red fill follows the scroll and each
 *           number fills red as its step reaches mid-screen.
 * ≥ 1100px: five columns on a horizontal rail that draws itself in.
 * Only transform / opacity are animated. Reduced motion shows the finished state.
 */
export default function Process() {
  const timelineRef = useRef(null);
  const listRef = useRef(null);
  const railRef = useRef(null);
  const reduce = useReducedMotion();
  // The rail runs node-centre to node-centre, so tracking it against the same 55% line
  // the steps light up on keeps the red fill arriving exactly as each number fills.
  const { scrollYProgress } = useScroll({ target: railRef, offset: ['start 55%', 'end 55%'] });
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 30, restDelta: 0.001 });
  const last = workflow.steps.length - 1;
  const initial = reduce ? 'on' : 'idle';

  // End the vertical rail at the last node's centre — card heights vary with copy and width.
  useEffect(() => {
    const timeline = timelineRef.current;
    const list = listRef.current;
    if (!timeline || !list) return undefined;
    const measure = () => {
      const step = list.lastElementChild;
      const node = step?.firstElementChild;
      if (!step || !node) return;
      const end = list.offsetHeight - step.offsetTop - node.offsetHeight / 2;
      timeline.style.setProperty('--tl-end', `${Math.max(0, end)}px`);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(list);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="process" className="ol-section ol-process" aria-labelledby="ol-process-title">
      <div className="ol-container ol-process__inner">
        <Reveal className="ol-head ol-head--center ol-process__head">
          <p className="ol-eyebrow">{workflow.eyebrow}</p>
          <h2 id="ol-process-title" className="ol-h2">
            {workflow.heading}
          </h2>
          <p className="ol-lead ol-process__intro">{workflow.intro}</p>
        </Reveal>

        <div ref={timelineRef} className="ol-tl">
          <span ref={railRef} className="ol-tl__rail" aria-hidden="true">
            <m.span className="ol-tl__fill ol-tl__fill--y" style={{ scaleY: reduce ? 1 : progress }} />
            <m.span
              className="ol-tl__fill ol-tl__fill--x"
              initial={{ scaleX: reduce ? 1 : 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 1.4, ease: EASE, delay: 0.2 }}
            />
          </span>

          <ol ref={listRef} className="ol-tl__list">
            {workflow.steps.map((step, index) => (
              <m.li
                key={step.title}
                className={`ol-tl__step${index === last ? ' ol-tl__step--last' : ''}`}
                initial={initial}
                whileInView="on"
                viewport={STEP_VIEWPORT}
              >
                <span className="ol-tl__node" aria-hidden="true">
                  <span className="ol-tl__num">{index + 1}</span>
                  <m.span className="ol-tl__node-fill" variants={fillVariants}>
                    {index + 1}
                  </m.span>
                </span>

                {/* Framer moves the wrapper; the hover lift lives on the card so transforms never fight. */}
                <m.div className="ol-tl__body" variants={cardVariants}>
                  <div className="ol-tl__card ol-lift">
                    <div className="ol-tl__top">
                      <span className="ol-tl__icon" aria-hidden="true">
                        <Icon name={step.icon} size={20} strokeWidth={2} />
                      </span>
                      <span className="ol-tl__when">{step.when}</span>
                    </div>
                    <h3 className="ol-tl__title">
                      <span className="ol-sr-only">Step {index + 1}: </span>
                      {step.title}
                    </h3>
                    <p className="ol-tl__text">{step.text}</p>
                    <p className="ol-tl__gets">
                      <Icon name="check" size={15} strokeWidth={3} />
                      {step.gets}
                    </p>
                  </div>
                </m.div>
              </m.li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
