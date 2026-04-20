import { NextResponse } from "next/server";
import { z } from "zod";
import { resetPasswordWithToken } from "@/lib/marketplace-auth";
import { applyNoStoreHeaders } from "@/lib/http-cache";
import { logStructured } from "@/lib/logger";

const schema = z.object({
  token: z.string().min(10),
  password: z.string().min(8).regex(/[A-Z]/, "Senha deve ter letra maiúscula").regex(/[a-z]/, "Senha deve ter letra minúscula").regex(/\d/, "Senha deve ter número"),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return applyNoStoreHeaders(NextResponse.json({ ok: false, error: "Dados inválidos para redefinir a senha." }, { status: 400 }));
  }

  const user = await resetPasswordWithToken(parsed.data.token, parsed.data.password);

  if (!user) {
    return applyNoStoreHeaders(NextResponse.json({ ok: false, error: "Token inválido ou expirado." }, { status: 400 }));
  }

  logStructured("info", "password_reset_completed", { userId: user.id });
  return applyNoStoreHeaders(NextResponse.json({ ok: true }));
}
