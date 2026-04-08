import { NextResponse } from "next/server";
import { auth } from "@/auth";

export const runtime = "nodejs";

export async function GET() {
  const session = await auth();

  if (!session?.user?.email) {
    return NextResponse.json({ ok: true, user: null });
  }

  return NextResponse.json({
    ok: true,
    user: {
      id: session.user.id,
      email: session.user.email,
      displayName: session.user.name || session.user.email.split("@")[0],
      role: session.user.role === "admin" ? "admin" : session.user.role === "seller" ? "seller" : "customer",
      twoFactorEnabled: session.user.twoFactorEnabled || false,
    },
  });
}
