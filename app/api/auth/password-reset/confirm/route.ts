import { NextResponse } from "next/server";
import { z } from "zod";
import { resetPasswordWithToken } from "@/lib/marketplace-auth";

const schema = z.object({
  token: z.string().min(10),
  password: z.string().min(8),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Dados inválidos para redefinir a senha." }, { status: 400 });
  }

  const user = await resetPasswordWithToken(parsed.data.token, parsed.data.password);

  if (!user) {
    return NextResponse.json({ ok: false, error: "Token inválido ou expirado." }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
