import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { adminConfig } from "@/lib/admin-config";

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  if (path === "/admin" || path.startsWith("/admin/")) {
    return new NextResponse("Not Found", { status: 404 });
  }

  const response = NextResponse.next();

  const cspRules = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' https://sdk.mercadopago.com",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "media-src 'self' https:",
    "font-src 'self' data:",
    "connect-src 'self' https://api.mercadopago.com https://graph.facebook.com https://viacep.com.br https://*.supabase.co wss://*.supabase.co https://*.supabase.in wss://*.supabase.in",
    "frame-src https://www.mercadopago.com.br https://www.mercadopago.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self' https://www.mercadopago.com.br https://www.mercadopago.com",
    "frame-ancestors 'none'"
  ];

  if (process.env.NODE_ENV === "production") {
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
  response.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");

  if (path.startsWith(adminConfig.hiddenPath) && !path.startsWith(`${adminConfig.hiddenPath}/login`)) {
    const adminCookie = request.cookies.get(adminConfig.sessionCookieName)?.value;
    if (!adminCookie || adminCookie !== adminConfig.sessionToken) {
      return NextResponse.redirect(new URL(`${adminConfig.hiddenPath}/login`, request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"]
};
