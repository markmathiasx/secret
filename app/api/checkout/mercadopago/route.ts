import { NextResponse } from "next/server";
import { z } from "zod";
import { findProduct } from "@/lib/catalog";
import { createMercadoPagoPayment } from "@/lib/payments";
import { resolveOrderPaymentContext } from "@/lib/server/payment-order";
import { updateOrderRecord } from "@/lib/storage";
import { getClientIp } from "@/lib/security";
import { rateLimitRequest } from "@/lib/redis";
import { createStableExternalReference, normalizeMpPaymentFormData } from "@/lib/mercadopago";

const MAX_PAYMENT_AMOUNT_BRL = 100000;

const schema = z.object({
  productId: z.string().min(1),
  quantity: z.coerce.number().int().min(1).max(20).default(1),
  email: z.string().email().optional(),
  orderCode: z.string().min(5).max(64).optional(),
  amount: z.number().positive().max(MAX_PAYMENT_AMOUNT_BRL).optional(),
  paymentData: z.record(z.string(), z.unknown()).optional(),
});

export async function POST(request: Request) {
  const ip = getClientIp(request.headers);
  const rateLimit = await rateLimitRequest(`checkout:${ip}`, 8, 60_000);

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

  const normalizedPaymentData = normalizeMpPaymentFormData(parsed.data.paymentData);
  const paymentMethodId = normalizedPaymentData.paymentMethodId || (parsed.data.paymentData?.payment_method_id as string | undefined) || (parsed.data.paymentData?.paymentMethodId as string | undefined) || (parsed.data.paymentData?.type as string | undefined) || (parsed.data.orderCode ? "pix" : "visa");

  // Idempotency key: dedup retries in same 5-min window from same IP + order
  const idempotencyBucket = Math.floor(Date.now() / (5 * 60_000));
  const idempotencyKey = `mdh-checkout-${ip}-${parsed.data.productId}-${parsed.data.orderCode ?? "new"}-${idempotencyBucket}`;

  const payment = await createMercadoPagoPayment({
    title: paymentContext.title,
    amount: paymentContext.amount,
    externalReference: paymentContext.orderCode || `MDH-${product.id}-${Date.now()}`,
    paymentMethodId,
    payerEmail: paymentContext.customerEmail || parsed.data.email,
    payerName: paymentContext.customerName || undefined,
    paymentData: parsed.data.paymentData,
    idempotencyKey,
  });

  if (!payment.ok) {
    return NextResponse.json(payment, { status: 400 });
  }

  if (parsed.data.orderCode) {
    await updateOrderRecord(parsed.data.orderCode, {
      status: payment.status === "approved" ? "paid" : "pending_payment",
      payment_provider: "mercado-pago",
      payment_method: paymentMethodId === "pix" ? "pix" : "cartao",
      payment_reference: payment.paymentId,
      payment_status: payment.status,
      payment_status_detail: payment.statusDetail,
      payment_approved_at: payment.paidAt || null,
      pix_payload: payment.pixPayload,
      pix_qr_code: payment.pixQrCode,
      boleto_url: payment.ticketUrl,
      updated_at: new Date().toISOString(),
    });
  }

  return NextResponse.json({
    ok: true,
    provider: "mercado-pago",
    orderCode: paymentContext.orderCode,
    paymentId: payment.paymentId,
    status: payment.status,
    statusDetail: payment.statusDetail,
    externalReference: createStableExternalReference(paymentContext.orderCode || `MDH-${product.id}`),
    payload: payment.pixPayload,
    qrCodeBase64: payment.pixQrCode,
    ticketUrl: payment.ticketUrl,
    dateOfExpiration: payment.dateOfExpiration,
  });
}
