import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";
import { createProjectRequire } from "../../../scripts/catalog/ts-runtime.mjs";

const apply = process.argv.includes("--apply");
if (apply && !process.env.DATABASE_URL) throw new Error("DATABASE_URL required for --apply");

const require = createProjectRequire();
const { publicCatalog, directSaleCatalog } = require("@/lib/public-catalog");
const {
  getCatalogGameIdentity,
  isCatalogChibiProduct,
  isCatalogGameProduct,
  isCatalogHomeProduct,
  isCatalogKeychainProduct,
} = require("@/lib/catalog-filters");

const siteOrigin = (process.env.CATALOG_SITE_ORIGIN || "https://www.mdh3d.com.br").replace(/\/$/, "");
const reportArgument = process.argv.find((item) => item.startsWith("--report="));
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const reportPath = path.resolve(root, reportArgument?.slice(9) || "output/native-marketplace-catalog-import.json");

function stableUuid(value) {
  const bytes = createHash("sha256").update(`mdh3d:${value}`).digest().subarray(0, 16);
  bytes[6] = (bytes[6] & 0x0f) | 0x50;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = bytes.toString("hex");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

function publicUrl(value) {
  if (!value) return null;
  const url = new URL(value, `${siteOrigin}/`);
  return url.protocol === "https:" && !url.username && !url.password ? url.toString() : null;
}

function categoryFor(product) {
  if (isCatalogKeychainProduct(product)) return "Chaveiros";
  if (isCatalogChibiProduct(product)) return "Chibis";
  if (isCatalogHomeProduct(product)) return "Casa e Organização";
  if (isCatalogGameProduct(product)) return "Games";
  if (product.customizable || /personaliz/i.test(`${product.primaryCategory} ${product.category}`)) return "Personalizados";
  if (/setup|home office|decora/i.test(`${product.primaryCategory} ${product.category}`)) return "Casa e Organização";
  return "Colecionáveis";
}

function importRecord(product) {
  const gameIdentity = getCatalogGameIdentity(product);
  const imageUrl = publicUrl(product.images?.[0] || product.image);
  const priceCents = Math.round(Number(product.pricePix) * 100);
  if (!imageUrl) throw new Error(`missing secure image: ${product.id}`);
  if (!Number.isSafeInteger(priceCents) || priceCents < 1) throw new Error(`invalid price: ${product.id}`);
  return {
    id: stableUuid(`product:${product.id}`),
    legacyId: product.id,
    slug: product.slug || product.id,
    category: categoryFor(product),
    title: product.name,
    description: product.description || "",
    priceCents,
    stock: Number.isSafeInteger(product.stock) && product.stock >= 0 ? product.stock : 0,
    imageUrl,
    productType: product.objectType || null,
    game: gameIdentity?.universe || null,
    character: gameIdentity?.characters?.[0] || null,
    tags: [...new Set((product.tags || []).filter((tag) => typeof tag === "string" && tag.trim()).map((tag) => tag.trim()))],
    sourceUrl: `${siteOrigin}/catalogo/${encodeURIComponent(product.slug || product.id)}`,
  };
}

const accepted = [];
const rejected = publicCatalog
  .filter((product) => !directSaleCatalog.some((candidate) => candidate.id === product.id))
  .map((product) => ({ id: product.id, reason: "commercial_media_review_required" }));
for (const product of directSaleCatalog) {
  try {
    accepted.push(importRecord(product));
  } catch (error) {
    rejected.push({ id: product.id, reason: error.message });
  }
}

if (apply) {
  const db = new pg.Client({ connectionString: process.env.DATABASE_URL });
  await db.connect();
  try {
    await db.query("BEGIN");
    await db.query(
      "INSERT INTO mdh_marketplace.users(id,email,role) VALUES('mdh-catalog-importer',NULL,'seller') ON CONFLICT(id) DO UPDATE SET disabled=false",
    );
    for (const name of [...new Set(accepted.map((item) => item.category))]) {
      await db.query(
        "INSERT INTO mdh_marketplace.categories(id,name) VALUES($1,$2) ON CONFLICT(id) DO UPDATE SET name=EXCLUDED.name",
        [stableUuid(`category:${name}`), name],
      );
    }
    for (const item of accepted) {
      await db.query(
        `INSERT INTO mdh_marketplace.products(
          id,legacy_id,slug,seller_id,category_id,title,description,price_cents,stock,image_url,model_url,published,
          product_type,game,character_name,tags,source_url,media_commercial_use,updated_at
        ) VALUES($1,$2,$3,'mdh-catalog-importer',$4,$5,$6,$7,$8,$9,NULL,true,$10,$11,$12,$13,$14,'verified',now())
        ON CONFLICT(legacy_id) WHERE legacy_id IS NOT NULL DO UPDATE SET
          slug=EXCLUDED.slug,category_id=EXCLUDED.category_id,title=EXCLUDED.title,description=EXCLUDED.description,
          price_cents=EXCLUDED.price_cents,stock=EXCLUDED.stock,image_url=EXCLUDED.image_url,product_type=EXCLUDED.product_type,
          game=EXCLUDED.game,character_name=EXCLUDED.character_name,tags=EXCLUDED.tags,source_url=EXCLUDED.source_url,
          media_commercial_use=EXCLUDED.media_commercial_use,updated_at=now()`,
        [
          item.id,
          item.legacyId,
          item.slug,
          stableUuid(`category:${item.category}`),
          item.title,
          item.description,
          item.priceCents,
          item.stock,
          item.imageUrl,
          item.productType,
          item.game,
          item.character,
          item.tags,
          item.sourceUrl,
        ],
      );
    }
    await db.query("COMMIT");
  } catch (error) {
    await db.query("ROLLBACK");
    throw error;
  } finally {
    await db.end();
  }
}

const report = {
  mode: apply ? "apply" : "dry-run",
  source: "lib/public-catalog.ts:directSaleCatalog",
  sourceTotal: publicCatalog.length,
  accepted: accepted.length,
  rejected: rejected.length,
  categories: Object.fromEntries(
    [...new Set(accepted.map((item) => item.category))]
      .sort()
      .map((category) => [category, accepted.filter((item) => item.category === category).length]),
  ),
  rejectedItems: rejected,
};
await mkdir(path.dirname(reportPath), { recursive: true });
await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
console.log(JSON.stringify({ ...report, rejectedItems: undefined, reportPath }, null, 2));
