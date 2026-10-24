import 'server-only';
import { createClient } from '@supabase/supabase-js';

/**
 * Service-role Supabase client. Bypasses RLS, so it must never reach the browser —
 * the `server-only` import makes the build fail if a client component imports it.
 * Every route that uses it checks the owner session first.
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const supabaseService =
  supabaseUrl && supabaseServiceKey
    ? createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      })
    : null;
