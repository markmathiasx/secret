import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const exists = (file) => fs.existsSync(path.join(root, file));
const readJson = (file, fallback = null) => {
  try {
    return JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
  } catch {
    return fallback;
  }
};

const requiredFiles = [
  "docs/00_AUDITORIA_TOTAL_MDH3D.md",
  "docs/01_ROTAS_LINKS_ACOES.md",
  "docs/02_CATALOGO_DADOS_PRODUTOS.md",
  "docs/03_RISCOS_SEGURANCA.md",
  "docs/04_SCORE_ANTES_DEPOIS.md",
  "docs/SCORE_COMMERCE_OS.md",
  "data/catalog/product-master-contract.json",
  "data/catalog/route-policy.json",
  "data/priceops/priceops-policy.json",
  "data/channelops/channel-policy.json",
  "data/backupops/backup-policy.json",
  "src/lib/catalog/repository.ts",
  "src/lib/priceops/policy.ts",
  "src/lib/channelops/channels.ts",
  "src/lib/feedops/health.ts",
  "src/lib/apiops/auth.ts",
  "src/config/navigation.ts",
  "app/api/admin/commerce-os/health/route.ts",
  "scripts/score-commerce-os.ts",
  "scripts/commerce-os/backup-catalog.mjs",
  "scripts/commerce-os/rollback-catalog.mjs",
];

const routePolicy = readJson("data/catalog/route-policy.json", {});
const routeToFile = (route) => {
  if (route === "/") return "app/page.tsx";
  return `app${route.replace(/\[slug\]/g, "[slug]").replace(/\[categoria\]/g, "[categoria]")}/page.tsx`;
};
const routeChecks = (routePolicy.officialPublicRoutes || [])
  .filter((route) => !route.includes("[categoria]/[slug]"))
  .map((route) => ({ route, file: routeToFile(route), ok: exists(routeToFile(route)) }));

const reports = {
  publicRegressions: readJson("reports/public-regressions-validation-report.json", {}),
  feed: readJson("reports/meta-commerce-feed-report.json", {}),
  security: readJson("reports/security-audit-report.json", {}),
  secrets: readJson("reports/git-secret-scan-report.json", {}),
  pricing: readJson("reports/pricing-validation-report.json", {}),
};
const officialCatalogCount = Number(reports.publicRegressions.catalogCount || 0);
const expectedMetaProducts = Math.max(1, Number(reports.feed.publicProducts || 0) - Number(reports.feed.skippedProducts || 0));

const checks = [
  ...requiredFiles.map((file) => ({ id: `file:${file}`, ok: exists(file), detail: file })),
  ...routeChecks.map((item) => ({ id: `route:${item.route}`, ok: item.ok, detail: item.file })),
  { id: "catalog:official-public-count", ok: officialCatalogCount > 0, detail: officialCatalogCount },
  { id: "games:11", ok: reports.publicRegressions.games?.length === 11, detail: reports.publicRegressions.games?.length },
  { id: "feed:ok", ok: reports.feed.ok === true && reports.feed.productsInFeed >= expectedMetaProducts, detail: `${reports.feed.productsInFeed}/${expectedMetaProducts}` },
  { id: "security:ok", ok: reports.security.ok === true, detail: reports.security.generatedAt },
  { id: "secrets:ok", ok: reports.secrets.ok === true, detail: reports.secrets.commitsScanned },
  { id: "pricing:ok", ok: reports.pricing.ok === true && reports.pricing.productsChecked >= officialCatalogCount, detail: reports.pricing.productsChecked },
];

const failed = checks.filter((check) => !check.ok);
const output = {
  generatedAt: new Date().toISOString(),
  ok: failed.length === 0,
  total: checks.length,
  failed,
  checks,
};

fs.mkdirSync(path.join(root, "reports"), { recursive: true });
fs.writeFileSync(path.join(root, "reports/commerce-os-static-validation-report.json"), `${JSON.stringify(output, null, 2)}\n`);

if (failed.length) {
  console.error(`Commerce OS static validation failed: ${failed.length}/${checks.length}`);
  process.exit(1);
}

console.log(`OK: Commerce OS static validation passed (${checks.length} checks).`);
