import fs from "node:fs";
import path from "node:path";
import { ROOT, writeJson } from "./ts-runtime.mjs";

const legacyPhone = ["(21) 99", "999-9999"].join("");
const legacyInstagram = ["mdh_", "impressao", "3d"].join("");

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
  "Peças reais",
  "Fechamento rápido",
  "Preço claro no site",
  "Preço claro",
  "Preço auditado",
  "Simulação ativa",
  "12x de",
  legacyPhone,
  "Peça já produzida",
  "visual fiel do produto final",
  legacyInstagram,
  "Pokémon",
  "Pokemon",
  "Fire Red",
  "Nintendo",
  "Game Boy",
];

const roots = [
  path.join(ROOT, "app"),
  path.join(ROOT, "components"),
  path.join(ROOT, "lib"),
];

const files = listFiles(roots).filter((file) => {
  const rel = relative(file);
  if (!/\.(tsx?|jsx?)$/.test(file)) return false;
  if (rel.startsWith("lib/") && !/^lib\/seo/i.test(rel) && !/^lib\/product-visuals/.test(rel)) {
    return false;
  }
  return true;
});

const matches = [];

for (const file of files) {
  const text = fs.readFileSync(file, "utf8");
  const lines = text.split(/\r?\n/);
  for (const term of forbiddenTerms) {
    for (let index = 0; index < lines.length; index += 1) {
      if (lines[index].includes(term)) {
        matches.push({
          file: relative(file),
          line: index + 1,
          term,
          excerpt: lines[index].trim().slice(0, 240),
        });
      }
    }
  }
}

const report = {
  generatedAt: new Date().toISOString(),
  ok: matches.length === 0,
  scannedFiles: files.length,
  forbiddenTermCount: forbiddenTerms.length,
  matches,
};

writeJson("reports/public-copy-validation-report.json", report);

if (matches.length) {
  console.error(`Falha: ${matches.length} ocorrências de copy pública proibida.`);
  for (const match of matches.slice(0, 40)) {
    console.error(`- ${match.file}:${match.line} ${match.term}`);
  }
  process.exit(1);
}

console.log(`OK: ${files.length} arquivos públicos sem copy proibida.`);

function listFiles(rootPaths) {
  const files = [];
  for (const rootPath of rootPaths) {
    if (fs.existsSync(rootPath)) walk(rootPath, files);
  }
  return files;
}

function walk(dir, files) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (["node_modules", ".next", ".git"].includes(entry.name)) continue;
      walk(full, files);
    } else {
      files.push(full);
    }
  }
}

function relative(file) {
  return path.relative(ROOT, file).replaceAll("\\", "/");
}
