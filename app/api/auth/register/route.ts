import { NextResponse } from "next/server";
import { createUser } from "@/lib/auth-store";
import { checkRateLimit, getClientIp } from "@/lib/security";
import { createSignedSessionToken, customerSessionCookieName, getCustomerSessionSecret } from "@/lib/session-token";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req.headers);
    const rateLimit = checkRateLimit(`customer_register:${ip}`, 5, 60_000);

    if (!rateLimit.ok) {
      return NextResponse.json({ error: "Muitas tentativas. Aguarde um pouco antes de tentar de novo." }, { status: 429 });
    }

    const { email, password, name } = await req.json();

    if (!email || !password || !name) {
      return NextResponse.json({ error: "Nome, email e senha são obrigatórios" }, { status: 400 });
    }

    if (password.length < 8 || !/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/\d/.test(password)) {
      return NextResponse.json(
        { error: "Use uma senha com pelo menos 8 caracteres, incluindo maiúscula, minúscula e número." },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Email inválido" }, { status: 400 });
    }

    const secret = getCustomerSessionSecret();
    if (!secret) {
      return NextResponse.json({ error: "Configure AUTH_CUSTOMER_SESSION_SECRET no .env.local." }, { status: 500 });
    }

    const user = await createUser({ email, password, displayName: name, role: "customer" });

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
        message: "Conta criada com sucesso!",
        user: {
          id: user.id,
          email: user.email,
          name: user.displayName
        }
      },
      { status: 201 }
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
  } catch (error: any) {
    console.error("Register error:", error);

    if (error?.message === "Já existe uma conta cadastrada com este e-mail.") {
      return NextResponse.json({ error: "Este email já está cadastrado" }, { status: 409 });
    }

    return NextResponse.json({ error: error.message || "Erro ao cadastrar" }, { status: 500 });
  }
}
