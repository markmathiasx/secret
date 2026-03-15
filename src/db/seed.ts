import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { getDb, isDatabaseConfigured } from "@/db/client";
import { catalog } from "@/lib/catalog";
import { SOURCE_CHANNELS } from "@/lib/commerce";
import { catalogImageMappings, products, sourceChannels } from "@/db/schema";

async function main() {
  if (!isDatabaseConfigured()) {
    throw new Error("DATABASE_URL não configurada. Configure o banco antes de rodar o seed.");
  }

  const db = getDb();
  const reportPath = resolve(process.cwd(), "public", "catalog-assets", "catalog-image-report.json");
  const imageReport = existsSync(reportPath)
    ? new Map(
        (((JSON.parse(readFileSync(reportPath, "utf8")) as { items?: Array<{ slug: string; status: "imported" | "placeholder" | "failed"; provider: string; sourceUrl: string; localPath: string; query: string }> }).items) || []).map((item) => [item.slug, item])
      )
    : new Map();

  for (const channel of SOURCE_CHANNELS) {
    await db
      .insert(sourceChannels)
      .values({
        id: channel.id,
        label: channel.label,
        description: channel.description
      })
      .onConflictDoUpdate({
        target: sourceChannels.id,
        set: {
          label: channel.label,
          description: channel.description,
          isActive: true
        }
      });
  }

  for (const product of catalog) {
    const localFile = resolve(process.cwd(), "public", "catalog-assets", `${product.slug}.webp`);
    const imageExists = existsSync(localFile);
    const reportEntry = imageReport.get(product.slug);
    const imageStatus = reportEntry?.status === "failed" ? "failed" : reportEntry?.status || (imageExists ? "imported" : "placeholder");
    const imagePath = imageExists ? `/catalog-assets/${product.slug}.webp` : null;

    await db
      .insert(products)
      .values({
        id: product.id,
        sku: product.sku,
        slug: product.slug,
        name: product.name,
        category: product.category,
        theme: product.theme,
        collection: product.collection,
        description: product.description,
        merchandising: product.merchandising,
        tags: product.tags,
        colors: product.colors,
        materials: product.materials,
        finishNotes: product.finishNotes,
        grams: product.grams,
        hours: product.hours,
        complexity: product.complexity,
        productionWindow: product.productionWindow,
        pricePix: product.pricePix,
        priceCard: product.priceCard,
        marketplaceSuggested: product.marketplaceSuggested,
        published: product.published,
        featured: product.featured,
        imagePath,
        imageStatus,
        imageAlt: product.imageAlt,
        sortOrder: product.sortOrder,
        metadata: product.metadata
      })
      .onConflictDoUpdate({
        target: products.id,
        set: {
          sku: product.sku,
          slug: product.slug,
          name: product.name,
          category: product.category,
          theme: product.theme,
          collection: product.collection,
          description: product.description,
          merchandising: product.merchandising,
          tags: product.tags,
          colors: product.colors,
          materials: product.materials,
          finishNotes: product.finishNotes,
          grams: product.grams,
          hours: product.hours,
          complexity: product.complexity,
          productionWindow: product.productionWindow,
          pricePix: product.pricePix,
          priceCard: product.priceCard,
          marketplaceSuggested: product.marketplaceSuggested,
          published: product.published,
          featured: product.featured,
          imagePath,
          imageStatus,
          imageAlt: product.imageAlt,
          sortOrder: product.sortOrder,
          metadata: product.metadata,
          updatedAt: new Date()
        }
      });
  }

  await db.delete(catalogImageMappings);
  await db.insert(catalogImageMappings).values(
    catalog.map((product) => {
      const localPath = existsSync(resolve(process.cwd(), "public", "catalog-assets", `${product.slug}.webp`))
        ? `/catalog-assets/${product.slug}.webp`
        : null;
      const reportEntry = imageReport.get(product.slug);
      const status: "imported" | "placeholder" | "failed" =
        reportEntry?.status || (localPath ? "imported" : "placeholder");

      return {
        productId: product.id,
        provider: reportEntry?.provider || (localPath ? "local" : "placeholder"),
        sourceUrl: reportEntry?.sourceUrl || (localPath ? `local:${localPath}` : "generated:placeholder"),
        localPath,
        query: reportEntry?.query || product.imageQuery,
        status,
        isPrimary: true
      };
    })
  );

  console.log(`Seed aplicado com ${catalog.length} produtos e ${SOURCE_CHANNELS.length} canais.`);
}

main().catch((error) => {
  console.error("Falha no seed:", error);
  process.exit(1);
});
