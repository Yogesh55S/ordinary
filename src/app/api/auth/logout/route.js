import { NextResponse } from 'next/server';
import { isCrossOrigin } from '@/lib/auth/server';
import { SESSION_COOKIE, sessionCookieOptions } from '@/lib/auth/session';

export async function POST(request) {
  if (isCrossOrigin(request)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, '', sessionCookieOptions(0));
  return response;
}
