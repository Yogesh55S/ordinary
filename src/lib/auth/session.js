import { SignJWT, jwtVerify } from 'jose';

/**
 * Owner session = a signed JWT (HS256) in an httpOnly cookie.
 * This module has no Next.js request APIs in it, so the proxy, route handlers
 * and server components can all share it.
 */

export const SESSION_COOKIE = 'ol_session';
export const LOGIN_PATH = '/lancer-login';
export const WORKSPACE_PATH = '/workspace';

const SHORT_SESSION_SECONDS = 60 * 60 * 12; // 12 hours
const REMEMBER_SESSION_SECONDS = 60 * 60 * 24 * 30; // 30 days
const ISSUER = 'ordinary-lancer';
const AUDIENCE = 'ordinary-lancer-workspace';

let cachedKey = null;
let cachedSecret = null;

function getSecretKey() {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error('AUTH_SECRET must be set to a random string of at least 32 characters.');
  }
  if (secret !== cachedSecret) {
    cachedKey = new TextEncoder().encode(secret);
    cachedSecret = secret;
  }
  return cachedKey;
}

export function sessionMaxAge(remember) {
  return remember ? REMEMBER_SESSION_SECONDS : SHORT_SESSION_SECONDS;
}

export async function createSessionToken(subject, remember) {
  return new SignJWT({ role: 'owner' })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(subject)
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(`${sessionMaxAge(remember)}s`)
    .sign(getSecretKey());
}

/** Returns the verified payload, or null for a missing/invalid/expired token. */
export async function verifySessionToken(token) {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecretKey(), {
      issuer: ISSUER,
      audience: AUDIENCE,
      algorithms: ['HS256'],
    });
    return payload.role === 'owner' ? payload : null;
  } catch (_) {
    return null;
  }
}

export function sessionCookieOptions(maxAge) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge,
  };
}
