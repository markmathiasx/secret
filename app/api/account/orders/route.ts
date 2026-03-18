import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getCustomerOrdersByEmail } from "@/lib/server-store";
import { customerSessionCookieName, getCustomerSessionSecret, verifySignedSessionToken } from "@/lib/session-token";

export const runtime = "nodejs";

export async function GET() {
  const secret = getCustomerSessionSecret();
  if (!secret) {
    return NextResponse.json({ ok: true, orders: [] });
  }

  const token = (await cookies()).get(customerSessionCookieName)?.value || "";
  const session = await verifySignedSessionToken(token, secret);

  if (!session || session.role !== "customer" || !session.email) {
    return NextResponse.json({ ok: true, orders: [] });
  }

  const orders = await getCustomerOrdersByEmail(session.email);
  return NextResponse.json({ ok: true, orders });
}
