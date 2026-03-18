#!/usr/bin/env node
/**
 * apply-image-map.mjs
 *
 * Uso:
 *   node apply-image-map.mjs <caminhoCatalogTs> <caminhoMapJson>
 *
 * O script:
 * - procura objetos com `id: 'xxx'`
 * - se encontrar `images: [...]`, troca o 1º item por `map[id]`
 * - se encontrar `image: '...'`, substitui por `map[id]`
 *
 * Compatível com TS "formatado", sem AST.
 */
import fs from "node:fs";
import path from "node:path";

const [,, catalogPath, mapPath] = process.argv;

if (!catalogPath || !mapPath) {
  console.error("Uso: node apply-image-map.mjs <catalog.ts> <map.json>");
  process.exit(1);
}

const catalogAbs = path.resolve(process.cwd(), catalogPath);
const mapAbs = path.resolve(process.cwd(), mapPath);

if (!fs.existsSync(catalogAbs)) {
  console.error("Não encontrei:", catalogAbs);
  process.exit(1);
}
if (!fs.existsSync(mapAbs)) {
  console.error("Não encontrei:", mapAbs);
  process.exit(1);
}

const map = JSON.parse(fs.readFileSync(mapAbs, "utf8"));
let src = fs.readFileSync(catalogAbs, "utf8");

let changed = 0;

for (const [id, imgPath] of Object.entries(map)) {
  // atualiza `image: '...'` perto do id
  const imageRe = new RegExp(
    String.raw`(id\s*:\s*['"]${id}['"][\s\S]{0,800}?image\s*:\s*)['"][^'"]*['"]`,
    "g"
  );
  src = src.replace(imageRe, (m, p1) => {
    changed++;
    return `${p1}'${imgPath}'`;
  });

  // atualiza primeiro item de `images: [...]` perto do id
  const imagesRe = new RegExp(
    String.raw`(id\s*:\s*['"]${id}['"][\s\S]{0,1200}?images\s*:\s*\[\s*)(['"][^'"]*['"])([\s\S]*?\])`,
    "g"
  );
  src = src.replace(imagesRe, (m, p1, first, rest) => {
    changed++;
    return `${p1}'${imgPath}'${rest}`;
  });
}

fs.writeFileSync(catalogAbs, src, "utf8");
console.log(`OK. Atualizações aplicadas: ${changed}`);
