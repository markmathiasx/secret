import { NextResponse } from "next/server";
import { catalog } from "@/lib/catalog";
import { isA1MiniCatalogProduct } from "@/lib/a1-mini-catalog";
import { isProductVisualVerified } from "@/lib/product-visuals";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const scope = searchParams.get("scope") || "all";
  const items =
    scope === "a1-mini"
      ? catalog.filter(isA1MiniCatalogProduct)
      : scope === "all"
        ? catalog
        : catalog.filter(isProductVisualVerified);
  return NextResponse.json({ total: items.length, scope, items });
}
