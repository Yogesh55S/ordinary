import { contact, pricing } from '@/data/portfolio';

/**
 * Contact form rules, shared by the browser (instant feedback) and the API route
 * (the real check). Returns { values, errors } with trimmed values.
 */

export const CONTACT_LIMITS = {
  name: { min: 2, max: 80 },
  email: { max: 160 },
  message: { min: 10, max: 4000 },
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const NEED_IDS = new Set(contact.form.needs.map((need) => need.id));
const BUDGETS = new Set(contact.form.budgets);
const PLAN_IDS = new Set(pricing.plans.map((plan) => plan.id));

export function validateContact(input) {
  const values = {
    name: String(input?.name ?? '').trim(),
    email: String(input?.email ?? '').trim(),
    need: String(input?.need ?? ''),
    budget: String(input?.budget ?? ''),
    // Optional: set when the visitor came from a pricing card. Unknown ids are dropped.
    plan: PLAN_IDS.has(String(input?.plan ?? '')) ? String(input.plan) : '',
    message: String(input?.message ?? '').trim(),
  };
  const errors = {};

  if (values.name.length < CONTACT_LIMITS.name.min) errors.name = 'Please tell me your name.';
  else if (values.name.length > CONTACT_LIMITS.name.max) errors.name = 'That name is a bit long.';

  if (!values.email) errors.email = 'I need an email to reply to.';
  else if (values.email.length > CONTACT_LIMITS.email.max || !EMAIL_RE.test(values.email)) {
    errors.email = 'That email doesn’t look right.';
  }

  if (!NEED_IDS.has(values.need)) errors.need = 'Pick what you need.';
  if (!BUDGETS.has(values.budget)) errors.budget = 'Pick a budget range.';

  if (values.message.length < CONTACT_LIMITS.message.min) {
    errors.message = 'A few more words about your project, please.';
  } else if (values.message.length > CONTACT_LIMITS.message.max) {
    errors.message = `Please keep it under ${CONTACT_LIMITS.message.max} characters.`;
  }

  return { values, errors };
}

export function needLabel(id) {
  return contact.form.needs.find((need) => need.id === id)?.label ?? id;
}

export function findPlan(id) {
  return pricing.plans.find((plan) => plan.id === id) ?? null;
}
