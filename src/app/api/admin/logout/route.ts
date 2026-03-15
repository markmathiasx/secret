import { NextResponse } from "next/server";
import { appendAuditLog } from "@/lib/audit";
import { adminConfig } from "@/lib/constants";
import { destroyAdminSession } from "@/lib/admin-auth";
import { enforceSameOrigin, getClientIp, isSecurityError } from "@/lib/security";

export async function POST(request: Request) {
  try {
    enforceSameOrigin(request);
    const ip = getClientIp(request.headers);
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
      sameSite: "strict",
      path: "/",
      maxAge: 0
    });

    await appendAuditLog({
      actorType: "admin",
      actorId: adminConfig.email,
      action: "admin_logout",
      resourceType: "admin_session",
      resourceId: adminConfig.email,
      ipAddress: ip,
      userAgent: request.headers.get("user-agent")
    });
    return response;
  } catch (error) {
    if (isSecurityError(error)) {
      return NextResponse.json({ ok: false, error: error.message }, { status: error.status });
    }

    return NextResponse.json({ ok: false, error: "Nao foi possivel encerrar a sessao admin agora." }, { status: 500 });
  }
}
