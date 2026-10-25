import { createHash, randomUUID } from "node:crypto";
import { PaymentProviderError, verifyPayment } from "./mercado-pago.js";

const IDEMPOTENCY_PATTERN = /^[a-zA-Z0-9_-]{16,100}$/;

export class CheckoutError extends Error {
  constructor(code, status = 400) {
    super(code);
    this.code = code;
    this.status = status;
  }
}

export function requireIdempotencyKey(value) {
  if (typeof value !== "string" || !IDEMPOTENCY_PATTERN.test(value)) {
    throw new CheckoutError("invalid_idempotency_key", 400);
  }
  return value;
}

export function requestFingerprint(value) {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

export function classifyProviderPayment(payment) {
  const refundedCents = Number(payment.transaction_amount_refunded || 0);
  if (payment.status === "charged_back") return "charged_back";
  if (payment.status === "refunded" || refundedCents > 0) return "refunded";
  if (payment.status === "approved") return "approved";
  if (payment.status === "rejected") return "rejected";
  if (payment.status === "cancelled") return "cancelled";
  return "pending";
}

function orderDto(row, replayed = false) {
  return {
    id: row.id,
    status: row.status,
    totalCents: Number(row.totalCents),
    expiresAt: row.expiresAt,
    createdAt: row.createdAt,
    replayed,
  };
}

function paymentDto(row, replayed = false) {
  return {
    id: row.id,
    orderId: row.orderId,
    status: row.status,
    providerStatus: row.providerStatus || null,
    amountCents: Number(row.amountCents),
    qrCode: row.qrCode || null,
    qrCodeBase64: row.qrCodeBase64 || null,
    expiresAt: row.expiresAt,
    replayed,
  };
}

async function rollbackQuietly(client) {
  try {
    await client.query("ROLLBACK");
  } catch {}
}

export async function createOrder({ db, userId, addressId, idempotencyKey, now = new Date() }) {
  const fingerprint = requestFingerprint({ addressId });
  const client = await db.connect();
  try {
    await client.query("BEGIN ISOLATION LEVEL SERIALIZABLE");
    await client.query("SELECT id FROM mdh_marketplace.users WHERE id=$1 FOR UPDATE", [userId]);
    const existing = (
      await client.query(
        `SELECT id,status,total_cents::float8 AS "totalCents",expires_at AS "expiresAt",created_at AS "createdAt",request_fingerprint AS "requestFingerprint"
         FROM mdh_marketplace.orders WHERE user_id=$1 AND idempotency_key=$2`,
        [userId, idempotencyKey],
      )
    ).rows[0];
    if (existing) {
      if (existing.requestFingerprint !== fingerprint) throw new CheckoutError("idempotency_conflict", 409);
      await client.query("COMMIT");
      return orderDto(existing, true);
    }
    const shippingAddress = (
      await client.query(
        `SELECT recipient,postal_code AS "postalCode",street,number,complement,district,city,state
         FROM mdh_marketplace.addresses WHERE id=$1 AND user_id=$2`,
        [addressId, userId],
      )
    ).rows[0];
    if (!shippingAddress) throw new CheckoutError("address_not_found", 404);
    const items = (
      await client.query(
        `SELECT c.product_id AS "productId",c.quantity,p.seller_id AS "sellerId",p.title,
                p.price_cents AS "priceCents",p.stock,p.availability_mode AS "availabilityMode",
                p.published,u.disabled AS "sellerDisabled"
         FROM mdh_marketplace.cart_items c
         JOIN mdh_marketplace.products p ON p.id=c.product_id
         JOIN mdh_marketplace.users u ON u.id=p.seller_id
         WHERE c.user_id=$1 ORDER BY c.product_id FOR UPDATE OF c,p`,
        [userId],
      )
    ).rows;
    if (!items.length) throw new CheckoutError("cart_empty", 409);
    let totalCents = 0;
    for (const item of items) {
      const unavailable = !item.published || item.sellerDisabled || item.availabilityMode === "out_of_stock" ||
        (item.availabilityMode === "in_stock" && item.stock < item.quantity);
      if (unavailable) throw new CheckoutError("product_unavailable", 409);
      totalCents += Number(item.priceCents) * Number(item.quantity);
    }
    if (!Number.isSafeInteger(totalCents) || totalCents < 1) throw new CheckoutError("invalid_order_total", 409);
    const id = randomUUID();
    const expiresAt = new Date(now.getTime() + 30 * 60 * 1000);
    const created = (
      await client.query(
        `INSERT INTO mdh_marketplace.orders
           (id,user_id,status,total_cents,idempotency_key,request_fingerprint,shipping_address,expires_at)
         VALUES($1,$2,'pending',$3,$4,$5,$6::jsonb,$7)
         RETURNING id,status,total_cents::float8 AS "totalCents",expires_at AS "expiresAt",created_at AS "createdAt"`,
        [id, userId, totalCents, idempotencyKey, fingerprint, JSON.stringify(shippingAddress), expiresAt],
      )
    ).rows[0];
    for (const item of items) {
      await client.query(
        `INSERT INTO mdh_marketplace.order_items
           (order_id,product_id,seller_id,title,unit_price_cents,quantity,availability_mode)
         VALUES($1,$2,$3,$4,$5,$6,$7)`,
        [id, item.productId, item.sellerId, item.title, item.priceCents, item.quantity, item.availabilityMode],
      );
      if (item.availabilityMode === "in_stock") {
        await client.query(
          `UPDATE mdh_marketplace.products
           SET stock=stock-$1,
               availability_mode=CASE WHEN stock-$1>0 THEN 'in_stock' ELSE 'out_of_stock' END,
               updated_at=now()
           WHERE id=$2`,
          [item.quantity, item.productId],
        );
      }
    }
    await client.query("DELETE FROM mdh_marketplace.cart_items WHERE user_id=$1", [userId]);
    await client.query(
      "INSERT INTO mdh_marketplace.audit_log(actor_id,action,entity_id) VALUES($1,'order.create',$2)",
      [userId, id],
    );
    await client.query("COMMIT");
    return orderDto(created);
  } catch (error) {
    await rollbackQuietly(client);
    if (error.code === "23505" && error.constraint === "orders_user_idempotency_unique") {
      const existing = (
        await client.query(
          `SELECT id,status,total_cents::float8 AS "totalCents",expires_at AS "expiresAt",created_at AS "createdAt",request_fingerprint AS "requestFingerprint"
           FROM mdh_marketplace.orders WHERE user_id=$1 AND idempotency_key=$2`,
          [userId, idempotencyKey],
        )
      ).rows[0];
      if (existing?.requestFingerprint === fingerprint) return orderDto(existing, true);
      if (existing) throw new CheckoutError("idempotency_conflict", 409);
    }
    throw error;
  } finally {
    client.release();
  }
}

async function cancelExpiredOrder(client, order) {
  if (order.status !== "pending" || new Date(order.expiresAt).getTime() > Date.now()) return false;
  const cancelled = await client.query(
    "UPDATE mdh_marketplace.orders SET status='cancelled',updated_at=now() WHERE id=$1 AND status='pending' RETURNING id",
    [order.id],
  );
  if (!cancelled.rows.length) return false;
  await client.query(
    `UPDATE mdh_marketplace.products p SET stock=p.stock+i.quantity,
       availability_mode='in_stock',updated_at=now()
     FROM mdh_marketplace.order_items i
     WHERE i.order_id=$1 AND i.product_id=p.id AND i.availability_mode='in_stock'`,
    [order.id],
  );
  return true;
}

export async function createPixPayment({
  db,
  provider,
  settings,
  userId,
  email,
  orderId,
  idempotencyKey,
}) {
  if (!provider || !settings?.collectorId || typeof settings.liveMode !== "boolean") {
    throw new CheckoutError("payments_not_configured", 503);
  }
  if (typeof email !== "string" || !email) throw new CheckoutError("payment_email_required", 422);
  const fingerprint = requestFingerprint({ orderId, method: "pix" });
  const client = await db.connect();
  let payment;
  try {
    await client.query("BEGIN");
    const order = (
      await client.query(
        `SELECT id,status,total_cents::float8 AS "totalCents",expires_at AS "expiresAt"
         FROM mdh_marketplace.orders WHERE id=$1 AND user_id=$2 FOR UPDATE`,
        [orderId, userId],
      )
    ).rows[0];
    if (!order) throw new CheckoutError("order_not_found", 404);
    if (order.status === "pending" && new Date(order.expiresAt).getTime() <= Date.now()) {
      const activePayment = (
        await client.query(
          "SELECT id FROM mdh_marketplace.payments WHERE order_id=$1 AND status IN ('creating','pending','approved') LIMIT 1",
          [orderId],
        )
      ).rows[0];
      if (activePayment) throw new CheckoutError("payment_already_exists", 409);
      if (await cancelExpiredOrder(client, order)) throw new CheckoutError("order_expired", 409);
    }
    if (order.status !== "pending") throw new CheckoutError("order_not_payable", 409);
    const existing = (
      await client.query(
        `SELECT id,order_id AS "orderId",status,provider_status AS "providerStatus",
                amount_cents::float8 AS "amountCents",qr_code AS "qrCode",qr_code_base64 AS "qrCodeBase64",
                expires_at AS "expiresAt",request_fingerprint AS "requestFingerprint"
         FROM mdh_marketplace.payments WHERE user_id=$1 AND idempotency_key=$2 FOR UPDATE`,
        [userId, idempotencyKey],
      )
    ).rows[0];
    if (existing) {
      if (existing.requestFingerprint !== fingerprint) throw new CheckoutError("idempotency_conflict", 409);
      if (["pending", "approved"].includes(existing.status)) {
        await client.query("COMMIT");
        return paymentDto(existing, true);
      }
      payment = existing;
      await client.query(
        "UPDATE mdh_marketplace.payments SET status='creating',failure_code=NULL,updated_at=now() WHERE id=$1",
        [existing.id],
      );
    } else {
      const active = (
        await client.query(
          "SELECT id FROM mdh_marketplace.payments WHERE order_id=$1 AND status IN ('creating','pending','approved') LIMIT 1",
          [orderId],
        )
      ).rows[0];
      if (active) throw new CheckoutError("payment_already_exists", 409);
      payment = {
        id: randomUUID(),
        orderId,
        amountCents: Number(order.totalCents),
        expiresAt: order.expiresAt,
      };
      await client.query(
        `INSERT INTO mdh_marketplace.payments
           (id,order_id,user_id,provider,method,status,idempotency_key,request_fingerprint,amount_cents,collector_id,live_mode,expires_at)
         VALUES($1,$2,$3,'mercado_pago','pix','creating',$4,$5,$6,$7,$8,$9)`,
        [payment.id, orderId, userId, idempotencyKey, fingerprint, payment.amountCents,
          settings.collectorId, settings.liveMode, payment.expiresAt],
      );
    }
    await client.query("COMMIT");
  } catch (error) {
    await rollbackQuietly(client);
    if (error.code === "23505" && error.constraint === "payments_user_idempotency_unique") {
      const existing = (
        await client.query(
          `SELECT id,order_id AS "orderId",status,provider_status AS "providerStatus",
                  amount_cents::float8 AS "amountCents",qr_code AS "qrCode",qr_code_base64 AS "qrCodeBase64",
                  expires_at AS "expiresAt",request_fingerprint AS "requestFingerprint"
           FROM mdh_marketplace.payments WHERE user_id=$1 AND idempotency_key=$2`,
          [userId, idempotencyKey],
        )
      ).rows[0];
      if (existing?.requestFingerprint !== fingerprint) throw new CheckoutError("idempotency_conflict", 409);
      if (["pending", "approved"].includes(existing?.status)) return paymentDto(existing, true);
      if (existing) payment = existing;
      else throw error;
    } else {
      throw error;
    }
  } finally {
    client.release();
  }

  try {
    const result = await provider.create({
      orderId,
      totalCents: Number(payment.amountCents),
      email,
      idempotencyKey,
      expiresAt: new Date(payment.expiresAt).toISOString(),
    });
    const status = ["rejected", "cancelled"].includes(result.status) ? result.status : "pending";
    const updated = (
      await db.query(
        `UPDATE mdh_marketplace.payments
         SET provider_payment_id=$1,provider_status=$2,status=$3,qr_code=$4,qr_code_base64=$5,
             expires_at=$6,failure_code=NULL,updated_at=now()
         WHERE id=$7
         RETURNING id,order_id AS "orderId",status,provider_status AS "providerStatus",
           amount_cents::float8 AS "amountCents",qr_code AS "qrCode",qr_code_base64 AS "qrCodeBase64",expires_at AS "expiresAt"`,
        [result.paymentId, result.status, status, result.qrCode, result.qrCodeBase64,
          result.expiresAt || payment.expiresAt, payment.id],
      )
    ).rows[0];
    return paymentDto(updated);
  } catch (error) {
    const code = error instanceof PaymentProviderError ? error.code : "PAYMENT_PROVIDER_UNAVAILABLE";
    await db.query(
      "UPDATE mdh_marketplace.payments SET status='failed',failure_code=$1,updated_at=now() WHERE id=$2",
      [code, payment.id],
    );
    throw error;
  }
}

export async function reconcileMercadoPagoPayment({ db, provider, paymentData, requestId }) {
  const providerPayment = await provider.get(paymentData);
  const client = await db.connect();
  try {
    await client.query("BEGIN");
    const duplicate = (
      await client.query(
        "SELECT id FROM mdh_marketplace.payment_webhook_events WHERE provider='mercado_pago' AND request_id=$1",
        [requestId],
      )
    ).rows[0];
    if (duplicate) {
      await client.query("COMMIT");
      return { duplicate: true };
    }
    const payment = (
      await client.query(
        `SELECT id,order_id AS "orderId",provider_payment_id AS "paymentId",amount_cents::float8 AS "totalCents",
                collector_id AS "collectorId",live_mode AS "liveMode"
         FROM mdh_marketplace.payments
         WHERE provider='mercado_pago' AND provider_payment_id=$1 FOR UPDATE`,
        [String(providerPayment.id)],
      )
    ).rows[0];
    if (!payment) {
      await client.query(
        `INSERT INTO mdh_marketplace.payment_webhook_events(id,provider,request_id,data_id,outcome)
         VALUES($1,'mercado_pago',$2,$3,'ignored')`,
        [randomUUID(), requestId, String(paymentData)],
      );
      await client.query("COMMIT");
      return { ignored: true };
    }
    verifyPayment(providerPayment, payment);
    const status = classifyProviderPayment(providerPayment);
    const order = (
      await client.query("SELECT status FROM mdh_marketplace.orders WHERE id=$1 FOR UPDATE", [payment.orderId])
    ).rows[0];
    if (!order) throw new CheckoutError("order_not_found", 404);
    if (status === "approved" && !["pending", "paid"].includes(order.status)) {
      throw new CheckoutError("order_state_conflict", 409);
    }
    await client.query(
      `UPDATE mdh_marketplace.payments SET status=$1,provider_status=$2,failure_code=NULL,updated_at=now()
       WHERE id=$3`,
      [status, providerPayment.status, payment.id],
    );
    if (status === "approved") {
      await client.query(
        "UPDATE mdh_marketplace.orders SET status='paid',updated_at=now() WHERE id=$1 AND status='pending'",
        [payment.orderId],
      );
    } else if (["refunded", "charged_back"].includes(status)) {
      if (order.status === "pending") {
        await client.query(
          `UPDATE mdh_marketplace.products p SET stock=p.stock+i.quantity,
             availability_mode='in_stock',updated_at=now()
           FROM mdh_marketplace.order_items i
           WHERE i.order_id=$1 AND i.product_id=p.id AND i.availability_mode='in_stock'`,
          [payment.orderId],
        );
      }
      await client.query(
        "UPDATE mdh_marketplace.orders SET status='refunded',updated_at=now() WHERE id=$1 AND status IN ('pending','paid','preparing','shipped','delivered')",
        [payment.orderId],
      );
    }
    await client.query(
      `INSERT INTO mdh_marketplace.payment_webhook_events(id,provider,request_id,data_id,payment_id,outcome)
       VALUES($1,'mercado_pago',$2,$3,$4,'processed')`,
      [randomUUID(), requestId, String(paymentData), payment.id],
    );
    await client.query("COMMIT");
    return { status };
  } catch (error) {
    await rollbackQuietly(client);
    if (error.code === "23505" && error.constraint === "payment_webhook_request_unique") {
      return { duplicate: true };
    }
    throw error;
  } finally {
    client.release();
  }
}
