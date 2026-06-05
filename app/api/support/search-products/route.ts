import { NextResponse } from "next/server";
import { z } from "zod";
import { checkRateLimit, getClientIp, sanitizeTextInput } from "@/lib/security";
import { buildSupportSearchReply } from "@/lib/support/support-answer-engine";
import { getSupportPriceRange, searchSupportProducts } from "@/lib/support/catalog-support-index";

export const runtime = "nodejs";

const searchSchema = z.object({
  query: z.string().trim().min(1).max(200),
  limit: z.coerce.number().int().min(1).max(12).optional(),
});

function json(payload: unknown, init?: ResponseInit) {
  const response = NextResponse.json(payload, init);
  response.headers.set("Cache-Control", "no-store, max-age=0");
  return response;
}

function methodNotAllowed() {
  return json({ ok: false, error: "Método não suportado." }, { status: 405, headers: { Allow: "GET, POST, OPTIONS" } });
}

function rateLimitOrNull(request: Request, suffix: string) {
  const ip = getClientIp(request.headers);
  const rateLimit = checkRateLimit(`support_search:${ip}:${suffix}`, 40, 60_000);
  if (rateLimit.ok) return null;
  const response = json(
    { ok: false, error: "Muitas buscas em sequência. Aguarde um pouco antes de continuar.", retryAfter: rateLimit.retryAfter },
    { status: 429 }
  );
  response.headers.set("Retry-After", String(rateLimit.retryAfter));
  return response;
}

export async function OPTIONS() {
  return json({ ok: true, methods: ["GET", "POST"] }, { headers: { Allow: "GET, POST, OPTIONS" } });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parsed = searchSchema.safeParse({
    query: searchParams.get("query") || searchParams.get("q") || "",
    limit: searchParams.get("limit") || undefined,
  });
  if (!parsed.success) {
    return json({ ok: false, error: "Informe um termo de busca válido." }, { status: 400 });
  }

  const limited = rateLimitOrNull(request, parsed.data.query);
  if (limited) return limited;

  const query = sanitizeTextInput(parsed.data.query, 200);
  const result = buildSupportSearchReply(query);
  const products = result.products.slice(0, parsed.data.limit || 6);
  return json({
    ok: true,
    query,
    intent: result.intent,
    products,
    priceRange: getSupportPriceRange(products),
  });
}

export async function POST(request: Request) {
  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > 8_000) {
    return json({ ok: false, error: "Busca acima do limite permitido." }, { status: 413 });
  }

  const body = await request.json().catch(() => null);
  const parsed = searchSchema.safeParse(body);
  if (!parsed.success) {
    return json({ ok: false, error: "Informe um termo de busca válido." }, { status: 400 });
  }

  const limited = rateLimitOrNull(request, parsed.data.query);
  if (limited) return limited;

  const query = sanitizeTextInput(parsed.data.query, 200);
  const products = searchSupportProducts(query, { limit: parsed.data.limit || 6 });
  return json({
    ok: true,
    query,
    products,
    priceRange: getSupportPriceRange(products),
  });
}

export const PUT = methodNotAllowed;
export const PATCH = methodNotAllowed;
export const DELETE = methodNotAllowed;
