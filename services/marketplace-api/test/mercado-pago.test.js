import test from 'node:test';
import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import { MercadoPagoPix, decimalToCents, verifyPayment, verifyWebhook } from '../src/mercado-pago.js';

test('money parsing preserves exact cents and rejects unsupported precision', () => {
  assert.equal(decimalToCents('19.90'), 1990);
  assert.equal(decimalToCents(0.1), 10);
  for (const value of ['1.005', '-1', 'NaN', '1e2', '', null, 0]) assert.throws(() => decimalToCents(value));
});
const expected = { paymentId: '123', orderId: 'order-fixture', collectorId: '999', totalCents: 1990, liveMode: false };
const payment = { id: 123, external_reference: 'order-fixture', collector_id: 999, transaction_amount: 19.90, currency_id: 'BRL', live_mode: false, status: 'approved', transaction_amount_refunded: 0 };
test('approves only authoritative matching, unrefunded payment', () => {
  assert.equal(verifyPayment(payment, expected), true);
  assert.equal(verifyPayment({ ...payment, status: 'pending' }, expected), false);
  assert.equal(verifyPayment({ ...payment, transaction_amount_refunded: 1 }, expected), false);
  for (const patch of [{ id: 124 }, { external_reference: 'someone-else' }, { collector_id: 1 },
    { currency_id: 'USD' }, { transaction_amount: 0.1 }, { live_mode: true }]) {
    assert.throws(() => verifyPayment({ ...payment, ...patch }, expected));
  }
  assert.throws(() => verifyPayment(payment, {}));
});
test('signed webhook rejects wrong secret, missing fields, duplicate fields and replay window', () => {
  const ts = '1780000000000'; const secret = 'test-only-not-a-real-secret';
  const v1 = createHmac('sha256', secret).update(`id:abc;request-id:req-1;ts:${ts};`).digest('hex');
  const input = { signature: `ts=${ts},v1=${v1}`, requestId: 'req-1', dataId: 'ABC', secret, now: Number(ts) };
  assert.equal(verifyWebhook(input).dataId, 'abc');
  for (const patch of [{ secret: 'wrong' }, { dataId: 'def' }, { signature: `ts=${ts},ts=${ts},v1=${v1}` },
    { signature: 'v1=bad' }, { requestId: '' }, { now: Number(ts) + 300001 },
    { now: NaN }, { toleranceMs: Infinity }, { toleranceMs: -1 }]) {
    assert.throws(() => verifyWebhook({ ...input, ...patch }));
  }
});
test('expired Pix is rejected before any provider request', async () => {
  let requests = 0;
  const adapter = new MercadoPagoPix({ accessToken: 'fixture', notificationUrl: 'https://example.test/webhook',
    now: () => Date.parse('2030-01-01T12:00:00Z'), fetchImpl: async () => { requests++; throw Error('must not run'); } });
  for (const expiresAt of ['2029-12-31T12:00:00Z', '2030-01-01T12:00:00Z', 'invalid', null]) {
    await assert.rejects(adapter.create({ orderId: 'fixture', totalCents: 1990, email: 'fixture@example.test',
      idempotencyKey: '0123456789abcdef', expiresAt }), { code: 'INVALID_EXPIRY' });
  }
  assert.equal(requests, 0);
});
test('Pix request uses fixed provider host, integer source amount and caller durable idempotency key', async () => {
  let request;
  const adapter = new MercadoPagoPix({ accessToken: 'fixture', notificationUrl: 'https://example.test/webhook',
    fetchImpl: async (url, options) => { request = { url, ...options }; return { ok: true, json: async () => ({ id: 123, status: 'pending', point_of_interaction: { transaction_data: { qr_code: 'fixture-qr' } } }) }; } });
  const result = await adapter.create({ orderId: 'order-fixture', totalCents: 1990, email: 'fixture@example.test',
    idempotencyKey: '0123456789abcdef', expiresAt: '2030-01-01T12:00:00Z' });
  assert.equal(result.status, 'pending');
  assert.equal(request.url, 'https://api.mercadopago.com/v1/payments');
  assert.equal(request.headers['X-Idempotency-Key'], '0123456789abcdef');
  assert.equal(JSON.parse(request.body).transaction_amount, 19.9);
  assert.equal(request.redirect, 'error');
  await assert.rejects(adapter.get('../users'));
  await assert.rejects(adapter.create({ orderId: 'x', totalCents: 1.1 }));
});
test('unconfigured, invalid callback and network failures never appear successful', async () => {
  await assert.rejects(new MercadoPagoPix({}).get('123'), { code: 'PAYMENT_NOT_CONFIGURED' });
  await assert.rejects(new MercadoPagoPix({ accessToken: 'fixture', fetchImpl: async () => { throw Error('secret-diagnostic'); } }).get('123'), { code: 'PAYMENT_PROVIDER_UNAVAILABLE' });
  await assert.rejects(new MercadoPagoPix({ accessToken: 'fixture', fetchImpl: async () => ({ ok: false }) }).get('123'), { code: 'PAYMENT_PROVIDER_REJECTED' });
  await assert.rejects(new MercadoPagoPix({ accessToken: 'fixture', fetchImpl: async () => ({ ok: true, json: async () => { throw Error('parse'); } }) }).get('123'), { code: 'PAYMENT_PROVIDER_INVALID_RESPONSE' });
});
