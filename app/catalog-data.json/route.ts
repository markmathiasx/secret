import { NextResponse } from "next/server";
import { toCatalogClientProducts } from "@/lib/catalog-client-product";
import { getCatalogSnapshot } from "@/lib/catalog-repository";

export const dynamic = "force-static";
export const revalidate = 300;

export async function GET() {
  const catalog = await getCatalogSnapshot();
  return NextResponse.json({
    total: catalog.length,
    items: toCatalogClientProducts(catalog),
  });
}
