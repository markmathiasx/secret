import { NextResponse } from "next/server";
import { z } from "zod";
import { resetPasswordWithToken } from "@/lib/marketplace-auth";
import { applyNoStoreHeaders } from "@/lib/http-cache";
import { logStructured } from "@/lib/logger";

const schema = z.object({
  token: z.string().min(10),
  password: z
    .string()
    .min(8, "A senha deve ter pelo menos 8 caracteres")
    .regex(/[A-Z]/, "A senha deve ter pelo menos uma letra maiúscula")
    .regex(/[a-z]/, "A senha deve ter pelo menos uma letra minúscula")
    .regex(/\d/, "A senha deve ter pelo menos um número"),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    const firstError = parsed.error.errors[0]?.message ?? "Dados inválidos para redefinir a senha.";
    return applyNoStoreHeaders(NextResponse.json({ ok: false, error: firstError }, { status: 400 }));
  }

  try {
    const user = await resetPasswordWithToken(parsed.data.token, parsed.data.password);

    if (!user) {
      return applyNoStoreHeaders(NextResponse.json({ ok: false, error: "Link inválido ou expirado. Solicite uma nova recuperação." }, { status: 400 }));
    }

    logStructured("info", "password_reset_completed", { userId: user.id });
    return applyNoStoreHeaders(NextResponse.json({ ok: true }));
  } catch (err) {
    logStructured("error", "password_reset_confirm_failed", {
      error: err instanceof Error ? err.message : "unknown",
    });
    return applyNoStoreHeaders(NextResponse.json({ ok: false, error: "Erro ao redefinir a senha. Tente novamente." }, { status: 500 }));
  }
}
