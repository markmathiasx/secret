import { randomBytes } from 'node:crypto';
import { mkdir, open } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// Local signing keys only. Never create fake gateway/OAuth credentials.
const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
export async function createDevelopmentSecrets({ directory = projectRoot, environment = process.env } = {}) {
  if (environment.NODE_ENV === 'production' || environment.VERCEL || environment.CI) {
    throw new Error('Development keys cannot be generated in production, hosting or CI.');
  }
  const destination = resolve(directory, '.env.development.local');
  await mkdir(directory, { recursive: true });
  const names = ['AUTH_SECRET', 'AUTH_CUSTOMER_SESSION_SECRET', 'ADMIN_SESSION_SECRET', 'OTP_SECRET'];
  const content = '# LOCAL DEVELOPMENT ONLY — never copy into production.\n' +
    '# Signing keys have no automatic expiry; sessions and OTP keep their normal expiry.\n' +
    '# Delete this file to revoke and regenerate the local keys.\n' +
    names.map(name => `${name}=mdh_dev_${randomBytes(48).toString('base64url')}`).join('\n') + '\n';
  let file;
  try { file = await open(destination, 'wx', 0o600); }
  catch (error) {
    if (error.code === 'EEXIST') return { created: false, destination };
    throw error;
  }
  try { await file.writeFile(content); }
  finally { await file.close(); }
  return { created: true, destination };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const result = await createDevelopmentSecrets();
  console.log(result.created ? 'Local development keys created; values were not printed.' : 'Existing local configuration preserved; no key was overwritten.');
}
