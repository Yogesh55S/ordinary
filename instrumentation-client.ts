import posthog from 'posthog-js';

const posthogKey = process.env.POSTHOG_KEYs;
const posthogHost = process.env.POSTHOG_HOST;

// Owner-only areas: never count these as portfolio visits, even after a client-side navigation.
const PRIVATE_PREFIXES = ['/workspace', '/lancer-login'];

// Automatic browsing events. Anything not listed here is sent as-is.
const AUTO_CAPTURED_EVENTS = new Set([
  '$pageview',
  '$pageleave',
  '$autocapture',
  '$rageclick',
  '$dead_click',
  '$web_vitals',
  '$heatmap',
]);

function isPrivatePath(url: unknown): boolean {
  if (typeof url !== 'string') return false;
  try {
    const { pathname } = new URL(url);
    return PRIVATE_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
  } catch {
    return false;
  }
}

if (!posthogKey) {
  if (process.env.NODE_ENV === 'development') {
    throw new Error(
      'POSTHOG_KEYs variable required by PostHog is missing or un-configured, this causes events to be silently missed. This error stops appearing once POSTHOG_KEYs is configured',
    );
  }
} else if (!posthogHost) {
  if (process.env.NODE_ENV === 'development') {
    throw new Error(
      'POSTHOG_HOST variable required by PostHog is missing or un-configured, this causes events to be silently missed. This error stops appearing once POSTHOG_HOST is configured',
    );
  }
} else {
  posthog.init(posthogKey, {
    // Ingestion goes through the /ingest rewrite in next.config.mjs so ad blockers don't drop visits.
    api_host: '/ingest',
    // Where "open in PostHog" / toolbar links point, since api_host is a relative proxy path.
    ui_host: process.env.POSTHOG_UI_HOST || 'https://us.posthog.com',
    defaults: '2026-01-30',
    // Anonymous portfolio visitors don't need person profiles; only the identified owner gets one.
    person_profiles: 'identified_only',
    capture_exceptions: true,
    // Keep owner-only pages out of the visitor numbers. Explicit product events
    // (client_created, outreach_scheduled, ...), errors and identify still go through.
    before_send: (event) => {
      if (!event || !AUTO_CAPTURED_EVENTS.has(event.event)) return event;
      return isPrivatePath(event.properties?.$current_url) ? null : event;
    },
    debug: process.env.NODE_ENV === 'development',
  });
}
