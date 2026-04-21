import { NextResponse } from "next/server";
import { getCatalogSnapshot, searchCatalogProducts } from "@/lib/catalog-repository";
import { publicFeaturedCatalog, serializePublicProducts } from "@/lib/public-catalog";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const category = url.searchParams.get("category") || undefined;
  const collection = url.searchParams.get("collection") || undefined;
  const limit = url.searchParams.get("limit") ? Number(url.searchParams.get("limit")) : 8;

  if (category || collection) {
    const results = await searchCatalogProducts({
      category,
      collection,
      limit,
    });

    return NextResponse.json({
      ok: true,
      items: serializePublicProducts(results.items),
    });
  }

  const products = await getCatalogSnapshot();
  const featured = (products.length ? products : publicFeaturedCatalog)
    .filter((item) => item.featured)
    .slice(0, limit);

  return NextResponse.json({
    ok: true,
    items: serializePublicProducts(featured),
  });
}
