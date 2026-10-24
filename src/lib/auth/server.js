import 'server-only';
import { timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { NextResponse } from 'next/server';
import { LOGIN_PATH, SESSION_COOKIE, verifySessionToken } from './session';

/** Session for the current request (server components / route handlers). */
export async function getSession() {
  const cookieStore = await cookies();
  return verifySessionToken(cookieStore.get(SESSION_COOKIE)?.value);
}

/** Server-component guard: logged-out visitors are sent to the login page. */
export async function requireSession() {
  const session = await getSession();
  if (!session) redirect(LOGIN_PATH);
  return session;
}

export function safeEqual(a, b) {
  const left = Buffer.from(String(a ?? ''));
  const right = Buffer.from(String(b ?? ''));
  if (left.length !== right.length) {
    // Still burn a comparison so length mismatches don't return measurably faster.
    timingSafeEqual(left, left);
    return false;
  }
  return timingSafeEqual(left, right);
}

/** True when the request carries the background worker's shared secret. */
export function hasWorkerSecret(request) {
  const expected = process.env.WORKER_SECRET;
  if (!expected) return false;
  return safeEqual(request.headers.get('x-worker-secret'), expected);
}

/**
 * Route-handler guard. Returns a 401 response to send back, or null when the
 * caller is the logged-in owner (or the worker, when `allowWorker` is set).
 *
 *   const denied = await requireApiAuth(request);
 *   if (denied) return denied;
 */
export async function requireApiAuth(request, { allowWorker = false } = {}) {
  if (allowWorker && hasWorkerSecret(request)) return null;
  const session = await getSession();
  if (session) return null;
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

/**
 * Client IP for rate limiting. Prefers X-Real-IP (set by nginx / Vercel), then the
 * LAST X-Forwarded-For hop — the one appended by our own proxy. The first hop is
 * client-controlled and would let anyone dodge the limit by faking it.
 */
export function getClientIp(request) {
  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp.trim();
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',').pop().trim();
  return 'unknown';
}

/**
 * Rejects cross-site POSTs to sensitive endpoints. Browsers always send Origin
 * on POST; requests without one (curl, server-to-server) are left to the auth check.
 */
export function isCrossOrigin(request) {
  const origin = request.headers.get('origin');
  if (!origin) return false;
  try {
    return new URL(origin).host !== request.headers.get('host');
  } catch (_) {
    return true;
  }
}
