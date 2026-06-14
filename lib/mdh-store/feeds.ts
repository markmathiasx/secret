import type { SmartStoreProduct } from "@/lib/mdh-store/products";
import { buildProductPagePath } from "@/lib/mdh-store/links";

function xml(value: string | number | undefined) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function csv(value: string | number | undefined) {
  const raw = String(value ?? "");
  return /[",\n\r]/.test(raw) ? `"${raw.replace(/"/g, '""')}"` : raw;
}

function absoluteUrl(baseUrl: string, pathOrUrl?: string) {
  if (!pathOrUrl) return "";
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  return `${baseUrl}${pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`}`;
}

export function productFeedRows(products: SmartStoreProduct[], baseUrl: string) {
  return products.map((product) => {
    const link = `${baseUrl}${buildProductPagePath(product)}`;
    return {
      id: product.sku || product.slug,
      title: product.name,
      description: product.seoDescription || product.description,
      availability: product.stock > 0 ? "in stock" : "out of stock",
      condition: "new",
      price: `${product.pixPrice.toFixed(2)} BRL`,
      link,
      image_link: absoluteUrl(baseUrl, product.image),
      brand: product.brand || "MDH3D",
      google_product_category: "Arts & Entertainment > Hobbies & Creative Arts > Crafts & Hobbies",
      product_type: product.category,
    };
  });
}

export function buildMetaCatalogCsv(products: SmartStoreProduct[], baseUrl: string) {
  const rows = productFeedRows(products, baseUrl);
  const header = [
    "id",
    "title",
    "description",
    "availability",
    "condition",
    "price",
    "link",
    "image_link",
    "brand",
    "google_product_category",
    "product_type",
  ];
  return [
    header.join(","),
    ...rows.map((row) => header.map((key) => csv(row[key as keyof typeof row])).join(",")),
  ].join("\n");
}

export function buildGoogleShoppingXml(products: SmartStoreProduct[], baseUrl: string) {
  const rows = productFeedRows(products, baseUrl);
  return `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">\n  <channel>\n    <title>MDH3D Loja Inteligente</title>\n    <link>${xml(baseUrl)}</link>\n    <description>Produtos locais de impressão 3D da MDH3D</description>\n${rows
      .map(
        (row) => `    <item>
      <g:id>${xml(row.id)}</g:id>
      <g:title>${xml(row.title)}</g:title>
      <g:description>${xml(row.description)}</g:description>
      <g:availability>${xml(row.availability)}</g:availability>
      <g:condition>${xml(row.condition)}</g:condition>
      <g:price>${xml(row.price)}</g:price>
      <g:link>${xml(row.link)}</g:link>
      ${row.image_link ? `<g:image_link>${xml(row.image_link)}</g:image_link>` : ""}
      <g:brand>${xml(row.brand)}</g:brand>
      <g:google_product_category>${xml(row.google_product_category)}</g:google_product_category>
      <g:product_type>${xml(row.product_type)}</g:product_type>
    </item>`
      )
      .join("\n")}\n  </channel>\n</rss>\n`;
}
