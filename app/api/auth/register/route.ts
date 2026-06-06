import { NextResponse } from "next/server";
import { registerBuyerAccount } from "@/lib/marketplace-auth";
import { applyNoStoreHeaders } from "@/lib/http-cache";
import { createCustomerAccount } from "@/lib/auth-store";
import { canConnectToDatabase } from "@/lib/prisma";
import { getClientIp, sanitizeTextInput, isValidEmail } from "@/lib/security";
import { rateLimitRequest } from "@/lib/redis";
import { recordAuthAudit } from "@/lib/auth/audit";

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
      await recordAuthAudit({
        actorUserId: user.id,
        action: "auth.customer.register_success",
        targetType: "User",
        targetId: user.id,
        ip,
        userAgent: req.headers.get("user-agent"),
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
    await recordAuthAudit({
      actorUserId: result.user.id,
      action: "auth.customer.register_success",
      targetType: "User",
      targetId: result.user.id,
      ip,
      userAgent: req.headers.get("user-agent"),
      metadata: { needsVerification: result.needsVerification },
    });

    return applyNoStoreHeaders(
      NextResponse.json(
        {
          success: true,
          needsVerification: result.needsVerification,
          message: result.needsVerification
            ? "Conta criada. Verifique seu e-mail para confirmar o acesso."
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
      await recordAuthAudit({
        action: "auth.customer.register_rejected",
        ip: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip"),
        userAgent: req.headers.get("user-agent"),
        metadata: { reason: "duplicate_or_registered" },
      });
      return applyNoStoreHeaders(NextResponse.json({ error: "Não foi possível criar a conta com os dados informados." }, { status: 409 }));
    }

    await recordAuthAudit({
      action: "auth.customer.register_error",
      ip: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip"),
      userAgent: req.headers.get("user-agent"),
      metadata: { reason: normalized.slice(0, 120) },
    });
    return applyNoStoreHeaders(NextResponse.json({ error: "Não foi possível criar a conta agora." }, { status: 500 }));
  }
}
