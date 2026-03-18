import { NextResponse } from 'next/server';
import { scryptSync, timingSafeEqual } from 'node:crypto';
import { checkRateLimit, getClientIp } from '@/lib/security';
import { adminConfig } from '@/lib/constants';
import { authenticateUser } from '@/lib/auth-store';
import { createSignedSessionToken } from '@/lib/session-token';

export const runtime = 'nodejs';

function verifyStoredPassword(password: string, storedHash: string) {
  const [algorithm, salt, digest] = storedHash.split(':');
  if (!salt || !digest) return false;
  if (algorithm !== 'scrypt' && algorithm !== 's2') return false;

  const computed = scryptSync(password, salt, 64);
  const stored = Buffer.from(digest, 'hex');

  if (computed.length !== stored.length) return false;
  return timingSafeEqual(computed, stored);
}

export async function POST(request: Request) {
  const ip = getClientIp(request.headers);
  const rateLimit = checkRateLimit(`admin_login:${ip}`, 5, 60_000);
  if (!rateLimit.ok) {
    return NextResponse.json({ ok: false, error: 'Muitas tentativas. Tente novamente em instantes.' }, { status: 429 });
  }

  const body = await request.json().catch(() => ({}));
  const email = String((body as any)?.email || '').trim().toLowerCase();
  const password = String((body as any)?.password || '');

  if (!email || !password) {
    return NextResponse.json({ ok: false, error: 'Informe e-mail e senha válidos.' }, { status: 400 });
  }

  if (!adminConfig.sessionSecret || adminConfig.sessionSecret === 'troque-o-session-secret') {
    return NextResponse.json({ ok: false, error: 'Configure ADMIN_SESSION_SECRET nas variáveis do projeto.' }, { status: 500 });
  }

  let user = null;

  if (email === adminConfig.email.toLowerCase()) {
    const adminPassword = process.env.ADMIN_PASSWORD || '';
    const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH || '';
    const passwordOk = adminPasswordHash ? verifyStoredPassword(password, adminPasswordHash) : adminPassword ? password === adminPassword : false;

    if (passwordOk) {
      user = {
        id: 'admin-env',
        email,
        displayName: 'Administrador MDH',
        role: 'admin' as const,
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString()
      };
    }
  }

  if (!user) {
    user = await authenticateUser({ email, password, role: 'admin' });
  }

  if (!user) {
    return NextResponse.json({ ok: false, error: 'Credenciais incorretas' }, { status: 401 });
  }

  const sessionToken = await createSignedSessionToken(
    {
      sub: user.id,
      email: user.email,
      displayName: user.displayName,
      role: 'admin',
      expiresInSeconds: 60 * 60 * 8
    },
    adminConfig.sessionSecret
  );

  const response = NextResponse.json({ ok: true, redirectTo: '/admin' });
  response.cookies.set({
    name: adminConfig.sessionCookieName,
    value: sessionToken,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 60 * 60 * 8
  });

  return response;
}
