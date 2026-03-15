import { z } from "zod";
import { NextResponse } from "next/server";
import { customerAuthConfig } from "@/lib/constants";
import {
  createCustomerSession,
  sanitizeCustomerRedirectPath,
  verifyCustomerCredentials
} from "@/lib/customer-auth";
import { databaseUnavailableMessage, isDatabaseRuntimeError } from "@/lib/database-status";
import { checkRateLimit, getClientIp } from "@/lib/security";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  next: z.string().optional()
});

export async function POST(request: Request) {
  const ip = getClientIp(request.headers);
  const rateLimit = checkRateLimit(`customer_login:${ip}`, 8, 60_000);

  if (!rateLimit.ok) {
    return NextResponse.json(
      { ok: false, error: "Muitas tentativas de login. Tente novamente em instantes." },
      { status: 429 }
    );
  }

  const body = await request.json().catch(() => ({}));
  const parsed = loginSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Preencha e-mail e senha corretamente." }, { status: 400 });
  }

  try {
    const account = await verifyCustomerCredentials(parsed.data.email, parsed.data.password);

    if (!account) {
      return NextResponse.json({ ok: false, error: "E-mail ou senha incorretos." }, { status: 401 });
    }

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
