import { NextResponse } from "next/server";
import { getCatalogSnapshot } from "@/lib/catalog-repository";
import { getProductUrl } from "@/lib/catalog";
import { resolveProductImage } from "@/lib/product-images";
import { getSiteUrl } from "@/lib/env";
import { getCommerceFeedAvailability } from "@/lib/product-availability";

export const dynamic = "force-dynamic";
export const revalidate = 3600; // 1 hour

function escape(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function GET() {
  const siteUrl = getSiteUrl();
  const products = await getCatalogSnapshot();

  const items = products
    .map((p) => {
      const rawImage = resolveProductImage(p);
      const imageUrl = rawImage.startsWith("http") ? rawImage : `${siteUrl}${rawImage}`;
      const productUrl = `${siteUrl}${getProductUrl(p)}`;
      const price = p.pricePix.toFixed(2);
      const availability = getCommerceFeedAvailability(p);
      const condition = "new";
      const brand = "MDH 3D Store";
      const description = p.description
        ? p.description.slice(0, 500)
        : `${p.name} – impressão 3D em PLA de alta qualidade. Categoria: ${p.category}.`;

      return `    <item>
      <g:id>${escape(p.sku)}</g:id>
      <g:title>${escape(p.name)}</g:title>
      <g:description>${escape(description)}</g:description>
      <g:link>${escape(productUrl)}</g:link>
      <g:image_link>${escape(imageUrl)}</g:image_link>
      <g:condition>${condition}</g:condition>
      <g:availability>${availability}</g:availability>
      <g:price>${price} BRL</g:price>
      <g:brand>${escape(brand)}</g:brand>
      <g:google_product_category>Artes e Artesanato > Impressão 3D</g:google_product_category>
      <g:product_type>${escape(p.category)} &gt; ${escape(p.subcategory)}</g:product_type>
      <g:identifier_exists>no</g:identifier_exists>
      <g:material>${escape(p.material || "PLA")}</g:material>
      <g:shipping>
        <g:country>BR</g:country>
        <g:service>Envio pelo Rio de Janeiro</g:service>
        <g:price>0.00 BRL</g:price>
      </g:shipping>
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>MDH 3D Store – Catálogo de Impressão 3D</title>
    <link>${escape(siteUrl)}</link>
    <description>Catálogo de produtos impressos em 3D: brindes personalizados, decoração, colecionáveis e peças sob medida.</description>
${items}
  </channel>
</rss>`;

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
