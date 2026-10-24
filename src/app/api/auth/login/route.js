import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';
import { getClientIp, isCrossOrigin, safeEqual } from '@/lib/auth/server';
import {
  SESSION_COOKIE,
  createSessionToken,
  sessionCookieOptions,
  sessionMaxAge,
} from '@/lib/auth/session';
import { hit, peek, reset } from '@/lib/rateLimit';

const WINDOW_MS = 15 * 60 * 1000;
const PER_ID_LIMIT = 5; // failed attempts per login ID per window
const PER_IP_LIMIT = 10; // failed attempts per IP per window

let dummyHash = null;

/**
 * bcrypt hashes contain "$", which .env expansion can mangle, so the hash may be
 * stored base64-encoded (OWNER_PASSWORD_HASH_B64, preferred) or raw (OWNER_PASSWORD_HASH).
 */
function getOwnerCredentials() {
  const loginId = process.env.OWNER_LOGIN_ID?.trim().toLowerCase();
  let hash = process.env.OWNER_PASSWORD_HASH?.trim() || null;
  if (process.env.OWNER_PASSWORD_HASH_B64) {
    hash = Buffer.from(process.env.OWNER_PASSWORD_HASH_B64.trim(), 'base64').toString('utf8');
  }
  if (!loginId || !hash || !hash.startsWith('$2')) return null;
  return { loginId, hash };
}

function tooMany(retryAfterSeconds) {
  const minutes = Math.ceil(retryAfterSeconds / 60);
  return NextResponse.json(
    { error: `Too many attempts. Login is locked — try again in ${minutes} minute${minutes === 1 ? '' : 's'}.` },
    { status: 429, headers: { 'Retry-After': String(retryAfterSeconds) } },
  );
}

export async function POST(request) {
  if (isCrossOrigin(request)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const owner = getOwnerCredentials();
  if (!owner || !process.env.AUTH_SECRET) {
    console.error('[auth] OWNER_LOGIN_ID, OWNER_PASSWORD_HASH_B64 and AUTH_SECRET must be configured.');
    return NextResponse.json({ error: 'Login is not configured on the server.' }, { status: 503 });
  }

  let body;
  try {
    body = await request.json();
  } catch (_) {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  const loginId = typeof body?.loginId === 'string' ? body.loginId.trim().toLowerCase().slice(0, 200) : '';
  const password = typeof body?.password === 'string' ? body.password.slice(0, 200) : '';
  const remember = body?.remember === true;

  if (!loginId || !password) {
    return NextResponse.json({ error: 'Enter your login ID and password.' }, { status: 400 });
  }

  const ipKey = `login:ip:${getClientIp(request)}`;
  const idKey = `login:id:${loginId}`;
  const ipState = peek(ipKey, { limit: PER_IP_LIMIT });
  const idState = peek(idKey, { limit: PER_ID_LIMIT });
  if (!ipState.allowed || !idState.allowed) {
    return tooMany(Math.max(ipState.retryAfterSeconds, idState.retryAfterSeconds));
  }

  // Always run bcrypt so a wrong ID takes as long as a wrong password.
  const idMatches = safeEqual(loginId, owner.loginId);
  if (!dummyHash) dummyHash = await bcrypt.hash('not-the-password', 12);
  const passwordMatches = await bcrypt.compare(password, idMatches ? owner.hash : dummyHash);

  if (!idMatches || !passwordMatches) {
    const ipAfter = hit(ipKey, { limit: PER_IP_LIMIT, windowMs: WINDOW_MS });
    const idAfter = hit(idKey, { limit: PER_ID_LIMIT, windowMs: WINDOW_MS });
    if (!ipAfter.allowed || !idAfter.allowed) {
      return tooMany(Math.max(ipAfter.retryAfterSeconds, idAfter.retryAfterSeconds));
    }
    return NextResponse.json({ error: 'Wrong login ID or password.' }, { status: 401 });
  }

  reset(idKey);
  const maxAge = sessionMaxAge(remember);
  const token = await createSessionToken(owner.loginId, remember);
  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, token, sessionCookieOptions(maxAge));
  return response;
}
