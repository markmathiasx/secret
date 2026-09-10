import type { Prisma } from "@prisma/client";

export async function reconcilePayment(transaction: Prisma.TransactionClient, payment: Record<string, any>) {
  const orderCode = String(payment.external_reference || "").trim();
  const order = await transaction.order.findUnique({ where: { orderNumber: orderCode } });
  if (!order) throw new Error("payment_order_missing");
  const stored = await transaction.payment.findUnique({ where: { externalReference: orderCode } });
  if (!stored || stored.orderId !== order.id || stored.provider !== "MERCADO_PAGO") throw new Error("payment_binding_mismatch");
  if (!payment.id || (stored.providerPaymentId && stored.providerPaymentId !== String(payment.id))) throw new Error("payment_id_mismatch");
  const amount = Number(payment.transaction_amount);
  if (!Number.isFinite(amount) || amount <= 0 || payment.currency_id !== stored.currency ||
      Math.round(amount * 100) !== Math.round(Number(stored.amount) * 100) ||
      Math.round(amount * 100) !== Math.round(Number(order.grandTotal) * 100)) throw new Error("payment_amount_mismatch");

  const timestamp = Date.parse(payment.date_last_updated || "");
  if (!Number.isFinite(timestamp)) throw new Error("payment_timestamp_missing");
  const metadata = (stored.metadata && typeof stored.metadata === "object" ? stored.metadata : {}) as Record<string, Prisma.InputJsonValue>;
  const previousTimestamp = Number(metadata.providerUpdatedAtMs || 0);
  if (timestamp <= previousTimestamp) return { duplicate: true, notify: false, order };
  const status = payment.status === "approved" ? "PAID"
    : payment.status === "refunded" || payment.status === "charged_back" ? "REFUNDED"
    : payment.status === "rejected" ? "FAILED"
    : payment.status === "cancelled" ? "CANCELED"
    : ["pending", "in_process", "authorized"].includes(payment.status) ? "PENDING" : null;
  if (!status) throw new Error("payment_status_unknown");
  if ((stored.status === "REFUNDED" && status !== "REFUNDED") ||
      (stored.status === "PAID" && status !== "PAID" && status !== "REFUNDED")) {
    return { duplicate: true, notify: false, order };
  }
  if (order.status === "CANCELED" && status === "PAID") throw new Error("payment_on_canceled_order_requires_review");
  const paidAt = payment.date_approved ? new Date(payment.date_approved) : undefined;
  const notify = status === "PAID" && stored.status !== "PAID" && !order.paidAt;
  await transaction.payment.update({
    where: { id: stored.id },
    data: {
      status,
      providerPaymentId: String(payment.id),
      paidAt,
      metadata: { ...metadata, providerUpdatedAtMs: timestamp, statusDetail: String(payment.status_detail || "") },
    },
  });
  await transaction.order.update({
    where: { id: order.id },
    data: {
      status: status === "REFUNDED" ? "REFUNDED"
        : status === "PAID" && order.status === "PENDING_PAYMENT" ? "PAID" : order.status,
      paidAt: status === "PAID" ? paidAt : undefined,
    },
  });
  return { duplicate: false, notify, order };
}
