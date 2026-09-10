const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { resolve } = require('node:path');
const { test } = require('node:test');
const ts = require('typescript');
const source = ts.transpileModule(readFileSync(resolve(__dirname, '../lib/server/reconcile-payment.ts'), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
const loaded = { exports: {} };
new Function('exports', source)(loaded.exports);
const { reconcilePayment } = loaded.exports;

function fixture(overrides = {}) {
  const writes = [];
  const order = { id: 'order-1', status: 'PENDING_PAYMENT', grandTotal: 25, ...overrides.order };
  const stored = { id: 'payment-1', orderId: 'order-1', provider: 'MERCADO_PAGO', currency: 'BRL', amount: 25, status: 'PENDING', providerPaymentId: '123', ...overrides.stored };
  const transaction = {
    order: { findUnique: async () => order, update: async (value) => writes.push(value) },
    payment: { findUnique: async () => stored, update: async (value) => writes.push(value) },
  };
  const payment = { id: 123, external_reference: 'MDH-1', transaction_amount: 25, currency_id: 'BRL', date_last_updated: '2026-09-10T12:00:00Z', date_approved: '2026-09-10T12:00:00Z', status: 'approved', ...overrides.payment };
  return { writes, run: () => reconcilePayment(transaction, payment) };
}

test('verified payment writes once and requests notification', async () => {
  const example = fixture();
  assert.equal((await example.run()).notify, true);
  assert.equal(example.writes.length, 2);
  assert.equal(example.writes[1].data.status, 'PAID');
});
test('wrong amount, currency, payment id and order binding never write', async () => {
  for (const overrides of [{ payment: { transaction_amount: 1 } }, { payment: { currency_id: 'USD' } }, { payment: { id: 456 } }, { stored: { orderId: 'another-order' } }]) {
    const example = fixture(overrides);
    await assert.rejects(example.run());
    assert.equal(example.writes.length, 0);
  }
});
test('duplicate and stale events are idempotent', async () => {
  for (const timestamp of [Date.parse('2026-09-10T12:00:00Z'), Date.parse('2026-09-11T12:00:00Z')]) {
    const example = fixture({ stored: { metadata: { providerUpdatedAtMs: timestamp } } });
    assert.equal((await example.run()).duplicate, true);
    assert.equal(example.writes.length, 0);
  }
});
test('paid and refunded states cannot regress', async () => {
  for (const status of ['PAID', 'REFUNDED']) {
    const example = fixture({ stored: { status }, payment: { status: 'pending' } });
    assert.equal((await example.run()).notify, false);
    assert.equal(example.writes.length, 0);
  }
});
test('production fulfillment is not reset by a later payment notification', async () => {
  const example = fixture({ order: { status: 'SHIPPED', paidAt: new Date() }, stored: { status: 'PAID' } });
  assert.equal((await example.run()).notify, false);
  assert.equal(example.writes[1].data.status, 'SHIPPED');
});
test('canceled orders and malformed events require manual investigation', async () => {
  for (const overrides of [{ order: { status: 'CANCELED' } }, { payment: { date_last_updated: '' } }, { payment: { status: 'unexpected' } }]) {
    const example = fixture(overrides);
    await assert.rejects(example.run());
    assert.equal(example.writes.length, 0);
  }
});
