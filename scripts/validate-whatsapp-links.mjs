import fs from "node:fs";
import path from "node:path";
import { createProjectRequire, ROOT, writeJson } from "./catalog/ts-runtime.mjs";

const require = createProjectRequire();
const { whatsappNumber, socialLinks, supportEmail } = require("@/lib/constants");

const roots = ["app", "components", "lib"].map((root) => path.join(ROOT, root));
const files = [];
for (const root of roots) walk(root, files);

const officialPhone = String(whatsappNumber).replace(/\D/g, "");
const placeholderPhone = ["(21) 99", "999-9999"].join("");
const oldInstagram = ["mdh_", "impressao", "3d"].join("");
const errors = [];
let officialPhoneHits = 0;
let instagramHits = 0;

for (const file of files) {
  const relative = path.relative(ROOT, file).replaceAll("\\", "/");
  if (!/\.(ts|tsx|js|jsx)$/.test(file)) continue;
  if (/scripts|node_modules|\.next/.test(relative)) continue;
  const text = fs.readFileSync(file, "utf8");
  if (text.includes(officialPhone)) officialPhoneHits += 1;
  if (text.includes(socialLinks.instagram)) instagramHits += 1;
  if (text.includes(placeholderPhone)) errors.push(`${relative}: telefone placeholder encontrado`);
  if (text.includes(oldInstagram)) errors.push(`${relative}: instagram antigo encontrado`);
}

if (!officialPhone || officialPhone.length < 12) errors.push("whatsapp oficial invalido");
if (!supportEmail || !supportEmail.includes("@")) errors.push("email de suporte invalido");
if (!socialLinks.instagram.includes("mdh_3d.com.br")) errors.push("instagram oficial incorreto");
if (officialPhoneHits === 0) errors.push("whatsapp oficial nao aparece em codigo publico");
if (instagramHits === 0) errors.push("instagram oficial nao aparece em codigo publico");

writeJson("reports/whatsapp-links-validation-report.json", {
  generatedAt: new Date().toISOString(),
  ok: errors.length === 0,
  officialPhoneHits,
  instagramHits,
  errors,
});

if (errors.length) {
  console.error("Falha em validate-whatsapp-links:");
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log("OK: WhatsApp, Instagram e email reais validados.");

function walk(dir, output) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (["node_modules", ".next", ".git"].includes(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, output);
    else output.push(full);
  }
}
