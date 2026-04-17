import { NextResponse } from "next/server";
import { isA1MiniCatalogProduct } from "@/lib/a1-mini-catalog";
import { applyNoStoreHeaders } from "@/lib/http-cache";
import { getCatalogDiagnostics, getCatalogSnapshot } from "@/lib/catalog-repository";
import { isProductVisualVerified } from "@/lib/product-visuals";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const requestedScope = searchParams.get("scope");
  const scope = requestedScope === "a1-mini" || requestedScope === "verified" ? requestedScope : "all";
  const catalog = await getCatalogSnapshot();
  const diagnostics = await getCatalogDiagnostics();
  const items =
    scope === "a1-mini"
      ? catalog.filter(isA1MiniCatalogProduct)
      : scope === "verified"
        ? catalog.filter(isProductVisualVerified)
        : catalog;
  return applyNoStoreHeaders(NextResponse.json({ total: items.length, scope, source: diagnostics.servedSource, items }));
}
