import { NextResponse } from "next/server";
import { getCatalogSnapshot } from "@/lib/catalog-repository";
import { applyNoStoreHeaders } from "@/lib/http-cache";

export async function GET() {
  const products = await getCatalogSnapshot();
  return applyNoStoreHeaders(
    NextResponse.json({
      ok: true,
      products: products.map((p) => ({
        id: p.id,
        slug: p.slug || p.id,
        sku: p.sku,
        name: p.name,
        category: p.category,
        subcategory: p.subcategory,
        pricePix: p.pricePix,
        priceCard: p.priceCard,
        images: p.images,
        stock: p.stock,
        readyToShip: p.readyToShip,
        customizable: p.customizable,
      })),
    })
  );
}
