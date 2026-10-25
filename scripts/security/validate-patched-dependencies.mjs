import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const packagePath = resolve('package.json');
const lockPath = resolve('package-lock.json');
const packageJson = JSON.parse(readFileSync(packagePath, 'utf8'));
const lock = JSON.parse(readFileSync(lockPath, 'utf8'));

const expectedDirect = {
  '@sentry/nextjs': '11.9.0',
  '@auth/prisma-adapter': '2.11.3',
  fflate: '0.8.3',
  'isomorphic-dompurify': '4.6.0',
  'lucide-react': '1.61.0',
  next: '15.5.28',
  'next-auth': '5.0.0-beta.32',
  nodemailer: '10.2.1',
  sharp: '0.35.5',
  undici: '8.12.3',
  zod: '4.6.7',
};
const expectedDev = {
  '@next/bundle-analyzer': '15.5.28',
  'eslint-config-next': '15.5.28',
  postcss: '8.5.26',
  'wait-on': '9.5.1',
};
const expectedOverrides = {
  '@auth/core': '0.41.3',
  'baseline-browser-mapping': '2.11.21',
  axios: '1.20.0',
  'brace-expansion': '5.0.12',
  browserslist: '4.28.9',
  dompurify: '3.4.17',
  'deepmerge-ts': '8.0.2',
  'js-yaml': '5.5.0',
  jsdom: '25.0.1',
  nanoid: '3.3.18',
  postcss: '8.5.26',
  'postcss-nested': '9.0.1',
  'postcss-selector-parser': '7.1.7',
  sharp: '0.35.5',
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

function requireRootExactInLock(packageName, expected) {
  const item = lock.packages?.[`node_modules/${packageName}`];
  if (!item?.version) {
    failures.push(`package-lock: dependência raiz ${packageName} não encontrada`);
    return;
  }
  if (item.version !== expected) {
    failures.push(`package-lock: dependência raiz ${packageName}@${item.version}; esperado ${expected}`);
  }
}

requireRootExactInLock('@sentry/nextjs', '11.9.0');
requireRootExactInLock('next', '15.5.28');
requireExactInLock('next-auth', '5.0.0-beta.32');
requireExactInLock('@auth/core', '0.41.3');
requireExactInLock('@auth/prisma-adapter', '2.11.3');
requireRootExactInLock('sharp', '0.35.5');
requireExactInLock('fflate', '0.8.3');
requireRootExactInLock('nodemailer', '10.2.1');
requireExactInLock('baseline-browser-mapping', '2.11.21');
requireExactInLock('browserslist', '4.28.9');
requireExactInLock('axios', '1.20.0');
requireRootExactInLock('undici', '8.12.3');
requireRootExactInLock('zod', '4.6.7');
requireRootExactInLock('lucide-react', '1.61.0');
requireExactInLock('brace-expansion', '5.0.12');
requireExactInLock('dompurify', '3.4.17');
requireExactInLock('deepmerge-ts', '8.0.2');
requireExactInLock('js-yaml', '5.5.0');
requireExactInLock('nanoid', '3.3.18');
requireExactInLock('postcss', '8.5.26');
requireExactInLock('postcss-nested', '9.0.1');
requireExactInLock('postcss-selector-parser', '7.1.7');
requireExactInLock('jsdom', '25.0.1');

if (failures.length) {
  console.error('VALIDAÇÃO DE DEPENDÊNCIAS CORRIGIDAS: REPROVADA');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('VALIDAÇÃO DE DEPENDÊNCIAS CORRIGIDAS: OK');
console.log(JSON.stringify({ expectedDirect, expectedDev, expectedOverrides }, null, 2));
