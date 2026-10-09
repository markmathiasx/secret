import assert from 'node:assert/strict';
import { createHmac, randomBytes } from 'node:crypto';
import { mkdtemp, readFile, writeFile, mkdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import ts from 'typescript';

// Compile the actual TS modules to an isolated temporary ESM folder, with no env files loaded.
const root = await mkdtemp(path.join(tmpdir(), 'mdh-secret-test-'));
const names = ['security/secret-policy', 'otp', 'session-token'];
const original = { NODE_ENV: process.env.NODE_ENV, VERCEL_ENV: process.env.VERCEL_ENV, AUTH_SECRET: process.env.AUTH_SECRET, OTP_SECRET: process.env.OTP_SECRET };
try {
  await writeFile(path.join(root, 'package.json'), '{"type":"module"}');
  for (const name of names) {
    const source = await readFile(new URL(`../../lib/${name}.ts`, import.meta.url), 'utf8');
    const output = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext } }).outputText.replaceAll('"./security/secret-policy"', '"./security/secret-policy.js"');
    const target = path.join(root, `${name}.js`);
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, output);
  }
  const policy = await import(pathToFileURL(path.join(root, 'security/secret-policy.js')));
  const otp = await import(pathToFileURL(path.join(root, 'otp.js')));
  const session = await import(pathToFileURL(path.join(root, 'session-token.js')));
  process.env.NODE_ENV = 'test';
  delete process.env.VERCEL_ENV;
  delete process.env.AUTH_SECRET;
  delete process.env.OTP_SECRET;
  assert.equal(policy.isSigningSecretValid(undefined), false);
  assert.equal(policy.isSigningSecretValid('short'), false);
  assert.equal(policy.isSigningSecretValid('placeholder_' + 'a'.repeat(40)), false);
  assert.equal(policy.isSigningSecretValid('csrf-default-secret' + 'a'.repeat(40)), false);
  assert.throws(() => otp.hashOTP('123456'), /missing or invalid/);
  const dev = `mdh_dev_${randomBytes(32).toString('hex')}`;
  const real = randomBytes(32).toString('hex');
  assert.equal(policy.isSigningSecretValid(dev, false), true);
  assert.equal(policy.isSigningSecretValid(dev, true), false);
  assert.equal(policy.isSigningSecretValid(real, true), true);
  assert.equal(policy.selectSigningSecret(['short', dev], false), dev);
  assert.equal(policy.selectSigningSecret([dev, real], true), real);
  process.env.OTP_SECRET = dev;
  const hash = otp.hashOTP('123456');
  assert.equal(hash, createHmac('sha256', dev).update('123456').digest('hex'));
  assert.equal(otp.verifyOTP('123456', hash), true);
  assert.equal(otp.verifyOTP('654321', hash), false);
  assert.equal(otp.verifyOTP('123456', hash.slice(0, 62) + (hash.endsWith('00') ? '01' : '00')), false);
  assert.equal(otp.verifyOTP('123456', 'a'.repeat(63)), false);
  assert.equal(otp.verifyOTP('12345x', hash), false);
  assert.equal(otp.OTP_EXPIRY_MINUTES, 10);
  const token = await session.createSignedSessionToken({ sub: 'test', email: 'test@example.test', displayName: 'Test', role: 'customer', expiresInSeconds: 30 }, dev);
  assert.equal((await session.verifySignedSessionToken(token, dev))?.sub, 'test');
  assert.equal(await session.verifySignedSessionToken(token + '.extra', dev), null);
  assert.equal(await session.verifySignedSessionToken(token, real), null);
  await assert.rejects(session.createSignedSessionToken({ sub: 'test', email: 'test@example.test', displayName: 'Test', role: 'customer', expiresInSeconds: 0 }, dev), /expiry/);
  process.env.VERCEL_ENV = 'production';
  assert.equal(policy.isSigningSecretValid(dev), false);
  assert.equal(session.isSessionSecretConfigured(dev), false);
  assert.equal(await session.verifySignedSessionToken(token, dev), null);
  assert.throws(() => otp.hashOTP('123456'), /missing or invalid/);
  console.log('PASS: secret policy, OTP HMAC/tamper checks, session expiry and production dev-secret rejection.');
} finally {
  for (const [key, value] of Object.entries(original)) {
    if (value === undefined) delete process.env[key]; else process.env[key] = value;
  }
  await rm(root, { recursive: true, force: true });
}
