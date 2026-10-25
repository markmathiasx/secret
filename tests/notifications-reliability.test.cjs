const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { resolve } = require('node:path');
const { test } = require('node:test');
const ts = require('typescript');

function load(relative, dependencies = {}, environment = {}) {
  const filename = resolve(__dirname, '..', relative);
  const compiled = ts.transpileModule(readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
    fileName: filename,
  }).outputText;
  const loaded = { exports: {} };
  const isolatedRequire = (name) => {
    if (Object.hasOwn(dependencies, name)) return dependencies[name];
    if (name === 'node:crypto' || name === '@prisma/client') return require(name);
    throw new Error(`Unmocked dependency: ${name}`);
  };
  new Function('require', 'module', 'exports', 'process', 'Buffer', compiled)(
    isolatedRequire,
    loaded,
    loaded.exports,
    { env: environment },
    Buffer,
  );
  return loaded.exports;
}

const nextServer = { NextResponse: { json: (body, init) => Response.json(body, init) } };

function cronFixture(environment = {}) {
  let databaseChecks = 0;
  const route = load('app/api/cron/abandoned-cart/route.ts', {
    'next/server': nextServer,
    '@/lib/prisma': {
      canConnectToDatabase: async () => { databaseChecks += 1; return false; },
      prisma: {},
    },
    '@/lib/notifications-service': {},
    '@/lib/logger': { logStructured: () => null },
  }, environment);
  return { route, databaseChecks: () => databaseChecks };
}

test('abandoned-cart cron fails closed when CRON_SECRET is empty', async () => {
  const fixture = cronFixture({ CRON_SECRET: '   ' });
  const response = await fixture.route.GET(new Request('http://localhost/api/cron/abandoned-cart'));
  assert.equal(response.status, 503);
  assert.equal(fixture.databaseChecks(), 0);
  assert.deepEqual(await response.json(), { ok: false, error: 'Cron unavailable' });
});

test('abandoned-cart cron rejects invalid credentials before database access', async () => {
  const fixture = cronFixture({ CRON_SECRET: 'expected-secret' });
  const response = await fixture.route.GET(new Request('http://localhost/api/cron/abandoned-cart', {
    headers: { authorization: 'Bearer wrong-secret' },
  }));
  assert.equal(response.status, 401);
  assert.equal(fixture.databaseChecks(), 0);
});

test('abandoned-cart cron accepts bearer and legacy header credentials', async () => {
  for (const headers of [
    { authorization: 'Bearer expected-secret' },
    { 'x-cron-secret': 'expected-secret' },
  ]) {
    const fixture = cronFixture({ CRON_SECRET: 'expected-secret' });
    const response = await fixture.route.GET(new Request('http://localhost/api/cron/abandoned-cart', { headers }));
    assert.equal(response.status, 503);
    assert.equal(fixture.databaseChecks(), 1);
  }
});

function notificationsFixture({ storedPreferences = null, environment = {}, pushResult = true } = {}) {
  const created = [];
  const upserts = [];
  const transports = [];
  const sentMail = [];
  const prisma = {
    user: {
      findUnique: async () => ({ email: 'buyer@example.test', name: 'Buyer', phone: '5511999999999' }),
    },
    userProfile: {
      findUnique: async () => storedPreferences === null ? null : { preferences: storedPreferences },
      upsert: async (input) => { upserts.push(input); return input; },
    },
    notification: {
      create: async (input) => { created.push(input); return input; },
      findMany: async () => [],
      update: async () => null,
    },
  };
  const service = load('lib/notifications-service.ts', {
    'server-only': {},
    '@prisma/client': {},
    './prisma': { prisma },
    nodemailer: {
      __esModule: true,
      default: {
        createTransport: (config) => {
          transports.push(config);
          return { sendMail: async (message) => { sentMail.push(message); return { accepted: [message.to] }; } };
        },
      },
    },
    '@/lib/env': { getSiteUrl: () => 'https://www.mdh3d.com.br' },
    '@/lib/meta/whatsapp': { sendWhatsAppText: async () => ({ ok: true }) },
    '@/lib/utils': { formatCurrency: (value) => `R$ ${value}` },
    '@/lib/logger': { logStructured: () => null },
    '@/lib/web-push': { sendWebPushToUser: async () => ({ sent: pushResult ? 1 : 0, removed: 0 }) },
  }, environment);
  return { service, created, upserts, transports, sentMail };
}

test('notification preferences persist in UserProfile without replacing unrelated data', async () => {
  const fixture = notificationsFixture({
    storedPreferences: {
      theme: 'dark',
      notificationPreferences: { email_marketing: false, digest_frequency: 'weekly' },
    },
  });
  assert.equal((await fixture.service.getNotificationPreferences('buyer')).email_marketing, false);
  await fixture.service.updateNotificationPreferences('buyer', { push_enabled: false, whatsapp_enabled: true });
  const saved = fixture.upserts[0].update.preferences;
  assert.equal(saved.theme, 'dark');
  assert.equal(saved.notificationPreferences.email_marketing, false);
  assert.equal(saved.notificationPreferences.push_enabled, false);
  assert.equal(saved.notificationPreferences.whatsapp_enabled, true);
  assert.equal(saved.notificationPreferences.digest_frequency, 'weekly');
});

test('invalid preference values cannot reset existing consent', async () => {
  const fixture = notificationsFixture({
    storedPreferences: { notificationPreferences: { email_marketing: false, digest_frequency: 'weekly' } },
  });
  await fixture.service.updateNotificationPreferences('buyer', {
    email_marketing: 'false',
    digest_frequency: 'sometimes',
  });
  const saved = fixture.upserts[0].update.preferences.notificationPreferences;
  assert.equal(saved.email_marketing, false);
  assert.equal(saved.digest_frequency, 'weekly');
});

test('marketing opt-out suppresses email and WhatsApp but retains in-app delivery', async () => {
  const fixture = notificationsFixture({
    storedPreferences: {
      notificationPreferences: { email_marketing: false, whatsapp_enabled: false },
    },
  });
  const delivered = await fixture.service.sendNotification({
    type: 'abandoned_cart',
    user_id: 'buyer',
    title: 'Carrinho',
    message: 'Retome sua compra',
    channels: ['EMAIL', 'WHATSAPP', 'IN_APP'],
  });
  assert.equal(delivered, true);
  assert.equal(fixture.sentMail.length, 0);
  assert.equal(fixture.created.length, 1);
  assert.equal(fixture.created[0].data.channel, 'IN_APP');
});

test('SMTP uses canonical variables and supports legacy password/from aliases', async () => {
  for (const [environment, expectedPassword, expectedFrom] of [
    [{ SMTP_USER: 'user', SMTP_PASS: 'canonical', SMTP_PASSWORD: 'legacy', EMAIL_FROM: 'canonical@example.test', SMTP_FROM: 'legacy@example.test' }, 'canonical', 'canonical@example.test'],
    [{ SMTP_USER: 'user', SMTP_PASSWORD: 'legacy', SMTP_FROM: 'legacy@example.test' }, 'legacy', 'legacy@example.test'],
  ]) {
    const fixture = notificationsFixture({ environment });
    assert.equal(await fixture.service.sendNotification({
      type: 'order_confirmed',
      user_id: 'buyer',
      title: 'Pedido',
      message: 'Confirmado',
      channels: ['EMAIL'],
    }), true);
    assert.equal(fixture.transports[0].auth.pass, expectedPassword);
    assert.equal(fixture.sentMail[0].from, expectedFrom);
    assert.equal(fixture.created[0].data.status, 'SENT');
  }
});

test('failed push is recorded as failed and is not reported as delivered', async () => {
  const fixture = notificationsFixture({ pushResult: false });
  const delivered = await fixture.service.sendNotification({
    type: 'shipment_update',
    user_id: 'buyer',
    title: 'Envio',
    message: 'Atualização',
    channels: ['PUSH'],
  });
  assert.equal(delivered, false);
  assert.equal(fixture.created[0].data.status, 'FAILED');
});
