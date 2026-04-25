import { NextResponse } from "next/server";
import { registerBuyerAccount } from "@/lib/marketplace-auth";
import { applyNoStoreHeaders } from "@/lib/http-cache";
import { createCustomerAccount } from "@/lib/auth-store";
import { canConnectToDatabase } from "@/lib/prisma";
import { getClientIp, sanitizeTextInput, isValidEmail } from "@/lib/security";
import { rateLimitRequest } from "@/lib/redis";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req.headers);
    const rateLimit = await rateLimitRequest(`customer_register:${ip}`, 5, 60_000);

    if (!rateLimit.ok) {
      return applyNoStoreHeaders(NextResponse.json({ error: "Muitas tentativas. Aguarde um pouco antes de tentar de novo." }, { status: 429 }));
    }

    const { email: rawEmail, password, name: rawName } = await req.json();

    const email = typeof rawEmail === "string" ? rawEmail.trim().toLowerCase() : "";
    const name = typeof rawName === "string" ? sanitizeTextInput(rawName, 100) : "";

    if (!email || !password || !name) {
      return applyNoStoreHeaders(NextResponse.json({ error: "Nome, email e senha são obrigatórios." }, { status: 400 }));
    }

    if (!isValidEmail(email)) {
      return applyNoStoreHeaders(NextResponse.json({ error: "Formato de email inválido." }, { status: 400 }));
    }

    if (typeof password !== "string" || password.length < 8 || !/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/\d/.test(password)) {
      return applyNoStoreHeaders(
        NextResponse.json(
          { error: "Use uma senha com pelo menos 8 caracteres, incluindo maiúscula, minúscula e número." },
          { status: 400 }
        )
      );
    }

    const hasDatabase = await canConnectToDatabase();

    if (!hasDatabase) {
      const user = await createCustomerAccount({
        email,
        password,
        displayName: name,
      });

      return applyNoStoreHeaders(
        NextResponse.json(
          {
            success: true,
            needsVerification: false,
            message: "Conta criada com sucesso.",
            user: {
              id: user.id,
              email: user.email,
              name: user.displayName,
            },
          },
          { status: 201 }
        )
      );
    }

    const result = await registerBuyerAccount({
      email,
      password,
      name,
    });

    return applyNoStoreHeaders(
      NextResponse.json(
        {
          success: true,
          needsVerification: result.needsVerification,
          message: result.needsVerification
            ? "Conta criada. Confira seu e-mail para confirmar o acesso."
            : "Conta criada com sucesso.",
          user: {
            id: result.user.id,
            email: result.user.email,
            name: result.user.name,
          },
        },
        { status: 201 }
      )
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro ao cadastrar.";
    const normalized = message.toLowerCase();

    if (normalized.includes("já existe") || normalized.includes("already") || normalized.includes("registered")) {
      return applyNoStoreHeaders(NextResponse.json({ error: message }, { status: 409 }));
    }

    return applyNoStoreHeaders(NextResponse.json({ error: message }, { status: 500 }));
  }
}
