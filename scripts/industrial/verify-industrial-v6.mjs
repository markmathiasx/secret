import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const root = process.cwd();
const failures = [];
const warnings = [];
const evidence = {};

function read(relative, required = true) {
  const file = path.join(root, relative);
  if (!fs.existsSync(file)) {
    if (required) failures.push(`Arquivo obrigatório ausente: ${relative}`);
    return '';
  }
  return fs.readFileSync(file, 'utf8');
}

function existsAny(candidates, label) {
  const found = candidates.filter((candidate) => fs.existsSync(path.join(root, candidate)));
  evidence[label] = found;
  if (found.length === 0) failures.push(`${label}: nenhum arquivo/rota encontrado entre ${candidates.join(', ')}`);
  return found;
}

function containsAny(source, terms, label, required = true) {
  const normalized = source.toLowerCase();
  const found = terms.filter((term) => normalized.includes(term.toLowerCase()));
  evidence[label] = found;
  if (required && found.length === 0) failures.push(`${label}: evidência não encontrada`);
  return found;
}

function git(args) {
  try {
    return execFileSync('git', ['-C', root, ...args], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
  } catch {
    return '';
  }
}

function changedFilesSinceBase() {
  const base = process.env.INDUSTRIAL_BASE_COMMIT?.trim();
  if (!base) {
    warnings.push('INDUSTRIAL_BASE_COMMIT não informado; consistência de migrações não foi comparada com a base.');
    return [];
  }
  const tracked = git(['diff', '--name-only', base, '--']).split(/\r?\n/).filter(Boolean);
  const untracked = git(['ls-files', '--others', '--exclude-standard']).split(/\r?\n/).filter(Boolean);
  return [...new Set([...tracked, ...untracked].map((file) => file.replaceAll('\\', '/')))];
}

const packageJson = JSON.parse(read('package.json'));
const scripts = packageJson.scripts || {};
for (const name of [
  'industrial:v6:verify',
  'industrial:v6:report',
  'industrial:v6:gate',
  'security:audit:production',
  'security:scan-secrets',
  'pricing:validate-commercial',
  'catalog:validate-commercial-storefront',
  'validate:auth',
  'validate:db-storage',
  'validate:private-routes',
  'validate:public-regressions',
  'typecheck',
  'lint:check',
  'build',
]) {
  if (!scripts[name]) failures.push(`Script npm obrigatório ausente: ${name}`);
}

const storefrontRaw = read('data/commercial-storefront.json');
let storefront;
try {
  storefront = JSON.parse(storefrontRaw);
} catch (error) {
  failures.push(`data/commercial-storefront.json inválido: ${error.message}`);
}
if (storefront) {
  const rawItems = storefront.products || storefront.items || storefront.featuredProducts || [];
  const items = Array.isArray(rawItems) ? rawItems : Object.values(rawItems || {});
  const maximum = Number(storefront.maximumPublicProducts || storefront.maxPublicProducts || 30);
  evidence.publicProducts = items.length;
  if (items.length < 8) failures.push('Vitrine comercial precisa ter ao menos 8 produtos aprovados.');
  if (items.length > Math.min(maximum || 30, 30)) failures.push('Vitrine comercial excede 30 produtos públicos.');
  const serialized = JSON.stringify(items).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const forbidden = ['disney', 'frozen', 'totoro', 'pokemon', 'marvel', 'dc comics', 'star wars', 'naruto', 'dragon ball', 'one piece'];
  const hits = forbidden.filter((term) => serialized.includes(term));
  if (hits.length) failures.push(`Termos de propriedade intelectual bloqueados na vitrine: ${hits.join(', ')}`);
  for (const item of items) {
    if (!item || typeof item !== 'object') continue;
    const status = String(item.status || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    const availabilityMode = String(item.availabilityMode || '').toLowerCase();
    const madeToOrder = item.readyToShip === false || status.includes('sob encomenda') || availabilityMode === 'made_to_order';
    if (madeToOrder && availabilityMode !== 'made_to_order') {
      failures.push(`${item.name || item.id || 'produto'}: item sob encomenda precisa declarar availabilityMode=made_to_order.`);
    }
    if (madeToOrder && Number(item.stock || 0) > 0) {
      failures.push(`${item.name || item.id || 'produto'}: estoque numérico não pode representar capacidade fictícia de item sob encomenda.`);
    }
  }
}

const schema = read('prisma/schema.prisma');
for (const model of ['User', 'Product', 'Order', 'Payment']) {
  if (!new RegExp(`model\\s+${model}\\b`).test(schema)) failures.push(`Modelo Prisma obrigatório ausente: ${model}`);
}
containsAny(schema, ['Inventory', 'Stock', 'MaterialInventory'], 'inventário no domínio');
containsAny(schema, ['Shipment', 'Shipping', 'Tracking'], 'envio/rastreamento no domínio');
containsAny(schema, ['Review', 'ProductReview'], 'avaliação no domínio');
containsAny(schema, ['Audit', 'AuditLog'], 'auditoria no domínio');
containsAny(schema, ['Production', 'PrintJob', 'Manufacturing'], 'produção no domínio');

const changedFiles = changedFilesSinceBase();
evidence.changedFilesSinceBase = changedFiles;
const prismaSchemaChanged = changedFiles.includes('prisma/schema.prisma');
const prismaMigrations = changedFiles.filter((file) => file.startsWith('prisma/migrations/'));
const supabaseMigrations = changedFiles.filter((file) => file.startsWith('supabase/migrations/'));
if (prismaSchemaChanged && prismaMigrations.length === 0 && supabaseMigrations.length === 0) {
  failures.push('prisma/schema.prisma mudou sem uma migração versionada correspondente.');
}
if (prismaMigrations.length > 0 && supabaseMigrations.length > 0) {
  failures.push('Migrações Prisma e Supabase foram alteradas juntas; use uma única fonte de migração por mudança.');
}
for (const migration of [...prismaMigrations, ...supabaseMigrations]) {
  const sql = read(migration, false).toLowerCase();
  const statements = sql
    .split(';')
    .map((statement) => statement.replace(/--.*$/gm, ' ').replace(/\s+/g, ' ').trim())
    .filter(Boolean);

  for (const statement of statements) {
    const destructive = [
      /\bdrop\s+(?:table|column|schema|type|database)\b/,
      /\btruncate\b/,
      /\bdelete\s+from\b/,
      /\balter\s+table\b[\s\S]*\bdrop\s+constraint\b/,
      /\balter\s+table\b[\s\S]*\brename\s+(?:column|to)\b/,
      /\balter\s+table\b[\s\S]*\balter\s+column\b[\s\S]*\b(?:set\s+not\s+null|type)\b/,
    ];
    if (destructive.some((pattern) => pattern.test(statement))) {
      failures.push(`Migração potencialmente destrutiva ou incompatível bloqueada: ${migration}`);
      break;
    }
    if (/\balter\s+table\b[\s\S]*\badd\s+(?:column\s+)?[^;]+\bnot\s+null\b/.test(statement) && !/\bdefault\b/.test(statement)) {
      failures.push(`Coluna NOT NULL sem DEFAULT bloqueada para preservar dados existentes: ${migration}`);
      break;
    }
  }
}

existsAny(['app/page.tsx', 'src/app/page.tsx'], 'home');
existsAny(['app/catalogo/page.tsx', 'src/app/catalogo/page.tsx', 'app/loja/page.tsx'], 'catálogo');
existsAny(['app/carrinho/page.tsx', 'src/app/carrinho/page.tsx'], 'carrinho');
existsAny(['app/checkout/page.tsx', 'src/app/checkout/page.tsx'], 'checkout');
existsAny(['app/login/page.tsx', 'src/app/login/page.tsx', 'app/(auth)/login/page.tsx'], 'login');
existsAny(['app/cadastro/page.tsx', 'src/app/cadastro/page.tsx', 'app/(auth)/cadastro/page.tsx'], 'cadastro');
existsAny(['app/conta/page.tsx', 'src/app/conta/page.tsx'], 'conta');
existsAny(['app/admin/page.tsx', 'src/app/admin/page.tsx'], 'admin');
existsAny(['app/api/health/route.ts', 'src/app/api/health/route.ts'], 'health API');

const sourceFiles = [];
for (const base of ['app', 'src', 'lib', 'components']) {
  const absolute = path.join(root, base);
  if (!fs.existsSync(absolute)) continue;
  const stack = [absolute];
  while (stack.length) {
    const current = stack.pop();
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) {
        if (!['node_modules', '.next', 'generated'].includes(entry.name)) stack.push(full);
      } else if (/\.(?:ts|tsx|js|mjs)$/.test(entry.name)) {
        sourceFiles.push(full);
      }
    }
  }
}
const combined = sourceFiles.slice(0, 6000).map((file) => {
  try { return fs.readFileSync(file, 'utf8'); } catch { return ''; }
}).join('\n');

containsAny(combined, ['idempotency', 'idempotent'], 'idempotência de pagamento/webhook');
containsAny(combined, ['x-signature', 'xSignature', 'webhook_secret', 'validateSignature', 'verifySignature'], 'assinatura de webhook');
containsAny(combined, ['rateLimit', 'rate-limit', 'ratelimit'], 'rate limiting');
containsAny(combined, ['application/ld+json', 'ProductJsonLd', '"@type": "Product"', '"@type":"Product"', "'@type': 'Product'", "'@type':'Product'"], 'dados estruturados de produto');
containsAny(combined, ['aria-label', 'aria-describedby', 'focus-visible'], 'acessibilidade explícita');
containsAny(combined, ['recommendation', 'recomendacao', 'recomendação'], 'recomendação');
containsAny(combined, ['assistant', 'assistente', 'ai-chat'], 'assistente/IA');
containsAny(combined, ['analytics', 'trackEvent', 'track('], 'analytics de funil');
containsAny(combined, ['consent', 'consentimento', 'analyticsConsent'], 'consentimento de analytics');
containsAny(combined, ['guest checkout', 'checkoutAsGuest', 'checkout como visitante', 'comprar sem conta'], 'checkout como visitante');
containsAny(combined, ['availabilityMode', 'made_to_order'], 'disponibilidade sem estoque fictício');
containsAny(combined, ['PrintJob', 'production queue', 'fila de producao', 'fila de produção'], 'fila de produção');

for (const file of sourceFiles) {
  let source = '';
  try { source = fs.readFileSync(file, 'utf8'); } catch { continue; }
  if (!/^\s*['"]use client['"];?/m.test(source)) continue;
  if (/(?:SUPABASE_SERVICE_ROLE|SUPABASE_SECRET_KEY|POSTGRES_PASSWORD|ADMIN_PASSWORD_HASH|MERCADOPAGO_ACCESS_TOKEN)/.test(source)) {
    failures.push(`Segredo de servidor referenciado em módulo cliente: ${path.relative(root, file)}`);
  }
}

const allText = combined.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
const fakeTrustPatterns = [
  /mais de\s+\d+[\d.,]*\s+(?:clientes|pedidos|vendas)/,
  /\d+[\d.,]*\s+avaliacoes verificadas/,
  /nota\s+4[,.][89]\s+de\s+5/,
];
for (const pattern of fakeTrustPatterns) {
  if (pattern.test(allText)) failures.push(`Prova social numérica sem fonte verificável bloqueada: ${pattern}`);
}

const forbiddenTracked = ['.env', '.env.local', '.env.production.local', '.vercel/project.json', 'supabase/.temp/project-ref'];
for (const relative of forbiddenTracked) {
  if (fs.existsSync(path.join(root, relative))) warnings.push(`Arquivo sensível presente no worktree; confirme que não será commitado: ${relative}`);
}

const result = {
  generatedAt: new Date().toISOString(),
  score: failures.length === 0 ? 10 : Math.max(0, 10 - failures.length * 0.5),
  failures,
  warnings,
  evidence,
};

fs.mkdirSync(path.join(root, 'output'), { recursive: true });
fs.writeFileSync(path.join(root, 'output', 'industrial-v6-verification.json'), JSON.stringify(result, null, 2));
console.log(JSON.stringify(result, null, 2));
if (failures.length) {
  console.error(`VERIFICAÇÃO INDUSTRIAL V6 REPROVADA: ${failures.length} falha(s).`);
  process.exit(1);
}
console.log('VERIFICAÇÃO INDUSTRIAL V6: OK');
