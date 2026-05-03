import { NextResponse } from "next/server";
import { getCatalogSnapshot } from "@/lib/catalog-repository";
import { getProductUrl } from "@/lib/catalog";
import { getSiteUrl } from "@/lib/env";
import { resolveProductImage } from "@/lib/product-images";
import { getProductLongDescription } from "@/lib/catalog-content";

export const revalidate = 3600;

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const siteUrl = getSiteUrl();
  const products = (await getCatalogSnapshot()).filter((product) => product.stock > 0 && product.pricePix > 0).slice(0, 1000);
  const items = products
    .map((product) => {
      const image = resolveProductImage(product);
      const imageUrl = image.startsWith("http") ? image : `${siteUrl}${image}`;
      const productUrl = `${siteUrl}${getProductUrl(product)}`;

      return `
        <item>
          <g:id>${escapeXml(product.sku || product.id)}</g:id>
          <g:title>${escapeXml(product.name)}</g:title>
          <g:description>${escapeXml(getProductLongDescription(product))}</g:description>
          <g:link>${escapeXml(productUrl)}</g:link>
          <g:image_link>${escapeXml(imageUrl)}</g:image_link>
          <g:availability>${product.stock > 0 ? "in_stock" : "out_of_stock"}</g:availability>
          <g:price>${product.pricePix.toFixed(2)} BRL</g:price>
          <g:brand>MDH 3D</g:brand>
          <g:condition>new</g:condition>
          <g:product_type>${escapeXml(product.category)}</g:product_type>
          <g:custom_label_0>${escapeXml(product.material)}</g:custom_label_0>
          <g:custom_label_1>${escapeXml(product.readyToShip ? "pronta-entrega" : "sob-encomenda")}</g:custom_label_1>
        </item>`;
    })
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>MDH 3D Store</title>
    <link>${escapeXml(siteUrl)}</link>
    <description>Catálogo MDH 3D para Google Merchant Center</description>
    ${items}
  </channel>
</rss>`;

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=300",
    },
  });
}
