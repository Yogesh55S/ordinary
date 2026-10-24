import { createBridgeClient } from './db/bridgeClient';

/**
 * Workspace data client.
 *
 * Same chainable API as supabase-js, but every query runs on the server through
 * the authenticated /api/db bridge with the service-role key. The browser never
 * gets a Supabase key, so data is only reachable with a valid owner session.
 *
 * Server code (API routes) should import `supabaseService` from '@/lib/supabaseServer'.
 */
export const supabase = createBridgeClient();
