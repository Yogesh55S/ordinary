import { NextResponse } from 'next/server';
import { isCrossOrigin, requireApiAuth } from '@/lib/auth/server';
import { supabaseService } from '@/lib/supabaseServer';
import { BRIDGE_MAX_OPS, BRIDGE_MODIFIERS, BRIDGE_TABLES, BRIDGE_VERBS } from '@/lib/db/bridgeSchema';

/**
 * Authenticated data bridge for the workspace. Replays a recorded supabase-js
 * chain ({ table, ops: [{ method, args }] }) with the service-role client.
 * Only allow-listed tables and methods are accepted.
 */

function badRequest(message) {
  return NextResponse.json({ data: null, error: { message, code: 'BRIDGE_INVALID' } }, { status: 400 });
}

function validate(body) {
  if (!body || typeof body !== 'object') return 'Invalid request body.';
  const { table, ops } = body;
  if (typeof table !== 'string' || !BRIDGE_TABLES.has(table)) return 'Table is not allowed.';
  if (!Array.isArray(ops) || ops.length === 0 || ops.length > BRIDGE_MAX_OPS) return 'Invalid query.';
  if (!BRIDGE_VERBS.has(ops[0]?.method)) return 'Query must start with select, insert, update, upsert or delete.';

  for (const op of ops) {
    if (!op || typeof op.method !== 'string' || !Array.isArray(op.args) || op.args.length > 4) {
      return 'Invalid query step.';
    }
    if (!BRIDGE_VERBS.has(op.method) && !BRIDGE_MODIFIERS.has(op.method)) {
      return `Method "${op.method}" is not allowed.`;
    }
  }
  return null;
}

export async function POST(request) {
  const denied = await requireApiAuth(request);
  if (denied) return denied;
  if (isCrossOrigin(request)) return NextResponse.json({ error: { message: 'Forbidden' } }, { status: 403 });

  if (!supabaseService) {
    return NextResponse.json(
      { data: null, error: { message: 'Missing SUPABASE_SERVICE_ROLE_KEY on the server.' } },
      { status: 500 },
    );
  }

  let body;
  try {
    body = await request.json();
  } catch (_) {
    return badRequest('Invalid JSON.');
  }

  const problem = validate(body);
  if (problem) return badRequest(problem);

  try {
    let query = supabaseService.from(body.table);
    for (const { method, args } of body.ops) {
      query = query[method](...args);
    }
    const { data, error, count, status, statusText } = await query;
    return NextResponse.json({
      data: data ?? null,
      error: error ? { message: error.message, details: error.details ?? null, hint: error.hint ?? null, code: error.code ?? null } : null,
      count: count ?? null,
      status,
      statusText,
    });
  } catch (err) {
    console.error('[api/db] query failed:', err);
    return NextResponse.json({ data: null, error: { message: err?.message || 'Query failed.' } }, { status: 500 });
  }
}
