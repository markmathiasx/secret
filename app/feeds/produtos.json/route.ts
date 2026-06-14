import { NextResponse } from "next/server";
import { buildProductPagePath } from "@/lib/mdh-store/links";
import { getLocalStoreProducts } from "@/lib/mdh-store/products";
import { getSiteUrl } from "@/lib/env";

export const dynamic = "force-static";
export const revalidate = 300;

export function GET() {
  const baseUrl = getSiteUrl();
  const products = getLocalStoreProducts().map((product) => ({
    ...product,
    url: `${baseUrl}${buildProductPagePath(product)}`,
    image: product.image
      ? product.image.startsWith("http")
        ? product.image
        : `${baseUrl}${product.image}`
      : undefined,
  }));

  return NextResponse.json(
    {
      ok: true,
      source: "/data/produtos.csv",
      total: products.length,
      products,
    },
    {
      headers: {
        "Cache-Control": "public, max-age=300, s-maxage=300",
      },
    }
  );
}
