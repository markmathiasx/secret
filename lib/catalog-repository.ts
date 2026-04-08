import type { Prisma } from "@prisma/client";
import { MediaType, ProductStatus, ProductVisibility } from "@prisma/client";
import { getProductLongDescription, buildProductSearchText } from "@/lib/catalog-content";
import { applyCatalogMedia, buildProductImageAlt } from "@/lib/catalog-media";
import { catalog as staticCatalog, findProductBySlug as findStaticProductBySlug, type Product } from "@/lib/catalog";
import { canConnectToDatabase, prisma } from "@/lib/prisma";

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

function decimalToNumber(value: Prisma.Decimal | number | null | undefined) {
  if (typeof value === "number") return value;
  if (!value) return 0;
  return Number(value);
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
    estimatedUnitCost: decimalToNumber(record.estimatedUnitCost),
    estimatedUnitProfit: decimalToNumber(record.estimatedUnitProfit),
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

  return applyCatalogMedia(baseProduct, { preserveExisting: true });
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

export async function getCatalogSnapshot(): Promise<Product[]> {
  if (!(await canConnectToDatabase())) {
    return staticCatalog;
  }

  try {
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

    if (!products.length) {
      return staticCatalog;
    }

    return products.map(mapPrismaProduct);
  } catch {
    return staticCatalog;
  }
}

export async function getCatalogCollections(): Promise<string[]> {
  const products = await getCatalogSnapshot();
  return Array.from(new Set(products.map((item) => item.collection)));
}

export async function getCatalogCategories(): Promise<string[]> {
  const products = await getCatalogSnapshot();
  return Array.from(new Set(products.map((item) => item.category)));
}

export async function getCatalogStaticParams(): Promise<Array<{ slug: string }>> {
  const products = await getCatalogSnapshot();
  return products.map((product) => ({
    slug: `${product.id}-${product.slug}`,
  }));
}

export async function findCatalogProductBySlug(slug: string): Promise<Product | undefined> {
  if (!(await canConnectToDatabase())) {
    return findStaticProductBySlug(slug);
  }

  const normalized = slug.includes("-") ? slug.substring(slug.indexOf("-") + 1) : slug;
  const idCandidate = slug.split("-")[0] || slug;

  try {
    const record = await prisma.product.findFirst({
      where: {
        OR: [
          { slug: normalized },
          { id: idCandidate },
        ],
      },
      include: defaultProductInclude,
    });

    if (!record) return findStaticProductBySlug(slug);
    return mapPrismaProduct(record);
  } catch {
    return findStaticProductBySlug(slug);
  }
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
