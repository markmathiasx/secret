import { NextResponse } from "next/server";
import { customerAuthConfig } from "@/lib/constants";
import { destroyCustomerSession } from "@/lib/customer-auth";

function readCookieValue(cookieHeader: string, name: string) {
  return cookieHeader
    .split(";")
    .map((item) => item.trim())
    .find((item) => item.startsWith(`${name}=`))
    ?.split("=")
    .slice(1)
    .join("=");
}

export async function POST(request: Request) {
  const sessionCookie = readCookieValue(request.headers.get("cookie") || "", customerAuthConfig.sessionCookieName);
  await destroyCustomerSession(sessionCookie);

  const requestUrl = new URL(request.url);
  const forwardedProto = request.headers.get("x-forwarded-proto");
  const secureCookie = forwardedProto ? forwardedProto === "https" : requestUrl.protocol === "https:";
  const response = NextResponse.redirect(new URL("/login?logout=1", request.url));

  response.cookies.set({
    name: customerAuthConfig.sessionCookieName,
    value: "",
    httpOnly: true,
    secure: secureCookie,
    sameSite: "lax",
    path: "/",
    maxAge: 0
  });

  return response;
}
