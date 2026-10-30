'use client';

import { selectPlan } from '@/lib/planSelection';

/** Pricing card button: scrolls to the form (plain anchor) and pre-selects the plan. */
export default function PlanCta({ planId, href, className, children }) {
  return (
    <a className={className} href={href} onClick={() => selectPlan(planId)}>
      {children}
    </a>
  );
}
