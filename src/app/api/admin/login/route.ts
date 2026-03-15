import { NextResponse } from "next/server";
import { z } from "zod";
import { appendAuditLog } from "@/lib/audit";
import { adminConfig } from "@/lib/constants";
import { createAdminSession, verifyAdminCredentials } from "@/lib/admin-auth";
import { databaseUnavailableMessage, isDatabaseRuntimeError } from "@/lib/database-status";
import { maskEmail } from "@/lib/data-protection";
import {
  appendRateLimitHeaders,
  checkRateLimit,
  clearAuthFailures,
  enforceSameOrigin,
  getAuthLockState,
  getClientIp,
  isSecurityError,
  registerAuthFailure
} from "@/lib/security";

const adminLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

export async function POST(request: Request) {
  const ip = getClientIp(request.headers);
  let rateLimit: ReturnType<typeof checkRateLimit> | null = null;
  let email = "";

  try {
    enforceSameOrigin(request);
    rateLimit = checkRateLimit(`admin_login:${ip}`, 5, 60_000);
    if (!rateLimit.ok) {
      return appendRateLimitHeaders(
        NextResponse.json({ ok: false, error: "Muitas tentativas. Tente novamente em instantes." }, { status: 429 }),
        rateLimit
      );
    }

    const body = await request.json().catch(() => ({}));
    const parsed = adminLoginSchema.safeParse(body);

    if (!parsed.success) {
      return appendRateLimitHeaders(
        NextResponse.json({ ok: false, error: "Preencha e-mail e senha corretamente." }, { status: 400 }),
        rateLimit
      );
    }

    email = parsed.data.email.trim().toLowerCase();
    const password = parsed.data.password;
    const authKey = `admin_login:${ip}:${email}`;
    const lockState = getAuthLockState(authKey);

    if (lockState.blocked) {
      return NextResponse.json(
        { ok: false, error: `Acesso temporariamente bloqueado. Aguarde ${lockState.retryAfter}s.` },
        { status: 429, headers: { "Retry-After": String(lockState.retryAfter) } }
      );
    }

    if (!process.env.ADMIN_PASSWORD_HASH) {
      return NextResponse.json({ ok: false, error: "Configure ADMIN_PASSWORD_HASH no .env.local." }, { status: 500 });
    }

    if (!await verifyAdminCredentials(email, password)) {
      const failure = registerAuthFailure(authKey);
      await appendAuditLog({
        actorType: "anonymous",
        action: "admin_login_failed",
        resourceType: "admin_session",
        ipAddress: ip,
        userAgent: request.headers.get("user-agent"),
        payload: { email: maskEmail(email), attempts: failure.attempts }
      });
      return NextResponse.json({ ok: false, error: "Credenciais incorretas" }, { status: 401 });
    }

    clearAuthFailures(authKey);

    const session = await createAdminSession({
      email: adminConfig.email,
      ipAddress: ip,
      userAgent: request.headers.get("user-agent")
    });
    const requestUrl = new URL(request.url);
    const forwardedProto = request.headers.get("x-forwarded-proto");
    const secureCookie = forwardedProto ? forwardedProto === "https" : requestUrl.protocol === "https:";
    const response = NextResponse.json({ ok: true, redirectTo: adminConfig.panelPath });
    response.cookies.set({
      name: adminConfig.sessionCookieName,
      value: session.value,
      httpOnly: true,
      secure: secureCookie,
      sameSite: "strict",
      path: "/",
      expires: new Date(session.expiresAt)
    });

    await appendAuditLog({
      actorType: "admin",
      actorId: adminConfig.email,
      action: "admin_login_success",
      resourceType: "admin_session",
      resourceId: adminConfig.email,
      ipAddress: ip,
      userAgent: request.headers.get("user-agent"),
      payload: { email: maskEmail(email) }
    });

    return appendRateLimitHeaders(response, rateLimit);
  } catch (error) {
    if (isSecurityError(error)) {
      return NextResponse.json({ ok: false, error: error.message }, { status: error.status });
    }
    const databaseUnavailable = isDatabaseRuntimeError(error);
    return NextResponse.json(
      {
        ok: false,
        error: databaseUnavailable
          ? databaseUnavailableMessage
          : error instanceof Error
            ? error.message
            : "Nao foi possivel criar a sessao do admin."
      },
      { status: databaseUnavailable ? 503 : 500 }
    );
  }
}
