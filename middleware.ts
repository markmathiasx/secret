import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { adminConfig } from "@/lib/constants";
import { verifySignedSessionToken } from "@/lib/session-token";

function isProtectedAdminPath(path: string) {
  return (
    path === "/admin" ||
    path.startsWith("/admin/") ||
    path === adminConfig.hiddenPath ||
    path.startsWith(`${adminConfig.hiddenPath}/`)
  );
}

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const response = NextResponse.next();

  const cspRules = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' https://sdk.mercadopago.com https://maps.googleapis.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: https:",
    "media-src 'self' https: blob:",
    "font-src 'self' data: https://fonts.gstatic.com",
    "connect-src 'self' https://api.mercadopago.com https://graph.facebook.com https://viacep.com.br https://*.supabase.co wss://*.supabase.co https://*.supabase.in wss://*.supabase.in https://maps.googleapis.com https://maps.gstatic.com",
    "frame-src https://www.mercadopago.com.br https://www.mercadopago.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self' https://www.mercadopago.com.br https://www.mercadopago.com",
    "frame-ancestors 'none'",
  ];
  if (process.env.NODE_ENV === 'production') cspRules.push('upgrade-insecure-requests');

  response.headers.set('Content-Security-Policy', cspRules.join('; '));
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-DNS-Prefetch-Control', 'off');
  response.headers.set('Cross-Origin-Opener-Policy', 'same-origin');
  response.headers.set('Cross-Origin-Resource-Policy', 'same-site');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');
  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  }

  if (isProtectedAdminPath(path) && !path.endsWith('/login')) {
    const adminCookie = request.cookies.get(adminConfig.sessionCookieName)?.value || "";
    const legacySessionActive = Boolean(adminConfig.legacySessionToken && adminCookie === adminConfig.legacySessionToken);
    const adminSession = legacySessionActive
      ? { role: "admin" as const }
      : await verifySignedSessionToken(adminCookie, adminConfig.sessionSecret);

    if (!adminSession || adminSession.role !== "admin") {
      const loginUrl = new URL(`${adminConfig.hiddenPath}/login`, request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
