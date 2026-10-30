import { after, NextResponse } from 'next/server';
import { getClientIp, isCrossOrigin } from '@/lib/auth/server';
import { getSmtpConfig, getTransporter } from '@/lib/mailer';
import { hit } from '@/lib/rateLimit';
import { findPlan, needLabel, validateContact } from '@/lib/contactValidation';
import { site } from '@/data/portfolio';
import { flushPostHogLogs, logPostHogError, logPostHogInfo } from '@/lib/posthogLogs';

/**
 * Public contact form endpoint (the only public write route).
 * Spam protection: same-origin check, honeypot field, minimum fill time,
 * per-IP rate limit, and strict server-side validation.
 */

const MIN_FILL_MS = 3000;
const MAX_FORM_AGE_MS = 24 * 60 * 60 * 1000;
const RATE_LIMIT = { limit: 3, windowMs: 10 * 60 * 1000 };

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

// Header-safe single line (no CR/LF injection into subject / names).
function oneLine(value) {
  return String(value ?? '').replace(/[\r\n]+/g, ' ').trim();
}

export async function POST(request) {
  if (isCrossOrigin(request)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  let body;
  try {
    body = await request.json();
  } catch (_) {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  // Bots that fill the hidden field or submit instantly get a fake success — no hint to retry.
  const elapsed = Date.now() - Number(body?.startedAt || 0);
  if (body?.website || !Number.isFinite(elapsed) || elapsed < MIN_FILL_MS || elapsed > MAX_FORM_AGE_MS) {
    return NextResponse.json({ ok: true });
  }

  const limit = hit(`contact:${getClientIp(request)}`, RATE_LIMIT);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: 'You have sent a few messages already. Please try again a little later.' },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfterSeconds) } },
    );
  }

  const { values, errors } = validateContact(body);
  if (Object.keys(errors).length) {
    return NextResponse.json({ error: 'Please fix the highlighted fields.', errors }, { status: 422 });
  }

  const transporter = getTransporter();
  const smtp = getSmtpConfig();
  if (!transporter || !smtp) {
    console.error('[api/contact] SMTP is not configured.');
    logPostHogError('contact delivery unavailable', {
      route: '/api/contact',
      reason: 'smtp_not_configured',
    });
    after(flushPostHogLogs);
    return NextResponse.json({ error: 'The message could not be sent right now.' }, { status: 503 });
  }

  const to = process.env.CONTACT_TO_EMAIL || site.email;
  const need = needLabel(values.need);
  const plan = findPlan(values.plan)?.name ?? 'Not chosen';
  const name = oneLine(values.name);

  const text = [
    `New project enquiry from ${site.name} portfolio`,
    '',
    `Name: ${name}`,
    `Email: ${values.email}`,
    `Needs: ${need}`,
    `Plan: ${plan}`,
    `Budget: ${values.budget}`,
    '',
    values.message,
  ].join('\n');

  const html = `
    <div style="font-family:Arial,sans-serif;font-size:15px;color:#1B1A19;line-height:1.6">
      <h2 style="margin:0 0 12px;color:#C1270A">New project enquiry</h2>
      <p style="margin:0"><strong>Name:</strong> ${escapeHtml(name)}</p>
      <p style="margin:0"><strong>Email:</strong> ${escapeHtml(values.email)}</p>
      <p style="margin:0"><strong>Needs:</strong> ${escapeHtml(need)}</p>
      <p style="margin:0"><strong>Plan:</strong> ${escapeHtml(plan)}</p>
      <p style="margin:0 0 12px"><strong>Budget:</strong> ${escapeHtml(values.budget)}</p>
      <p style="margin:0;white-space:pre-wrap">${escapeHtml(values.message)}</p>
    </div>`;

  try {
    await transporter.sendMail({
      from: { name: `${site.name} Portfolio`, address: smtp.auth.user },
      to,
      replyTo: { name, address: values.email },
      subject: oneLine(`New enquiry: ${need} · ${values.budget} — ${name}`),
      text,
      html,
    });
  } catch (err) {
    console.error('[api/contact] sendMail failed:', err?.message);
    logPostHogError('contact delivery failed', {
      route: '/api/contact',
      reason: 'mail_transport_error',
    });
    after(flushPostHogLogs);
    return NextResponse.json({ error: 'The message could not be sent right now.' }, { status: 502 });
  }

  logPostHogInfo('contact delivery completed', {
    route: '/api/contact',
    outcome: 'sent',
  });
  after(flushPostHogLogs);
  return NextResponse.json({ ok: true });
}
