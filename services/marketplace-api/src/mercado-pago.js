import { createHmac, timingSafeEqual } from 'node:crypto';

// Adapter only: the HTTP checkout must not enable this before a durable payment
// record, signed-webhook inbox, reconciliation job, refunds and sandbox approval.
const API = 'https://api.mercadopago.com';
export class PaymentProviderError extends Error {
  constructor(code, status = 502) {
    super(code);
    this.code = code;
    this.status = status;
  }
}

export function decimalToCents(value, allowZero = false) {
  const text = String(value);
  if (!/^\d{1,9}(\.\d{1,2})?$/.test(text)) throw new PaymentProviderError('INVALID_AMOUNT');
  const [whole, fraction = ''] = text.split('.');
  const cents = Number(whole) * 100 + Number(fraction.padEnd(2, '0'));
  if (!Number.isSafeInteger(cents) || cents < (allowZero ? 0 : 1)) throw new PaymentProviderError('INVALID_AMOUNT');
  return cents;
}

export function verifyPayment(payment, expected) {
  if (!expected?.paymentId || !expected.orderId || !expected.collectorId ||
      typeof expected.liveMode !== 'boolean' || !Number.isSafeInteger(expected.totalCents) ||
      !payment || String(payment.id) !== String(expected.paymentId) ||
      payment.external_reference !== expected.orderId || payment.currency_id !== 'BRL' ||
      String(payment.collector_id) !== String(expected.collectorId) ||
      payment.live_mode !== expected.liveMode ||
      decimalToCents(payment.transaction_amount) !== expected.totalCents) {
    throw new PaymentProviderError('PAYMENT_MISMATCH', 409);
  }
  // Refunded/charged-back states must be handled in a separate ledger transition.
  // A browser return URL or webhook payload alone can never mark an order paid.
  return payment.status === 'approved' && decimalToCents(payment.transaction_amount_refunded ?? 0, true) === 0;
}

export function verifyWebhook({ signature, requestId, dataId, secret, now = Date.now(), toleranceMs = 300_000 }) {
  if (!secret || typeof signature !== 'string' || typeof requestId !== 'string' ||
      !/^[a-zA-Z0-9_-]{1,200}$/.test(requestId) || !/^[a-zA-Z0-9_-]{1,200}$/.test(String(dataId))) {
    throw new PaymentProviderError('INVALID_WEBHOOK', 401);
  }
  const fields = new Map();
  for (const pair of signature.split(',')) {
    const [key, value, extra] = pair.trim().split('=');
    if (extra || !value || fields.has(key)) throw new PaymentProviderError('INVALID_WEBHOOK', 401);
    fields.set(key, value);
  }
  const ts = fields.get('ts');
  const digest = fields.get('v1');
  if (!/^\d{10,13}$/.test(ts || '') || !/^[a-f0-9]{64}$/i.test(digest || '')) {
    throw new PaymentProviderError('INVALID_WEBHOOK', 401);
  }
  const epochMs = ts.length === 10 ? Number(ts) * 1000 : Number(ts);
  if (!Number.isSafeInteger(epochMs) || Math.abs(now - epochMs) > toleranceMs) {
    throw new PaymentProviderError('EXPIRED_WEBHOOK', 401);
  }
  const manifest = `id:${String(dataId).toLowerCase()};request-id:${requestId};ts:${ts};`;
  const expected = createHmac('sha256', secret).update(manifest).digest();
  if (!timingSafeEqual(expected, Buffer.from(digest, 'hex'))) throw new PaymentProviderError('INVALID_WEBHOOK', 401);
  return { dataId: String(dataId).toLowerCase(), requestId };
}

export class MercadoPagoPix {
  constructor({ accessToken, notificationUrl, fetchImpl = fetch }) {
    this.accessToken = accessToken;
    this.notificationUrl = notificationUrl;
    this.fetchImpl = fetchImpl;
  }

  async request(path, options = {}) {
    if (!this.accessToken) throw new PaymentProviderError('PAYMENT_NOT_CONFIGURED', 503);
    let response;
    try {
      response = await this.fetchImpl(`${API}${path}`, {
        ...options, redirect: 'error', signal: AbortSignal.timeout(15_000),
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${this.accessToken}`, ...options.headers },
      });
    } catch { throw new PaymentProviderError('PAYMENT_PROVIDER_UNAVAILABLE'); }
    if (!response.ok) throw new PaymentProviderError('PAYMENT_PROVIDER_REJECTED');
    try { return await response.json(); }
    catch { throw new PaymentProviderError('PAYMENT_PROVIDER_INVALID_RESPONSE'); }
  }

  async create({ orderId, totalCents, email, idempotencyKey, expiresAt }) {
    if (!/^[a-zA-Z0-9_-]{1,100}$/.test(orderId || '') || !Number.isSafeInteger(totalCents) ||
        totalCents < 1 || totalCents > 100_000_000 ||
        !/^[a-zA-Z0-9_-]{16,100}$/.test(idempotencyKey || '') ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email || '')) throw new PaymentProviderError('INVALID_PAYMENT_INPUT', 400);
    let callback;
    try { callback = new URL(this.notificationUrl); }
    catch { throw new PaymentProviderError('PAYMENT_NOT_CONFIGURED', 503); }
    if (callback.protocol !== 'https:' || callback.username || callback.password) throw new PaymentProviderError('PAYMENT_NOT_CONFIGURED', 503);
    if (!expiresAt || !Number.isFinite(Date.parse(expiresAt))) throw new PaymentProviderError('INVALID_EXPIRY', 400);
    const result = await this.request('/v1/payments', {
      method: 'POST', headers: { 'X-Idempotency-Key': idempotencyKey },
      body: JSON.stringify({
        external_reference: orderId, transaction_amount: totalCents / 100,
        description: `Pedido MDH 3D ${orderId}`, payment_method_id: 'pix',
        payer: { email }, notification_url: callback.href,
        date_of_expiration: new Date(expiresAt).toISOString(),
      }),
    });
    const data = result.point_of_interaction?.transaction_data;
    if (!result.id || !data?.qr_code) throw new PaymentProviderError('PAYMENT_PROVIDER_INVALID_RESPONSE');
    return { paymentId: String(result.id), status: result.status, qrCode: data.qr_code,
      qrCodeBase64: data.qr_code_base64 || null, expiresAt: result.date_of_expiration };
  }

  async get(paymentId) {
    if (!/^\d{1,30}$/.test(String(paymentId))) throw new PaymentProviderError('INVALID_PAYMENT_ID', 400);
    return this.request(`/v1/payments/${paymentId}`);
  }
}
