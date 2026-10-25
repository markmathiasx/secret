import test from "node:test";
import assert from "node:assert/strict";
import {
  CheckoutError,
  classifyProviderPayment,
  createOrder,
  createPixPayment,
  reconcileMercadoPagoPayment,
  requestFingerprint,
  requireIdempotencyKey,
} from "../src/checkout.js";

const USER_ID = "buyer-fixture";
const ADDRESS_ID = "7fb1d9ab-47fd-430d-a1e2-d3116179eb44";
const ORDER_ID = "3f70aeb2-b9f8-45e3-a76f-2b278fa5089b";
const PRODUCT_ID = "53174633-583a-4673-a2d7-093f71cd82ba";
const KEY = "checkout-fixture-key-0001";

function scriptedDb(handler) {
  const calls = [];
  const query = async (sql, values = []) => {
    calls.push({ sql, values });
    return handler(sql, values, calls);
  };
  return {
    calls,
    query,
    connect: async () => ({ query, release() {} }),
  };
}

test("idempotency keys and provider states are strict", () => {
  assert.equal(requireIdempotencyKey(KEY), KEY);
  for (const value of [undefined, "short", "contains spaces and symbols!", "x".repeat(101)]) {
    assert.throws(() => requireIdempotencyKey(value), CheckoutError);
  }
  assert.equal(requestFingerprint({ a: 1 }), requestFingerprint({ a: 1 }));
  assert.notEqual(requestFingerprint({ a: 1 }), requestFingerprint({ a: 2 }));
  assert.equal(classifyProviderPayment({ status: "approved", transaction_amount_refunded: 0 }), "approved");
  assert.equal(classifyProviderPayment({ status: "approved", transaction_amount_refunded: 1 }), "refunded");
  assert.equal(classifyProviderPayment({ status: "charged_back" }), "charged_back");
  assert.equal(classifyProviderPayment({ status: "in_process" }), "pending");
});

test("order checkout snapshots server prices, reserves stock and clears cart atomically", async () => {
  const now = new Date("2030-01-01T12:00:00.000Z");
  const db = scriptedDb((sql) => {
    if (sql.includes("FROM mdh_marketplace.orders WHERE user_id")) return { rows: [] };
    if (sql.includes("FROM mdh_marketplace.addresses")) {
      return { rows: [{ recipient: "Alice", postalCode: "01001000", street: "Rua A", number: "1", complement: "", district: "Centro", city: "São Paulo", state: "SP" }] };
    }
    if (sql.includes("FROM mdh_marketplace.cart_items c")) {
      return { rows: [{ productId: PRODUCT_ID, quantity: 2, sellerId: "seller", title: "Peça", priceCents: 1990, stock: 3, availabilityMode: "in_stock", published: true, sellerDisabled: false }] };
    }
    if (sql.includes("INSERT INTO mdh_marketplace.orders")) {
      return { rows: [{ id: ORDER_ID, status: "pending", totalCents: 3980, expiresAt: new Date("2030-01-01T12:30:00.000Z"), createdAt: now }] };
    }
    return { rows: [] };
  });
  const result = await createOrder({ db, userId: USER_ID, addressId: ADDRESS_ID, idempotencyKey: KEY, now });
  assert.equal(result.totalCents, 3980);
  assert.equal(result.replayed, false);
  assert(db.calls.some(({ sql }) => sql.includes("FOR UPDATE OF c,p")));
  assert(db.calls.some(({ sql, values }) => sql.includes("SET stock=stock-$1") && values[0] === 2));
  assert(db.calls.some(({ sql }) => sql.startsWith("DELETE FROM mdh_marketplace.cart_items")));
  assert.equal(db.calls.at(-1).sql, "COMMIT");
});

test("order idempotency replays the durable order and rejects a changed request", async () => {
  const existing = {
    id: ORDER_ID,
    status: "pending",
    totalCents: 1990,
    expiresAt: new Date("2030-01-01T12:30:00.000Z"),
    createdAt: new Date("2030-01-01T12:00:00.000Z"),
    requestFingerprint: requestFingerprint({ addressId: ADDRESS_ID }),
  };
  const db = scriptedDb((sql) =>
    sql.includes("FROM mdh_marketplace.orders WHERE user_id") ? { rows: [existing] } : { rows: [] },
  );
  const replay = await createOrder({ db, userId: USER_ID, addressId: ADDRESS_ID, idempotencyKey: KEY });
  assert.equal(replay.replayed, true);
  assert(!db.calls.some(({ sql }) => sql.includes("INSERT INTO mdh_marketplace.orders")));

  const conflictDb = scriptedDb((sql) =>
    sql.includes("FROM mdh_marketplace.orders WHERE user_id")
      ? { rows: [{ ...existing, requestFingerprint: "different" }] }
      : { rows: [] },
  );
  await assert.rejects(
    createOrder({ db: conflictDb, userId: USER_ID, addressId: ADDRESS_ID, idempotencyKey: KEY }),
    { code: "idempotency_conflict", status: 409 },
  );
  assert.equal(conflictDb.calls.at(-1).sql, "ROLLBACK");
});

test("Pix creation persists before provider I/O and reuses the same provider idempotency key", async () => {
  const order = { id: ORDER_ID, status: "pending", totalCents: 3980, expiresAt: new Date("2030-01-01T12:30:00.000Z") };
  const db = scriptedDb((sql) => {
    if (sql.includes("FROM mdh_marketplace.orders WHERE id")) return { rows: [order] };
    if (sql.includes("FROM mdh_marketplace.payments WHERE user_id")) return { rows: [] };
    if (sql.includes("FROM mdh_marketplace.payments WHERE order_id")) return { rows: [] };
    if (sql.startsWith("UPDATE mdh_marketplace.payments") && sql.includes("RETURNING")) {
      return { rows: [{ id: "payment-local", orderId: ORDER_ID, status: "pending", providerStatus: "pending", amountCents: 3980, qrCode: "pix-code", qrCodeBase64: null, expiresAt: order.expiresAt }] };
    }
    return { rows: [] };
  });
  let providerInput;
  const provider = {
    create: async (input) => {
      providerInput = input;
      assert(db.calls.some(({ sql }) => sql === "COMMIT"));
      return { paymentId: "123", status: "pending", qrCode: "pix-code", qrCodeBase64: null, expiresAt: order.expiresAt.toISOString() };
    },
  };
  const result = await createPixPayment({
    db,
    provider,
    settings: { collectorId: "999", liveMode: false },
    userId: USER_ID,
    email: "buyer@example.test",
    orderId: ORDER_ID,
    idempotencyKey: KEY,
  });
  assert.equal(result.status, "pending");
  assert.equal(providerInput.idempotencyKey, KEY);
  assert.equal(providerInput.totalCents, 3980);
  assert(db.calls.some(({ sql }) => sql.includes("INSERT INTO mdh_marketplace.payments")));
});

test("Pix fails closed before persistence and stores sanitized provider failure", async () => {
  const db = scriptedDb(() => ({ rows: [] }));
  await assert.rejects(
    createPixPayment({ db, provider: null, settings: null, userId: USER_ID, email: "buyer@example.test", orderId: ORDER_ID, idempotencyKey: KEY }),
    { code: "payments_not_configured", status: 503 },
  );
  assert.equal(db.calls.length, 0);

  const order = { id: ORDER_ID, status: "pending", totalCents: 1990, expiresAt: new Date(Date.now() + 60_000) };
  const failureDb = scriptedDb((sql) => {
    if (sql.includes("FROM mdh_marketplace.orders WHERE id")) return { rows: [order] };
    return { rows: [] };
  });
  await assert.rejects(
    createPixPayment({
      db: failureDb,
      provider: { create: async () => { throw Object.assign(new Error("provider secret"), { code: "PAYMENT_PROVIDER_UNAVAILABLE" }); } },
      settings: { collectorId: "999", liveMode: false },
      userId: USER_ID,
      email: "buyer@example.test",
      orderId: ORDER_ID,
      idempotencyKey: KEY,
    }),
  );
  const failureUpdate = failureDb.calls.find(({ sql }) => sql.includes("SET status='failed'"));
  assert.equal(failureUpdate.values[0], "PAYMENT_PROVIDER_UNAVAILABLE");
  assert(!failureUpdate.values.includes("provider secret"));
});

test("authoritative reconciliation pays only a coherent pending order", async () => {
  const providerPayment = {
    id: 123,
    external_reference: ORDER_ID,
    collector_id: 999,
    transaction_amount: 39.8,
    transaction_amount_refunded: 0,
    currency_id: "BRL",
    live_mode: false,
    status: "approved",
  };
  const paymentRow = { id: "local-payment", orderId: ORDER_ID, paymentId: "123", totalCents: 3980, collectorId: "999", liveMode: false };
  const db = scriptedDb((sql) => {
    if (sql.includes("FROM mdh_marketplace.payment_webhook_events")) return { rows: [] };
    if (sql.includes("FROM mdh_marketplace.payments") && sql.includes("provider_payment_id")) return { rows: [paymentRow] };
    if (sql.startsWith("SELECT status FROM mdh_marketplace.orders")) return { rows: [{ status: "pending" }] };
    return { rows: [] };
  });
  const result = await reconcileMercadoPagoPayment({
    db,
    provider: { get: async () => providerPayment },
    paymentData: "123",
    requestId: "request-approved-1",
  });
  assert.equal(result.status, "approved");
  assert(db.calls.some(({ sql }) => sql.includes("SET status='paid'")));
  assert(db.calls.some(({ sql }) => sql.includes("payment_webhook_events") && sql.startsWith("INSERT")));
  assert.equal(db.calls.at(-1).sql, "COMMIT");
});

test("approved payment cannot silently revive a cancelled order", async () => {
  const db = scriptedDb((sql) => {
    if (sql.includes("FROM mdh_marketplace.payment_webhook_events")) return { rows: [] };
    if (sql.includes("FROM mdh_marketplace.payments") && sql.includes("provider_payment_id")) {
      return { rows: [{ id: "local-payment", orderId: ORDER_ID, paymentId: "123", totalCents: 3980, collectorId: "999", liveMode: false }] };
    }
    if (sql.startsWith("SELECT status FROM mdh_marketplace.orders")) return { rows: [{ status: "cancelled" }] };
    return { rows: [] };
  });
  await assert.rejects(
    reconcileMercadoPagoPayment({
      db,
      provider: { get: async () => ({ id: 123, external_reference: ORDER_ID, collector_id: 999, transaction_amount: 39.8, transaction_amount_refunded: 0, currency_id: "BRL", live_mode: false, status: "approved" }) },
      paymentData: "123",
      requestId: "request-conflict-1",
    }),
    { code: "order_state_conflict", status: 409 },
  );
  assert.equal(db.calls.at(-1).sql, "ROLLBACK");
  assert(!db.calls.some(({ sql }) => sql.includes("SET status='paid'")));
});
