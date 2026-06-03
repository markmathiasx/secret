import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const reportPath = path.join(ROOT, "reports", "ux-validation-report.json");

const files = {
  rotatingHero: path.join(ROOT, "components", "home", "RotatingProductHero.tsx"),
  productCard: path.join(ROOT, "components", "product", "PremiumCard.tsx"),
  catalog: path.join(ROOT, "app", "catalogo", "page.tsx"),
  game: path.join(ROOT, "components", "game", "PrintQuestGame.tsx"),
  dock: path.join(ROOT, "components", "route-action-dock.tsx"),
  video: path.join(ROOT, "components", "media", "CinematicVideoBackground.tsx"),
};

const text = Object.fromEntries(Object.entries(files).map(([key, file]) => [key, readText(file)]));

const checks = [
  check("home rotating every 3000ms", text.rotatingHero.includes("ROTATION_MS = 3000") && text.rotatingHero.includes("setInterval")),
  check("home carousel controls", text.rotatingHero.includes("Produto anterior") && text.rotatingHero.includes("Próximo produto") && text.rotatingHero.includes("aria-current")),
  check("home pause hover focus", text.rotatingHero.includes("onMouseEnter") && text.rotatingHero.includes("onFocusCapture")),
  check("reduced motion", text.rotatingHero.includes("useReducedMotion") && text.video.includes("motion-reduce:hidden")),
  check("card image fallback", text.productCard.includes("<img") && text.productCard.includes("onError") && text.productCard.includes("PRODUCT_CARD_PLACEHOLDER")),
  check("card conversion ctas", text.productCard.includes("Comprar") && text.productCard.includes("WhatsApp") && text.productCard.includes("Ver produto")),
  check("catalog search", text.catalog.includes("catalog-search") && text.catalog.includes("Ctrl+K")),
  check("catalog price chips", text.catalog.includes("Até R$ 29,90") && text.catalog.includes("Premium e sob medida")),
  check("game exists", text.game.includes("Print Quest") && text.game.includes("data-print-quest-game")),
  check("bottom dock game", text.dock.includes("/jogue") && text.dock.includes("Gamepad2")),
  check("video metadata", text.video.includes('preload="metadata"') && text.video.includes("playsInline") && text.video.includes("muted")),
];

const report = {
  generatedAt: new Date().toISOString(),
  ok: checks.every((item) => item.ok),
  checks,
};

writeJson(reportPath, report);

if (!report.ok) {
  console.error("[ux:validate] failed");
  for (const item of checks.filter((checkItem) => !checkItem.ok)) console.error(`- ${item.name}`);
  process.exit(1);
}

console.log("[ux:validate] ok");

function check(name, ok) {
  return { name, ok: Boolean(ok) };
}

function readText(file) {
  return fs.existsSync(file) ? fs.readFileSync(file, "utf8") : "";
}

function writeJson(file, data) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}
