import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { getMercadoPagoPayment } from "@/lib/payments";
import { updateOrderRecord } from "@/lib/storage";

export const runtime = "nodejs";

function parseSignature(signature: string) {
  return signature
    .split(",")
    .map((part) => part.trim().split("="))
    .reduce<Record<string, string>>((acc, [key, value]) => {
      if (key && value) {
        acc[key] = value;
      }
      return acc;
    }, {});
}

function matchesDigest(candidate: string, expected: string) {
  const left = Buffer.from(candidate, "hex");
  const right = Buffer.from(expected, "hex");

  if (left.length !== right.length) {
    return false;
  }

  return timingSafeEqual(left, right);
}

function buildManifestCandidates(dataId: string, requestId: string, ts: string) {
  return [
    `id:${dataId};request-id:${requestId};ts:${ts};`,
    `id:${dataId};request-id:${requestId};ts:${ts}`,
    `id:${dataId};ts:${ts};`,
    `id:${dataId};ts:${ts}`
  ];
}

function verifyMercadoPagoSignature({
  secret,
  signature,
  requestId,
  dataId
}: {
  secret: string;
  signature: string;
  requestId: string;
  dataId: string;
}) {
  const parts = parseSignature(signature);
  const ts = parts.ts || "";
  const expected = parts.v1 || "";

  if (!ts || !expected || !dataId) {
    return false;
  }

  return buildManifestCandidates(dataId, requestId, ts).some((manifest) => {
    const digest = createHmac("sha256", secret).update(manifest).digest("hex");
    return matchesDigest(digest, expected);
  });
}

function mapPaymentStatus(status?: string, detail?: string) {
  switch (status) {
    case "approved":
      return "pagamento aprovado";
    case "pending":
    case "in_process":
      return "pagamento em analise";
    case "authorized":
      return "pagamento autorizado";
    case "rejected":
      return "pagamento recusado";
    case "cancelled":
      return "pagamento cancelado";
    case "refunded":
      return "pagamento estornado";
    case "charged_back":
      return "pagamento contestado";
    default:
      return detail ? `status ${detail}` : "atualizacao de pagamento";
  }
}

export async function POST(request: Request) {
  const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET;
  const signature = request.headers.get("x-signature");
  const requestId = request.headers.get("x-request-id") || "";
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
      dataId
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

  const paymentResult = await getMercadoPagoPayment(dataId);

  if (!paymentResult.ok) {
    return NextResponse.json({ ok: true, received: true, ignored: true, topic, reason: paymentResult.reason });
  }

  const payment = paymentResult.payment;
  const orderCode = String(payment.external_reference || "").trim();

  if (!orderCode) {
    return NextResponse.json({ ok: true, received: true, ignored: true, topic, reason: "missing_external_reference" });
  }

  const updated = await updateOrderRecord(orderCode, {
    status: mapPaymentStatus(payment.status, payment.status_detail),
    payment_provider: "mercado-pago",
    payment_reference: payment.id ? String(payment.id) : dataId,
    payment_status: payment.status || "unknown",
    payment_status_detail: payment.status_detail || null,
    payment_approved_at: payment.date_approved || null,
    updated_at: new Date().toISOString()
  });

  return NextResponse.json({
    ok: true,
    received: true,
    topic,
    orderCode,
    updated: updated.ok
  });
}
