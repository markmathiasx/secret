import fs from "node:fs";
import path from "node:path";
import { createProjectRequire, ROOT, writeJson } from "./catalog/ts-runtime.mjs";

const require = createProjectRequire();
const { catalog } = require("@/lib/catalog");
const { COMMERCIAL_STOREFRONT_CONFIG } = require("@/lib/commercial-catalog-policy");

const publicRoots = ["app", "components", "lib"].map((root) => path.join(ROOT, root));
const files = [];
for (const root of publicRoots) walk(root, files);

const forbiddenTerms = [
  ["Foto", "real"].join(" "),
  ["fotos", "reais"].join(" "),
  ["render", "fiel"].join(" "),
  "Fechamento rápido",
  "Preço claro no site",
  "Preço auditado",
  "Simulação ativa",
  ["12x", "de"].join(" "),
  ["mdh_", "impressao", "3d"].join(""),
  ["(21) 99", "999-9999"].join(""),
  ["$500K", "ARCHITECTURE"].join(" "),
  ["QUANTUM", "RESISTANT"].join("-"),
  "receita falsa",
  "ameaças bloqueadas fake",
  "cluster falso",
  "uptime falso",
];

const errors = [];
const matches = [];
const expectedPublicProducts = Number(COMMERCIAL_STOREFRONT_CONFIG.maximumPublicProducts || 12);

for (const file of files) {
  const relative = path.relative(ROOT, file).replaceAll("\\", "/");
  if (!/\.(ts|tsx|js|jsx)$/.test(file)) continue;
  if (relative.startsWith("lib/catalog.ts")) continue;
  const text = fs.readFileSync(file, "utf8");
  const lines = text.split(/\r?\n/);
  forbiddenTerms.forEach((term) => {
    lines.forEach((line, index) => {
      if (line.includes(term)) {
        matches.push({ file: relative, line: index + 1, term });
      }
    });
  });
}

const arcade = fs.readFileSync(path.join(ROOT, "components/games/ArcadeHub.tsx"), "utf8");
const metaRouteExists = fs.existsSync(path.join(ROOT, "app/meta/catalog.csv/route.ts"));
const supportPage = fs.readFileSync(path.join(ROOT, "app/atendimento/page.tsx"), "utf8");
const layout = fs.readFileSync(path.join(ROOT, "app/layout.tsx"), "utf8");
const sitemap = fs.readFileSync(path.join(ROOT, "app/sitemap.ts"), "utf8");

if (matches.length) errors.push(`${matches.length} termo(s) publico(s) proibido(s) encontrado(s)`);
if (!metaRouteExists) errors.push("feed Meta route ausente");
if (!arcade.includes("11 experiências ativas")) errors.push("/jogue sem indicacao de 11 jogos");
if (!arcade.includes("Pinball Star")) errors.push("Pinball Star ausente");
if (!arcade.includes("Print Runner 3D")) errors.push("Print Runner ausente");
if (!supportPage.includes("catálogo real") || !supportPage.includes("Central de Atendimento MDH 3D")) errors.push("/atendimento sem central de catalogo real");
if (!layout.includes("Organization") || !layout.includes("WebSite")) errors.push("JSON-LD Organization/WebSite ausente");
if (!sitemap.includes("/jogue") || !sitemap.includes("/atendimento")) errors.push("sitemap sem rotas criticas");
if (catalog.length !== expectedPublicProducts) {
  errors.push(`catalogo publico fora da curadoria industrial: ${catalog.length}/${expectedPublicProducts} produtos`);
}

writeJson("reports/public-trust-validation-report.json", {
  generatedAt: new Date().toISOString(),
  ok: errors.length === 0,
  catalogProducts: catalog.length,
  expectedPublicProducts,
  matches,
  errors,
});

if (errors.length) {
  console.error("Falha em validate-public-trust:");
  errors.forEach((error) => console.error(`- ${error}`));
  matches.slice(0, 20).forEach((match) => console.error(`  ${match.file}:${match.line} ${match.term}`));
  process.exit(1);
}

console.log("OK: confianca publica, jogos, feed Meta e catalogo preservados.");

function walk(dir, output) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (["node_modules", ".next", ".git"].includes(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, output);
    else output.push(full);
  }
}
