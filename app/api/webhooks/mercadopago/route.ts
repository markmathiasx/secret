import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { canConnectToDatabase, prisma } from "@/lib/prisma";
import { updateOrderRecord } from "@/lib/storage";
import { sendMail } from "@/lib/mailer";
import { paymentConfirmedHtml } from "@/lib/email-templates";
import {
  mapMercadoPagoPaymentStatus,
  normalizeMercadoPagoError,
  parseMercadoPagoSignature,
  verifyMercadoPagoSignature,
} from "@/lib/mercadopago";
import { getMercadoPagoPayment } from "@/lib/payments";
import { logStructured } from "@/lib/logger";
import { getMercadoPagoWebhookSecret } from "@/lib/env";

export const runtime = "nodejs";

function readWebhookSignature(request: Request) {
  return request.headers.get("x-signature") || request.headers.get("x-mercadopago-signature") || "";
}

function getWebhookEventKey(topic: string, dataId: string, requestId: string, signature: string) {
  const parsed = signature ? parseMercadoPagoSignature(signature) : {};
  const ts = parsed.ts || "0";
  return `${topic}:${dataId}:${requestId || ts}`;
}

function toJsonValue(value: unknown) {
  return JSON.parse(JSON.stringify(value ?? {})) as Prisma.InputJsonValue;
}

async function markWebhookEventProcessed(orderCode: string, eventKey: string, payload: Record<string, unknown>) {
  if (!(await canConnectToDatabase())) {
    return;
  }

  const payment = await prisma.payment.findFirst({
    where: {
      externalReference: orderCode,
    },
    select: {
      id: true,
      metadata: true,
    },
  });

  if (!payment) return;

  const existingMetadata = (payment.metadata && typeof payment.metadata === "object" ? payment.metadata : {}) as Record<string, unknown>;
  const processedIds = Array.isArray(existingMetadata.processedWebhookEventIds)
    ? existingMetadata.processedWebhookEventIds.filter((item): item is string => typeof item === "string")
    : [];

  if (processedIds.includes(eventKey)) {
    return;
  }

  await prisma.payment.update({
    where: { id: payment.id },
    data: {
      metadata: {
        ...existingMetadata,
        lastWebhookAt: new Date().toISOString(),
        rawLastPayload: toJsonValue(payload),
        processedWebhookEventIds: [...processedIds, eventKey].slice(-25),
      },
    },
  });
}

export async function POST(request: Request) {
  const secret = getMercadoPagoWebhookSecret();
  const signature = readWebhookSignature(request);
  const requestId = request.headers.get("x-request-id") || request.headers.get("x-mercadopago-request-id") || "";
  const url = new URL(request.url);
  const payload = await request.json().catch(() => ({}));
  const dataId =
    url.searchParams.get("data.id") ||
    url.searchParams.get("id") ||
    String((payload as { data?: { id?: string | number } })?.data?.id || "");

  if (secret) {
    if (!signature) {
      return NextResponse.json({ ok: false, message: "Webhook sem assinatura." }, { status: 401 });
    }

    const validSignature = verifyMercadoPagoSignature({
      secret,
      signature,
      requestId,
      dataId,
    });

    if (!validSignature) {
      return NextResponse.json({ ok: false, message: "Assinatura inválida." }, { status: 401 });
    }
  }

  const topic = String(
    (payload as { type?: string; action?: string; topic?: string })?.type ||
      (payload as { type?: string; action?: string; topic?: string })?.action ||
      (payload as { type?: string; action?: string; topic?: string })?.topic ||
      "unknown"
  );

  if (!dataId || !topic.includes("payment")) {
    return NextResponse.json({ ok: true, received: true, ignored: true, topic });
  }

  const eventKey = getWebhookEventKey(topic, dataId, requestId, signature);
  const paymentResult = await getMercadoPagoPayment(dataId);

  if (!paymentResult.ok) {
    logStructured("warn", "mercadopago_webhook_payment_lookup_failed", {
      topic,
      dataId,
      requestId,
      reason: paymentResult.reason,
    });
    return NextResponse.json({ ok: true, received: true, ignored: true, topic, reason: paymentResult.reason });
  }

  const payment = paymentResult.payment;
  const orderCode = String(payment.external_reference || "").trim().toUpperCase();

  if (!orderCode) {
    return NextResponse.json({ ok: true, received: true, ignored: true, topic, reason: "missing_external_reference" });
  }

  if (await canConnectToDatabase()) {
    const existingPayment = await prisma.payment.findFirst({
      where: {
        OR: [{ externalReference: orderCode }, { providerPaymentId: String(payment.id) }],
      },
      select: { id: true, metadata: true, status: true },
    });

    const processedIds = Array.isArray((existingPayment?.metadata as Record<string, unknown> | null)?.processedWebhookEventIds)
      ? ((existingPayment?.metadata as Record<string, unknown>)?.processedWebhookEventIds as unknown[]).filter((item): item is string => typeof item === "string")
      : [];

    if (processedIds.includes(eventKey)) {
      return NextResponse.json({ ok: true, received: true, ignored: true, topic, orderCode, duplicate: true });
    }
  }

  const mappedStatus = mapMercadoPagoPaymentStatus(payment.status, payment.status_detail);
  const updated = await updateOrderRecord(orderCode, {
    status: mappedStatus,
    payment_provider: "mercado-pago",
    payment_reference: payment.id ? String(payment.id) : dataId,
    payment_status: payment.status || "unknown",
    payment_status_detail: payment.status_detail || null,
    payment_approved_at: payment.date_approved || null,
    payment_payload: payment,
    updated_at: new Date().toISOString(),
  });

  await markWebhookEventProcessed(orderCode, eventKey, payload as Record<string, unknown>);

  if (payment.status === "approved" && await canConnectToDatabase()) {
    try {
      const order = await prisma.order.findFirst({
        where: { orderNumber: orderCode },
        select: {
          customerEmail: true,
          customerName: true,
          grandTotal: true,
          items: { select: { title: true }, take: 1 },
        },
      });
      if (order?.customerEmail) {
        void sendMail({
          to: order.customerEmail,
          subject: `Pagamento confirmado — Pedido ${orderCode}`,
          html: paymentConfirmedHtml({
            orderCode,
            customerName: order.customerName ?? "Cliente",
            productName: order.items[0]?.title ?? "Produto MDH 3D",
            totalPix: Number(order.grandTotal),
          }),
        }).catch((error) => {
          logStructured("warn", "mercadopago_webhook_email_failed", {
            orderCode,
            message: normalizeMercadoPagoError(error).message,
          });
        });
      }
    } catch (error) {
      logStructured("warn", "mercadopago_webhook_email_lookup_failed", {
        orderCode,
        message: normalizeMercadoPagoError(error).message,
      });
    }
  }

  return NextResponse.json({
    ok: true,
    received: true,
    topic,
    orderCode,
    status: mappedStatus,
    updated: updated.ok,
  });
}
