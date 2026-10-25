import test from "node:test";
import assert from "node:assert/strict";
import { once } from "node:events";
import { createHmac } from "node:crypto";
import { createApp } from "../src/app.js";
const ID = "9d2d08fe-b933-4f8d-a24d-2a5fb5bb1832";
function fixture({
  role = "buyer",
  disabled = false,
  verified = true,
  query,
  paymentProvider = null,
  paymentSettings = null,
  logger = { error() {}, info() {}, warn() {} },
  rateLimits,
  authTimeoutMs,
  verifyToken,
} = {}) {
  const calls = [];
  const db = {
    query: async (sql, values = []) => {
      calls.push({ sql, values });
      if (sql.startsWith("INSERT INTO mdh_marketplace.users"))
        return {
          rows: [{ id: "alice", email: "a@example.com", role, disabled }],
        };
      return query ? query(sql, values) : { rows: [] };
    },
    connect: async () => ({ ...db, release() {} }),
  };
  const app = createApp({
    db,
    verifyToken: verifyToken || (async (t) => {
      if (t !== "good") throw Error("bad");
      return { uid: "alice", email: "a@example.com", email_verified: verified };
    }),
    logger,
    paymentProvider,
    paymentSettings,
    rateLimits,
    authTimeoutMs,
  });
  return { app, calls };
}
async function run(f, callback) {
  const server = f.app.listen(0, "127.0.0.1");
  await once(server, "listening");
  try {
    await callback(`http://127.0.0.1:${server.address().port}`);
  } finally {
    server.close();
    await once(server, "close");
  }
}
const auth = { Authorization: "Bearer good" };
test("private routes reject absent and invalid bearer tokens", async () => {
  const f = fixture();
  await run(f, async (url) => {
    assert.equal((await fetch(url + "/api/cart")).status, 401);
    assert.equal(
      (
        await fetch(url + "/api/cart", {
          headers: { Authorization: "Bearer bad" },
        })
      ).status,
      401,
    );
  });
  assert.equal(f.calls.length, 0);
});
test("disabled accounts and unverified emails are blocked", async () => {
  for (const options of [{ disabled: true }, { verified: false }])
    await run(fixture(options), async (url) =>
      assert.equal(
        (await fetch(url + "/api/me", { headers: auth })).status,
        403,
      ),
    );
});
test("catalog filters use parameters and cursor belongs to last returned item", async () => {
  const f = fixture({
    query: () => ({
      rows: [{ id: ID }, { id: "885b7899-aeeb-40c2-ae8a-a27179ca463d" }],
    }),
  });
  await run(f, async (url) => {
    const r = await fetch(url + "/api/products?limit=1&q=%27&categoryId=" + ID);
    assert.equal(r.status, 200);
    const data = await r.json();
    assert.equal(data.items.length, 1);
    assert.equal(data.nextCursor, ID);
  });
  assert.deepEqual(f.calls[0].values, [ID, "'", 2]);
  assert.match(f.calls[0].sql, /NOT u.disabled/);
});
test("invalid product cursor and unknown filters are rejected before SQL", async () => {
  const f = fixture();
  await run(f, async (url) => {
    assert.equal((await fetch(url + "/api/products?cursor=bad")).status, 400);
    assert.equal((await fetch(url + "/api/products?role=admin")).status, 400);
  });
  assert.equal(f.calls.length, 0);
});
test("catalog metadata filters are strict and parameterized", async () => {
  const f = fixture({ query: () => ({ rows: [] }) });
  await run(f, async (url) => {
    const params = new URLSearchParams({
      productType: "chaveiro",
      game: "valorant",
      character: "jett",
      limit: "5",
    });
    assert.equal((await fetch(`${url}/api/products?${params}`)).status, 200);
  });
  assert.deepEqual(f.calls[0].values, ["chaveiro", "valorant", "jett", 6]);
  assert.match(f.calls[0].sql, /lower\(p\.product_type\)=lower\(\$1\)/);
  assert.match(f.calls[0].sql, /lower\(p\.game\)=lower\(\$2\)/);
  assert.match(f.calls[0].sql, /lower\(p\.character_name\)=lower\(\$3\)/);
});
test("cart calculations are server sourced and scoped to authenticated user", async () => {
  const f = fixture({
    query: (sql) => ({
      rows: sql.includes("cart_items c")
        ? [{ productId: ID, priceCents: 900, quantity: 2 }]
        : [],
    }),
  });
  await run(f, async (url) => {
    assert.equal(
      (await (await fetch(url + "/api/cart", { headers: auth })).json())
        .totalCents,
      1800,
    );
  });
  assert.deepEqual(f.calls.at(-1).values, ["alice"]);
  assert.match(f.calls.at(-1).sql, /p\.stock>=c\.quantity/);
});
test("cart mutation locks user and rejects unavailable stock without inserting", async () => {
  const f = fixture({ query: () => ({ rows: [] }) });
  await run(f, async (url) => {
    assert.equal(
      (
        await fetch(url + "/api/cart/items/" + ID, {
          method: "PUT",
          headers: { ...auth, "Content-Type": "application/json" },
          body: JSON.stringify({ quantity: 1 }),
        })
      ).status,
      409,
    );
  });
  assert(f.calls.some((x) => x.sql.includes("FOR UPDATE")));
  assert(f.calls.some((x) => x.sql === "ROLLBACK"));
  assert(
    !f.calls.some((x) =>
      x.sql.startsWith("INSERT INTO mdh_marketplace.cart_items"),
    ),
  );
});
test("made-to-order product can enter cart without fake stock", async () => {
  const f = fixture({
    query: (sql) => {
      if (sql.includes("SELECT p.stock"))
        return { rows: [{ stock: 0, availabilityMode: "made_to_order" }] };
      if (sql.includes("count(*)")) return { rows: [{ count: "0" }] };
      return { rows: [] };
    },
  });
  await run(f, async (url) => {
    assert.equal(
      (
        await fetch(url + "/api/cart/items/" + ID, {
          method: "PUT",
          headers: { ...auth, "Content-Type": "application/json" },
          body: JSON.stringify({ quantity: 1 }),
        })
      ).status,
      204,
    );
  });
  assert(
    f.calls.some((x) =>
      x.sql.startsWith("INSERT INTO mdh_marketplace.cart_items"),
    ),
  );
});
test("buyer cannot modify listings and seller update cannot cross owner boundary", async () => {
  await run(fixture(), async (url) =>
    assert.equal(
      (
        await fetch(url + "/api/seller/products/" + ID, {
          method: "PUT",
          headers: auth,
        })
      ).status,
      403,
    ),
  );
  const f = fixture({ role: "seller" });
  await run(f, async (url) => {
    assert.equal(
      (
        await fetch(url + "/api/seller/products/" + ID, {
          method: "PUT",
          headers: { ...auth, "Content-Type": "application/json" },
          body: JSON.stringify({
            title: "Real piece",
            categoryId: ID,
            priceCents: 2000,
            stock: 1,
            imageUrl: "https://example.com/photo.jpg",
          }),
        })
      ).status,
      404,
    );
  });
  const q = f.calls.find((x) => x.sql.startsWith("UPDATE"));
  assert.match(q.sql, /seller_id=\$11/);
  assert.equal(q.values[10], "alice");
});
test("seller update preserves made-to-order mode unless explicitly changed", async () => {
  const f = fixture({
    role: "seller",
    query: (sql) =>
      sql.startsWith("UPDATE")
        ? { rows: [{ id: ID, availabilityMode: "made_to_order" }] }
        : { rows: [] },
  });
  await run(f, async (url) => {
    const response = await fetch(url + "/api/seller/products/" + ID, {
      method: "PUT",
      headers: { ...auth, "Content-Type": "application/json" },
      body: JSON.stringify({
        title: "Sob encomenda",
        categoryId: ID,
        priceCents: 2500,
        stock: 0,
        imageUrl: "https://example.com/photo.jpg",
      }),
    });
    assert.equal(response.status, 200);
    assert.equal((await response.json()).availabilityMode, "made_to_order");
  });
  const update = f.calls.find((x) => x.sql.startsWith("UPDATE"));
  assert.equal(update.values[8], null);
  assert.match(update.sql, /availability_mode='made_to_order'/);
});
test("address payload rejects role injection and deletion is owner scoped", async () => {
  const f = fixture();
  await run(f, async (url) => {
    const payload = {
      recipient: "Alice",
      postalCode: "01001000",
      street: "Rua",
      number: "1",
      city: "São Paulo",
      state: "SP",
      role: "admin",
    };
    assert.equal(
      (
        await fetch(url + "/api/addresses", {
          method: "POST",
          headers: { ...auth, "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
      ).status,
      400,
    );
    assert.equal(
      (
        await fetch(url + "/api/addresses/" + ID, {
          method: "DELETE",
          headers: auth,
        })
      ).status,
      404,
    );
  });
  assert.deepEqual(f.calls.at(-1).values, [ID, "alice"]);
});
test("checkout fails closed and public capabilities do not imply production payments", async () => {
  await run(fixture(), async (url) => {
    assert.equal(
      (await fetch(url + "/api/orders", { method: "POST", headers: auth }))
        .status,
      503,
    );
    assert.equal(
      (
        await fetch(url + "/api/payments/pix", {
          method: "POST",
          headers: auth,
        })
      ).status,
      503,
    );
    const caps = await (await fetch(url + "/api/capabilities")).json();
    assert.equal(caps.payments, false);
    assert.equal(caps.existingWebsiteAccountsLinked, false);
  });
});
test("configured checkout advertises capability but still requires strict idempotency", async () => {
  const paymentProvider = { create: async () => assert.fail("must not call provider"), get: async () => assert.fail("must not call provider") };
  const paymentSettings = { collectorId: "999", liveMode: false, webhookSecret: "test-webhook-secret" };
  const f = fixture({ paymentProvider, paymentSettings });
  await run(f, async (url) => {
    const caps = await (await fetch(url + "/api/capabilities")).json();
    assert.equal(caps.checkout, true);
    assert.equal(caps.payments, true);
    const order = await fetch(url + "/api/orders", {
      method: "POST",
      headers: { ...auth, "Content-Type": "application/json" },
      body: JSON.stringify({ addressId: ID }),
    });
    assert.equal(order.status, 400);
    assert.deepEqual(await order.json(), { error: "invalid_idempotency_key" });
    const webhook = await fetch(url + "/api/webhooks/mercadopago?data.id=123", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-request-id": "request-1", "x-signature": "invalid" },
      body: JSON.stringify({ data: { id: "123" } }),
    });
    assert.equal(webhook.status, 401);
  });
  assert(!f.calls.some(({ sql }) => sql === "BEGIN ISOLATION LEVEL SERIALIZABLE"));
});
test("seller creation assigns authenticated owner and records transaction audit", async () => {
  const payload = {
    title: "Real piece",
    categoryId: ID,
    priceCents: 2000,
    stock: 1,
    imageUrl: "https://example.com/photo.jpg",
  };
  const f = fixture({ role: "seller" });
  await run(f, async (url) => {
    const result = await fetch(url + "/api/seller/products", {
      method: "POST",
      headers: { ...auth, "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    assert.equal(result.status, 201);
    assert.equal((await result.json()).sellerId, "alice");
  });
  const insert = f.calls.find((x) =>
    x.sql.startsWith("INSERT INTO mdh_marketplace.products"),
  );
  assert.equal(insert.values[1], "alice");
  assert.equal(insert.values[5], 2000);
  assert(f.calls.some((x) => x.sql.includes("'product.create'")));
  assert.equal(f.calls.at(-1).sql, "COMMIT");
});
test("product creation blocks buyers, owner injection and invalid price", async () => {
  const payload = {
    title: "Real piece",
    categoryId: ID,
    priceCents: 2000,
    stock: 1,
    imageUrl: "https://example.com/photo.jpg",
  };
  await run(fixture(), async (url) =>
    assert.equal(
      (
        await fetch(url + "/api/seller/products", {
          method: "POST",
          headers: { ...auth, "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
      ).status,
      403,
    ),
  );
  for (const changes of [
    { sellerId: "bob" },
    { priceCents: 0 },
    { stock: 1000001 },
    { imageUrl: "http://example.com/photo.jpg" },
  ]) {
    const f = fixture({ role: "seller" });
    await run(f, async (url) =>
      assert.equal(
        (
          await fetch(url + "/api/seller/products", {
            method: "POST",
            headers: { ...auth, "Content-Type": "application/json" },
            body: JSON.stringify({ ...payload, ...changes }),
          })
        ).status,
        400,
      ),
    );
    assert(
      !f.calls.some((x) =>
        x.sql.startsWith("INSERT INTO mdh_marketplace.products"),
      ),
    );
  }
});
test("invalid category creation rolls back and returns sanitized validation error", async () => {
  const f = fixture({
    role: "seller",
    query: (sql) => {
      if (sql.startsWith("INSERT INTO mdh_marketplace.products"))
        throw Object.assign(new Error("SQL secret detail"), { code: "23503" });
      return { rows: [] };
    },
  });
  await run(f, async (url) => {
    const r = await fetch(url + "/api/seller/products", {
      method: "POST",
      headers: { ...auth, "Content-Type": "application/json" },
      body: JSON.stringify({
        title: "Real piece",
        categoryId: ID,
        priceCents: 2000,
        stock: 1,
        imageUrl: "https://example.com/photo.jpg",
      }),
    });
    assert.equal(r.status, 400);
    assert.deepEqual(await r.json(), { error: "invalid_reference" });
  });
  assert.equal(f.calls.at(-1).sql, "ROLLBACK");
});

test("REST mutations require JSON and enforce route and global payload limits", async () => {
  await run(fixture(), async (url) => {
    const unsupported = await fetch(url + "/api/addresses", {
      method: "POST",
      headers: { ...auth, "Content-Type": "text/plain" },
      body: "not-json",
    });
    assert.equal(unsupported.status, 415);
    assert.deepEqual(await unsupported.json(), { error: "json_required" });

    const routeLimited = await fetch(url + "/api/cart/items/" + ID, {
      method: "PUT",
      headers: { ...auth, "Content-Type": "application/json" },
      body: JSON.stringify({ quantity: 1, padding: "x".repeat(1200) }),
    });
    assert.equal(routeLimited.status, 413);

    const globallyLimited = await fetch(url + "/api/addresses", {
      method: "POST",
      headers: { ...auth, "Content-Type": "application/json" },
      body: JSON.stringify({ padding: "x".repeat(17 * 1024) }),
    });
    assert.equal(globallyLimited.status, 413);
  });
});

test("checkout limiter is isolated and returns standard 429 responses", async () => {
  const f = fixture({ rateLimits: { checkout: { limit: 1 } } });
  await run(f, async (url) => {
    const options = {
      method: "POST",
      headers: { ...auth, "Content-Type": "application/json" },
      body: JSON.stringify({ addressId: ID }),
    };
    assert.equal((await fetch(url + "/api/orders", options)).status, 503);
    const limited = await fetch(url + "/api/orders", options);
    assert.equal(limited.status, 429);
    assert.deepEqual(await limited.json(), { error: "rate_limited" });
    assert(limited.headers.get("ratelimit"));
  });
});

test("authentication verification has a hard deadline", async () => {
  const f = fixture({
    authTimeoutMs: 20,
    verifyToken: async () => new Promise(() => {}),
  });
  await run(f, async (url) => {
    const response = await fetch(url + "/api/me", { headers: auth });
    assert.equal(response.status, 504);
    assert.deepEqual(await response.json(), { error: "authentication_timeout" });
  });
});

test("forensic request logs exclude query, credentials, body and exception messages", async () => {
  const records = [];
  const logger = {
    info: (entry) => records.push(entry),
    warn: (entry) => records.push(entry),
    error: (entry) => records.push(entry),
  };
  const f = fixture({
    logger,
    query: (sql) => {
      if (sql === "SELECT 1") throw Object.assign(new Error("postgres://admin:secret@db/private"), { code: "XX000" });
      return { rows: [] };
    },
  });
  await run(f, async (url) => {
    await fetch(url + "/health?token=secret-query", {
      headers: { Authorization: "Bearer secret-authorization" },
    });
  });
  const serialized = JSON.stringify(records);
  for (const secret of ["secret-query", "secret-authorization", "postgres://", "admin:secret"])
    assert(!serialized.includes(secret));
  assert(records.some((entry) => entry.event === "request_failed" && entry.code === "xx000"));
  assert(records.some((entry) => entry.event === "request_complete" && entry.ipHash));
});

test("Mercado Pago webhook rejects body/query mismatch before provider access", async () => {
  let providerCalls = 0;
  const paymentProvider = {
    get: async () => { providerCalls += 1; throw Error("must not run"); },
  };
  const secret = "test-webhook-secret";
  const timestamp = String(Date.now());
  const requestId = "request-mismatch-1";
  const digest = createHmac("sha256", secret)
    .update(`id:123;request-id:${requestId};ts:${timestamp};`)
    .digest("hex");
  const f = fixture({
    paymentProvider,
    paymentSettings: { collectorId: "999", liveMode: false, webhookSecret: secret },
  });
  await run(f, async (url) => {
    const response = await fetch(url + "/api/webhooks/mercadopago?data.id=123&type=payment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-request-id": requestId,
        "x-signature": `ts=${timestamp},v1=${digest}`,
      },
      body: JSON.stringify({ type: "payment", data: { id: "124" } }),
    });
    assert.equal(response.status, 401);
  });
  assert.equal(providerCalls, 0);
  assert.equal(f.calls.length, 0);
});
