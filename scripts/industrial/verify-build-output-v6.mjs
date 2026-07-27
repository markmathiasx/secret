import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const nextRoot = path.join(root, '.next');
const outputRoot = path.join(root, 'output');
const failures = [];
const warnings = [];

function readJson(relative, required = true) {
  const file = path.join(root, relative);
  if (!fs.existsSync(file)) {
    if (required) failures.push(`Artefato de build ausente: ${relative}`);
    return null;
  }
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (error) {
    failures.push(`JSON de build inválido em ${relative}: ${error.message}`);
    return null;
  }
}

if (!fs.existsSync(nextRoot)) failures.push('Diretório .next ausente; execute next build antes deste portão.');

const appPaths = readJson('.next/server/app-paths-manifest.json', false) || {};
const pages = readJson('.next/server/pages-manifest.json', false) || {};
const routes = readJson('.next/routes-manifest.json', false) || {};
const prerender = readJson('.next/prerender-manifest.json', false) || {};

const routeNames = new Set([
  ...Object.keys(appPaths),
  ...Object.keys(pages),
  ...Object.keys(prerender.routes || {}),
  ...(routes.staticRoutes || []).map((route) => route.page || route.regex || route.namedRegex).filter(Boolean),
  ...(routes.dynamicRoutes || []).map((route) => route.page || route.regex || route.namedRegex).filter(Boolean),
]);

const routeCount = routeNames.size;
const maximumRouteBudget = 1900;
if (routeCount === 0) failures.push('Nenhuma rota foi encontrada nos manifestos do build.');
if (routeCount > maximumRouteBudget) {
  failures.push(`Build excede o orçamento preventivo de rotas: ${routeCount} > ${maximumRouteBudget}. Reduza geração estática de catálogo e páginas duplicadas.`);
}

const chunkRoot = path.join(nextRoot, 'static', 'chunks');
const oversizedChunks = [];
let chunkBytes = 0;
if (fs.existsSync(chunkRoot)) {
  const stack = [chunkRoot];
  while (stack.length) {
    const current = stack.pop();
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) stack.push(full);
      else if (entry.name.endsWith('.js')) {
        const size = fs.statSync(full).size;
        chunkBytes += size;
        if (size > 1_500_000) oversizedChunks.push({ file: path.relative(root, full), bytes: size });
      }
    }
  }
}
if (oversizedChunks.length) {
  failures.push(`Chunks JavaScript individuais acima de 1,5 MB: ${oversizedChunks.map((item) => item.file).join(', ')}`);
}
if (chunkBytes > 30_000_000) warnings.push(`Volume total de chunks JavaScript elevado: ${(chunkBytes / 1_000_000).toFixed(2)} MB.`);

const result = {
  generatedAt: new Date().toISOString(),
  routeCount,
  maximumRouteBudget,
  chunkBytes,
  oversizedChunks,
  failures,
  warnings,
};

fs.mkdirSync(outputRoot, { recursive: true });
fs.writeFileSync(path.join(outputRoot, 'industrial-v6-build-output.json'), `${JSON.stringify(result, null, 2)}\n`, 'utf8');
console.log(JSON.stringify(result, null, 2));
if (failures.length) {
  console.error(`BUILD INDUSTRIAL V6 REPROVADO: ${failures.length} falha(s).`);
  process.exit(1);
}
console.log('BUILD INDUSTRIAL V6: OK');
