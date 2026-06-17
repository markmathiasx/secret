import fs from "node:fs";
import path from "node:path";
import { createProjectRequire, writeJson } from "./catalog/ts-runtime.mjs";

const ROOT = process.cwd();
const require = createProjectRequire();
const { catalog } = require("@/lib/catalog");
const { normalizeMoney } = require("@/lib/payment-pricing");
const { buildMetaCommerceFeedData } = require("@/lib/meta-commerce-feed");
const errors = [];
const warnings = [];

const baselinePath = path.join(ROOT, "reports/industrial-auth-db-baseline.json");
const baseline = fs.existsSync(baselinePath) ? JSON.parse(fs.readFileSync(baselinePath, "utf8")) : null;
const copaExpansionPath = path.join(ROOT, "data/copa-theme-expansion-300.json");
const copaExpansionCount = fs.existsSync(copaExpansionPath) ? JSON.parse(fs.readFileSync(copaExpansionPath, "utf8")).length : 0;
const expectedProductCount = (baseline?.productCount ?? catalog.length - copaExpansionCount) + copaExpansionCount;

if (catalog.length !== expectedProductCount) {
  errors.push({ code: "catalog_count_changed", expected: expectedProductCount, actual: catalog.length });
}

const pricingIssues = [];
for (const product of catalog) {
  const pix = normalizeMoney(product.pricePix);
  const card = normalizeMoney(product.priceCard);
  if (Math.abs(card - pix - 1) > 0.009) {
    pricingIssues.push({ id: product.id, name: product.name, pix, card });
  }
}
if (pricingIssues.length) {
  errors.push({ code: "price_rule_changed", count: pricingIssues.length, sample: pricingIssues.slice(0, 10) });
}

const meta = buildMetaCommerceFeedData();
if (meta.products.length < 1) {
  errors.push({ code: "meta_feed_empty" });
}
if (meta.products.length !== 560) {
  warnings.push({ code: "meta_feed_count_not_560", actual: meta.products.length, skipped: meta.skipped.length });
}

const serializedMeta = meta.products.map((product) => Object.values(product).join(" ")).join("\n");
for (const pattern of [/localhost/i, /127\.0\.0\.1/i, /blob:/i, /data:/i, /\b12x\b/i, /mdh_impressao3d/i, /fotos reais/i, /render fiel/i]) {
  if (pattern.test(serializedMeta)) {
    errors.push({ code: "forbidden_meta_copy", pattern: String(pattern) });
  }
}

const arcade = fs.readFileSync(path.join(ROOT, "components/games/ArcadeHub.tsx"), "utf8");
const miniGames = fs.readFileSync(path.join(ROOT, "components/game/MiniGames.tsx"), "utf8");
const miniGameIds = [...miniGames.matchAll(/id:\s*"([^"]+)"/g)].map((match) => match[1]).filter((id) => id.includes("-"));
const featuredIds = [...arcade.matchAll(/id:\s*"([^"]+)"/g)].map((match) => match[1]).filter((id) => id === "pinball-star" || id === "print-runner");
const allGameIds = Array.from(new Set([...featuredIds, ...miniGameIds]));
if (allGameIds.length !== 11 || !allGameIds.includes("pinball-star")) {
  errors.push({ code: "jogue_games_changed", count: allGameIds.length, games: allGameIds });
}
if (!arcade.includes("GameKeyboardGuard")) {
  errors.push({ code: "jogue_keyboard_guard_missing" });
}

const publicSourceFiles = [];
for (const dir of ["app", "components"]) {
  const stack = [path.join(ROOT, dir)];
  while (stack.length) {
    const current = stack.pop();
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) {
        if (![".next", "node_modules"].includes(entry.name)) stack.push(full);
      } else if (/\.(ts|tsx|js|jsx)$/.test(entry.name)) {
        publicSourceFiles.push(full);
      }
    }
  }
}

for (const file of publicSourceFiles) {
  const rel = path.relative(ROOT, file).replace(/\\/g, "/");
  if (rel.startsWith("app/meta/catalog.csv")) continue;
  const source = fs.readFileSync(file, "utf8");
  for (const forbidden of ["@mdh_impressao3d", "(21) 99999-9999", "fotos reais"]) {
    if (source.includes(forbidden)) {
      errors.push({ code: "forbidden_public_source_copy", file: rel, forbidden });
    }
  }
}

const report = {
  generatedAt: new Date().toISOString(),
  ok: errors.length === 0,
  catalogCount: catalog.length,
  metaProducts: meta.products.length,
  metaSkipped: meta.skipped.length,
  games: allGameIds,
  pricingIssues,
  warnings,
  errors,
};

writeJson("reports/public-regressions-validation-report.json", report);

if (errors.length) {
  console.error(`Falha: ${errors.length} regressao(oes) publica(s).`);
  process.exit(1);
}

console.log(`OK: regressões públicas validadas (${catalog.length} produtos, ${allGameIds.length} jogos).`);
