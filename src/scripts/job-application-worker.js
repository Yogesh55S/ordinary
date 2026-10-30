/**
 * Job Application sending loop.
 *
 * Next.js API routes are stateless/serverless — they cannot safely run a persistent
 * setInterval to enforce "send X emails every Y minutes/hours" across requests. This
 * script is the persistent process that owns that timing: it polls the
 * `job_application_settings` row on a fixed tick, and whenever the configured interval
 * has elapsed (and the loop is marked active), it triggers one batch by calling the
 * `/api/send-job-emails` route, which owns the actual Nodemailer + template logic.
 *
 * Run as a long-lived background process: `npm run job-application-worker`
 */

const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

const { getPostHogServer, shutdownPostHog } = require('../lib/posthog-server.cjs');
getPostHogServer();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const APP_BASE_URL = process.env.JOB_APPLICATION_APP_BASE_URL || 'http://localhost:3000';
// Shared secret that lets this worker call the auth-protected /api/send-job-emails route.
const WORKER_SECRET = process.env.WORKER_SECRET;

// How often the worker checks whether it's time to send the next batch.
// Kept well below the smallest realistic interval (1 minute) so batches fire promptly.
const TICK_MS = 15000;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: Missing Supabase environment variables in .env.local');
  console.error('Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set.');
  process.exit(1);
}

if (!WORKER_SECRET) {
  console.error('Error: Missing WORKER_SECRET in .env.local — the app rejects unauthenticated batch requests.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

let running = false;

function log(message) {
  console.log(`[job-application-worker ${new Date().toISOString()}] ${message}`);
}

function intervalToMs(value, unit) {
  const multiplier = unit === 'hours' ? 60 * 60 * 1000 : 60 * 1000;
  return value * multiplier;
}

async function tick() {
  if (running) return; // Skip overlapping ticks if a batch send is still in flight.

  try {
    const { data: settings, error } = await supabase
      .from('job_application_settings')
      .select('*')
      .limit(1)
      .maybeSingle();

    if (error) {
      log(`Failed to read job_application_settings: ${error.message}`);
      return;
    }

    if (!settings || !settings.is_active) {
      return; // Loop disabled from the UI — nothing to do.
    }

    const intervalMs = intervalToMs(settings.interval_value, settings.interval_unit);
    const lastRun = settings.last_run_at ? new Date(settings.last_run_at).getTime() : 0;
    const dueAt = lastRun + intervalMs;

    if (Date.now() < dueAt) return; // Not due yet.

    running = true;
    log(`Interval elapsed — triggering batch of up to ${settings.batch_size} email(s)...`);

    const res = await fetch(`${APP_BASE_URL}/api/send-job-emails`, {
      method: 'POST',
      headers: { 'x-worker-secret': WORKER_SECRET },
    });
    const result = await res.json();

    if (!res.ok) {
      log(`Batch send failed: ${result.error || res.statusText}`);
    } else if (result.message) {
      log(result.message);
    } else {
      log(`Batch complete — sent ${result.sent}, failed ${result.failed}, ${result.remaining} still pending.`);
    }
  } catch (err) {
    if (err.cause?.code === 'ECONNREFUSED' || err.message?.includes('fetch failed')) {
      log(`Could not reach ${APP_BASE_URL} — make sure the Next.js app (npm run dev / npm run start) is running.`);
    } else {
      log(`Unexpected error: ${err.message}`);
    }
  } finally {
    running = false;
  }
}

log(`Starting job application worker. Polling every ${TICK_MS / 1000}s, dispatching to ${APP_BASE_URL}/api/send-job-emails`);
tick();
const timer = setInterval(tick, TICK_MS);

async function shutdownWorker() {
  log('Shutting down job application worker.');
  clearInterval(timer);
  await shutdownPostHog();
  process.exit(0);
}

process.on('SIGINT', shutdownWorker);
process.on('SIGTERM', shutdownWorker);
