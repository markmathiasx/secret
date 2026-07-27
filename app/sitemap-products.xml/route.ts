import { NextResponse } from "next/server";
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

function sitemapResponse(body: string, headers: Record<string, string> = {}) {
  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=300, s-maxage=300",
      ...headers,
    },
  });
}

function emptySitemap(error?: unknown) {
  const now = new Date().toISOString();
  const headers: Record<string, string> = error instanceof Error ? { "X-MDH-Sitemap-Error": error.message.slice(0, 180).replace(/[\r\n<>"]/g, " ") } : {};
  return sitemapResponse(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url>\n    <loc>${xml(getSiteUrl())}</loc>\n    <lastmod>${now}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>1.0</priority>\n  </url>\n</urlset>\n`, headers);
}

export async function GET() {
  try {
    const baseUrl = getSiteUrl();
    const now = new Date().toISOString();
    const catalog = await getCatalogSnapshot();
    const urls = catalog.slice(0, 1000).map((product) => `${baseUrl}${getProductUrl(product)}`);

    const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${Array.from(new Set(urls))
      .map((url) => `  <url>\n    <loc>${xml(url)}</loc>\n    <lastmod>${now}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.65</priority>\n  </url>`)
      .join("\n")}\n</urlset>\n`;

    return sitemapResponse(body);
  } catch (error) {
    return emptySitemap(error);
  }
}
