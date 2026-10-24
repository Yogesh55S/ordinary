import { NextResponse } from 'next/server';
import { requireApiAuth } from '@/lib/auth/server';
import fs from 'fs';
import path from 'path';
import { supabaseService } from '@/lib/supabaseServer';
import { DEFAULT_TECH_STACK, buildTechStackSectionHtml } from '@/lib/jobApplicationTechStack';
import { getTransporter, getSmtpConfig } from '@/lib/mailer';

const DEFAULT_TECH_STACK_HTML = buildTechStackSectionHtml(DEFAULT_TECH_STACK);

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

function renderTemplate(template, tokens) {
  let out = template;
  for (const [token, value] of Object.entries(tokens)) {
    out = out.split(token).join(value);
  }
  return out;
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
    '{{TECH_STACK_SECTION}}': DEFAULT_TECH_STACK_HTML,
  });
}

function buildEmailText(templateText, { hrName, companyName, jobTitle, whyCompany, relevantSkills }) {
  if (!templateText) return null;
  return renderTemplate(templateText, {
    '{{HR_NAME}}': hrName || 'there',
    '{{COMPANY_NAME}}': companyName || 'your team',
    '{{JOB_TITLE}}': jobTitle || 'the open role',
    '{{WHY_COMPANY}}': whyCompany || '',
    '{{RELEVANT_SKILLS}}': relevantSkills || '',
    '{{PORTFOLIO_URL}}': PORTFOLIO_URL,
    '{{GITHUB_URL}}': GITHUB_URL,
    '{{LINKEDIN_URL}}': LINKEDIN_URL,
    '{{RESUME_URL}}': RESUME_URL,
  });
}

export async function POST(request) {
  // The job-application worker calls this route with WORKER_SECRET instead of a session.
  const denied = await requireApiAuth(request, { allowWorker: true });
  if (denied) return denied;

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

  // The bulk-queue flow has no per-contact template picker, so it always uses whichever
  // saved template is marked default (see /job-applications/templates); falls back to the
  // compiled react-email export if no template has been saved yet.
  const { data: savedTemplate } = await supabaseService
    .from('job_email_template')
    .select('*')
    .eq('is_default', true)
    .limit(1)
    .maybeSingle();

  let templateHtml = savedTemplate?.html_content || null;
  const templateText = savedTemplate?.plain_text_content || null;

  if (!templateHtml) {
    if (!fs.existsSync(TEMPLATE_PATH)) {
      return NextResponse.json(
        { error: `No default saved template and no compiled email template found at ${TEMPLATE_PATH}. Mark a template as default at /job-applications/templates, or run "npm run export-job-application-template".` },
        { status: 500 }
      );
    }
    templateHtml = fs.readFileSync(TEMPLATE_PATH, 'utf-8');
  }

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

  const transporter = getTransporter();

  let sent = 0;
  let failed = 0;

  for (const contact of pending) {
    const profile = contact.job_profiles || {};
    const jobTitle = profile.title || 'the open role';
    const whyCompany = (profile.why_company_template || '').split('{{company_name}}').join(contact.company_name || 'your company');

    try {
      const personalization = {
        hrName: contact.hr_name,
        companyName: contact.company_name,
        jobTitle,
        whyCompany,
        relevantSkills: profile.relevant_skills,
      };

      const html = buildEmailHtml(templateHtml, personalization);
      const text = buildEmailText(templateText, personalization);

      const subject = `Application for ${jobTitle}${contact.company_name ? ` at ${contact.company_name}` : ''}`;

      await transporter.sendMail({
        from: `"${SENDER_NAME}" <${SENDER_EMAIL}>`,
        to: contact.hr_email,
        subject,
        html,
        ...(text ? { text } : {}),
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
