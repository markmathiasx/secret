import fs from "node:fs/promises";
import path from "node:path";
import { catalog } from "@/lib/catalog";
import { getProductVisual } from "@/lib/product-visuals";
import { slugify } from "@/lib/utils";

async function main() {
  const snapshot = catalog.map((product) => ({
    id: product.id,
    slug: `${product.id}-${product.slug || slugify(product.name)}`,
    name: product.name,
    image: product.image || product.images?.[0] || "",
    images: product.images || [],
    material: product.material,
    category: product.category,
    collection: product.collection,
    visualKind: getProductVisual(product).kind,
  }));

  const outputPath = path.join(process.cwd(), "data", "local-catalog-image-snapshot.json");
  await fs.writeFile(outputPath, `${JSON.stringify(snapshot, null, 2)}\n`, "utf8");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
