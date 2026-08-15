import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const packagePath = resolve('package.json');
const lockPath = resolve('package-lock.json');
const packageJson = JSON.parse(readFileSync(packagePath, 'utf8'));
const lock = JSON.parse(readFileSync(lockPath, 'utf8'));

const expectedDirect = {
  '@auth/prisma-adapter': '2.11.3',
  'isomorphic-dompurify': '3.19.0',
  next: '15.5.21',
  'next-auth': '5.0.0-beta.32',
  sharp: '0.35.3',
  undici: '^6.28.0',
};
const expectedDev = {
  '@next/bundle-analyzer': '15.5.21',
  'eslint-config-next': '15.5.21',
  postcss: '8.5.26',
};
const expectedOverrides = {
  '@auth/core': '0.41.3',
  'brace-expansion': '5.0.9',
  dompurify: '3.4.13',
  'js-yaml': '5.3.0',
  jsdom: '25.0.1',
  nanoid: '3.3.18',
  postcss: '8.5.26',
  sharp: '0.35.3',
};

const failures = [];
for (const [name, version] of Object.entries(expectedDirect)) {
  if (packageJson.dependencies?.[name] !== version) {
    failures.push(`dependencies.${name}: esperado ${version}, encontrado ${packageJson.dependencies?.[name] ?? 'ausente'}`);
  }
}
for (const [name, version] of Object.entries(expectedDev)) {
  if (packageJson.devDependencies?.[name] !== version) {
    failures.push(`devDependencies.${name}: esperado ${version}, encontrado ${packageJson.devDependencies?.[name] ?? 'ausente'}`);
  }
}
for (const [name, version] of Object.entries(expectedOverrides)) {
  if (packageJson.overrides?.[name] !== version) {
    failures.push(`overrides.${name}: esperado ${version}, encontrado ${packageJson.overrides?.[name] ?? 'ausente'}`);
  }
}

const packageEntries = Object.entries(lock.packages || {});
function versionsFor(packageName) {
  const suffix = `/node_modules/${packageName}`;
  const windowsSuffix = `\\node_modules\\${packageName}`;
  return packageEntries
    .filter(([path]) => path === `node_modules/${packageName}` || path.endsWith(suffix) || path.endsWith(windowsSuffix))
    .map(([path, value]) => ({ path, version: value?.version }))
    .filter((item) => typeof item.version === 'string');
}

function requireExactInLock(packageName, expected) {
  const found = versionsFor(packageName);
  if (!found.length) {
    failures.push(`package-lock: ${packageName} não encontrado`);
    return;
  }
  for (const item of found) {
    if (item.version !== expected) {
      failures.push(`package-lock: ${packageName}@${item.version} em ${item.path}; esperado ${expected}`);
    }
  }
}

requireExactInLock('next', '15.5.21');
requireExactInLock('next-auth', '5.0.0-beta.32');
requireExactInLock('@auth/core', '0.41.3');
requireExactInLock('@auth/prisma-adapter', '2.11.3');
requireExactInLock('sharp', '0.35.3');
requireExactInLock('undici', '6.28.0');
requireExactInLock('brace-expansion', '5.0.9');
requireExactInLock('dompurify', '3.4.13');
requireExactInLock('js-yaml', '5.3.0');
requireExactInLock('nanoid', '3.3.18');
requireExactInLock('postcss', '8.5.26');
requireExactInLock('jsdom', '25.0.1');

if (failures.length) {
  console.error('VALIDAÇÃO DE DEPENDÊNCIAS CORRIGIDAS: REPROVADA');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('VALIDAÇÃO DE DEPENDÊNCIAS CORRIGIDAS: OK');
console.log(JSON.stringify({ expectedDirect, expectedDev, expectedOverrides }, null, 2));
