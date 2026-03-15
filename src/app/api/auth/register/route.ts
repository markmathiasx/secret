import { z } from "zod";
import { NextResponse } from "next/server";
import { customerAuthConfig } from "@/lib/constants";
import {
  createCustomerSession,
  registerCustomerAccount,
  sanitizeCustomerRedirectPath
} from "@/lib/customer-auth";
import { databaseUnavailableMessage, isDatabaseRuntimeError } from "@/lib/database-status";
import { checkRateLimit, getClientIp } from "@/lib/security";

const registerSchema = z.object({
  fullName: z.string().min(3).max(160),
  email: z.string().email().max(160),
  password: z
    .string()
    .min(8)
    .max(128)
    .refine((value) => /[a-z]/i.test(value) && /\d/.test(value), "Senha fraca"),
  next: z.string().optional()
});

export async function POST(request: Request) {
  const ip = getClientIp(request.headers);
  const rateLimit = checkRateLimit(`customer_register:${ip}`, 5, 60_000);

  if (!rateLimit.ok) {
    return NextResponse.json(
      { ok: false, error: "Muitas tentativas de cadastro. Tente novamente em instantes." },
      { status: 429 }
    );
  }

  const body = await request.json().catch(() => ({}));
  const parsed = registerSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "Revise nome, e-mail e senha. Use pelo menos 8 caracteres com letras e numeros." },
      { status: 400 }
    );
  }

  try {
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
      sameSite: "lax",
      path: "/",
      expires: new Date(session.expiresAt)
    });

    return response;
  } catch (error) {
    const databaseUnavailable = isDatabaseRuntimeError(error);
    const message = error instanceof Error ? error.message : "Nao foi possivel criar sua conta agora.";

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
