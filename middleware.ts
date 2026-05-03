import { NextRequest, NextResponse } from "next/server";
import { adminConfig } from "@/lib/admin-config";
import { getSiteUrl } from "@/lib/env";
import { API_RATE_LIMIT, AUTH_RATE_LIMIT, checkRateLimit, GLOBAL_RATE_LIMIT, PAYMENT_RATE_LIMIT, RateLimitConfig, SESSION_RATE_LIMIT } from "@/lib/rate-limit";
import { getCustomerSessionSecret, verifySignedSessionToken } from "@/lib/session-token";

const protectedPrefixes = ["/seller", "/admin", "/conta"];
const adminLoginPath = "/admin/login";

function isProtectedPath(pathname: string) {
  if (pathname === adminLoginPath || pathname.startsWith(`${adminLoginPath}/`)) {
    return false;
  }

  return protectedPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(prefix + "/"));
}

function isStaticAssetPath(pathname: string) {
  return (
    pathname.startsWith("/products/") ||
    pathname.startsWith("/catalog-assets/") ||
    /\.(?:avif|css|gif|ico|jpeg|jpg|js|json|map|png|svg|txt|webmanifest|webp|woff|woff2|xml)$/i.test(pathname)
  );
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

  if (request.headers.has("x-middleware-subrequest")) {
    return NextResponse.json(
      { error: "Forbidden" },
      {
        status: 403,
        headers: { "x-request-id": requestId, "x-trace-id": requestId },
      },
    );
  }

  // --- Rate limiting ---
  const RATE_LIMITED_ROUTES: { pattern: string; config: RateLimitConfig }[] = [
    { pattern: "/api/admin/login", config: AUTH_RATE_LIMIT },
    { pattern: "/api/auth/session", config: SESSION_RATE_LIMIT },
    { pattern: "/api/auth/", config: AUTH_RATE_LIMIT },
    { pattern: "/api/pix", config: PAYMENT_RATE_LIMIT },
    { pattern: "/api/checkout", config: PAYMENT_RATE_LIMIT },
    { pattern: "/api/", config: API_RATE_LIMIT },
  ];

  const clientIp =
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";

  const globalRate = isStaticAssetPath(pathname)
    ? null
    : checkRateLimit(`global:${clientIp}`, GLOBAL_RATE_LIMIT);
  if (globalRate && !globalRate.success) {
    return NextResponse.json(
      { error: "Too many requests", retryAfterMs: globalRate.retryAfterMs },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil((globalRate.retryAfterMs ?? 60000) / 1000)),
          "X-RateLimit-Limit": String(GLOBAL_RATE_LIMIT.maxRequests),
          "X-RateLimit-Remaining": String(globalRate.remaining),
          "X-RateLimit-Reset": String(globalRate.resetAt),
          "x-request-id": requestId,
        },
      },
    );
  }

  for (const { pattern, config } of RATE_LIMITED_ROUTES) {
    const normalised = pattern.replace(/\/$/, "");
    if (pathname === normalised || pathname.startsWith(normalised + "/")) {
      const result = checkRateLimit(`${clientIp}:${normalised}`, config);
      if (!result.success) {
        return NextResponse.json(
          { error: "Too many requests", retryAfterMs: result.retryAfterMs },
          {
            status: 429,
            headers: {
              "Retry-After": String(Math.ceil((result.retryAfterMs ?? 60000) / 1000)),
              "X-RateLimit-Limit": String(config.maxRequests),
              "X-RateLimit-Remaining": String(result.remaining),
              "X-RateLimit-Reset": String(result.resetAt),
              "x-request-id": requestId,
            },
          }
        );
      }
      break;
    }
  }

  // --- Domain canonicalization (production only) ---
  // Redirect every production host to the canonical custom domain from NEXT_PUBLIC_SITE_URL.
  const isProductionDeployment =
    process.env.VERCEL_ENV === "production" || (process.env.NODE_ENV === "production" && !process.env.VERCEL_ENV);
  const canonicalHost = isProductionDeployment ? new URL(getSiteUrl()).host : "";

  if (
    canonicalHost &&
    host !== canonicalHost &&
    !host.includes("localhost") &&
    !host.includes("127.0.0.1") &&
    isProductionDeployment
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
    "connect-src 'self' https://api.mercadopago.com https://api-static.mercadopago.com https://secure-fields.mercadopago.com https://api.mercadolibre.com https://*.mercadolibre.com https://*.mercadolivre.com https://http2.mlstatic.com https://graph.facebook.com https://viacep.com.br https://*.supabase.co wss://*.supabase.co https://*.supabase.in wss://*.supabase.in https://maps.googleapis.com https://maps.gstatic.com https://www.google-analytics.com https://region1.google-analytics.com https://*.sentry.io https://ingest.sentry.io https://*.upstash.io",
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
