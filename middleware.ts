import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { adminConfig } from "@/lib/constants";

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  if (path.startsWith(adminConfig.legacyPath)) {
    const target = path.replace(adminConfig.legacyPath, adminConfig.panelPath) || adminConfig.panelPath;
    return NextResponse.redirect(new URL(target, request.url));
  }

  if (path.startsWith(adminConfig.panelPath) && path !== adminConfig.loginPath && !path.startsWith("/api/admin")) {
    const rawCookie = request.cookies.get(adminConfig.sessionCookieName)?.value || "";
    const parts = rawCookie.split(".");
    const expiresAt = Number(parts[1] || 0);

    if (!rawCookie || parts.length < 4 || !Number.isFinite(expiresAt) || expiresAt < Date.now()) {
      return NextResponse.redirect(new URL(adminConfig.loginPath, request.url));
    }
  }

  const response = NextResponse.next();

  const cspRules = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' https://sdk.mercadopago.com https://www.googletagmanager.com",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "media-src 'self' https:",
    "font-src 'self' data:",
    "connect-src 'self' https://api.mercadopago.com https://viacep.com.br https://*.supabase.co wss://*.supabase.co https://*.supabase.in wss://*.supabase.in https://www.google-analytics.com https://region1.google-analytics.com",
    "frame-src https://www.mercadopago.com.br https://www.mercadopago.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self' https://www.mercadopago.com.br https://www.mercadopago.com",
    "frame-ancestors 'none'"
  ];

  const isProduction = process.env.NODE_ENV === "production";

  if (isProduction) {
    cspRules.push("upgrade-insecure-requests");
  }

  response.headers.set("Content-Security-Policy", cspRules.join("; "));
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("X-DNS-Prefetch-Control", "off");
  response.headers.set("Cross-Origin-Opener-Policy", "same-origin");
  response.headers.set("Cross-Origin-Resource-Policy", "same-site");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  if (isProduction) {
    response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|manifest.webmanifest).*)"]
};
