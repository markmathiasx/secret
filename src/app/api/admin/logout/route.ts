import { NextResponse } from "next/server";
import { adminConfig } from "@/lib/constants";
import { destroyAdminSession } from "@/lib/admin-auth";

export async function POST(request: Request) {
  const cookieHeader = request.headers.get("cookie") || "";
  const sessionCookie = cookieHeader
    .split(";")
    .map((item) => item.trim())
    .find((item) => item.startsWith(`${adminConfig.sessionCookieName}=`))
    ?.split("=")
    .slice(1)
    .join("=");

  await destroyAdminSession(sessionCookie);

  const requestUrl = new URL(request.url);
  const forwardedProto = request.headers.get("x-forwarded-proto");
  const secureCookie = forwardedProto ? forwardedProto === "https" : requestUrl.protocol === "https:";
  const response = NextResponse.redirect(new URL(`${adminConfig.loginPath}?logout=1`, request.url));
  response.cookies.set({
    name: adminConfig.sessionCookieName,
    value: "",
    httpOnly: true,
    secure: secureCookie,
    sameSite: "lax",
    path: "/",
    maxAge: 0
  });
  return response;
}
