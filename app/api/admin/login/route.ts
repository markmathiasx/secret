import { NextResponse } from 'next/server';
import { getClientIp } from '@/lib/security';
import { rateLimitRequest } from '@/lib/redis';
import { adminConfig } from '@/lib/server-config';
import { authenticateAdminUser } from '@/lib/auth-store';
import { createSignedSessionToken, isSessionSecretConfigured } from '@/lib/session-token';
import { applyNoStoreHeaders } from '@/lib/http-cache';
import { logStructured } from '@/lib/logger';
import { sanitizeEmail } from '@/lib/sanitize';
import { z } from 'zod';
import { canConnectToDatabase } from '@/lib/prisma';

export const runtime = 'nodejs';

const loginSchema = z.object({
  email: z.string().email().max(320).transform((value) => sanitizeEmail(value)),
  password: z.string().min(1).max(512),
  twoFactorCode: z.string().trim().max(32).optional(),
});

export async function POST(request: Request) {
  const ip = getClientIp(request.headers);
  const rateLimit = await rateLimitRequest(`admin_login:${ip}`, 5, 60_000);
  if (!rateLimit.ok) {
    logStructured("warn", "admin_login_rate_limited", { ip, requestId: request.headers.get("x-request-id") || null });
    return applyNoStoreHeaders(NextResponse.json({ ok: false, error: 'Muitas tentativas. Tente novamente em instantes.' }, { status: 429 }));
  }

  const body = await request.json().catch(() => ({}));
  const parsed = loginSchema.safeParse(body);

  if (!parsed.success) {
    logStructured("warn", "admin_login_invalid_payload", { ip, requestId: request.headers.get("x-request-id") || null });
    return applyNoStoreHeaders(NextResponse.json({ ok: false, error: 'Informe e-mail e senha válidos.' }, { status: 400 }));
  }

  const { email, password, twoFactorCode } = parsed.data;

  if (!isSessionSecretConfigured(adminConfig.sessionSecret)) {
    return applyNoStoreHeaders(NextResponse.json({ ok: false, error: 'Configure ADMIN_SESSION_SECRET nas variáveis do projeto.' }, { status: 500 }));
  }

  if (!(await canConnectToDatabase())) {
    return applyNoStoreHeaders(NextResponse.json(
      { ok: false, error: 'Banco administrativo indisponível. Tente novamente em instantes.' },
      { status: 503 }
    ));
  }

  const user = await authenticateAdminUser({ email, password, twoFactorCode });

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
