import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { supabaseService } from '@/lib/supabase';
import { DEFAULT_TECH_STACK, buildTechStackSectionHtml } from '@/lib/jobApplicationTechStack';

// Hardcoded per product requirement — override via JOB_APPLICATION_SENDER_EMAIL if the sending
// mailbox ever changes, but this is the address application emails are sent from.
const SENDER_EMAIL = process.env.JOB_APPLICATION_SENDER_EMAIL || 'yogesharma914@gmail.com';
const SENDER_NAME = process.env.JOB_APPLICATION_SENDER_NAME || 'Yogesh Kumar';

const PORTFOLIO_URL = process.env.JOB_APPLICATION_PORTFOLIO_URL || '';
const GITHUB_URL = process.env.JOB_APPLICATION_GITHUB_URL || '';
const LINKEDIN_URL = process.env.JOB_APPLICATION_LINKEDIN_URL || '';
const RESUME_URL = process.env.JOB_APPLICATION_RESUME_URL || '';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

function renderTemplate(template, tokens) {
  let out = template;
  for (const [token, value] of Object.entries(tokens)) {
    out = out.split(token).join(value);
  }
  return out;
}

function getSmtpConfig() {
  const host = process.env.JOB_APPLICATION_SMTP_HOST || process.env.SMTP_HOST;
  const port = parseInt(process.env.JOB_APPLICATION_SMTP_PORT || process.env.SMTP_PORT, 10) || 587;
  const user = process.env.JOB_APPLICATION_SMTP_USER || process.env.SMTP_USER;
  const pass = process.env.JOB_APPLICATION_SMTP_PASS || process.env.SMTP_PASS;
  const secure = (process.env.JOB_APPLICATION_SMTP_SECURE ?? process.env.SMTP_SECURE) === 'true';

  if (!host || !user || !pass) return null;
  return { host, port, secure, auth: { user, pass } };
}

// Composed, immediate single-send path (distinct from the bulk-queue /api/send-job-emails
// loop): the caller picks a specific template + a custom skills subset for this one
// application, and the email goes out right away instead of joining the Pending queue.
export async function POST(request) {
  if (!supabaseService) {
    return NextResponse.json(
      { error: 'Missing SUPABASE_SERVICE_ROLE_KEY — required to send job application emails from the server.' },
      { status: 500 }
    );
  }

  const smtpConfig = getSmtpConfig();
  if (!smtpConfig) {
    return NextResponse.json(
      { error: 'SMTP is not configured. Set SMTP_HOST, SMTP_USER and SMTP_PASS in .env.local.' },
      { status: 500 }
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const {
    hrEmail,
    hrName,
    companyName,
    templateId,
    jobProfileId,
    jobTitle,
    whyCompany,
    relevantSkills,
    selectedSkills,
  } = body || {};

  if (!hrEmail || !EMAIL_RE.test(hrEmail)) {
    return NextResponse.json({ error: 'A valid HR email is required.' }, { status: 400 });
  }
  if (!templateId) {
    return NextResponse.json({ error: 'A template must be selected.' }, { status: 400 });
  }

  const { data: template, error: templateError } = await supabaseService
    .from('job_email_template')
    .select('*')
    .eq('id', templateId)
    .maybeSingle();

  if (templateError) {
    return NextResponse.json({ error: templateError.message }, { status: 500 });
  }
  if (!template) {
    return NextResponse.json({ error: 'Selected template not found — it may have been deleted.' }, { status: 404 });
  }

  const techStackCategories = Array.isArray(selectedSkills) && selectedSkills.length ? selectedSkills : DEFAULT_TECH_STACK;
  const techStackHtml = buildTechStackSectionHtml(techStackCategories);

  const resolvedJobTitle = jobTitle || 'the open role';

  const htmlTokens = {
    '{{HR_NAME}}': escapeHtml(hrName || 'there'),
    '{{COMPANY_NAME}}': escapeHtml(companyName || 'your team'),
    '{{JOB_TITLE}}': escapeHtml(resolvedJobTitle),
    '{{WHY_COMPANY}}': escapeHtml(whyCompany || ''),
    '{{RELEVANT_SKILLS}}': escapeHtml(relevantSkills || ''),
    // URL tokens sit inside href attributes — do not HTML-escape them.
    '{{PORTFOLIO_URL}}': PORTFOLIO_URL,
    '{{GITHUB_URL}}': GITHUB_URL,
    '{{LINKEDIN_URL}}': LINKEDIN_URL,
    '{{RESUME_URL}}': RESUME_URL,
    '{{TECH_STACK_SECTION}}': techStackHtml,
  };

  const html = renderTemplate(template.html_content, htmlTokens);

  const text = template.plain_text_content
    ? renderTemplate(template.plain_text_content, {
        '{{HR_NAME}}': hrName || 'there',
        '{{COMPANY_NAME}}': companyName || 'your team',
        '{{JOB_TITLE}}': resolvedJobTitle,
        '{{WHY_COMPANY}}': whyCompany || '',
        '{{RELEVANT_SKILLS}}': relevantSkills || '',
        '{{PORTFOLIO_URL}}': PORTFOLIO_URL,
        '{{GITHUB_URL}}': GITHUB_URL,
        '{{LINKEDIN_URL}}': LINKEDIN_URL,
        '{{RESUME_URL}}': RESUME_URL,
      })
    : null;

  const subject = `Application for ${resolvedJobTitle}${companyName ? ` at ${companyName}` : ''}`;
  const transporter = nodemailer.createTransport(smtpConfig);

  try {
    await transporter.sendMail({
      from: `"${SENDER_NAME}" <${SENDER_EMAIL}>`,
      to: hrEmail,
      subject,
      html,
      ...(text ? { text } : {}),
    });

    const { data: inserted } = await supabaseService
      .from('job_hr_contacts')
      .insert({
        job_profile_id: jobProfileId || null,
        hr_email: hrEmail,
        hr_name: hrName || null,
        company_name: companyName || null,
        status: 'Sent',
        sent_at: new Date().toISOString(),
        template_id: templateId,
      })
      .select()
      .single();

    await supabaseService.from('activity_logs').insert({
      action_type: 'Job Application Email Sent',
      details: `Composed and sent application email to ${hrEmail} for "${resolvedJobTitle}"${companyName ? ` at ${companyName}` : ''}.`,
    });

    return NextResponse.json({ success: true, contactId: inserted?.id || null });
  } catch (sendErr) {
    await supabaseService.from('job_hr_contacts').insert({
      job_profile_id: jobProfileId || null,
      hr_email: hrEmail,
      hr_name: hrName || null,
      company_name: companyName || null,
      status: 'Failed',
      error_message: sendErr.message,
      template_id: templateId,
    });

    await supabaseService.from('activity_logs').insert({
      action_type: 'Job Application Email Failed',
      details: `Failed to send composed application email to ${hrEmail}: ${sendErr.message}`,
    });

    return NextResponse.json({ error: sendErr.message }, { status: 500 });
  }
}
