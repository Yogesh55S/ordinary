import { contact, site } from '@/data/portfolio';
import { findPlan, needLabel } from '@/lib/contactValidation';

/**
 * Turns validated contact form values into a wa.me link whose chat box is
 * pre-filled with a neatly formatted enquiry (WhatsApp renders *text* as bold).
 */

// WhatsApp formatting characters in user input would break the bold labels.
function plain(value) {
  return String(value ?? '').replace(/[*_~`]/g, '').trim();
}

export function buildWhatsAppMessage(values) {
  const { greeting, labels } = contact.form.whatsapp;
  const plan = findPlan(values.plan);

  const lines = [
    greeting,
    '',
    `*${labels.name}:* ${plain(values.name)}`,
    `*${labels.email}:* ${plain(values.email)}`,
    `*${labels.need}:* ${needLabel(values.need)}`,
    plan ? `*${labels.plan}:* ${plan.name}` : null,
    `*${labels.budget}:* ${values.budget}`,
    '',
    `*${labels.message}:*`,
    String(values.message ?? '').trim(),
  ];

  return lines.filter((line) => line !== null).join('\n');
}

export function buildWhatsAppUrl(values) {
  return `${site.whatsapp}?text=${encodeURIComponent(buildWhatsAppMessage(values))}`;
}
