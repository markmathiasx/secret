import { NextResponse } from "next/server";
import { cookies } from "next/headers";
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

  return NextResponse.json({
    ok: true,
    user: {
      id: session.sub,
      email: session.email,
      displayName: session.displayName,
      role: "customer"
    }
  });
}
