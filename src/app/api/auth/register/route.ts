import { z } from "zod";
import { NextResponse } from "next/server";
import { appendAuditLog } from "@/lib/audit";
import { customerAuthConfig } from "@/lib/constants";
import {
  createCustomerSession,
  registerCustomerAccount,
  sanitizeCustomerRedirectPath
} from "@/lib/customer-auth";
import { databaseUnavailableMessage, isDatabaseRuntimeError } from "@/lib/database-status";
import { maskEmail, sanitizeTextInput } from "@/lib/data-protection";
import { appendRateLimitHeaders, checkRateLimit, enforceSameOrigin, getClientIp, isSecurityError } from "@/lib/security";

const registerSchema = z.object({
  fullName: z.string().min(3).max(160).transform((value) => sanitizeTextInput(value, 160)),
  email: z.string().email().max(160),
  password: z
    .string()
    .min(8)
    .max(128)
    .refine((value) => /[a-z]/i.test(value) && /\d/.test(value) && /[^A-Za-z0-9]/.test(value), "Senha fraca"),
  next: z.string().optional()
});

export async function POST(request: Request) {
  const ip = getClientIp(request.headers);
  const body = await request.json().catch(() => ({}));
  try {
    enforceSameOrigin(request);
    const rateLimit = checkRateLimit(`customer_register:${ip}`, 5, 60_000);

    if (!rateLimit.ok) {
      return appendRateLimitHeaders(
        NextResponse.json(
          { ok: false, error: "Muitas tentativas de cadastro. Tente novamente em instantes." },
          { status: 429 }
        ),
        rateLimit
      );
    }

    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return appendRateLimitHeaders(
        NextResponse.json(
          { ok: false, error: "Revise nome, e-mail e senha. Use pelo menos 8 caracteres com letras, numeros e simbolos." },
          { status: 400 }
        ),
        rateLimit
      );
    }

    const account = await registerCustomerAccount(parsed.data);
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
      action: "customer_register_success",
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
    const message = error instanceof Error ? error.message : "Nao foi possivel criar sua conta agora.";

    await appendAuditLog({
      actorType: "anonymous",
      action: "customer_register_failed",
      resourceType: "customer_account",
      ipAddress: ip,
      userAgent: request.headers.get("user-agent"),
      payload: { error: message, email: maskEmail((body as any)?.email || "") }
    });

    return NextResponse.json(
      {
        ok: false,
        error: databaseUnavailable ? databaseUnavailableMessage : message
      },
      {
        status: databaseUnavailable ? 503 : message.includes("Já existe") ? 409 : 500
      }
    );
  }
}
