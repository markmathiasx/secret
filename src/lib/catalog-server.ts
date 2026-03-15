import "server-only";

import { and, asc, eq } from "drizzle-orm";
import { getDb, isDatabaseConfigured } from "@/db/client";
import { products, type ProductRow } from "@/db/schema";
import {
  catalog as seedCatalog,
  featuredCatalog as seedFeaturedCatalog,
  type Product
} from "@/lib/catalog";

function getSeedProductById(id: string) {
  return seedCatalog.find((product) => product.id === id) || null;
}

function getSeedProductBySlug(slug: string) {
  return seedCatalog.find((product) => product.slug === slug) || null;
}

function mapProduct(row: ProductRow): Product {
  return {
    id: row.id,
    sku: row.sku,
    slug: row.slug,
    name: row.name,
    category: row.category,
    theme: row.theme,
    collection: row.collection,
    description: row.description,
    merchandising: row.merchandising || "",
    tags: row.tags,
    colors: row.colors,
    materials: row.materials,
    finishNotes: row.finishNotes || "",
    grams: row.grams,
    hours: row.hours,
    complexity: row.complexity,
    productionWindow: row.productionWindow,
    pricePix: row.pricePix,
    priceCard: row.priceCard,
    marketplaceSuggested: row.marketplaceSuggested ?? row.priceCard,
    published: row.published,
    featured: row.featured,
    imagePath: row.imagePath,
    imageStatus: row.imageStatus,
    imageAlt: row.imageAlt || row.name,
    imageHint: row.name,
    imageQuery: row.name,
    sortOrder: row.sortOrder,
    metadata: row.metadata
  };
}

async function readPublishedProducts() {
  const db = getDb();
  return db
    .select()
    .from(products)
    .where(eq(products.published, true))
    .orderBy(asc(products.sortOrder), asc(products.name));
}

export async function listStorefrontProducts() {
  if (!isDatabaseConfigured()) return seedCatalog;

  try {
    const rows = await readPublishedProducts();
    return rows.length ? rows.map(mapProduct) : seedCatalog;
  } catch {
    return seedCatalog;
  }
}

export async function listFeaturedProducts() {
  if (!isDatabaseConfigured()) return seedFeaturedCatalog;

  try {
    const db = getDb();
    const rows = await db
      .select()
      .from(products)
      .where(and(eq(products.published, true), eq(products.featured, true)))
      .orderBy(asc(products.sortOrder), asc(products.name));

    return rows.length ? rows.map(mapProduct).slice(0, 12) : seedFeaturedCatalog;
  } catch {
    return seedFeaturedCatalog;
  }
}

export async function getStorefrontProductBySlug(slug: string) {
  if (!isDatabaseConfigured()) {
    return getSeedProductBySlug(slug);
  }

  try {
    const db = getDb();
    const [row] = await db
      .select()
      .from(products)
      .where(and(eq(products.slug, slug), eq(products.published, true)))
      .limit(1);

    return row ? mapProduct(row) : getSeedProductBySlug(slug);
  } catch {
    return getSeedProductBySlug(slug);
  }
}

export async function getStorefrontProductById(id: string, options?: { fallbackToSeed?: boolean }) {
  const fallbackToSeed = options?.fallbackToSeed ?? true;

  if (!isDatabaseConfigured()) {
    return fallbackToSeed ? getSeedProductById(id) : null;
  }

  try {
    const db = getDb();
    const [row] = await db
      .select()
      .from(products)
      .where(and(eq(products.id, id), eq(products.published, true)))
      .limit(1);

    return row ? mapProduct(row) : fallbackToSeed ? getSeedProductById(id) : null;
  } catch {
    return fallbackToSeed ? getSeedProductById(id) : null;
  }
}

export async function getRelatedProducts(product: Product, limit = 4) {
  const products = await listStorefrontProducts();
  return products
    .filter((item) => item.id !== product.id)
    .sort((left, right) => {
      const leftScore =
        Number(left.featured) +
        Number(left.collection === product.collection) * 4 +
        Number(left.category === product.category) * 3 +
        Number(left.theme === product.theme) * 2 +
        left.tags.filter((tag) => product.tags.includes(tag)).length;
      const rightScore =
        Number(right.featured) +
        Number(right.collection === product.collection) * 4 +
        Number(right.category === product.category) * 3 +
        Number(right.theme === product.theme) * 2 +
        right.tags.filter((tag) => product.tags.includes(tag)).length;

      return rightScore - leftScore || left.pricePix - right.pricePix;
    })
    .slice(0, limit);
}

export async function getCatalogStats() {
  const products = await listStorefrontProducts();
  return {
    totalProducts: products.length,
    totalCategories: new Set(products.map((item) => item.category)).size,
    totalCollections: new Set(products.map((item) => item.collection)).size
  };
}
