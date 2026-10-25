import test from 'node:test';
import assert from 'node:assert/strict';
import { createHmac, randomUUID } from 'node:crypto';
import { readdir, readFile } from 'node:fs/promises';
import { once } from 'node:events';
import pg from 'pg';
import { createApp } from '../src/app.js';

// This suite is intentionally opt-in and refuses remote/production databases.
// CI gives it a disposable localhost database named mdh_api_test.
test('PostgreSQL: schema, own cart/address, seller price update and ownership boundaries', {
  skip: !process.env.TEST_DATABASE_URL,
}, async () => {
  const url = new URL(process.env.TEST_DATABASE_URL);
  assert(['localhost', '127.0.0.1'].includes(url.hostname), 'test database must be local');
  assert(url.pathname.endsWith('_test'), 'test database name must end in _test');
  const db = new pg.Pool({ connectionString: url.href, max: 4 });
  const suffix = randomUUID();
  const alice = `test-alice-${suffix}`, bob = `test-bob-${suffix}`, seller = `test-seller-${suffix}`;
  const categoryId = randomUUID(), productId = randomUUID();
  let server;
  try {
    const migrationDirectory = new URL('../migrations/', import.meta.url);
    const migrations = (await readdir(migrationDirectory)).filter(name => name.endsWith('.sql')).sort();
    for (const migration of migrations) {
      await db.query(await readFile(new URL(migration, migrationDirectory), 'utf8'));
    }
    await db.query("INSERT INTO mdh_marketplace.users(id,role) VALUES($1,'buyer'),($2,'buyer'),($3,'seller')", [alice, bob, seller]);
    await db.query('INSERT INTO mdh_marketplace.categories(id,name) VALUES($1,$2)', [categoryId, `Test ${suffix}`]);
    await db.query("INSERT INTO mdh_marketplace.products(id,seller_id,category_id,title,price_cents,stock,image_url,published,availability_mode) VALUES($1,$2,$3,$4,1900,2,$5,true,'in_stock')",
      [productId, seller, categoryId, 'Peça de teste', 'https://example.test/original.jpg']);
    const ids = { alice, bob, seller };
    let providerCreates = 0;
    let paidOrderId;
    const paymentProvider = {
      create: async ({ orderId, totalCents, idempotencyKey, expiresAt }) => {
        providerCreates++;
        paidOrderId = orderId;
        assert.equal(totalCents, 4000);
        assert.equal(idempotencyKey, 'payment-postgres-fixture-0001');
        return { paymentId: '123456', status: 'pending', qrCode: 'pix-copy-paste', qrCodeBase64: null, expiresAt };
      },
      get: async paymentId => ({
        id: paymentId,
        external_reference: paidOrderId,
        collector_id: 999,
        transaction_amount: 40,
        transaction_amount_refunded: 0,
        currency_id: 'BRL',
        live_mode: false,
        status: 'approved',
      }),
    };
    const paymentSettings = { collectorId: '999', liveMode: false, webhookSecret: 'postgres-test-webhook-secret' };
    const app = createApp({ db, paymentProvider, paymentSettings, verifyToken: async token => {
      if (!ids[token]) throw Error('invalid');
      return { uid: ids[token] };
    }, logger: { error() {} } });
    server = app.listen(0, '127.0.0.1');
    await once(server, 'listening');
    const base = `http://127.0.0.1:${server.address().port}`;
    const request = (path, token, method = 'GET', body) => fetch(base + path, {
      method, headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    assert.equal((await request(`/api/cart/items/${productId}`, 'alice', 'PUT', { quantity: 2 })).status, 204);
    assert.equal((await (await request('/api/cart', 'alice')).json()).totalCents, 3800);
    assert.deepEqual((await (await request('/api/cart', 'bob')).json()).items, []);
    assert.equal((await request(`/api/cart/items/${productId}`, 'alice', 'PUT', { quantity: 3 })).status, 409);
    const address = await request('/api/addresses', 'alice', 'POST', {
      recipient: 'Alice', postalCode: '01001000', street: 'Rua de teste', number: '1', city: 'São Paulo', state: 'SP',
    });
    assert.equal(address.status, 201);
    const { id: addressId } = await address.json();
    assert.equal((await request(`/api/addresses/${addressId}`, 'bob', 'DELETE')).status, 404);
    assert.equal((await (await request('/api/addresses', 'alice')).json()).items.length, 1);
    const edit = { title: 'Peça revisada', description: 'Teste', categoryId, priceCents: 2000, stock: 2,
      imageUrl: 'https://example.test/original.jpg', published: true };
    assert.equal((await request(`/api/seller/products/${productId}`, 'bob', 'PUT', edit)).status, 403);
    assert.equal((await request(`/api/seller/products/${productId}`, 'seller', 'PUT', edit)).status, 200);
    assert.equal((await (await request('/api/cart', 'alice')).json()).totalCents, 4000);
    assert.equal((await db.query('SELECT count(*)::int AS count FROM mdh_marketplace.audit_log WHERE actor_id=$1', [seller])).rows[0].count, 1);
    const checkoutKey = 'checkout-postgres-fixture-0001';
    const checkout = await fetch(base + '/api/orders', {
      method: 'POST',
      headers: { Authorization: 'Bearer alice', 'Content-Type': 'application/json', 'Idempotency-Key': checkoutKey },
      body: JSON.stringify({ addressId }),
    });
    assert.equal(checkout.status, 201);
    const order = await checkout.json();
    assert.equal(order.totalCents, 4000);
    assert.equal((await db.query('SELECT stock FROM mdh_marketplace.products WHERE id=$1', [productId])).rows[0].stock, 0);
    assert.equal((await db.query('SELECT count(*)::int AS count FROM mdh_marketplace.cart_items WHERE user_id=$1', [alice])).rows[0].count, 0);
    assert.equal((await db.query('SELECT count(*)::int AS count FROM mdh_marketplace.order_items WHERE order_id=$1', [order.id])).rows[0].count, 1);
    const checkoutReplay = await fetch(base + '/api/orders', {
      method: 'POST',
      headers: { Authorization: 'Bearer alice', 'Content-Type': 'application/json', 'Idempotency-Key': checkoutKey },
      body: JSON.stringify({ addressId }),
    });
    assert.equal(checkoutReplay.status, 200);
    assert.equal((await checkoutReplay.json()).id, order.id);
    const paymentHeaders = { Authorization: 'Bearer alice', 'Content-Type': 'application/json', 'Idempotency-Key': 'payment-postgres-fixture-0001' };
    const pix = await fetch(base + '/api/payments/pix', { method: 'POST', headers: paymentHeaders, body: JSON.stringify({ orderId: order.id }) });
    assert.equal(pix.status, 201);
    assert.equal((await pix.json()).qrCode, 'pix-copy-paste');
    assert.equal((await fetch(base + '/api/payments/pix', { method: 'POST', headers: paymentHeaders, body: JSON.stringify({ orderId: order.id }) })).status, 200);
    assert.equal(providerCreates, 1);
    const timestamp = String(Date.now());
    const requestId = `postgres-${suffix}`;
    const digest = createHmac('sha256', paymentSettings.webhookSecret)
      .update(`id:123456;request-id:${requestId};ts:${timestamp};`).digest('hex');
    const webhook = await fetch(base + '/api/webhooks/mercadopago?data.id=123456', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-request-id': requestId, 'x-signature': `ts=${timestamp},v1=${digest}` },
      body: JSON.stringify({ data: { id: '123456' } }),
    });
    assert.equal(webhook.status, 204);
    assert.equal((await db.query('SELECT status FROM mdh_marketplace.orders WHERE id=$1', [order.id])).rows[0].status, 'paid');
    await db.query('UPDATE mdh_marketplace.users SET disabled=true WHERE id=$1', [alice]);
    assert.equal((await request('/api/cart', 'alice')).status, 403);
  } finally {
    if (server) { server.close(); await once(server, 'close'); }
    await db.query("DELETE FROM mdh_marketplace.payment_webhook_events WHERE request_id LIKE 'postgres-%'");
    await db.query('DELETE FROM mdh_marketplace.payments WHERE user_id = ANY($1)', [[alice, bob]]);
    await db.query('DELETE FROM mdh_marketplace.order_items WHERE order_id IN (SELECT id FROM mdh_marketplace.orders WHERE user_id = ANY($1))', [[alice, bob]]);
    await db.query('DELETE FROM mdh_marketplace.orders WHERE user_id = ANY($1)', [[alice, bob]]);
    await db.query('DELETE FROM mdh_marketplace.audit_log WHERE actor_id = ANY($1)', [[alice, bob, seller]]);
    await db.query('DELETE FROM mdh_marketplace.cart_items WHERE user_id = ANY($1)', [[alice, bob, seller]]);
    await db.query('DELETE FROM mdh_marketplace.addresses WHERE user_id = ANY($1)', [[alice, bob, seller]]);
    await db.query('DELETE FROM mdh_marketplace.products WHERE id=$1', [productId]);
    await db.query('DELETE FROM mdh_marketplace.categories WHERE id=$1', [categoryId]);
    await db.query('DELETE FROM mdh_marketplace.users WHERE id = ANY($1)', [[alice, bob, seller]]);
    await db.end();
  }
});
