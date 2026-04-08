import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { disableTwoFactor } from "@/lib/marketplace-auth";

export const runtime = "nodejs";

export async function POST() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ ok: false, error: "Faça login para desativar o 2FA." }, { status: 401 });
  }

  await disableTwoFactor(session.user.id);
  return NextResponse.json({ ok: true });
}
