import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createDevelopmentSecrets } from './create-development-secrets.mjs';

test('generates separate random local keys, no expiry, without overwriting configuration', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'mdh-development-'));
  try {
    const first = await createDevelopmentSecrets({ directory, environment: {} });
    const text = await readFile(first.destination, 'utf8');
    const keys = text.split('\n').filter(line => !line.startsWith('#') && line.includes('=')).map(line => line.split('=')[1]);
    assert.equal(keys.length, 4);
    assert.equal(new Set(keys).size, 4);
    for (const key of keys) assert.match(key, /^mdh_dev_[A-Za-z0-9_-]{64}$/);
    assert(!text.includes('MERCADOPAGO') && !text.includes('FIREBASE') && !text.includes('EXPIRES_AT'));
    if (process.platform !== 'win32') assert.equal((await stat(first.destination)).mode & 0o777, 0o600);
    assert.equal((await createDevelopmentSecrets({ directory, environment: {} })).created, false);
    assert.equal(await readFile(first.destination, 'utf8'), text);
  } finally { await rm(directory, { recursive: true, force: true }); }
});
test('refuses production, hosting and CI even when the file is absent', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'mdh-development-'));
  try {
    for (const environment of [{ NODE_ENV: 'production' }, { VERCEL: '1' }, { CI: 'true' }]) {
      await assert.rejects(createDevelopmentSecrets({ directory, environment }));
    }
    await assert.rejects(stat(join(directory, '.env.development.local')), { code: 'ENOENT' });
  } finally { await rm(directory, { recursive: true, force: true }); }
});
