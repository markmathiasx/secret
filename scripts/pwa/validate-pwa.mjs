import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const reportPath = path.join(ROOT, "reports", "pwa-validation-report.json");

const files = {
  appManifest: path.join(ROOT, "app", "manifest.ts"),
  publicManifest: path.join(ROOT, "public", "manifest.json"),
  serviceWorker: path.join(ROOT, "public", "sw.js"),
  offline: path.join(ROOT, "public", "offline.html"),
  icon192: path.join(ROOT, "public", "icon-192.png"),
  icon512: path.join(ROOT, "public", "icon-512.png"),
};

const publicManifest = readJson(files.publicManifest);
const appManifestText = readText(files.appManifest);
const swText = readText(files.serviceWorker);
const shortcuts = Array.isArray(publicManifest?.shortcuts) ? publicManifest.shortcuts : [];
const shortcutUrls = shortcuts.map((item) => String(item.url || ""));

const checks = [
  check("manifest app route", fs.existsSync(files.appManifest)),
  check("manifest public json", Boolean(publicManifest)),
  check("service worker", fs.existsSync(files.serviceWorker)),
  check("offline fallback", fs.existsSync(files.offline)),
  check("icon 192", fs.existsSync(files.icon192)),
  check("icon 512", fs.existsSync(files.icon512)),
  check("shortcut catalogo", shortcutUrls.includes("/catalogo") && appManifestText.includes("/catalogo")),
  check("shortcut whatsapp", shortcutUrls.some((url) => url.includes("whatsapp") || url.includes("atendimento")) && appManifestText.includes("WhatsApp")),
  check("shortcut jogue", shortcutUrls.includes("/jogue") && appManifestText.includes("/jogue")),
  check("shortcut carrinho", shortcutUrls.includes("/carrinho") && appManifestText.includes("/carrinho")),
  check("static asset cache only", swText.includes("SAFE_DESTINATIONS") && swText.includes("STATIC_ASSET_PATTERN")),
  check("admin not cached", swText.includes('startsWith("/admin")')),
  check("checkout not cached", swText.includes('startsWith("/checkout")')),
];

const report = {
  generatedAt: new Date().toISOString(),
  ok: checks.every((item) => item.ok),
  shortcuts: shortcutUrls,
  checks,
};

writeJson(reportPath, report);

if (!report.ok) {
  console.error("[pwa:validate] failed");
  for (const item of checks.filter((checkItem) => !checkItem.ok)) console.error(`- ${item.name}`);
  process.exit(1);
}

console.log("[pwa:validate] ok");

function check(name, ok) {
  return { name, ok: Boolean(ok) };
}

function readText(file) {
  return fs.existsSync(file) ? fs.readFileSync(file, "utf8") : "";
}

function readJson(file) {
  try {
    return JSON.parse(readText(file));
  } catch {
    return null;
  }
}

function writeJson(file, data) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}
