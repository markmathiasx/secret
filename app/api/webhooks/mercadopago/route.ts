import { NextResponse } from "next/server";
import { canConnectToDatabase, prisma } from "@/lib/prisma";
import { getMercadoPagoAccessToken, getMercadoPagoWebhookSecret } from "@/lib/env";
import { isMercadoPagoSignatureFresh, verifyMercadoPagoSignature } from "@/lib/mercadopago";
import { getMercadoPagoPayment } from "@/lib/payments";
import { reconcilePayment } from "@/lib/server/reconcile-payment";
import { sendMail } from "@/lib/mailer";
import { paymentConfirmedHtml } from "@/lib/email-templates";
import { logStructured } from "@/lib/logger";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const secret = getMercadoPagoWebhookSecret();
  if (!secret || !getMercadoPagoAccessToken()) {
    return NextResponse.json({ ok: false }, { status: 503 });
  }
  const signature = request.headers.get("x-signature") || request.headers.get("x-mercadopago-signature") || "";
  const requestId = request.headers.get("x-request-id") || request.headers.get("x-mercadopago-request-id") || "";
  const url = new URL(request.url);
  const payload = await request.json().catch(() => null);
  const dataId = url.searchParams.get("data.id") || url.searchParams.get("id") || String(payload?.data?.id || "");
  if (!dataId || !requestId || !isMercadoPagoSignatureFresh(signature) ||
      !verifyMercadoPagoSignature({ secret, signature, requestId, dataId })) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const topic = String(payload?.type || payload?.action || url.searchParams.get("type") || payload?.topic || "");
  if (topic !== "payment" && !topic.startsWith("payment.")) {
    return NextResponse.json({ ok: true, ignored: true });
  }
  try {
    const result = await getMercadoPagoPayment(dataId);
    if (!result.ok || !(await canConnectToDatabase())) {
      return NextResponse.json({ ok: false, retry: true }, { status: 503 });
    }
    if (String(result.payment.id) !== dataId) {
      return NextResponse.json({ ok: false }, { status: 409 });
    }
    const reconciled = await prisma.$transaction(
      (transaction) => reconcilePayment(transaction, result.payment),
      { isolationLevel: "Serializable" },
    );
    if (reconciled.notify && reconciled.order.customerEmail) {
      await sendMail({
        to: reconciled.order.customerEmail,
        subject: `Pagamento confirmado — Pedido ${reconciled.order.orderNumber}`,
        html: paymentConfirmedHtml({
          orderCode: reconciled.order.orderNumber,
          customerName: reconciled.order.customerName || "Cliente",
          productName: "Pedido MDH 3D",
          totalPix: Number(reconciled.order.grandTotal),
        }),
      }).catch(() => logStructured("warn", "payment_confirmation_email_failed", { orderCode: reconciled.order.orderNumber }));
    }
    return NextResponse.json({ ok: true, duplicate: reconciled.duplicate });
  } catch (error) {
    logStructured("warn", "payment_reconciliation_failed", {
      reason: error instanceof Error ? error.message : "unknown",
    });
    return NextResponse.json({ ok: false, retry: true }, { status: 503 });
  }
}
