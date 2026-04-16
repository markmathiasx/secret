import { NextResponse } from "next/server";
import { z } from "zod";
import { createMercadoPagoPixPayment } from "@/lib/payments";
import { makePixPayload } from "@/lib/pix";
import { resolveOrderPaymentContext } from "@/lib/server/payment-order";
import { updateOrderRecord } from "@/lib/storage";

const schema = z.object({
  title: z.string().min(1).max(120),
  amount: z.number().positive().max(99999),
  orderCode: z.string().min(5).max(64).optional(),
  email: z.string().email().optional(),
  customerName: z.string().min(2).max(120).optional(),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Dados inválidos." }, { status: 400 });
  }

  const paymentContext = await resolveOrderPaymentContext({
    orderCode: parsed.data.orderCode,
    fallbackTitle: parsed.data.title || "Pagamento MDH 3D",
    fallbackAmount: parsed.data.amount,
    fallbackEmail: parsed.data.email,
    fallbackCustomerName: parsed.data.customerName,
  });

  const pixPayment = paymentContext.orderCode
    ? await createMercadoPagoPixPayment({
        title: paymentContext.title,
        amount: paymentContext.amount,
        externalReference: paymentContext.orderCode,
        payerEmail: paymentContext.customerEmail,
        customerName: paymentContext.customerName,
      })
    : null;

  if (pixPayment?.ok) {
    if (paymentContext.orderCode) {
      await updateOrderRecord(paymentContext.orderCode, {
        status: "aguardando pix",
        payment_provider: "mercado-pago",
        payment_method: "pix",
        payment_reference: pixPayment.paymentId,
        payment_status: pixPayment.status,
        payment_status_detail: pixPayment.statusDetail,
        pix_payload: pixPayment.payload,
        pix_qr_code: pixPayment.qrCodeBase64,
        boleto_url: pixPayment.ticketUrl,
        updated_at: new Date().toISOString(),
      });
    }

    return NextResponse.json({
      ok: true,
      provider: "mercado-pago",
      payload: pixPayment.payload,
      qrCodeBase64: pixPayment.qrCodeBase64,
      ticketUrl: pixPayment.ticketUrl,
      paymentId: pixPayment.paymentId,
      status: pixPayment.status,
      statusDetail: pixPayment.statusDetail,
      expiresAt: pixPayment.expiresAt,
    });
  }

  const payload = makePixPayload({
    description: paymentContext.title || "Pagamento MDH 3D",
    amount: paymentContext.amount,
  });

  if (paymentContext.orderCode) {
    await updateOrderRecord(paymentContext.orderCode, {
      status: "aguardando pix manual",
      payment_provider: "manual",
      payment_method: "pix",
      payment_status: "pending",
      payment_status_detail: "local_pix_payload",
      pix_payload: payload,
      updated_at: new Date().toISOString(),
    });
  }

  return NextResponse.json({
    ok: true,
    provider: "manual",
    payload,
    fallbackMessage: pixPayment?.fallbackMessage,
  });
}
