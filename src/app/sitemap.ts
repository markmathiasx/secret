import type { MetadataRoute } from "next";
import { getProductUrl } from "@/lib/catalog";
import { listStorefrontProducts } from "@/lib/catalog-server";
import { getSiteUrl } from "@/lib/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();
  const products = await listStorefrontProducts();

  const staticPages = [
    "",
    "/catalogo",
    "/divulgacao",
    "/politica-de-privacidade",
    "/termos",
    "/trocas-e-devolucoes",
    "/entregas",
    "/faq"
  ].map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.7
  }));

  const productPages = products.map((product) => ({
    url: `${base}${getProductUrl(product)}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: product.featured ? 0.8 : 0.6
  }));

  return [...staticPages, ...productPages];
}
