import { NextRequest, NextResponse } from "next/server";

const protectedPrefixes = ["/conta", "/checkout", "/seller", "/admin"];

function isProtectedPath(pathname: string) {
  return protectedPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(prefix + "/"));
}

function hasSessionCookie(request: NextRequest) {
  return Boolean(
    request.cookies.get("authjs.session-token")?.value ||
    request.cookies.get("__Secure-authjs.session-token")?.value ||
    request.cookies.get("next-auth.session-token")?.value ||
    request.cookies.get("__Secure-next-auth.session-token")?.value
  );
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

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
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=()");

  if (process.env.NODE_ENV === "production") {
    response.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
  }

  if (!isProtectedPath(pathname)) {
    return response;
  }

  if (hasSessionCookie(request)) {
    return response;
  }

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("redirect", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
