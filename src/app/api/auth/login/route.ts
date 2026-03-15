import { z } from "zod";
import { NextResponse } from "next/server";
import { appendAuditLog } from "@/lib/audit";
import { customerAuthConfig } from "@/lib/constants";
import {
  createCustomerSession,
  sanitizeCustomerRedirectPath,
  verifyCustomerCredentials
} from "@/lib/customer-auth";
import { databaseUnavailableMessage, isDatabaseRuntimeError } from "@/lib/database-status";
import { maskEmail, normalizeEmailAddress } from "@/lib/data-protection";
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

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  next: z.string().optional()
});

export async function POST(request: Request) {
  try {
    enforceSameOrigin(request);
    const ip = getClientIp(request.headers);
    const rateLimit = checkRateLimit(`customer_login:${ip}`, 8, 60_000);

    if (!rateLimit.ok) {
      return appendRateLimitHeaders(
        NextResponse.json(
          { ok: false, error: "Muitas tentativas de login. Tente novamente em instantes." },
          { status: 429 }
        ),
        rateLimit
      );
    }

    const body = await request.json().catch(() => ({}));
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return appendRateLimitHeaders(
        NextResponse.json({ ok: false, error: "Preencha e-mail e senha corretamente." }, { status: 400 }),
        rateLimit
      );
    }

    const normalizedEmail = normalizeEmailAddress(parsed.data.email);
    const authKey = `customer_login:${ip}:${normalizedEmail}`;
    const lockState = getAuthLockState(authKey);

    if (lockState.blocked) {
      return NextResponse.json(
        { ok: false, error: `Muitas tentativas inválidas. Aguarde ${lockState.retryAfter}s.` },
        { status: 429, headers: { "Retry-After": String(lockState.retryAfter) } }
      );
    }

    const account = await verifyCustomerCredentials(parsed.data.email, parsed.data.password);

    if (!account) {
      const failure = registerAuthFailure(authKey);
      await appendAuditLog({
        actorType: "anonymous",
        action: "customer_login_failed",
        resourceType: "customer_account",
        ipAddress: ip,
        userAgent: request.headers.get("user-agent"),
        payload: { email: maskEmail(parsed.data.email), attempts: failure.attempts }
      });
      return NextResponse.json({ ok: false, error: "E-mail ou senha incorretos." }, { status: 401 });
    }

    clearAuthFailures(authKey);

    const session = await createCustomerSession({
      accountId: account.id,
      email: account.email,
      ipAddress: ip,
      userAgent: request.headers.get("user-agent")
    });

    const requestUrl = new URL(request.url);
    const forwardedProto = request.headers.get("x-forwarded-proto");
    const secureCookie = forwardedProto ? forwardedProto === "https" : requestUrl.protocol === "https:";
    const response = NextResponse.json({
      ok: true,
      redirectTo: sanitizeCustomerRedirectPath(parsed.data.next)
    });

    response.cookies.set({
      name: customerAuthConfig.sessionCookieName,
      value: session.value,
      httpOnly: true,
      secure: secureCookie,
      sameSite: "strict",
      path: "/",
      expires: new Date(session.expiresAt)
    });

    await appendAuditLog({
      actorType: "customer",
      actorId: account.id,
      action: "customer_login_success",
      resourceType: "customer_account",
      resourceId: account.id,
      ipAddress: ip,
      userAgent: request.headers.get("user-agent"),
      payload: { email: maskEmail(account.email) }
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
            : "Nao foi possivel iniciar a sessao do cliente."
      },
      { status: databaseUnavailable ? 503 : 500 }
    );
  }
}
