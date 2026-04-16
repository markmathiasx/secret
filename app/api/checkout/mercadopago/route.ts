import { NextResponse } from "next/server";
import { z } from "zod";
import { findProduct } from "@/lib/catalog";
import { createMercadoPagoPreference } from "@/lib/payments";
import { resolveOrderPaymentContext } from "@/lib/server/payment-order";
import { updateOrderRecord } from "@/lib/storage";
import { getClientIp, checkRateLimit } from "@/lib/security";

const schema = z.object({
  productId: z.string().min(1),
  quantity: z.coerce.number().int().min(1).max(20).default(1),
  email: z.string().email().optional(),
  orderCode: z.string().min(5).max(64).optional(),
  amount: z.number().positive().max(99999).optional(),
});

export async function POST(request: Request) {
  const ip = getClientIp(request.headers);
  const rateLimit = checkRateLimit(`checkout:${ip}`, 8, 60_000);

  if (!rateLimit.ok) {
    return NextResponse.json({ message: "Muitas tentativas de checkout." }, { status: 429 });
  }

  const raw = await request.json().catch(() => null);
  const parsed = schema.safeParse(raw);

  if (!parsed.success) {
    return NextResponse.json({ message: "Dados inválidos para iniciar o checkout." }, { status: 400 });
  }

  const product = findProduct(parsed.data.productId || "");

  if (!product) {
    return NextResponse.json({ message: "Produto não encontrado." }, { status: 404 });
  }

  const paymentContext = await resolveOrderPaymentContext({
    orderCode: parsed.data.orderCode,
    fallbackTitle: `${product.name} - MDH 3D`,
    fallbackAmount: parsed.data.amount || product.priceCard * parsed.data.quantity,
    fallbackEmail: parsed.data.email,
  });

  const preference = await createMercadoPagoPreference({
    title: paymentContext.title,
    unitPrice: paymentContext.amount,
    quantity: 1,
    payerEmail: paymentContext.customerEmail || parsed.data.email,
    externalReference: paymentContext.orderCode || `MDH-${product.id}-${Date.now()}`
  });

  if (!preference.ok) {
    return NextResponse.json(preference, { status: 400 });
  }

  if (parsed.data.orderCode) {
    await updateOrderRecord(parsed.data.orderCode, {
      status: "checkout de cartao iniciado",
      payment_provider: "mercado-pago",
      payment_reference: preference.id || null,
      payment_status: "checkout_created",
      payment_status_detail: "checkout_pro_redirect",
      updated_at: new Date().toISOString()
    });
  }

  return NextResponse.json(preference);
}
