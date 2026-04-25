import { NextResponse } from "next/server";
import { z } from "zod";
import { getClientIp } from "@/lib/security";
import { rateLimitRequest } from "@/lib/redis";
import { findProduct } from "@/lib/catalog";
import { logStructured } from "@/lib/logger";

export const runtime = "nodejs";

const schema = z.object({
  productId: z.string().min(1).max(128),
  email: z.string().email().max(320),
});

/**
 * POST /api/notify/back-in-stock
 * Registers an email to be notified when a product is back in stock.
 * Currently persists to logs; wire to DB/email queue when needed.
 */
export async function POST(request: Request) {
  const ip = getClientIp(request.headers);
  const rateLimit = await rateLimitRequest(`back-in-stock:${ip}`, 5, 60 * 60 * 1000);

  if (!rateLimit.ok) {
    return NextResponse.json({ ok: false, message: "Muitas tentativas. Tente novamente mais tarde." }, { status: 429 });
  }

  const raw = await request.json().catch(() => null);
  const parsed = schema.safeParse(raw);

  if (!parsed.success) {
    return NextResponse.json({ ok: false, message: "Dados inválidos." }, { status: 400 });
  }

  const product = findProduct(parsed.data.productId);
  if (!product) {
    return NextResponse.json({ ok: false, message: "Produto não encontrado." }, { status: 404 });
  }

  logStructured("info", "back_in_stock_request", {
    productId: parsed.data.productId,
    productName: product.name,
    // Email is hashed/redacted by the logger's PII filter
    emailDomain: parsed.data.email.split("@")[1] || "unknown",
  });

  // TODO: persist to DB and trigger email when stock is restored
  return NextResponse.json({ ok: true, message: "Você será notificado assim que o produto estiver disponível." });
}
