import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { adminConfig } from "@/lib/constants";

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  if (path.startsWith(adminConfig.legacyPath)) {
    const target = path.replace(adminConfig.legacyPath, adminConfig.panelPath) || adminConfig.panelPath;
    return NextResponse.redirect(new URL(target, request.url));
  }

  const response = NextResponse.next();

  const cspRules = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' https://sdk.mercadopago.com",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "media-src 'self' https:",
    "font-src 'self' data:",
    "connect-src 'self' https://api.mercadopago.com https://viacep.com.br https://*.supabase.co wss://*.supabase.co https://*.supabase.in wss://*.supabase.in",
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
  response.headers.set("X-DNS-Prefetch-Control", "off");
  response.headers.set("Cross-Origin-Opener-Policy", "same-origin");
  response.headers.set("Cross-Origin-Resource-Policy", "same-site");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=() ");
  if (isProduction) {
    response.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"]
};
