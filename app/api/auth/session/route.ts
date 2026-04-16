import { NextResponse } from "next/server";
import { getServerSessionUser } from "@/lib/server-session";

export const runtime = "nodejs";

export async function GET() {
  const user = await getServerSessionUser();

  if (!user?.email) {
    return NextResponse.json({ ok: true, user: null });
  }

  return NextResponse.json({
    ok: true,
    user: {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      role: user.role,
      twoFactorEnabled: user.twoFactorEnabled,
      supportsTwoFactor: user.supportsTwoFactor,
      source: user.source,
    },
  });
}
