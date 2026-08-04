// Renders the "What I Work With" skills box for job-application emails. The compiled
// template contains a literal {{TECH_STACK_SECTION}} token in place of this section (see
// job-application-email/components/TechStack.tsx) so each application can highlight a
// different subset of skills instead of a fixed baked-in list.
//
// DEFAULT_TECH_STACK is the canonical skills list — kept here (not in the separate
// job-application-email sub-project) since it needs to be usable from plain server/client
// JS without pulling in that sub-project's own React/tsx toolchain.

export const DEFAULT_TECH_STACK = [
  { category: 'Frontend', items: ['React.js', 'Next.js', 'React Native (Expo)', 'Tailwind CSS'] },
  { category: 'Backend', items: ['Node.js', 'Python', 'REST APIs', 'JWT', 'Webhooks'] },
  { category: 'Data & Caching', items: ['Supabase (Postgres)', 'MongoDB', 'MySQL', 'Valkey / Redis'] },
  { category: 'Cloud & Integrations', items: ['AWS Lambda', 'API Gateway', 'EventBridge', 'Vercel', 'Shopify', 'Cashfree', 'Razorpay'] },
];

// Single quotes around 'Segoe UI' are HTML-entity-escaped (&#x27;) to exactly match what
// react-email produces elsewhere in this template — some email clients' inline-style
// sanitizers mishandle a raw quote character inside a style="..." attribute and drop the
// whole attribute, which silently strips all chip styling (background/padding/spacing)
// while leaving the text behind.
const FONT_FAMILY = "-apple-system, BlinkMacSystemFont, &#x27;Segoe UI&#x27;, Roboto, Helvetica, Arial, sans-serif";

const CHIP_STYLE = `display:inline-block;background-color:#EFF6FF;color:#1D4ED8;font-family:${FONT_FAMILY};font-size:12px;font-weight:600;padding:5px 10px;border-radius:4px;margin-right:6px;margin-bottom:6px`;

const CATEGORY_LABEL_STYLE = `font-size:12px;line-height:24px;color:#0F172A;font-family:${FONT_FAMILY};font-weight:700;letter-spacing:0.5px;text-transform:uppercase;margin:0 0 10px 0`;

const EYEBROW_STYLE = `font-size:12px;line-height:24px;color:#3B82F6;font-family:${FONT_FAMILY};font-weight:700;letter-spacing:1.5px;text-transform:uppercase;margin:0 0 20px 0`;

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

// categories: [{ category: string, items: string[] }] — items already filtered to the
// ones selected for this specific application. Each category renders as its own full-width
// row (stacked top to bottom) rather than side-by-side columns, so its chips have the full
// email width to flow and wrap across instead of being squeezed into a narrow column.
export function buildTechStackSectionHtml(categories) {
  const nonEmpty = (categories || []).filter((c) => c.items && c.items.length > 0);
  if (nonEmpty.length === 0) return '';

  const rows = nonEmpty
    .map((group, index) => {
      const topBorder = index > 0 ? 'border-top:1px solid #E2E8F0;' : '';
      const chips = group.items.map((item) => `<span style="${CHIP_STYLE}">${escapeHtml(item)}</span>`).join('');
      return `<tr><td style="padding:16px;${topBorder}"><p style="${CATEGORY_LABEL_STYLE}">${escapeHtml(group.category)}</p><div>${chips}</div></td></tr>`;
    })
    .join('');

  return `<table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" class="content-section" style="background-color:#FFFFFF;padding:24px 32px 36px 32px"><tbody><tr><td><p style="${EYEBROW_STYLE}">What I Work With</p><table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background-color:#F8FAFC;border:1px solid #E2E8F0;border-radius:8px"><tbody>${rows}</tbody></table></td></tr></tbody></table>`;
}
