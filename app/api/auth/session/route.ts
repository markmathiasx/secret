import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { findUserById } from "@/lib/auth-store";
import { customerSessionCookieName, getCustomerSessionSecret, verifySignedSessionToken } from "@/lib/session-token";

export const runtime = "nodejs";

export async function GET() {
  const secret = getCustomerSessionSecret();
  if (!secret) {
    return NextResponse.json({ ok: true, user: null });
  }

  const token = (await cookies()).get(customerSessionCookieName)?.value || "";
  const session = await verifySignedSessionToken(token, secret);

  if (!session || session.role !== "customer") {
    return NextResponse.json({ ok: true, user: null });
  }

  const user = await findUserById(session.sub, "customer");
  if (!user) {
    return NextResponse.json({ ok: true, user: null });
  }

  return NextResponse.json({
    ok: true,
    user: {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      role: "customer"
    }
  });
}
