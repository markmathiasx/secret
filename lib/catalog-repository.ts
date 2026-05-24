import type { Prisma } from "@prisma/client";
import { MediaType, ProductStatus, ProductVisibility } from "@prisma/client";
import { getProductLongDescription, buildProductSearchText } from "@/lib/catalog-content";
import { applyCatalogMedia, buildProductImageAlt } from "@/lib/catalog-media";
import { applyCatalogTaxonomy } from "@/lib/catalog-taxonomy";
import { catalog as staticCatalog, findProductBySlug as findStaticProductBySlug, type Product } from "@/lib/catalog";
import { logStructured } from "@/lib/logger";
import { canConnectToDatabase, prisma } from "@/lib/prisma";
import { filterPublicCatalogProducts, isPublicCatalogProduct } from "@/lib/public-catalog";
import { getCachedJson, setCachedJson } from "@/lib/runtime-cache";

type CatalogSource = "static" | "database";

const defaultProductInclude = {
  category: true,
  collections: {
    include: {
      collection: true,
    },
  },
  media: {
    orderBy: {
      sortOrder: "asc" as const,
    },
  },
  variants: {
    orderBy: {
      createdAt: "asc" as const,
    },
  },
  inventory: true,
} satisfies Prisma.ProductInclude;

type PrismaProductRecord = Prisma.ProductGetPayload<{
  include: typeof defaultProductInclude;
}>;

function getConfiguredCatalogSource(): CatalogSource {
  const raw = (process.env.CATALOG_SOURCE || process.env.NEXT_PUBLIC_CATALOG_SOURCE || "static").trim().toLowerCase();
  return raw === "database" || raw === "prisma" || raw === "db" ? "database" : "static";
}

function getDuplicateValues(values: string[]) {
  const seen = new Set<string>();
  const duplicates = new Set<string>();

  values.forEach((value) => {
    if (seen.has(value)) duplicates.add(value);
    seen.add(value);
  });

  return [...duplicates].sort();
}

function getStaticCatalogDiagnostics() {
  const publicSafeCatalog = filterPublicCatalogProducts(staticCatalog);

  return {
    total: staticCatalog.length,
    publicSafeTotal: publicSafeCatalog.length,
    duplicateIds: getDuplicateValues(staticCatalog.map((product) => product.id)),
    duplicateSlugs: getDuplicateValues(
      staticCatalog
        .map((product) => product.slug || product.name)
        .filter(Boolean)
    ),
    missingImages: staticCatalog.filter((product) => !product.images?.length && !product.image).map((product) => product.id),
  };
}

function decimalToNumber(value: Prisma.Decimal | number | null | undefined) {
  if (typeof value === "number") return value;
  if (!value) return 0;
  return Number(value);
}

function decimalToOptionalNumber(value: Prisma.Decimal | number | null | undefined) {
  if (value === null || value === undefined) return undefined;
  const numberValue = decimalToNumber(value);
  return Number.isFinite(numberValue) ? numberValue : undefined;
}

function mapStatusToLegacy(status: ProductStatus): Product["status"] {
  return status === ProductStatus.READY_TO_SHIP ? "Pronta entrega" : "Sob encomenda";
}

function mapPrismaProduct(record: PrismaProductRecord): Product {
  const images = record.media
    .filter((item) => item.type === MediaType.IMAGE || item.type === MediaType.THUMBNAIL)
    .map((item) => item.url);

  const categoryName = record.category?.name || "Catálogo";
  const collectionName = record.collections[0]?.collection.name || "Marketplace";
  const baseProduct: Product = {
    id: record.id,
    slug: record.slug,
    sku: record.sku,
    name: record.title,
    category: categoryName,
    subcategory: record.subcategory || categoryName,
    theme: record.theme || categoryName,
    collection: collectionName,
    colors: record.colors,
    grams: record.grams,
    hours: decimalToNumber(record.hours),
    complexity: record.complexity,
    featured: record.featured,
    description: record.description,
    tags: record.tags,
    price: decimalToNumber(record.pricePix),
    printTime: record.printTimeLabel || `${decimalToNumber(record.hours)}h`,
    plaWeight: record.plaWeightLabel || `${record.grams}g`,
    dimensions: record.dimensions || "",
    images,
    imageAlt: record.imageAlt || buildProductImageAlt(record.title),
    licenseType: record.licenseType === "commercial" ? "commercial" : "personal",
    variants: record.variants.map((variant) => ({
      color: variant.color || variant.optionValue,
      available: variant.available,
    })),
    pricePix: decimalToNumber(record.pricePix),
    priceCard: decimalToNumber(record.priceCard),
    marketplaceSuggested: decimalToNumber(record.marketplaceSuggested),
    productionWindow: record.productionWindow,
    imageHint: record.imageHint || record.title,
    image: images[0] || undefined,
    material: record.material,
    finish: record.finish,
    status: mapStatusToLegacy(record.status),
    stock: record.inventory?.quantity ?? record.stock,
    customizable: record.customizable,
    readyToShip: record.readyToShip,
    estimatedUnitCost: decimalToOptionalNumber(record.estimatedUnitCost),
    estimatedUnitProfit: decimalToOptionalNumber(record.estimatedUnitProfit),
    estimatedGrams: decimalToOptionalNumber(record.estimatedGrams),
    estimatedHours: decimalToOptionalNumber(record.estimatedHours),
    spoolPricePerKg: decimalToOptionalNumber(record.spoolPricePerKg),
    machineHourlyRate: decimalToOptionalNumber(record.machineHourlyRate),
    postProcessMinutes: record.postProcessMinutes ?? undefined,
    laborHourlyRate: decimalToOptionalNumber(record.laborHourlyRate),
    packagingCost: decimalToOptionalNumber(record.packagingCost),
    overheadPercent: decimalToOptionalNumber(record.overheadPercent),
    profitMode: record.profitMode === "markup" || record.profitMode === "margin" ? record.profitMode : undefined,
    profitTargetPercent: decimalToOptionalNumber(record.profitTargetPercent),
    estimatedProfitAmount: decimalToOptionalNumber(record.estimatedProfitAmount),
    estimatedProfitPercent: decimalToOptionalNumber(record.estimatedProfitPercent),
    costingUpdatedAt: record.costingUpdatedAt?.toISOString(),
    pricingMode: "faixa-auditada",
    pricingNarrative: getProductLongDescription({
      ...staticCatalog[0],
      name: record.title,
      description: record.description,
      category: categoryName,
      collection: collectionName,
      material: record.material,
      finish: record.finish,
      pricePix: decimalToNumber(record.pricePix),
      priceCard: decimalToNumber(record.priceCard),
      productionWindow: record.productionWindow,
      tags: record.tags,
      grams: record.grams,
      hours: decimalToNumber(record.hours),
      colors: record.colors,
      images,
    } as Product),
  };

  return applyCatalogMedia(applyCatalogTaxonomy(baseProduct), { preserveExisting: true });
}
export type CatalogQuery = {
  q?: string;
  category?: string;
  collection?: string;
  status?: string;
  material?: string;
  customizableOnly?: boolean;
  minPrice?: number;
  maxPrice?: number;
  cursor?: string | null;
  limit?: number;
};

async function getDatabaseCatalogSnapshot(): Promise<Product[]> {
  const products = await prisma.product.findMany({
    where: {
      visibility: ProductVisibility.PUBLIC,
    },
    include: defaultProductInclude,
    orderBy: [
      { featured: "desc" },
      { updatedAt: "desc" },
    ],
  });

  return filterPublicCatalogProducts(products.map(mapPrismaProduct));
}

export async function getCatalogSnapshot(): Promise<Product[]> {
  const cached = await getCachedJson<Product[]>("catalog:products");
  if (cached?.length) return cached;

  const configuredSource = getConfiguredCatalogSource();
  let result: Product[];

  if (configuredSource === "static") {
    result = filterPublicCatalogProducts(staticCatalog);
    await setCachedJson("catalog:products", result, 300);
    return result;
  }

  if (!(await canConnectToDatabase())) {
    logStructured("error", "catalog_database_unavailable", { configuredSource });
    result = filterPublicCatalogProducts(staticCatalog);
    await setCachedJson("catalog:products", result, 300);
    return result;
  }

  try {
    const products = await getDatabaseCatalogSnapshot();

    if (!products.length) {
      logStructured("error", "catalog_database_empty", { configuredSource });
      result = filterPublicCatalogProducts(staticCatalog);
      await setCachedJson("catalog:products", result, 300);
      return result;
    }

    await setCachedJson("catalog:products", products, 300);
    return products;
  } catch (error) {
    logStructured("error", "catalog_database_failed", {
      message: error instanceof Error ? error.message : "unknown",
    });
    result = filterPublicCatalogProducts(staticCatalog);
    await setCachedJson("catalog:products", result, 300);
    return result;
  }
}

export async function getCatalogCollections(): Promise<string[]> {
  const products = await getCatalogSnapshot();
  return Array.from(new Set(products.map((item) => item.collection)));
}

export async function getCatalogCategories(): Promise<string[]> {
  const cached = await getCachedJson<string[]>("catalog:categories");
  if (cached?.length) return cached;
  const products = await getCatalogSnapshot();
  const categories = Array.from(new Set(products.map((item) => item.category)));
  await setCachedJson("catalog:categories", categories, 3600);
  return categories;
}

export async function getCatalogStaticParams(): Promise<Array<{ slug: string }>> {
  const products = await getCatalogSnapshot();
  return products.map((product) => ({
    slug: `${product.id}-${product.slug}`,
  }));
}

export async function findCatalogProductBySlug(slug: string): Promise<Product | undefined> {
  if (getConfiguredCatalogSource() === "static" || !(await canConnectToDatabase())) {
    const product = findStaticProductBySlug(slug);
    return product && isPublicCatalogProduct(product) ? product : undefined;
  }

  const normalized = slug.includes("-") ? slug.substring(slug.indexOf("-") + 1) : slug;
  const idCandidate = slug.split("-")[0] || slug;

  try {
    const record = await prisma.product.findFirst({
      where: {
        visibility: ProductVisibility.PUBLIC,
        OR: [
          { slug: normalized },
          { id: idCandidate },
        ],
      },
      include: defaultProductInclude,
    });

    if (!record) {
      const fallback = findStaticProductBySlug(slug);
      return fallback && isPublicCatalogProduct(fallback) ? fallback : undefined;
    }

    const product = mapPrismaProduct(record);
    return isPublicCatalogProduct(product) ? product : undefined;
  } catch {
    const fallback = findStaticProductBySlug(slug);
    return fallback && isPublicCatalogProduct(fallback) ? fallback : undefined;
  }
}

export async function getCatalogDiagnostics() {
  const configuredSource = getConfiguredCatalogSource();
  const staticDiagnostics = getStaticCatalogDiagnostics();
  const databaseConfigured = configuredSource === "database";
  let databaseConnectable = false;
  let databasePublicCount: number | null = null;
  let databaseError: string | null = null;

  if (databaseConfigured || process.env.DATABASE_URL) {
    try {
      databaseConnectable = await canConnectToDatabase();
      if (databaseConnectable) {
        databasePublicCount = await prisma.product.count({
          where: {
            visibility: ProductVisibility.PUBLIC,
          },
        });
      }
    } catch (error) {
      databaseError = error instanceof Error ? error.message : "Falha desconhecida no catálogo do banco.";
    }
  }

  const databaseUsable = configuredSource === "database" && databaseConnectable && Boolean(databasePublicCount);
  const fallbackActive = configuredSource === "database" && !databaseUsable;
  const publicCount = databaseUsable && databasePublicCount ? databasePublicCount : staticDiagnostics.publicSafeTotal;
  const servedSource = databaseUsable ? "database" : fallbackActive ? "static-fallback" : "static";

  return {
    ok: !fallbackActive && staticDiagnostics.duplicateIds.length === 0,
    configuredSource,
    servedSource,
    fallbackActive,
    publicCount,
    pageSize: 24,
    expectedPages: Math.ceil(publicCount / 24),
    staticCatalog: staticDiagnostics,
    database: {
      configured: databaseConfigured,
      connectable: databaseConnectable,
      publicCount: databasePublicCount,
      error: databaseError,
    },
  };
}

export async function searchCatalogProducts(query: CatalogQuery) {
  const products = await getCatalogSnapshot();
  const normalizedQuery = query.q?.trim().toLowerCase() || "";
  const filtered = products.filter((product) => {
    if (query.category && query.category !== "Todas" && product.category !== query.category) return false;
    if (query.collection && query.collection !== "Todas" && product.collection !== query.collection) return false;
    if (query.status && query.status !== "Todos" && product.status !== query.status) return false;
    if (query.material && query.material !== "Todos" && product.material !== query.material) return false;
    if (query.customizableOnly && !product.customizable) return false;
    if (typeof query.minPrice === "number" && product.pricePix < query.minPrice) return false;
    if (typeof query.maxPrice === "number" && product.pricePix > query.maxPrice) return false;
    if (!normalizedQuery) return true;

    const blob = buildProductSearchText(product).toLowerCase();
    return blob.includes(normalizedQuery);
  });

  const limit = query.limit ?? 24;
  const start = query.cursor ? Number(query.cursor) || 0 : 0;
  const items = filtered.slice(start, start + limit);
  const nextCursor = start + limit < filtered.length ? String(start + limit) : null;

  return {
    items,
    total: filtered.length,
    nextCursor,
  };
}
