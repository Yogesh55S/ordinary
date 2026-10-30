/**
 * Pricing card → contact form hand-off. The card's link still jumps to #contact
 * natively; this event tells the (client) form which plan to pre-select.
 */

export const PLAN_SELECT_EVENT = 'ol:select-plan';

export function selectPlan(planId) {
  window.dispatchEvent(new CustomEvent(PLAN_SELECT_EVENT, { detail: { planId } }));
}
