import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const packagePath = path.join(root, 'package.json');
const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

const requiredScripts = {
  'catalog:audit-commercial-costs': 'node scripts/catalog/audit-commercial-costs.mjs',
  'catalog:audit-commercial-costs:strict': 'node scripts/catalog/audit-commercial-costs.mjs --strict',
  'catalog:validate-commercial-storefront': 'node scripts/catalog/validate-commercial-storefront.mjs',
  'pricing:keychain': 'node scripts/pricing/calculate-keychain.mjs',
  'pricing:validate-commercial': 'node scripts/pricing/validate-commercial-pricing.mjs',
  'security:audit:production': 'node scripts/security/validate-npm-audit.mjs --omit-dev --max-total=0 --report=output/npm-audit-production.json',
  'security:audit:all': 'node scripts/security/validate-npm-audit.mjs --max-total=0 --report=output/npm-audit-all.json',
  'security:audit:all:report': 'node scripts/security/validate-npm-audit.mjs --max-total=9999 --report=output/npm-audit-all.json',
  'security:validate-patched-dependencies': 'node scripts/security/validate-patched-dependencies.mjs',
  'industrial:v6:enforce': 'node scripts/industrial/enforce-industrial-contract-v6.mjs',
  'industrial:v6:verify': 'node scripts/industrial/verify-industrial-v6.mjs',
  'industrial:v6:report': 'node scripts/industrial/generate-industrial-report-v6.mjs',
  'industrial:v6:verify-build': 'node scripts/industrial/verify-build-output-v6.mjs',
  'industrial:v6:gate': 'npm run security:validate-patched-dependencies && npm run security:audit:production && npm run security:scan-secrets && npm run prisma:validate && npm run db:generate && npm run pricing:validate-commercial && npm run catalog:audit-commercial-costs:strict && npm run catalog:validate-commercial-storefront && npm run validate:first-sale && npm run validate:auth && npm run validate:db-storage && npm run validate:private-routes && npm run validate:public-regressions && npm run validate:industrial-ui && npm run validate:mdh-smart-store && npm run validate:enterprise-scaffold && npm run commerce-os:validate && npm run marketplace:audit-phases && npm run validate:assets:fs && npm run industrial:v6:verify && npm run typecheck && npm run lint:check && npm run build && npm run industrial:v6:verify-build && npm run industrial:v6:browser-gates && npm run marketplace:audit-phases && npm run industrial:v6:report',
};

const requiredDependencies = {
  '@auth/prisma-adapter': '2.11.3',
  'isomorphic-dompurify': '3.19.0',
  next: '15.5.21',
  'next-auth': '5.0.0-beta.32',
  sharp: '0.35.3',
};
const requiredDevDependencies = {
  '@next/bundle-analyzer': '15.5.21',
  'eslint-config-next': '15.5.21',
  postcss: '8.5.19',
};
const requiredOverrides = {
  '@auth/core': '0.41.3',
  dompurify: '3.4.12',
  jsdom: '25.0.1',
  postcss: '8.5.19',
  sharp: '0.35.3',
};

pkg.scripts = { ...(pkg.scripts || {}), ...requiredScripts };
pkg.dependencies = { ...(pkg.dependencies || {}), ...requiredDependencies };
pkg.devDependencies = { ...(pkg.devDependencies || {}), ...requiredDevDependencies };
pkg.overrides = { ...(pkg.overrides || {}), ...requiredOverrides };

fs.writeFileSync(packagePath, `${JSON.stringify(pkg, null, 2)}\n`, 'utf8');
console.log('CONTRATO INDUSTRIAL V6: REAPLICADO');
console.log(JSON.stringify({
  protectedScripts: Object.keys(requiredScripts),
  protectedDependencies: requiredDependencies,
  protectedDevDependencies: requiredDevDependencies,
  protectedOverrides: requiredOverrides,
}, null, 2));
