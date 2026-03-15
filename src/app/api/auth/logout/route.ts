import { NextResponse } from "next/server";
import { appendAuditLog } from "@/lib/audit";
import { customerAuthConfig } from "@/lib/constants";
import { destroyCustomerSession } from "@/lib/customer-auth";
import { enforceSameOrigin, getClientIp, isSecurityError } from "@/lib/security";

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
  try {
    enforceSameOrigin(request);
    const ip = getClientIp(request.headers);
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
      sameSite: "strict",
      path: "/",
      maxAge: 0
    });

    await appendAuditLog({
      actorType: "customer",
      action: "customer_logout",
      resourceType: "customer_session",
      ipAddress: ip,
      userAgent: request.headers.get("user-agent")
    });

    return response;
  } catch (error) {
    if (isSecurityError(error)) {
      return NextResponse.json({ ok: false, error: error.message }, { status: error.status });
    }

    return NextResponse.json({ ok: false, error: "Nao foi possivel encerrar a sessao agora." }, { status: 500 });
  }
}
