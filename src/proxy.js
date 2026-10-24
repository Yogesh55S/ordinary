import { NextResponse } from 'next/server';
import { LOGIN_PATH, SESSION_COOKIE, WORKSPACE_PATH, verifySessionToken } from '@/lib/auth/session';

/**
 * First gate in front of the private workspace. Every page layout and API
 * route re-checks the session on its own, so this is defence in depth, not
 * the only check.
 */

// API routes that must stay reachable without a session.
const PUBLIC_API_ROUTES = new Set(['/api/contact', '/api/auth/login', '/api/auth/logout']);
// API routes the background worker calls with its shared secret.
const WORKER_API_ROUTES = new Set(['/api/send-job-emails']);

const NOINDEX = 'noindex, nofollow, noarchive';

function hasWorkerHeader(request) {
  const expected = process.env.WORKER_SECRET;
  const provided = request.headers.get('x-worker-secret');
  // Only a cheap presence/equality check here; the route handler does the timing-safe compare.
  return Boolean(expected && provided && provided.length === expected.length);
}

export async function proxy(request) {
  const { pathname, search } = request.nextUrl;
  const session = await verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value);

  if (pathname.startsWith('/api/')) {
    if (PUBLIC_API_ROUTES.has(pathname)) return NextResponse.next();
    if (WORKER_API_ROUTES.has(pathname) && hasWorkerHeader(request)) return NextResponse.next();
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401, headers: { 'X-Robots-Tag': NOINDEX } },
      );
    }
    const response = NextResponse.next();
    response.headers.set('X-Robots-Tag', NOINDEX);
    return response;
  }

  if (pathname === LOGIN_PATH) {
    if (session) return NextResponse.redirect(new URL(WORKSPACE_PATH, request.url));
    const response = NextResponse.next();
    response.headers.set('X-Robots-Tag', NOINDEX);
    return response;
  }

  // /workspace and everything under it
  if (!session) {
    const loginUrl = new URL(LOGIN_PATH, request.url);
    loginUrl.searchParams.set('next', `${pathname}${search}`);
    return NextResponse.redirect(loginUrl);
  }
  const response = NextResponse.next();
  response.headers.set('X-Robots-Tag', NOINDEX);
  response.headers.set('Cache-Control', 'private, no-store');
  return response;
}

export const config = {
  matcher: ['/workspace/:path*', '/api/:path*', '/lancer-login'],
};
