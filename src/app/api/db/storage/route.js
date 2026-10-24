import { NextResponse } from 'next/server';
import { isCrossOrigin, requireApiAuth } from '@/lib/auth/server';
import { supabaseService } from '@/lib/supabaseServer';
import { BRIDGE_BUCKETS, BRIDGE_MAX_UPLOAD_BYTES } from '@/lib/db/bridgeSchema';

/**
 * Authenticated storage bridge: uploads (multipart) and removals (JSON) for the
 * workspace's media bucket, executed with the service-role client.
 */

const SAFE_PATH = /^[A-Za-z0-9._\-/]{1,300}$/;

function isSafePath(path) {
  return typeof path === 'string' && SAFE_PATH.test(path) && !path.includes('..') && !path.startsWith('/');
}

function fail(message, status = 400) {
  return NextResponse.json({ data: null, error: { message } }, { status });
}

async function handleUpload(request) {
  let form;
  try {
    form = await request.formData();
  } catch (_) {
    return fail('Invalid upload.');
  }

  const bucket = form.get('bucket');
  const path = form.get('path');
  const file = form.get('file');

  if (!BRIDGE_BUCKETS.has(bucket)) return fail('Bucket is not allowed.');
  if (!isSafePath(path) || !path.startsWith('uploads/')) return fail('Invalid file path.');
  if (!file || typeof file.arrayBuffer !== 'function') return fail('No file provided.');
  if (file.size > BRIDGE_MAX_UPLOAD_BYTES) return fail('File is too large (max 50 MB).', 413);

  const { data, error } = await supabaseService.storage.from(bucket).upload(path, Buffer.from(await file.arrayBuffer()), {
    contentType: form.get('contentType') || file.type || 'application/octet-stream',
    cacheControl: form.get('cacheControl') || '3600',
    upsert: form.get('upsert') === 'true',
  });

  return NextResponse.json({ data: data ?? null, error: error ? { message: error.message } : null });
}

async function handleRemove(request) {
  let body;
  try {
    body = await request.json();
  } catch (_) {
    return fail('Invalid JSON.');
  }

  const { action, bucket, paths } = body ?? {};
  if (action !== 'remove') return fail('Unsupported action.');
  if (!BRIDGE_BUCKETS.has(bucket)) return fail('Bucket is not allowed.');
  if (!Array.isArray(paths) || paths.length === 0 || paths.length > 50 || !paths.every(isSafePath)) {
    return fail('Invalid file paths.');
  }

  const { data, error } = await supabaseService.storage.from(bucket).remove(paths);
  return NextResponse.json({ data: data ?? null, error: error ? { message: error.message } : null });
}

export async function POST(request) {
  const denied = await requireApiAuth(request);
  if (denied) return denied;
  if (isCrossOrigin(request)) return fail('Forbidden', 403);
  if (!supabaseService) return fail('Missing SUPABASE_SERVICE_ROLE_KEY on the server.', 500);

  const contentType = request.headers.get('content-type') || '';
  try {
    if (contentType.startsWith('multipart/form-data')) return await handleUpload(request);
    return await handleRemove(request);
  } catch (err) {
    console.error('[api/db/storage] failed:', err);
    return fail(err?.message || 'Storage request failed.', 500);
  }
}
