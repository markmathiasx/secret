import { NextResponse } from "next/server";
import { buildProductPagePath } from "@/lib/mdh-store/links";
import { getLocalStoreProducts } from "@/lib/mdh-store/products";
import { getCatalogSnapshot } from "@/lib/catalog-repository";
import { getProductUrl } from "@/lib/catalog";
import { getSiteUrl } from "@/lib/env";

export const dynamic = "force-static";
export const revalidate = 300;

function xml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function GET() {
  const baseUrl = getSiteUrl();
  const now = new Date().toISOString();
  const catalog = await getCatalogSnapshot();
  const smartProducts = getLocalStoreProducts();
  const urls = [
    ...catalog.slice(0, 1000).map((product) => `${baseUrl}${getProductUrl(product)}`),
    ...smartProducts.map((product) => `${baseUrl}${buildProductPagePath(product)}`),
  ];

  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${Array.from(new Set(urls))
    .map((url) => `  <url>\n    <loc>${xml(url)}</loc>\n    <lastmod>${now}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.65</priority>\n  </url>`)
    .join("\n")}\n</urlset>\n`;

  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=300, s-maxage=300",
    },
  });
}
