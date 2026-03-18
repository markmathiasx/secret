import { NextResponse } from "next/server";
import { authenticateUser } from "@/lib/auth-store";
import { checkRateLimit, getClientIp } from "@/lib/security";
import { createSignedSessionToken, customerSessionCookieName, getCustomerSessionSecret } from "@/lib/session-token";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req.headers);
    const rateLimit = checkRateLimit(`customer_login:${ip}`, 6, 60_000);

    if (!rateLimit.ok) {
      return NextResponse.json({ error: "Muitas tentativas. Aguarde um pouco antes de tentar de novo." }, { status: 429 });
    }

    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email e senha são obrigatórios" }, { status: 400 });
    }

    const secret = getCustomerSessionSecret();
    if (!secret) {
      return NextResponse.json({ error: "Configure AUTH_CUSTOMER_SESSION_SECRET no .env.local." }, { status: 500 });
    }

    const user = await authenticateUser({ email, password, role: "customer" });

    if (!user) {
      return NextResponse.json({ error: "Email ou senha incorretos" }, { status: 401 });
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

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Erro ao fazer login" }, { status: 500 });
  }
}
