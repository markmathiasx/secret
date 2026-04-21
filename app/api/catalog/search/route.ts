import { NextResponse } from "next/server";
import { searchCatalogProducts } from "@/lib/catalog-repository";
import { applyNoStoreHeaders } from "@/lib/http-cache";
import { serializePublicProducts } from "@/lib/public-catalog";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const results = await searchCatalogProducts({
    q: url.searchParams.get("q") || undefined,
    category: url.searchParams.get("category") || undefined,
    collection: url.searchParams.get("collection") || undefined,
    status: url.searchParams.get("status") || undefined,
    material: url.searchParams.get("material") || undefined,
    customizableOnly: url.searchParams.get("custom") === "1",
    minPrice: url.searchParams.get("min") ? Number(url.searchParams.get("min")) : undefined,
    maxPrice: url.searchParams.get("max") ? Number(url.searchParams.get("max")) : undefined,
    cursor: url.searchParams.get("cursor"),
    limit: url.searchParams.get("limit") ? Number(url.searchParams.get("limit")) : 24,
  });

  return applyNoStoreHeaders(NextResponse.json({
    ok: true,
    ...results,
    items: serializePublicProducts(results.items),
  }));
}
