import { NextResponse } from "next/server";
import { authenticateCustomerUser } from "@/lib/auth-store";
import { applyNoStoreHeaders } from "@/lib/http-cache";
import { getClientIp, isValidEmail } from "@/lib/security";
import { rateLimitRequest } from "@/lib/redis";
import { createSignedSessionToken, customerSessionCookieName, getCustomerSessionSecret } from "@/lib/session-token";
import { logStructured } from "@/lib/logger";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req.headers);
    const rateLimit = await rateLimitRequest(`customer_login:${ip}`, 6, 60_000);

    if (!rateLimit.ok) {
      logStructured("warn", "customer_login_rate_limited", { requestId: req.headers.get("x-request-id") || null, ip });
      return applyNoStoreHeaders(NextResponse.json({ error: "Muitas tentativas. Aguarde um pouco antes de tentar de novo." }, { status: 429 }));
    }

    const { email: rawEmail, password } = await req.json();
    const email = typeof rawEmail === "string" ? rawEmail.trim().toLowerCase() : "";

    if (!email || !password) {
      logStructured("warn", "customer_login_invalid_payload", { requestId: req.headers.get("x-request-id") || null, ip });
      return applyNoStoreHeaders(NextResponse.json({ error: "Email e senha são obrigatórios" }, { status: 400 }));
    }

    if (!isValidEmail(email)) {
      logStructured("warn", "customer_login_invalid_email", { requestId: req.headers.get("x-request-id") || null, ip });
      return applyNoStoreHeaders(NextResponse.json({ error: "Formato de email inválido" }, { status: 400 }));
    }

    const secret = getCustomerSessionSecret();
    if (!secret) {
      return applyNoStoreHeaders(NextResponse.json({ error: "Configure AUTH_CUSTOMER_SESSION_SECRET nas variáveis do projeto." }, { status: 500 }));
    }

    const user = await authenticateCustomerUser({ email, password });

    if (!user) {
      logStructured("warn", "customer_login_failed", { requestId: req.headers.get("x-request-id") || null, ip, emailDomain: email.split("@")[1] || "unknown" });
      return applyNoStoreHeaders(NextResponse.json({ error: "Email ou senha incorretos" }, { status: 401 }));
    }

    const sessionToken = await createSignedSessionToken(
      {
        sub: user.id,
        email: user.email,
        displayName: user.displayName,
        role: "customer",
        expiresInSeconds: 60 * 60 * 24 * 30
      },
      secret
    );

    const response = NextResponse.json(
      {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.displayName
        }
      },
      { status: 200 }
    );

    response.cookies.set({
      name: customerSessionCookieName,
      value: sessionToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30
    });

    logStructured("info", "customer_login_success", { requestId: req.headers.get("x-request-id") || null, userId: user.id });
    return applyNoStoreHeaders(response);
  } catch (error) {
    logStructured("error", "customer_login_error", { error: error instanceof Error ? error.message : "unknown" });
    return applyNoStoreHeaders(NextResponse.json({ error: "Erro ao fazer login" }, { status: 500 }));
  }
}
