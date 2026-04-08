import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { confirmTwoFactorEnrollment } from "@/lib/marketplace-auth";

const schema = z.object({
  code: z.string().min(6).max(16),
});

export const runtime = "nodejs";

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ ok: false, error: "Faça login para confirmar o 2FA." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Informe um código 2FA válido." }, { status: 400 });
  }

  try {
    await confirmTwoFactorEnrollment(session.user.id, parsed.data.code);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Não foi possível confirmar o 2FA.",
      },
      { status: 400 }
    );
  }
}
