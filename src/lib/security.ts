import { NextResponse } from "next/server";
import { z } from "zod";
import { hashIpAddress, sanitizeTextInput } from "@/lib/data-protection";

export class SecurityError extends Error {
  status: number;

  constructor(message: string, status = 403) {
    super(message);
    this.name = "SecurityError";
    this.status = status;
  }
}

type RateLimitEntry = {
  count: number;
  expiresAt: number;
};

type AuthFailureEntry = {
  count: number;
  lockedUntil: number;
  lastFailureAt: number;
};

const hits = new Map<string, RateLimitEntry>();
const authFailures = new Map<string, AuthFailureEntry>();

function now() {
  return Date.now();
}

function getExpectedOrigins(request: Request) {
  const requestUrl = new URL(request.url);
  const forwardedProto = request.headers.get("x-forwarded-proto") || requestUrl.protocol.replace(":", "");
  const forwardedHost = request.headers.get("x-forwarded-host") || request.headers.get("host") || requestUrl.host;
  const configured = process.env.NEXT_PUBLIC_SITE_URL ? new URL(process.env.NEXT_PUBLIC_SITE_URL).origin : null;

  return new Set(
    [`${forwardedProto}://${forwardedHost}`, requestUrl.origin, configured]
      .filter(Boolean)
      .map((value) => String(value).toLowerCase())
  );
}

export function sanitizeInput(value: string | null | undefined, maxLength?: number) {
  return sanitizeTextInput(value, maxLength);
}

export function isSecurityError(error: unknown): error is SecurityError {
  return error instanceof SecurityError;
}

export function appendRateLimitHeaders(response: NextResponse, limitResult: ReturnType<typeof checkRateLimit>) {
  response.headers.set("X-RateLimit-Limit", String(limitResult.limit));
  response.headers.set("X-RateLimit-Remaining", String(limitResult.remaining));

  if (!limitResult.ok && typeof limitResult.retryAfter === "number") {
    response.headers.set("Retry-After", String(limitResult.retryAfter));
  }

  return response;
}

export function checkRateLimit(key: string, limit = 15, windowMs = 60_000) {
  const timestamp = now();
  const current = hits.get(key);

  if (!current || current.expiresAt < timestamp) {
    const nextEntry = { count: 1, expiresAt: timestamp + windowMs };
    hits.set(key, nextEntry);
    return { ok: true, remaining: Math.max(0, limit - 1), retryAfter: 0, limit, count: 1 };
  }

  if (current.count >= limit) {
    return {
      ok: false,
      remaining: 0,
      retryAfter: Math.max(1, Math.ceil((current.expiresAt - timestamp) / 1000)),
      limit,
      count: current.count
    };
  }

  current.count += 1;
  hits.set(key, current);
  return {
    ok: true,
    remaining: Math.max(0, limit - current.count),
    retryAfter: 0,
    limit,
    count: current.count
  };
}

export function peekRateLimit(key: string) {
  const current = hits.get(key);
  if (!current || current.expiresAt < now()) return 0;
  return current.count;
}

export function getClientIp(headers: Headers) {
  return (
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headers.get("x-real-ip") ||
    headers.get("cf-connecting-ip") ||
    "unknown"
  );
}

export function getMaskedClientIp(headers: Headers) {
  return hashIpAddress(getClientIp(headers));
}

export function enforceSameOrigin(request: Request) {
  const expectedOrigins = getExpectedOrigins(request);
  const originHeader = request.headers.get("origin");
  const refererHeader = request.headers.get("referer");
  const secFetchSite = request.headers.get("sec-fetch-site");

  if (originHeader && !expectedOrigins.has(originHeader.toLowerCase())) {
    throw new SecurityError("Requisicao bloqueada por verificacao de origem.");
  }

  if (!originHeader && refererHeader) {
    const refererOrigin = new URL(refererHeader).origin.toLowerCase();
    if (!expectedOrigins.has(refererOrigin)) {
      throw new SecurityError("Requisicao bloqueada por verificacao de referer.");
    }
  }

  if (!originHeader && !refererHeader && secFetchSite && !["same-origin", "same-site", "none"].includes(secFetchSite)) {
    throw new SecurityError("Requisicao bloqueada por verificacao de origem.");
  }
}

export function getAuthLockState(key: string) {
  const current = authFailures.get(key);
  const timestamp = now();

  if (!current) {
    return { blocked: false, retryAfter: 0, attempts: 0 };
  }

  if (current.lockedUntil > timestamp) {
    return {
      blocked: true,
      retryAfter: Math.max(1, Math.ceil((current.lockedUntil - timestamp) / 1000)),
      attempts: current.count
    };
  }

  return { blocked: false, retryAfter: 0, attempts: current.count };
}

export function registerAuthFailure(key: string) {
  const timestamp = now();
  const current = authFailures.get(key);
  const nextCount = (current?.count || 0) + 1;
  const multiplier = Math.max(0, nextCount - 4);
  const lockMs = multiplier > 0 ? Math.min(30 * 60_000, 60_000 * 2 ** (multiplier - 1)) : 0;

  authFailures.set(key, {
    count: nextCount,
    lockedUntil: lockMs ? timestamp + lockMs : 0,
    lastFailureAt: timestamp
  });

  return getAuthLockState(key);
}

export function clearAuthFailures(key: string) {
  authFailures.delete(key);
}

export function detectSuspiciousRequest(headers: Headers) {
  const signals: string[] = [];
  const forwardedFor = headers.get("x-forwarded-for");
  const via = headers.get("via");
  const forwarded = headers.get("forwarded");
  const secFetchSite = headers.get("sec-fetch-site");

  if (forwardedFor && forwardedFor.includes(",")) signals.push("proxy_chain_detected");
  if (via) signals.push("via_header_present");
  if (forwarded) signals.push("forwarded_header_present");
  if (secFetchSite && !["same-origin", "same-site", "none"].includes(secFetchSite)) signals.push("cross_site_navigation");

  return signals;
}

export function assessOrderRisk(input: {
  ipAddress: string;
  headers: Headers;
  paymentMethod: "pix" | "card" | "cash" | "other";
  state: string;
  shippingAmount: number;
  hasEmail: boolean;
  ordersThisHour: number;
}) {
  const signals = detectSuspiciousRequest(input.headers);

  if (input.ordersThisHour >= 3) signals.push("high_velocity_ip");
  if (input.paymentMethod === "card" && !input.hasEmail) signals.push("card_without_email");
  if (input.shippingAmount <= 0 && input.state.trim().toUpperCase() !== "RJ") signals.push("zero_shipping_outside_primary_region");

  const score = signals.length * 20;
  return {
    signals,
    score,
    reviewRequired: score >= 40
  };
}

export const adminStatusSchema = z.object({
  nextStatus: z.enum([
    "new_order",
    "waiting_payment",
    "payment_confirmed",
    "preparing_model",
    "in_production",
    "completed",
    "shipped",
    "delivered",
    "canceled"
  ]),
  redirectTo: z.string().min(1).max(200).default("/admin/pedidos")
});

export const adminPaymentSchema = z.object({
  status: z.enum(["pending", "waiting_proof", "paid", "declined", "canceled", "refunded"]),
  verificationNote: z.string().max(500).optional().default(""),
  pixReference: z.string().max(160).optional().default(""),
  cardBrand: z.string().max(40).optional().default(""),
  cardLast4: z
    .string()
    .max(4)
    .optional()
    .default("")
    .transform((value) => value.replace(/\D/g, "").slice(-4)),
  cardHolderName: z.string().max(160).optional().default(""),
  redirectTo: z.string().min(1).max(200).default("/admin/pedidos")
});

export const adminNoteSchema = z.object({
  content: z.string().min(1).max(2_000),
  redirectTo: z.string().min(1).max(200).default("/admin/pedidos")
});
