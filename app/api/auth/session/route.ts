import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { applyNoStoreHeaders } from "@/lib/http-cache";
import { customerSessionCookieName, getCustomerSessionSecret, verifySignedSessionToken } from "@/lib/session-token";

export const runtime = "nodejs";

export async function GET() {
  const secret = getCustomerSessionSecret();
  if (!secret) {
    return applyNoStoreHeaders(NextResponse.json({ ok: true, user: null }), { varyCookie: true });
  }

  const token = (await cookies()).get(customerSessionCookieName)?.value || "";
  const session = await verifySignedSessionToken(token, secret);

  if (!session || session.role !== "customer") {
    return applyNoStoreHeaders(NextResponse.json({ ok: true, user: null }), { varyCookie: true });
  }

  return applyNoStoreHeaders(
    NextResponse.json({
      ok: true,
      user: {
        id: session.sub,
        email: session.email,
        displayName: session.displayName,
        role: "customer"
      }
    }),
    { varyCookie: true }
  );
}
