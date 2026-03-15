import { NextResponse } from "next/server";
import { attachPaymentProviderData, getOrderByNumber, updateOrderPayment } from "@/lib/order-service";
import { fetchMercadoPagoPayment } from "@/lib/payments";

function mapMercadoPagoStatus(status: string) {
  if (status === "approved") return "paid";
  if (status === "pending" || status === "in_process") return "pending";
  if (status === "rejected") return "declined";
  if (status === "cancelled") return "canceled";
  if (status === "refunded" || status === "charged_back") return "refunded";
  return "pending";
}

export async function POST(request: Request) {
  const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET;
  const signature = request.headers.get("x-signature");

  if (secret && !signature) {
    return NextResponse.json({ ok: false, message: "Webhook sem assinatura." }, { status: 401 });
  }

  const payload = await request.json();
  const paymentId = String(payload?.data?.id || payload?.id || "");

  if (!paymentId) {
    return NextResponse.json({ ok: true, ignored: true, reason: "missing_payment_id" });
  }

  const payment = await fetchMercadoPagoPayment(paymentId);
  const externalReference = String(payment?.external_reference || "");

  if (!externalReference) {
    return NextResponse.json({ ok: true, ignored: true, reason: "missing_external_reference" });
  }

  const detail = await getOrderByNumber(externalReference);

  if (!detail) {
    return NextResponse.json({ ok: true, ignored: true, reason: "order_not_found" });
  }

  await attachPaymentProviderData({
    orderId: detail.order.id,
    provider: "mercadopago",
    providerPaymentId: String(payment.id),
    verificationNote: `Webhook Mercado Pago: ${payment.status}`,
    rawPayload: payment
  });

  await updateOrderPayment({
    orderId: detail.order.id,
    status: mapMercadoPagoStatus(String(payment.status)) as any,
    verificationNote: `Mercado Pago ${payment.status_detail || payment.status}`,
    cardBrand: payment.payment_method_id || "",
    cardLast4: payment.card?.last_four_digits || "",
    cardHolderName: payment.card?.cardholder?.name || "",
    adminActor: "mercadopago:webhook"
  });

  return NextResponse.json({ ok: true, received: true, payloadType: payload?.type || payload?.action || "unknown" });
}
