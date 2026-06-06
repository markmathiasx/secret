import { NextResponse } from "next/server";
import { applyNoStoreHeaders } from "@/lib/http-cache";
import { customerSessionCookieName } from "@/lib/session-token";
import { getClientIp } from "@/lib/security";
import { recordAuthAudit } from "@/lib/auth/audit";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const response = NextResponse.json({ ok: true });
  const cookieNames = [
    customerSessionCookieName,
    "authjs.session-token",
    "__Secure-authjs.session-token",
    "next-auth.session-token",
    "__Secure-next-auth.session-token",
    "authjs.csrf-token",
    "next-auth.csrf-token",
    "authjs.callback-url",
    "next-auth.callback-url",
  ];

  for (const cookieName of cookieNames) {
    response.cookies.set({
      name: cookieName,
      value: "",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });
  }

  await recordAuthAudit({
    action: "auth.customer.logout",
    ip: getClientIp(request.headers),
    userAgent: request.headers.get("user-agent"),
  });

  return applyNoStoreHeaders(response);
}
