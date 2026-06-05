import fs from "node:fs";
import path from "node:path";
import { createProjectRequire } from "./catalog/ts-runtime.mjs";

const ROOT = process.cwd();
const appBuildDir = path.join(ROOT, ".next", "server", "app");
const reportPath = path.join(ROOT, "reports", "local-vs-production-validation-report.json");
const require = createProjectRequire();
const { catalog, getProductUrl } = require("@/lib/catalog");

const productionArg = process.argv.find((arg) => arg.startsWith("--production="));
const productionBase = productionArg ? productionArg.slice("--production=".length).replace(/\/$/, "") : null;
const legacyInstagram = ["mdh_", "impressao", "3d"].join("");
const legacyPhotoSingular = ["Foto", "real"].join(" ");
const legacyPhotoPlural = ["Fotos", "reais"].join(" ");
const legacyPhotoLower = legacyPhotoSingular.toLowerCase();
const legacyPhotosLower = legacyPhotoPlural.toLowerCase();
const legacyRender = ["render", "fiel"].join(" ");
const legacyRenderTitle = legacyRender.charAt(0).toUpperCase() + legacyRender.slice(1);
const legacyInstallments = ["12x", "de"].join(" ");

const forbiddenTerms = [
  legacyPhotoSingular,
  legacyPhotoPlural,
  legacyPhotoLower,
  legacyPhotosLower,
  legacyRender,
  legacyRenderTitle,
  ["Só", legacyPhotoLower].join(" "),
  "Foto + render",
  "Ver peças reais",
  "Fechamento rápido",
  "Preço claro",
  "Preço auditado",
  "Simulação ativa",
  legacyInstallments,
  "12x no cartão",
  legacyInstagram,
  "Pokémon",
  "Pokemon",
  "Fire Red",
  "Nintendo",
  "Game Boy",
  "Subway Surfers",
];

const productRoutes = catalog.slice(0, 3).map((product) => getProductUrl(product));
const routes = [
  { route: "/", signals: ["mdh_3d.com.br", "Jogue no site", "Comprar", "WhatsApp", "Pix", "Cartão", "Cartão + R$ 1", "data-rotating-product-hero"] },
  { route: "/catalogo", signals: ["<img", "src", "data-product-card", "Comprar", "WhatsApp", "Pix", "Cartão", "Cartão + R$ 1"] },
  { route: "/jogue", signals: ["Print Runner", "Filament Catcher", "Jogar", "WhatsApp"] },
  ...productRoutes.map((route) => ({ route, signals: ["<img", "Pix", "Cartão", "Cartão + R$ 1", "WhatsApp", "Comprar"] })),
  { route: "/carrinho", signals: ["Carrinho"] },
  { route: "/checkout", signals: ["Checkout"] },
  { route: "/admin/products/real-002/edit", signals: ["<html"] },
];

const localChecks = validateLocalBuild(routes);
const productionChecks = productionBase ? await validateProduction(productionBase, routes) : [];

const report = {
  generatedAt: new Date().toISOString(),
  productionBase,
  ok: localChecks.every((item) => item.ok) && productionChecks.every((item) => item.ok),
  forbiddenTermCount: forbiddenTerms.length,
  localChecks,
  productionChecks,
};

writeJson(reportPath, report);

if (!report.ok) {
  console.error("[public:validate-html] failed");
  for (const item of [...localChecks, ...productionChecks].filter((check) => !check.ok)) {
    console.error(`- ${item.scope} ${item.route}: ${item.reason || item.missing?.join(", ") || item.forbidden?.join(", ") || item.status}`);
  }
  process.exit(1);
}

console.log(productionBase ? "[public:validate-html] local and production ok" : "[public:validate-html] local build ok");

function validateLocalBuild(routeSpecs) {
  const htmlFiles = fs.existsSync(appBuildDir) ? listFiles(appBuildDir).filter((file) => file.endsWith(".html")) : [];
  return routeSpecs.map((spec) => {
    const file = findHtmlForRoute(htmlFiles, spec.route);
    if (!file) {
      if (spec.route.startsWith("/admin/") || spec.route.startsWith("/checkout")) {
        return { scope: "local", route: spec.route, ok: true, skipped: true, reason: "dynamic/protected route validated after deploy" };
      }
      return { scope: "local", route: spec.route, ok: false, reason: "HTML local não encontrado; rode npm run build antes." };
    }
    return validateHtml("local", spec.route, fs.readFileSync(file, "utf8"), spec.signals, path.relative(ROOT, file).replaceAll("\\", "/"));
  });
}

async function validateProduction(baseUrl, routeSpecs) {
  const checks = [];
  for (const spec of routeSpecs) {
    const url = `${baseUrl}${spec.route}`;
    try {
      const html = await fetchText(url);
      checks.push(validateHtml("production", spec.route, html, spec.signals, url));
    } catch (error) {
      checks.push({ scope: "production", route: spec.route, ok: false, reason: error instanceof Error ? error.message : "fetch failed", url });
    }
  }
  return checks;
}

function validateHtml(scope, route, html, signals, source) {
  const missing = signals.filter((signal) => !html.includes(signal));
  const forbidden = forbiddenTerms.filter((term) => html.includes(term));
  const imgCount = (html.match(/<img\b/g) || []).length;
  const productCardCount = (html.match(/data-product-card=/g) || []).length;
  return {
    scope,
    route,
    source,
    ok: missing.length === 0 && forbidden.length === 0,
    missing,
    forbidden,
    imgCount,
    productCardCount,
  };
}

function findHtmlForRoute(files, route) {
  const normalizedRoute = route === "/" ? "index" : route.replace(/^\//, "").replace(/\/$/, "");
  const candidates = [
    `${normalizedRoute}.html`,
    `${normalizedRoute}/index.html`,
    `${normalizedRoute}/page.html`,
  ];
  const normalized = files.map((file) => ({
    file,
    rel: path.relative(appBuildDir, file).replaceAll("\\", "/"),
  }));
  return normalized.find((item) => candidates.includes(item.rel))?.file || null;
}

async function fetchText(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    const response = await fetch(url, {
      redirect: "follow",
      headers: { "user-agent": "MDH3D-public-validator/1.0" },
      signal: controller.signal,
    });
    const text = await response.text();
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return text;
  } finally {
    clearTimeout(timeout);
  }
}

function listFiles(dir) {
  const files = [];
  walk(dir, files);
  return files;
}

function walk(dir, files) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else files.push(full);
  }
}

function writeJson(file, data) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}
