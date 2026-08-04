import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import { supabaseService } from '@/lib/supabase';

// Hardcoded per product requirement — override via JOB_APPLICATION_SENDER_EMAIL if the sending
// mailbox ever changes, but this is the address application emails are sent from.
const SENDER_EMAIL = process.env.JOB_APPLICATION_SENDER_EMAIL || 'yogesharma914@gmail.com';
const SENDER_NAME = process.env.JOB_APPLICATION_SENDER_NAME || 'Yogesh Kumar';

const PORTFOLIO_URL = process.env.JOB_APPLICATION_PORTFOLIO_URL || '';
const GITHUB_URL = process.env.JOB_APPLICATION_GITHUB_URL || '';
const LINKEDIN_URL = process.env.JOB_APPLICATION_LINKEDIN_URL || '';
const RESUME_URL = process.env.JOB_APPLICATION_RESUME_URL || '';

const TEMPLATE_PATH = path.join(process.cwd(), 'job-application-email', 'dist', 'template.html');

const DEFAULT_BATCH_SIZE = 5;

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

function renderTemplate(templateHtml, tokens) {
  let html = templateHtml;
  for (const [token, value] of Object.entries(tokens)) {
    html = html.split(token).join(value);
  }
  return html;
}

function buildEmailHtml(templateHtml, { hrName, companyName, jobTitle, whyCompany, relevantSkills }) {
  return renderTemplate(templateHtml, {
    '{{HR_NAME}}': escapeHtml(hrName || 'there'),
    '{{COMPANY_NAME}}': escapeHtml(companyName || 'your team'),
    '{{JOB_TITLE}}': escapeHtml(jobTitle || 'the open role'),
    '{{WHY_COMPANY}}': escapeHtml(whyCompany || ''),
    '{{RELEVANT_SKILLS}}': escapeHtml(relevantSkills || ''),
    // URL tokens sit inside href attributes in the compiled template — do not HTML-escape them.
    '{{PORTFOLIO_URL}}': PORTFOLIO_URL,
    '{{GITHUB_URL}}': GITHUB_URL,
    '{{LINKEDIN_URL}}': LINKEDIN_URL,
    '{{RESUME_URL}}': RESUME_URL,
  });
}

function getSmtpConfig() {
  // Job applications send from a hardcoded address, which usually needs its own SMTP
  // credentials (most providers reject or silently rewrite a From that doesn't match
  // the authenticated account). Falls back to the shared outreach SMTP config if no
  // dedicated JOB_APPLICATION_SMTP_* credentials are set.
  const host = process.env.JOB_APPLICATION_SMTP_HOST || process.env.SMTP_HOST;
  const port = parseInt(process.env.JOB_APPLICATION_SMTP_PORT || process.env.SMTP_PORT, 10) || 587;
  const user = process.env.JOB_APPLICATION_SMTP_USER || process.env.SMTP_USER;
  const pass = process.env.JOB_APPLICATION_SMTP_PASS || process.env.SMTP_PASS;
  const secure = (process.env.JOB_APPLICATION_SMTP_SECURE ?? process.env.SMTP_SECURE) === 'true';

  if (!host || !user || !pass) return null;
  return { host, port, secure, auth: { user, pass } };
}

export async function POST(request) {
  if (!supabaseService) {
    return NextResponse.json(
      { error: 'Missing SUPABASE_SERVICE_ROLE_KEY — required to send job application batches from the server.' },
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

  if (!fs.existsSync(TEMPLATE_PATH)) {
    return NextResponse.json(
      { error: `Compiled email template not found at ${TEMPLATE_PATH}. Run "npm run export" inside job-application-email/ first.` },
      { status: 500 }
    );
  }
  const templateHtml = fs.readFileSync(TEMPLATE_PATH, 'utf-8');

  let requestedBatchSize = null;
  try {
    const body = await request.json();
    if (body && Number.isInteger(body.batchSize) && body.batchSize > 0) {
      requestedBatchSize = body.batchSize;
    }
  } catch {
    // No JSON body provided — fall back to configured batch size.
  }

  const { data: settings } = await supabaseService
    .from('job_application_settings')
    .select('*')
    .limit(1)
    .maybeSingle();

  const batchSize = requestedBatchSize || settings?.batch_size || DEFAULT_BATCH_SIZE;

  const { data: pending, error: fetchError } = await supabaseService
    .from('job_hr_contacts')
    .select('*, job_profiles(*)')
    .eq('status', 'Pending')
    .order('created_at', { ascending: true })
    .limit(batchSize);

  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 500 });
  }

  if (settings?.id) {
    await supabaseService
      .from('job_application_settings')
      .update({ last_run_at: new Date().toISOString() })
      .eq('id', settings.id);
  }

  if (!pending || pending.length === 0) {
    return NextResponse.json({ sent: 0, failed: 0, remaining: 0, message: 'Queue is empty.' });
  }

  const transporter = nodemailer.createTransport(smtpConfig);

  let sent = 0;
  let failed = 0;

  for (const contact of pending) {
    const profile = contact.job_profiles || {};
    const jobTitle = profile.title || 'the open role';
    const whyCompany = (profile.why_company_template || '').split('{{company_name}}').join(contact.company_name || 'your company');

    try {
      const html = buildEmailHtml(templateHtml, {
        hrName: contact.hr_name,
        companyName: contact.company_name,
        jobTitle,
        whyCompany,
        relevantSkills: profile.relevant_skills,
      });

      const subject = `Application for ${jobTitle}${contact.company_name ? ` at ${contact.company_name}` : ''}`;

      await transporter.sendMail({
        from: `"${SENDER_NAME}" <${SENDER_EMAIL}>`,
        to: contact.hr_email,
        subject,
        html,
      });

      await supabaseService
        .from('job_hr_contacts')
        .update({ status: 'Sent', sent_at: new Date().toISOString(), error_message: null })
        .eq('id', contact.id);

      await supabaseService.from('activity_logs').insert({
        action_type: 'Job Application Email Sent',
        details: `Sent application email to ${contact.hr_email} for "${jobTitle}"${contact.company_name ? ` at ${contact.company_name}` : ''}.`,
      });

      sent += 1;
    } catch (sendErr) {
      await supabaseService
        .from('job_hr_contacts')
        .update({ status: 'Failed', error_message: sendErr.message })
        .eq('id', contact.id);

      await supabaseService.from('activity_logs').insert({
        action_type: 'Job Application Email Failed',
        details: `Failed to send application email to ${contact.hr_email}: ${sendErr.message}`,
      });

      failed += 1;
    }
  }

  const { count: remaining } = await supabaseService
    .from('job_hr_contacts')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'Pending');

  return NextResponse.json({ sent, failed, remaining: remaining || 0 });
}
