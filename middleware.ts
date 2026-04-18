import { NextRequest, NextResponse } from "next/server";

const protectedPrefixes = ["/seller", "/admin"];
const adminLoginPath = "/admin/login";

function isProtectedPath(pathname: string) {
  if (pathname === adminLoginPath || pathname.startsWith(`${adminLoginPath}/`)) {
    return false;
  }

  return protectedPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(prefix + "/"));
}

function hasSharedAuthCookie(request: NextRequest) {
  return Boolean(
    request.cookies.get("authjs.session-token")?.value ||
    request.cookies.get("__Secure-authjs.session-token")?.value ||
    request.cookies.get("next-auth.session-token")?.value ||
    request.cookies.get("__Secure-next-auth.session-token")?.value
  );
}

function hasMarketplaceSessionCookie(request: NextRequest) {
  return Boolean(request.cookies.get("mdh_customer")?.value || hasSharedAuthCookie(request));
}

function hasAdminSessionCookie(request: NextRequest) {
  return Boolean(request.cookies.get("mdh_admin")?.value || hasSharedAuthCookie(request));
}

function hasSellerSessionCookie(request: NextRequest) {
  return Boolean(request.cookies.get("mdh_admin")?.value || request.cookies.get("mdh_customer")?.value || hasSharedAuthCookie(request));
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const response = NextResponse.next();

  const cspRules = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' https://sdk.mercadopago.com https://http2.mlstatic.com https://maps.googleapis.com https://www.googletagmanager.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: https:",
    "media-src 'self' https: blob:",
    "font-src 'self' data: https://fonts.gstatic.com",
    "connect-src 'self' https://api.mercadopago.com https://api.mercadolibre.com https://http2.mlstatic.com https://graph.facebook.com https://viacep.com.br https://*.supabase.co wss://*.supabase.co https://*.supabase.in wss://*.supabase.in https://maps.googleapis.com https://maps.gstatic.com https://www.google-analytics.com https://region1.google-analytics.com",
    "frame-src https://www.mercadopago.com.br https://www.mercadopago.com https://www.mercadolibre.com https://www.mercadolibre.com.br",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self' https://www.mercadopago.com.br https://www.mercadopago.com https://www.mercadolibre.com https://www.mercadolibre.com.br",
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

  const hasRequiredSession =
    pathname === "/admin" || pathname.startsWith("/admin/")
      ? hasAdminSessionCookie(request)
      : pathname === "/seller" || pathname.startsWith("/seller/")
        ? hasSellerSessionCookie(request)
        : hasMarketplaceSessionCookie(request);

  if (hasRequiredSession) {
    return response;
  }

  const loginUrl = new URL(pathname === "/admin" || pathname.startsWith("/admin/") ? adminLoginPath : "/login", request.url);
  loginUrl.searchParams.set("redirect", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
