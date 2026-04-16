import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const ROOT = process.cwd();
const csvPath = path.join(ROOT, "data", "catalogo_curado_160_itens_ptbr.json");
const publicDir = path.join(ROOT, "public", "products", "csv-curated");

function normalizeSku(sku) {
  return String(sku || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-");
}

async function hasLocalMedia(sku) {
  const dir = path.join(publicDir, normalizeSku(sku));
  try {
    const entries = await fs.readdir(dir);
    return entries.some((name) => /\.(webp|png|jpg|jpeg)$/i.test(name));
  } catch {
    return false;
  }
}

async function main() {
  const rows = JSON.parse(await fs.readFile(csvPath, "utf8"));
  const report = [];

  for (const row of rows) {
    const local = await hasLocalMedia(row.sku);
    report.push({
      sku: row.sku,
      title_pt: row.title_pt,
      category: row.category,
      hasLocalMedia: local
    });
  }

  const pending = report.filter((item) => !item.hasLocalMedia);
  console.log(JSON.stringify({
    totalCsvItems: report.length,
    pendingCsvItems: pending.length,
    pending: pending.slice(0, 200)
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
