import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import sharp from "sharp";
import { eq } from "drizzle-orm";
import { getDb, isDatabaseConfigured } from "@/db/client";
import { catalog } from "@/lib/catalog";
import { catalogImageMappings, products } from "@/db/schema";
import { makeProductPlaceholder } from "@/lib/product-media";

type SearchHit = {
  provider: string;
  url: string;
  sourceUrl: string;
  query: string;
};

type ImageReportEntry = {
  productId: string;
  slug: string;
  sku: string;
  provider: string;
  status: "imported" | "placeholder" | "failed";
  localPath: string;
  sourceUrl: string;
  query: string;
};

const refresh = process.argv.includes("--refresh");

async function searchOpenverse(query: string): Promise<SearchHit | null> {
  const baseUrl = process.env.OPENVERSE_BASE_URL || "https://api.openverse.org/v1/images/";
  const url = new URL(baseUrl);
  url.searchParams.set("q", query);
  url.searchParams.set("license_type", "commercial");
  url.searchParams.set("page_size", "1");

  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) return null;

  const data = await response.json();
  const hit = data?.results?.[0];
  if (!hit?.url) return null;

  return {
    provider: "openverse",
    url: hit.thumbnail || hit.url,
    sourceUrl: hit.foreign_landing_url || hit.url,
    query
  };
}

async function searchWikimedia(query: string): Promise<SearchHit | null> {
  const url = new URL(process.env.WIKIMEDIA_API_URL || "https://commons.wikimedia.org/w/api.php");
  url.searchParams.set("action", "query");
  url.searchParams.set("generator", "search");
  url.searchParams.set("gsrsearch", query);
  url.searchParams.set("gsrnamespace", "6");
  url.searchParams.set("prop", "imageinfo");
  url.searchParams.set("iiprop", "url|mime");
  url.searchParams.set("iiurlwidth", "1200");
  url.searchParams.set("format", "json");
  url.searchParams.set("origin", "*");

  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) return null;

  const data = await response.json();
  const pages = Object.values<Record<string, any>>(data?.query?.pages || {});

  for (const page of pages) {
    const image = page?.imageinfo?.[0];
    const title = String(page?.title || "").toLowerCase();
    const mime = String(image?.mime || "").toLowerCase();
    const descriptionUrl = String(image?.descriptionurl || "").toLowerCase();

    if (!image?.thumburl) continue;
    if (title.endsWith(".pdf")) continue;
    if (title.endsWith(".djvu")) continue;
    if (title.endsWith(".tif") || title.endsWith(".tiff")) continue;
    if (descriptionUrl.includes(".pdf") || descriptionUrl.includes(".djvu")) continue;
    if (mime && !mime.startsWith("image/")) continue;

    return {
      provider: "wikimedia",
      url: image.thumburl,
      sourceUrl: image.descriptionurl || image.thumburl,
      query
    };
  }

  return null;
}

async function downloadAndConvert(sourceUrl: string, outputPath: string) {
  const response = await fetch(sourceUrl, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Falha ao baixar imagem: ${sourceUrl}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  await sharp(Buffer.from(arrayBuffer)).resize(1200, 1200, { fit: "cover" }).webp({ quality: 84 }).toFile(outputPath);
}

async function writePlaceholder(outputPath: string, name: string, sku: string, category: string) {
  const svg = makeProductPlaceholder({ name, sku, category });
  const [, encoded] = svg.split(",");
  await sharp(Buffer.from(decodeURIComponent(encoded))).webp({ quality: 90 }).toFile(outputPath);
}

function buildImageQueries(product: (typeof catalog)[number]) {
  const approximationQueries = getApproximationQueries(product);

  return Array.from(
    new Set([
      product.imageQuery,
      `${product.name} ${product.category} ${product.theme}`,
      `${product.collection} ${product.category} ${product.theme}`,
      `${product.name} 3d print ${product.theme}`,
      `${product.category} ${product.theme} decor`,
      ...approximationQueries
    ])
  ).filter(Boolean);
}

function getApproximationQueries(product: (typeof catalog)[number]) {
  const slug = product.slug;

  if (slug.includes("hello-kitty-organizer")) {
    return ["cute desk organizer", "pink desk organizer", "kawaii desk organizer"];
  }
  if (slug.includes("naruto-kunai-display")) {
    return [
      "ninja kunai prop",
      "kunai knife prop",
      "fantasy kunai display",
      "anime prop display",
      "fantasy dagger prop"
    ];
  }
  if (slug.includes("one-piece-wanted-plaque")) {
    return [
      "wanted poster wall decor",
      "vintage wanted poster plaque",
      "pirate wanted poster",
      "anime poster plaque"
    ];
  }
  if (slug.includes("suporte-controle-duplo")) {
    return ["game controller stand", "dual controller stand", "gaming desk controller holder"];
  }
  if (slug.includes("headset-dock-neon")) {
    return ["headphone stand setup", "gaming headset stand", "desk headphone holder"];
  }
  if (slug.includes("dragao-articulado-premium")) {
    return ["dragon figurine", "articulated dragon toy", "fantasy dragon model"];
  }
  if (slug.includes("dice-tower-mistica")) {
    return ["dice tower", "rpg dice tower", "tabletop gaming dice tower"];
  }
  if (slug.includes("vaso-geometrico-wave")) {
    return ["geometric vase", "modern geometric planter", "decorative polygon vase"];
  }
  if (slug.includes("luminaria-lua-vazada")) {
    return ["moon lamp", "decorative moon light", "sphere lamp moon"];
  }
  if (slug.includes("mandala-orbit")) {
    return ["mandala wall decor", "geometric mandala decor", "circular wall mandala"];
  }
  if (slug.includes("placa-pix-premium")) {
    return ["countertop payment sign", "table qr payment sign", "cashier counter sign"];
  }
  if (slug.includes("nome-3d-signature")) {
    return ["custom name sign", "lettering decor sign", "decorative name plaque"];
  }

  return [];
}

async function findImageHit(product: (typeof catalog)[number]) {
  for (const query of buildImageQueries(product)) {
    const openverse = await searchOpenverse(query);
    if (openverse) return openverse;

    const wikimedia = await searchWikimedia(query);
    if (wikimedia) return wikimedia;
  }

  return null;
}

async function readPreviousReport(reportPath: string) {
  if (!existsSync(reportPath)) return new Map<string, ImageReportEntry>();

  try {
    const raw = await readFile(reportPath, "utf8");
    const parsed = JSON.parse(raw) as { items?: ImageReportEntry[] };
    return new Map((parsed.items || []).map((item) => [item.productId || item.slug, item]));
  } catch {
    return new Map<string, ImageReportEntry>();
  }
}

async function main() {
  const assetsDir = resolve(process.cwd(), "public", "catalog-assets");
  const reportPath = resolve(assetsDir, "catalog-image-report.json");
  await mkdir(assetsDir, { recursive: true });
  const previousReport = await readPreviousReport(reportPath);

  const db = isDatabaseConfigured() ? getDb() : null;
  let canSyncDatabase = Boolean(db);
  const reportEntries: ImageReportEntry[] = [];
  const counters = {
    imported: 0,
    placeholder: 0,
    failed: 0
  };

  for (const product of catalog) {
    const outputPath = resolve(assetsDir, `${product.id}.webp`);
    const localPath = `/catalog-assets/${product.id}.webp`;
    let provider = "placeholder";
    let sourceUrl = "";
    let status: "imported" | "placeholder" | "failed" = "placeholder";
    let query = product.imageQuery;
    const previous = previousReport.get(product.id) || previousReport.get(product.slug);
    const shouldRetry = refresh || !existsSync(outputPath) || previous?.status === "placeholder" || previous?.status === "failed";

    if (shouldRetry) {
      try {
        const hit = await findImageHit(product);

        if (hit) {
          provider = hit.provider;
          sourceUrl = hit.sourceUrl;
          query = hit.query;
          await downloadAndConvert(hit.url, outputPath);
          status = "imported";
        } else {
          await writePlaceholder(outputPath, product.name, product.sku, product.category);
          sourceUrl = "generated:placeholder";
          provider = "placeholder";
        }
      } catch {
        await writePlaceholder(outputPath, product.name, product.sku, product.category);
        sourceUrl = "generated:placeholder";
        provider = "placeholder";
        status = "placeholder";
      }
    } else {
      provider = previous?.provider || "local";
      sourceUrl = previous?.sourceUrl || `local:${localPath}`;
      query = previous?.query || product.imageQuery;
      status = previous?.status || "imported";
    }

    counters[status] += 1;
    reportEntries.push({
      productId: product.id,
      slug: product.slug,
      sku: product.sku,
      provider,
      status,
      localPath,
      sourceUrl: sourceUrl || `local:${localPath}`,
      query
    });

    if (db && canSyncDatabase) {
      try {
        await db
          .update(products)
          .set({
            imagePath: localPath,
            imageStatus: status === "imported" ? "imported" : "placeholder",
            imageAlt: product.imageAlt,
            updatedAt: new Date()
          })
          .where(eq(products.id, product.id));

        await db.delete(catalogImageMappings).where(eq(catalogImageMappings.productId, product.id));
        await db.insert(catalogImageMappings).values({
          productId: product.id,
          provider,
          sourceUrl: sourceUrl || "generated:placeholder",
          localPath,
          query,
          status: status === "imported" ? "imported" : "placeholder",
          isPrimary: true,
          downloadedAt: status === "imported" ? new Date() : null
        });
      } catch {
        canSyncDatabase = false;
        console.warn("Banco indisponível para sincronizar imagens. Continuando apenas com os arquivos locais.");
      }
    }

    console.log(`${product.sku} -> ${provider || "placeholder"} (${status})`);
  }

  await writeFile(
    reportPath,
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        refresh,
        counters,
        items: reportEntries
      },
      null,
      2
    ),
    "utf8"
  );

  console.log(`Resumo -> importadas: ${counters.imported}, placeholders: ${counters.placeholder}, falhas: ${counters.failed}`);
}

main().catch((error) => {
  console.error("Falha ao importar imagens do catálogo:", error);
  process.exit(1);
});
