import { NextResponse } from "next/server";
import { buildProductPagePath } from "@/lib/mdh-store/links";
import { getLocalStoreProducts } from "@/lib/mdh-store/products";
import { getSiteUrl } from "@/lib/env";

export const dynamic = "force-static";
export const revalidate = 300;

function safeErrorHeader(error: unknown) {
  return error instanceof Error ? error.message.slice(0, 180).replace(/[\r\n<>"]/g, " ") : "unknown_feed_error";
}

export function GET() {
  try {
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
  } catch (error) {
    return NextResponse.json(
      {
        ok: true,
        source: "/data/produtos.csv",
        total: 0,
        products: [],
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, max-age=0, s-maxage=60",
          "X-MDH-Feed-Error": safeErrorHeader(error),
        },
      }
    );
  }
}
