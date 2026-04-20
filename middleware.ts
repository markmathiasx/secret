import { NextRequest, NextResponse } from "next/server";
import { adminConfig } from "@/lib/constants";
import { getCustomerSessionSecret, verifySignedSessionToken } from "@/lib/session-token";

const protectedPrefixes = ["/seller", "/admin", "/conta"];
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

async function hasVerifiedCookieSession(request: NextRequest, cookieName: string, secret: string | null) {
  const token = request.cookies.get(cookieName)?.value;
  if (!token || !secret) return false;
  const payload = await verifySignedSessionToken(token, secret);
  return Boolean(payload);
}

async function hasAdminSessionCookie(request: NextRequest) {
  if (await hasVerifiedCookieSession(request, "mdh_admin", adminConfig.sessionSecret)) {
    return true;
  }

  return hasSharedAuthCookie(request);
}

async function hasSellerSessionCookie(request: NextRequest) {
  if (await hasVerifiedCookieSession(request, "mdh_admin", adminConfig.sessionSecret)) {
    return true;
  }

  if (await hasVerifiedCookieSession(request, "mdh_customer", getCustomerSessionSecret())) {
    return true;
  }

  return hasSharedAuthCookie(request);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const host = request.headers.get("host") || "";
  const requestId = request.headers.get("x-request-id") || crypto.randomUUID();
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-request-id", requestId);
  requestHeaders.set("x-trace-id", requestId);

  // --- Domain canonicalization (production only) ---
  // Redirect apex → www (or vercel.app → custom domain) when NEXT_PUBLIC_SITE_URL is set
  const canonicalHost = process.env.NEXT_PUBLIC_SITE_URL
    ? new URL(process.env.NEXT_PUBLIC_SITE_URL).host
    : "";

  if (
    canonicalHost &&
    host !== canonicalHost &&
    !host.includes("localhost") &&
    !host.includes("127.0.0.1") &&
    process.env.NODE_ENV === "production"
  ) {
    const url = request.nextUrl.clone();
    url.host = canonicalHost;
    url.protocol = "https";
    url.port = "";
    const redirectResponse = NextResponse.redirect(url, 308);
    redirectResponse.headers.set("x-request-id", requestId);
    redirectResponse.headers.set("x-trace-id", requestId);
    return redirectResponse;
  }

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  const cspRules = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' https://sdk.mercadopago.com https://http2.mlstatic.com https://secure-fields.mercadopago.com https://api-static.mercadopago.com https://maps.googleapis.com https://www.googletagmanager.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: https: https://secure-fields.mercadopago.com https://api-static.mercadopago.com",
    "media-src 'self' https: blob:",
    "font-src 'self' data: https://fonts.gstatic.com https://secure-fields.mercadopago.com https://api-static.mercadopago.com",
    "connect-src 'self' https://api.mercadopago.com https://api-static.mercadopago.com https://secure-fields.mercadopago.com https://api.mercadolibre.com https://*.mercadolibre.com https://*.mercadolivre.com https://http2.mlstatic.com https://graph.facebook.com https://viacep.com.br https://*.supabase.co wss://*.supabase.co https://*.supabase.in wss://*.supabase.in https://maps.googleapis.com https://maps.gstatic.com https://www.google-analytics.com https://region1.google-analytics.com",
    "frame-src https://www.mercadopago.com.br https://www.mercadopago.com https://secure-fields.mercadopago.com https://api-static.mercadopago.com https://www.mercadolibre.com https://www.mercadolibre.com.br https://www.mercadolivre.com https://www.mercadolivre.com.br",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self' https://www.mercadopago.com.br https://www.mercadopago.com https://www.mercadolibre.com https://www.mercadolibre.com.br https://www.mercadolivre.com https://www.mercadolivre.com.br",
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
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");

  if (process.env.NODE_ENV === "production") {
    response.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
  }

  if (!isProtectedPath(pathname)) {
    response.headers.set("x-request-id", requestId);
    response.headers.set("x-trace-id", requestId);
    return response;
  }

  const hasRequiredSession =
    pathname === "/admin" || pathname.startsWith("/admin/")
      ? await hasAdminSessionCookie(request)
      : pathname === "/seller" || pathname.startsWith("/seller/")
        ? await hasSellerSessionCookie(request)
        : hasMarketplaceSessionCookie(request);

  if (hasRequiredSession) {
    response.headers.set("x-request-id", requestId);
    response.headers.set("x-trace-id", requestId);
    return response;
  }

  const loginUrl = new URL(pathname === "/admin" || pathname.startsWith("/admin/") ? adminLoginPath : "/login", request.url);
  loginUrl.searchParams.set("redirect", pathname);
  const redirectResponse = NextResponse.redirect(loginUrl);
  redirectResponse.headers.set("x-request-id", requestId);
  redirectResponse.headers.set("x-trace-id", requestId);
  return redirectResponse;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
