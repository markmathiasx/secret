import { NextResponse } from "next/server";
import { adminConfig } from "@/lib/server-config";
import { applyNoStoreHeaders } from "@/lib/http-cache";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  const cookieNames = [
    adminConfig.sessionCookieName,
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
      sameSite: "strict",
      path: "/",
      maxAge: 0,
    });
  }

  return applyNoStoreHeaders(response, { varyCookie: true });
}
