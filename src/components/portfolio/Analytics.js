'use client';

import { useEffect } from 'react';
import posthog from 'posthog-js';

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
// UI host is where "view in PostHog" links point; ingestion goes through our /ingest rewrite.
const POSTHOG_UI_HOST = process.env.NEXT_PUBLIC_POSTHOG_UI_HOST || 'https://us.posthog.com';

// Owner-only areas: never count these as portfolio visits, even after a client-side navigation.
const PRIVATE_PREFIXES = ['/workspace', '/lancer-login'];

function isPrivatePath(url) {
  try {
    const { pathname } = new URL(url);
    return PRIVATE_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
  } catch {
    return false;
  }
}

/**
 * Visitor analytics for the public portfolio. Mounted only in the (site) layout,
 * and does nothing when NEXT_PUBLIC_POSTHOG_KEY is unset (e.g. local dev).
 */
export default function Analytics() {
  useEffect(() => {
    if (!POSTHOG_KEY || posthog.__loaded) return;

    posthog.init(POSTHOG_KEY, {
      api_host: '/ingest',
      ui_host: POSTHOG_UI_HOST,
      defaults: '2025-05-24',
      capture_pageview: 'history_change',
      capture_pageleave: true,
      // Anonymous visitors only — no person profiles until someone is identified.
      person_profiles: 'identified_only',
      before_send: (event) => (event && isPrivatePath(event.properties?.$current_url) ? null : event),
    });
  }, []);

  return null;
}
