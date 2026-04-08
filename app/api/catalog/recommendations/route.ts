import { NextResponse } from "next/server";
import { catalog } from "@/lib/catalog";
import { searchCatalogProducts } from "@/lib/catalog-repository";

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
      items: results.items,
    });
  }

  return NextResponse.json({
    ok: true,
    items: catalog.filter((item) => item.featured).slice(0, limit),
  });
}
