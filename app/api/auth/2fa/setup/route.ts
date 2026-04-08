import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { beginTwoFactorEnrollment } from "@/lib/marketplace-auth";

export const runtime = "nodejs";

export async function POST() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ ok: false, error: "Faça login para configurar o 2FA." }, { status: 401 });
  }

  try {
    const setup = await beginTwoFactorEnrollment(session.user.id);
    return NextResponse.json({
      ok: true,
      secret: setup.secret,
      backupCodes: setup.backupCodes,
      otpauthUrl: setup.otpauthUrl,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Não foi possível iniciar a configuração do 2FA.",
      },
      { status: 400 }
    );
  }
}
