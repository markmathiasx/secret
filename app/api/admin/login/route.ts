import { NextResponse } from 'next/server';
import { scryptSync, timingSafeEqual } from 'node:crypto';
import { getClientIp } from '@/lib/security';
import { rateLimitRequest } from '@/lib/redis';
import { adminConfig } from '@/lib/constants';
import { authenticateUser, type AuthUser } from '@/lib/auth-store';
import { createSignedSessionToken, isSessionSecretConfigured } from '@/lib/session-token';
import { applyNoStoreHeaders } from '@/lib/http-cache';
import { logStructured } from '@/lib/logger';

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
  const rateLimit = await rateLimitRequest(`admin_login:${ip}`, 5, 60_000);
  if (!rateLimit.ok) {
    logStructured("warn", "admin_login_rate_limited", { ip, requestId: request.headers.get("x-request-id") || null });
    return applyNoStoreHeaders(NextResponse.json({ ok: false, error: 'Muitas tentativas. Tente novamente em instantes.' }, { status: 429 }));
  }

  const body = await request.json().catch(() => ({}));
  const email = String((body as any)?.email || '').trim().toLowerCase();
  const password = String((body as any)?.password || '');

  if (!email || !password) {
    logStructured("warn", "admin_login_invalid_payload", { ip, requestId: request.headers.get("x-request-id") || null });
    return applyNoStoreHeaders(NextResponse.json({ ok: false, error: 'Informe e-mail e senha válidos.' }, { status: 400 }));
  }

  if (!isSessionSecretConfigured(adminConfig.sessionSecret)) {
    return applyNoStoreHeaders(NextResponse.json({ ok: false, error: 'Configure ADMIN_SESSION_SECRET nas variáveis do projeto.' }, { status: 500 }));
  }

  let user: AuthUser | null = null;

  if (email === adminConfig.email.toLowerCase()) {
    const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH || '';
    const passwordOk = adminPasswordHash ? verifyStoredPassword(password, adminPasswordHash) : false;

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
    logStructured("warn", "admin_login_failed", { ip, requestId: request.headers.get("x-request-id") || null, emailDomain: email.split("@")[1] || "unknown" });
    return applyNoStoreHeaders(NextResponse.json({ ok: false, error: 'Credenciais incorretas' }, { status: 401 }));
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

  logStructured("info", "admin_login_success", { ip, requestId: request.headers.get("x-request-id") || null, actorId: user.id });
  return applyNoStoreHeaders(response);
}
