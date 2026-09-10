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
    if (name === '@prisma/client' || name === 'zod' || name.startsWith('node:')) return require(name);
    throw new Error(`Unmocked dependency: ${name}`);
  };
  new Function('require', 'module', 'exports', 'process', compiled)(isolatedRequire, loaded, loaded.exports, { env: environment });
  return loaded.exports;
}

const httpCache = load('lib/http-cache.ts');
const nextServer = { NextResponse: { json: (body, init) => Response.json(body, init) } };

function productFixture(options = {}) {
  const writes = [];
  const paths = [];
  let invalidations = 0;
  const current = { id: 'product-test', title: 'Teste', pricePix: 20, grams: 10, hours: 1, complexity: 1, marketplaceSuggested: 25 };
  const transaction = {
    product: {
      findUnique: async () => options.missing ? null : current,
      update: async ({ data }) => {
        if (options.writeError) throw new Error('sensitive database connection failure');
        writes.push(data);
        return { ...current, ...data };
      },
    },
  };
  const route = load('app/api/admin/products/[id]/route.ts', {
    'next/server': nextServer,
    'next/cache': { revalidatePath: (...args) => paths.push(args) },
    '@/lib/http-cache': httpCache,
    '@/lib/server-session': {
      getServerSessionUser: async () => options.user === undefined ? { id: 'admin-test', role: 'admin' } : options.user,
      isAdminSession: (user) => user?.role === 'admin',
    },
    '@/lib/server/admin-catalog-store': { updateAdminCatalogProduct: () => { throw new Error('Filesystem fallback forbidden'); } },
    '@/lib/prisma': { canConnectToDatabase: async () => !options.offline, prisma: { $transaction: async (callback) => callback(transaction) } },
    '@/lib/admin-audit': { recordAdminAction: async () => null },
    '@/lib/runtime-cache': { invalidateCatalogCache: async () => { invalidations += 1; if (options.cacheError) throw new Error('cache unavailable'); } },
    '@/lib/utils': { slugify: (value) => value },
    '@/lib/pricing-engine': load('lib/pricing-engine.ts', { '@/lib/payment-pricing': load('lib/payment-pricing.ts'), './cache': {} }),
    '@/lib/catalog-taxonomy': load('lib/catalog-taxonomy.ts'),
    '@/lib/payment-pricing': load('lib/payment-pricing.ts'),
  });
  return {
    writes, paths,
    invalidations: () => invalidations,
    save: (body) => route.PUT(new Request('http://localhost/api/admin/products/product-test', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
    }), { params: Promise.resolve({ id: current.id }) }),
  };
}

test('price update rejects anonymous and customer without writes', async () => {
  for (const [user, status] of [[null, 401], [{ role: 'customer' }, 403]]) {
    const fixture = productFixture({ user });
    const response = await fixture.save({ pricePix: 12 });
    assert.equal(response.status, status);
    assert.match(response.headers.get('cache-control'), /no-store/);
    assert.equal(fixture.writes.length, 0);
  }
});

test('price update rejects invalid, blank, zero and negative inputs', async () => {
  for (const pricePix of ['', ' ', null, true, [], {}, 'abc', 0, -1, 100001]) {
    const fixture = productFixture();
    assert.equal((await fixture.save({ pricePix })).status, 400);
    assert.equal(fixture.writes.length, 0);
  }
});

test('price update persists decimal comma, derives card and invalidates views', async () => {
  const fixture = productFixture();
  const response = await fixture.save({ pricePix: '29,90', priceCard: 1 });
  const data = await response.json();
  assert.equal(response.status, 200);
  assert.equal(data.persisted, true);
  assert.equal(data.source, 'database');
  assert.equal(fixture.writes[0].pricePix, 29.9);
  assert.equal(fixture.writes[0].priceCard, 30.9);
  assert.equal(fixture.invalidations(), 1);
  assert.ok(fixture.paths.some(([path]) => path === '/produto/[slug]'));
});

test('offline, missing product and database failures never fall back to files', async () => {
  for (const [options, status, code] of [
    [{ offline: true }, 503, 'DATABASE_PERSISTENCE_REQUIRED'],
    [{ missing: true }, 404, 'PRODUCT_NOT_IN_DATABASE'],
    [{ writeError: true }, 503, 'DATABASE_UPDATE_FAILED'],
  ]) {
    const fixture = productFixture(options);
    const response = await fixture.save({ pricePix: 15 });
    const data = await response.json();
    assert.equal(response.status, status);
    assert.equal(data.code, code);
    assert.equal(data.persisted, false);
    assert.doesNotMatch(JSON.stringify(data), /sensitive/);
    assert.equal(fixture.invalidations(), 0);
    assert.equal(fixture.writes.length, 0);
  }
});

test('cache failure after commit reports persisted with warning, no second write', async () => {
  const fixture = productFixture({ cacheError: true });
  const response = await fixture.save({ pricePix: 15 });
  const data = await response.json();
  assert.equal(response.status, 200);
  assert.equal(data.persisted, true);
  assert.match(data.warning, /cache/);
  assert.equal(fixture.writes.length, 1);
});

function sessionFixture(options = {}) {
  const payload = options.payload || { sub: 'admin-env', email: 'admin@example.test', role: 'admin', iat: 200 };
  return load('lib/server-session.ts', {
    'next/headers': { cookies: async () => ({ get: (name) => name === 'admin' && !options.noCookie ? { value: 'signed' } : undefined }) },
    '@/auth': { auth: async () => options.authSession || { user: { id: 'buyer', email: 'buyer@example.test', role: 'buyer' } } },
    '@/lib/server-config': { adminConfig: { email: 'admin@example.test', sessionCookieName: 'admin', sessionSecret: 'test' } },
    '@/lib/prisma': { canConnectToDatabase: async () => !options.offline, prisma: { user: { findUnique: async () => options.record || null } } },
    '@/lib/session-token': {
      customerSessionCookieName: 'customer', getCustomerSessionSecret: () => 'test',
      isSessionSecretConfigured: Boolean, verifySignedSessionToken: async () => payload,
    },
  }, { ADMIN_PASSWORD_HASH: 'configured-test-only' });
}

test('validated env admin session takes precedence over customer Auth.js session', async () => {
  assert.equal((await sessionFixture().getServerSessionUser()).source, 'admin-cookie');
});

test('customer payload cannot become admin by changing cookie name', async () => {
  const session = sessionFixture({ payload: { sub: 'buyer', email: 'buyer@example.test', role: 'customer' } });
  assert.equal(await session.getServerSessionUser(), null);
});

test('inactive, demoted, mismatched and reset admin identities are rejected', async () => {
  for (const record of [
    { id: 'admin-env', role: 'ADMIN', isActive: false },
    { id: 'admin-env', role: 'BUYER', isActive: true },
    { id: 'admin-env', role: 'ADMIN', isActive: true, passwordUpdatedAt: new Date(201000) },
  ]) {
    assert.equal(await sessionFixture({ record }).getServerSessionUser(), null);
  }
  assert.equal(await sessionFixture({ offline: true, noCookie: true }).getServerSessionUser(), null);
});

function authFixture(options = {}) {
  let configuration;
  const created = [];
  const provider = (settings) => settings;
  const prisma = { user: {
    findUnique: async () => options.user || null,
    create: async ({ data }) => { created.push(data); return { id: 'oauth-buyer', ...data }; },
  } };
  load('auth.ts', {
    'server-only': {},
    'next-auth': (config) => { configuration = config; return {}; },
    'next-auth/providers/apple': provider,
    'next-auth/providers/credentials': provider,
    'next-auth/providers/google': (settings) => ({ id: 'google', ...settings }),
    '@auth/prisma-adapter': { PrismaAdapter: () => ({}) },
    '@/lib/prisma': { prisma, isDatabaseConfigured: () => !options.noDatabase },
    '@/lib/env': { getAuthSecret: () => options.noSecret ? '' : 'test' },
    '@/lib/marketplace-auth': {},
  }, options.environment || {});
  return { configuration, created };
}

test('Google requires credentials, database and session configuration', () => {
  const environment = { AUTH_GOOGLE_ID: 'test', AUTH_GOOGLE_SECRET: 'test' };
  for (const options of [{}, { environment, noDatabase: true }, { environment, noSecret: true }]) {
    assert.ok(!authFixture(options).configuration.providers.some((provider) => provider.id === 'google'));
  }
  assert.ok(authFixture({ environment }).configuration.providers.some((provider) => provider.id === 'google'));
});

test('OAuth registration atomically creates only buyer and existing profile relations', async () => {
  const fixture = authFixture();
  await fixture.configuration.adapter.createUser({ email: 'Buyer@Example.test', name: 'Buyer', emailVerified: null, role: 'ADMIN' });
  assert.equal(fixture.created[0].role, 'BUYER');
  assert.equal(fixture.created[0].email, 'buyer@example.test');
  assert.deepEqual(fixture.created[0].buyerProfile, { create: {} });
  assert.deepEqual(fixture.created[0].wishlist, { create: {} });
});

test('Google denies unverified, disabled, privileged and 2FA identities', async () => {
  const input = { user: { email: 'buyer@example.test' }, account: { provider: 'google' }, profile: { email_verified: true } };
  assert.equal(await authFixture().configuration.callbacks.signIn(input), true);
  assert.equal(await authFixture().configuration.callbacks.signIn({ ...input, profile: {} }), false);
  for (const user of [
    { isActive: false, role: 'BUYER' },
    { isActive: true, role: 'ADMIN' },
    { isActive: true, role: 'BUYER', twoFactorEnabled: true },
  ]) assert.equal(await authFixture({ user }).configuration.callbacks.signIn(input), false);
});

test('OAuth JWT never adopts a privileged profile claim', async () => {
  const token = await authFixture().configuration.callbacks.jwt({ token: {}, user: { id: 'buyer', role: 'ADMIN' }, account: { provider: 'google' } });
  assert.equal(token.role, 'buyer');
});

test('registration refuses offline storage without creating a temporary account', async () => {
  const route = load('app/api/auth/register/route.ts', {
    'next/server': nextServer,
    '@/lib/marketplace-auth': { registerBuyerAccount: () => { throw new Error('Must not create'); } },
    '@/lib/http-cache': httpCache,
    '@/lib/prisma': { canConnectToDatabase: async () => false },
    '@/lib/security': { getClientIp: () => 'local', sanitizeTextInput: (value) => value, isValidEmail: () => true },
    '@/lib/redis': { rateLimitRequest: async () => ({ ok: true }) },
    '@/lib/auth/audit': { recordAuthAudit: async () => null },
  });
  const response = await route.POST(new Request('http://localhost/api/auth/register', {
    method: 'POST', body: JSON.stringify({ email: 'buyer@example.test', name: 'Buyer', password: 'TestPassword123' }),
  }));
  assert.equal(response.status, 503);
});
