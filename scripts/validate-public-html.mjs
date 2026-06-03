import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const appBuildDir = path.join(ROOT, ".next", "server", "app");
const reportPath = path.join(ROOT, "reports", "public-html-validation-report.json");

const forbiddenTerms = [
  "Foto real",
  "Fotos reais",
  "foto real",
  "fotos reais",
  "render fiel",
  "Render fiel",
  "Só foto real",
  "Foto + render",
  "Ver peças reais",
  "Fechamento rápido",
  "Preço claro no site",
  "12x de",
];

const htmlFiles = fs.existsSync(appBuildDir)
  ? listFiles(appBuildDir).filter((file) => file.endsWith(".html"))
  : [];

const homeFile = findHtmlFile(htmlFiles, ["index.html", "page.html"]);
const catalogFile = findHtmlFile(htmlFiles, ["catalogo.html", "catalogo/index.html"]);
const checks = [];

if (!homeFile) {
  checks.push({ route: "/", ok: false, reason: "HTML de / não encontrado. Rode npm run build antes." });
} else {
  checks.push(validateRoute("/", homeFile, ["Pix", "Cartão", "WhatsApp"]));
}

if (!catalogFile) {
  checks.push({ route: "/catalogo", ok: false, reason: "HTML de /catalogo não encontrado. Rode npm run build antes." });
} else {
  checks.push(validateRoute("/catalogo", catalogFile, ["<img", "src", "data-product-card", "data-card-image-placeholder", "Comprar", "WhatsApp", "Pix", "Cartão"]));
}

const report = {
  generatedAt: new Date().toISOString(),
  ok: checks.every((check) => check.ok),
  buildDir: path.relative(ROOT, appBuildDir).replaceAll("\\", "/"),
  checks,
};

fs.mkdirSync(path.dirname(reportPath), { recursive: true });
fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");

if (!report.ok) {
  console.error("[validate-public-html] failed");
  for (const check of checks) {
    if (!check.ok) console.error(`- ${check.route}: ${check.reason || check.missing?.join(", ") || "falhou"}`);
  }
  process.exit(1);
}

console.log("[validate-public-html] ok");

function validateRoute(route, file, requiredSignals) {
  const html = fs.readFileSync(file, "utf8");
  const missing = requiredSignals.filter((signal) => !html.includes(signal));
  const forbidden = forbiddenTerms.filter((term) => html.includes(term));
  const imgCount = (html.match(/<img\b/g) || []).length;
  const productCardCount = (html.match(/data-product-card=/g) || []).length;
  return {
    route,
    file: path.relative(ROOT, file).replaceAll("\\", "/"),
    ok: missing.length === 0 && forbidden.length === 0,
    missing,
    forbidden,
    imgCount,
    productCardCount,
  };
}

function findHtmlFile(files, candidates) {
  const normalized = files.map((file) => ({
    file,
    rel: path.relative(appBuildDir, file).replaceAll("\\", "/"),
  }));
  for (const candidate of candidates) {
    const match = normalized.find((item) => item.rel === candidate);
    if (match) return match.file;
  }
  return null;
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
