import { NextResponse } from 'next/server';
import { scryptSync, timingSafeEqual } from 'node:crypto';
import { checkRateLimit, getClientIp } from '@/lib/security';
import { adminConfig } from '@/lib/constants';

function verifyPassword(password: string, storedHash: string) {
  if (!storedHash.startsWith('s2:')) return false;
  const [, salt, digest] = storedHash.split(':');
  if (!salt || !digest) return false;
  const computed = scryptSync(password, salt, 64).toString('hex');
  return timingSafeEqual(Buffer.from(computed, 'hex'), Buffer.from(digest, 'hex'));
}

export async function POST(request: Request) {
  const ip = getClientIp(request.headers);
  const rateLimit = checkRateLimit(`admin_login:${ip}`, 5, 60_000);
  if (!rateLimit.ok) {
    return NextResponse.json({ ok: false, error: 'Muitas tentativas. Tente novamente em instantes.' }, { status: 429 });
  }

  const body = await request.json().catch(() => ({}));
  const email = String((body as any)?.email || adminConfig.email).trim().toLowerCase();
  const password = String((body as any)?.password || '');
  const adminEmail = adminConfig.email.toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD || '';
  const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH || '';

  if (!adminConfig.sessionToken || adminConfig.sessionToken === 'mdh_troque_este_token_no_env') {
    return NextResponse.json({ ok: false, error: 'Configure ADMIN_SESSION_TOKEN no .env.local' }, { status: 500 });
  }

  const passwordOk = adminPasswordHash ? verifyPassword(password, adminPasswordHash) : adminPassword ? password === adminPassword : false;

  if (email !== adminEmail || !passwordOk) {
    return NextResponse.json({ ok: false, error: 'Credenciais incorretas' }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true, redirectTo: '/admin' });
  response.cookies.set({
    name: adminConfig.sessionCookieName,
    value: adminConfig.sessionToken,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 60 * 60 * 8
  });

  return response;
}
