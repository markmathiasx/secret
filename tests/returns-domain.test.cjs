const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { resolve } = require('node:path');
const { test } = require('node:test');
const ts = require('typescript');

function loadReturns() {
  const filename = resolve(__dirname, '..', 'lib/returns.ts');
  const compiled = ts.transpileModule(readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
    fileName: filename,
  }).outputText;
  const loaded = { exports: {} };
  new Function('require', 'module', 'exports', compiled)(require, loaded, loaded.exports);
  return loaded.exports;
}

const returns = loadReturns();

test('normalizes return input and defaults to RETURN', () => {
  const parsed = returns.parseReturnRequestInput({
    orderCode: ' MDH-123 ', customerName: ' Cliente ', email: 'USER@EXAMPLE.COM ', reason: ' Defeito ',
  });
  assert.equal(parsed.orderCode, 'MDH-123');
  assert.equal(parsed.email, 'user@example.com');
  assert.equal(parsed.type, 'RETURN');
});

test('rejects invalid type and ineligible order status', () => {
  assert.throws(() => returns.parseReturnRequestInput({ orderCode: '1', customerName: 'A', email: 'a@b.com', reason: 'x', type: 'OTHER' }));
  assert.throws(() => returns.assertReturnEligible('PENDING_PAYMENT'));
  assert.doesNotThrow(() => returns.assertReturnEligible('DELIVERED'));
});

test('creates stable idempotency key and protocol', () => {
  const input = returns.parseReturnRequestInput({ orderCode: 'MDH-1', customerName: 'A', email: 'a@b.com', reason: 'x' });
  assert.equal(returns.createReturnRequestKey(input), returns.createReturnRequestKey(input));
  assert.equal(returns.createReturnRequestKey(input, 'client-key'), returns.createReturnRequestKey(input, 'client-key'));
  assert.equal(returns.createReturnProtocol(new Date('2026-10-24T10:00:00Z'), 'a1b2c3d4'), 'RMA-20261024-A1B2C3D4');
});
