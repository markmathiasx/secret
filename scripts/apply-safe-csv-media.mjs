import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const ROOT = process.cwd();
const catalogCsvPath = path.join(ROOT, "lib", "catalog-csv-curated.ts");
const catalogPath = path.join(ROOT, "lib", "catalog.ts");
const helperPath = path.join(ROOT, "lib", "csv-curated-media.ts");

async function patchCatalogCsvCurated() {
  let source = await fs.readFile(catalogCsvPath, "utf8");

  const importNeedle = 'import curatedCsvRows from "@/data/catalogo_curado_160_itens_ptbr.json";';
  const importReplacement = 'import curatedCsvRows from "@/data/catalogo_curado_160_itens_ptbr.json";\nimport { getCsvCuratedLocalImages, hasCsvCuratedLocalMedia } from "@/lib/csv-curated-media";';
  if (!source.includes(importNeedle)) {
    throw new Error("Não encontrei o import base em lib/catalog-csv-curated.ts");
  }
  if (!source.includes('from "@/lib/csv-curated-media"')) {
    source = source.replace(importNeedle, importReplacement);
  }

  const toImageListNeedle = `function toImageList(row: CsvRow) {
  const candidates = [row.photo_url_1, row.photo_url_2, row.photo_url_3, row.thumbnail_url]
    .map((value) => value.trim())
    .filter((value) => /^https?:\\/\\//i.test(value) && !/não verificado/i.test(value));

  if (!candidates.length) return [PLACEHOLDER_IMAGE];
  return candidates;
}`;
  const toImageListReplacement = `function toImageList(row: CsvRow) {
  const localImages = getCsvCuratedLocalImages(row.sku.trim());
  if (localImages.length) return localImages;
  return [PLACEHOLDER_IMAGE];
}`;
  if (!source.includes(toImageListReplacement)) {
    if (!source.includes(toImageListNeedle)) {
      throw new Error("Não encontrei a função toImageList original em lib/catalog-csv-curated.ts");
    }
    source = source.replace(toImageListNeedle, toImageListReplacement);
  }

  const unverifiedNeedle = `  const images = toImageList(row);
  const priceLow = toNumber(row.price_low_brl, 19.9);
  const priceMedian = toNumber(row.price_median_brl, Math.max(24.9, priceLow));
  const priceHigh = toNumber(row.price_high_brl, Number((priceMedian * 1.2).toFixed(2)));
  const hours = estimateHoursFromWeight(weightG);
  const unverifiedMedia = hasUnverifiedMedia(row);`;
  const unverifiedReplacement = `  const images = toImageList(row);
  const priceLow = toNumber(row.price_low_brl, 19.9);
  const priceMedian = toNumber(row.price_median_brl, Math.max(24.9, priceLow));
  const priceHigh = toNumber(row.price_high_brl, Number((priceMedian * 1.2).toFixed(2)));
  const hours = estimateHoursFromWeight(weightG);
  const pendingLocalMedia = !hasCsvCuratedLocalMedia(row.sku.trim());
  const unverifiedMedia = pendingLocalMedia || hasUnverifiedMedia(row);`;
  if (!source.includes("pendingLocalMedia")) {
    if (!source.includes(unverifiedNeedle)) {
      throw new Error("Não encontrei o bloco de unverifiedMedia em lib/catalog-csv-curated.ts");
    }
    source = source.replace(unverifiedNeedle, unverifiedReplacement);
  }

  const tagsNeedle = `      ...(unverifiedMedia ? ["midia-nao-verificada"] : []),`;
  const tagsReplacement = `      ...(unverifiedMedia ? ["midia-nao-verificada"] : []),
      ...(pendingLocalMedia ? ["midia-pendente-curadoria"] : []),`;
  if (!source.includes('midia-pendente-curadoria')) {
    if (!source.includes(tagsNeedle)) {
      throw new Error("Não encontrei o bloco de tags de mídia em lib/catalog-csv-curated.ts");
    }
    source = source.replace(tagsNeedle, tagsReplacement);
  }

  await fs.writeFile(catalogCsvPath, source, "utf8");
}

async function patchCatalog() {
  let source = await fs.readFile(catalogPath, "utf8");

  const importNeedle = 'import { csvCuratedCatalog } from "@/lib/catalog-csv-curated";';
  const importReplacement = 'import { csvCuratedCatalog } from "@/lib/catalog-csv-curated";\nimport { getSafePublicCatalog } from "@/lib/csv-curated-media";';
  if (!source.includes(importNeedle)) {
    throw new Error("Não encontrei o import csvCuratedCatalog em lib/catalog.ts");
  }
  if (!source.includes('from "@/lib/csv-curated-media"')) {
    source = source.replace(importNeedle, importReplacement);
  }

  if (source.includes("export const catalog = getSafePublicCatalog(fullCatalog);")) {
    await fs.writeFile(catalogPath, source, "utf8");
    return;
  }

  if (!source.includes("export const catalog = [")) {
    throw new Error("Não encontrei export const catalog = [ em lib/catalog.ts");
  }
  source = source.replace("export const catalog = [", "const fullCatalog = [");

  const tailNeedle = `];
export const featuredCatalog = catalog.filter((item) => item.featured).slice(0, 12);`;
  const tailReplacement = `];
export const catalog = getSafePublicCatalog(fullCatalog);
export const featuredCatalog = catalog.filter((item) => item.featured).slice(0, 12);`;
  if (!source.includes(tailNeedle)) {
    throw new Error("Não encontrei o final do array catalog em lib/catalog.ts");
  }
  source = source.replace(tailNeedle, tailReplacement);

  await fs.writeFile(catalogPath, source, "utf8");
}

async function writeHelper() {
  const helperSource = await fs.readFile(helperPath, "utf8");
  await fs.writeFile(helperPath, helperSource, "utf8");
}

async function main() {
  await writeHelper();
  await patchCatalogCsvCurated();
  await patchCatalog();

  console.log(JSON.stringify({
    ok: true,
    helper: "lib/csv-curated-media.ts",
    patched: [
      "lib/catalog-csv-curated.ts",
      "lib/catalog.ts"
    ],
    note: "Itens CSV sem mídia local curada deixam de aparecer no catálogo público."
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
