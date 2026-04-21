import { NextResponse } from "next/server";
import { getCatalogSnapshot } from "@/lib/catalog-repository";
import { applyNoStoreHeaders } from "@/lib/http-cache";
import { serializePublicProducts } from "@/lib/public-catalog";

export async function GET() {
  const products = await getCatalogSnapshot();
  return applyNoStoreHeaders(
    NextResponse.json({
      ok: true,
      products: serializePublicProducts(products),
    })
  );
}
