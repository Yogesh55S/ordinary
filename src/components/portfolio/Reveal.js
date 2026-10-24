'use client';

import { LazyMotion, domAnimation, m, useReducedMotion } from 'framer-motion';

/**
 * Scroll reveal: fade + rise 40px, once, when the element enters the viewport.
 * Groups stagger their direct <RevealItem> children. With prefers-reduced-motion
 * everything renders in place with no animation.
 *
 * Reveal wrappers only animate opacity/transform of the wrapper itself; hover lifts
 * live on the inner card so the two transforms never fight.
 */

const EASE = [0.2, 0.7, 0.2, 1];
const VIEWPORT = { once: true, amount: 0.15, margin: '0px 0px -60px 0px' };

const itemVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: EASE } },
};

const groupVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } },
};

export function MotionProvider({ children }) {
  return (
    <LazyMotion features={domAnimation} strict>
      {children}
    </LazyMotion>
  );
}

const TAGS = { div: m.div, li: m.li, ul: m.ul, ol: m.ol, article: m.article, section: m.section, form: m.form };

function pick(as) {
  return TAGS[as] ?? m.div;
}

export function Reveal({ as = 'div', children, ...props }) {
  const reduce = useReducedMotion();
  const Tag = pick(as);
  return (
    <Tag
      initial={reduce ? false : 'hidden'}
      whileInView="visible"
      viewport={VIEWPORT}
      variants={itemVariants}
      {...props}
    >
      {children}
    </Tag>
  );
}

export function RevealGroup({ as = 'div', children, ...props }) {
  const reduce = useReducedMotion();
  const Tag = pick(as);
  return (
    <Tag
      initial={reduce ? false : 'hidden'}
      whileInView="visible"
      viewport={VIEWPORT}
      variants={groupVariants}
      {...props}
    >
      {children}
    </Tag>
  );
}

export function RevealItem({ as = 'div', children, ...props }) {
  const Tag = pick(as);
  return (
    <Tag variants={itemVariants} {...props}>
      {children}
    </Tag>
  );
}
