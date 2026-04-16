import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const ROOT = process.cwd();
const targets = [
  path.join(ROOT, "package.json"),
  path.join(ROOT, "data", "catalog-photo-manifest.json"),
];

for (const filePath of targets) {
  try {
    let content = await fs.readFile(filePath, "utf8");
    if (content.charCodeAt(0) === 0xFEFF) {
      content = content.slice(1);
      await fs.writeFile(filePath, content, "utf8");
      console.log(`BOM removido: ${path.relative(ROOT, filePath)}`);
    } else {
      console.log(`Sem BOM: ${path.relative(ROOT, filePath)}`);
    }
  } catch (error) {
    console.log(`Ignorado: ${path.relative(ROOT, filePath)} (${error.code || error.message})`);
  }
}
