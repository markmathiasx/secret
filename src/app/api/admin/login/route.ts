import { NextResponse } from "next/server";
import { checkRateLimit, getClientIp } from "@/lib/security";
import { adminConfig } from "@/lib/constants";
import { createAdminSession, verifyAdminCredentials } from "@/lib/admin-auth";
import { databaseUnavailableMessage, isDatabaseRuntimeError } from "@/lib/database-status";

export async function POST(request: Request) {
  const ip = getClientIp(request.headers);
  const rateLimit = checkRateLimit(`admin_login:${ip}`, 5, 60_000);
  if (!rateLimit.ok) {
    return NextResponse.json({ ok: false, error: "Muitas tentativas. Tente novamente em instantes." }, { status: 429 });
  }

  const body = await request.json().catch(() => ({}));
  const email = String((body as any)?.email || "").trim().toLowerCase();
  const password = String((body as any)?.password || "");

  if (!process.env.ADMIN_PASSWORD_HASH) {
    return NextResponse.json({ ok: false, error: "Configure ADMIN_PASSWORD_HASH no .env.local." }, { status: 500 });
  }

  if (!await verifyAdminCredentials(email, password)) {
    return NextResponse.json({ ok: false, error: "Credenciais incorretas" }, { status: 401 });
  }

  let session;

  try {
    session = await createAdminSession({
      email: adminConfig.email,
      ipAddress: ip,
      userAgent: request.headers.get("user-agent")
    });
  } catch (error) {
    const databaseUnavailable = isDatabaseRuntimeError(error);
    return NextResponse.json(
      {
        ok: false,
        error: databaseUnavailable
          ? databaseUnavailableMessage
          : error instanceof Error
            ? error.message
            : "Nao foi possivel criar a sessao do admin."
      },
      { status: databaseUnavailable ? 503 : 500 }
    );
  }

  const requestUrl = new URL(request.url);
  const forwardedProto = request.headers.get("x-forwarded-proto");
  const secureCookie = forwardedProto ? forwardedProto === "https" : requestUrl.protocol === "https:";
  const response = NextResponse.json({ ok: true, redirectTo: adminConfig.panelPath });
  response.cookies.set({
    name: adminConfig.sessionCookieName,
    value: session.value,
    httpOnly: true,
    secure: secureCookie,
    sameSite: "lax",
    path: "/",
    expires: new Date(session.expiresAt)
  });

  return response;
}
