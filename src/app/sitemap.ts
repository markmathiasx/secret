import type { MetadataRoute } from "next";
import { getProductUrl } from "@/lib/catalog";
import { listStorefrontProducts } from "@/lib/catalog-server";
import { categoryLandingEntries, guideEntries } from "@/lib/seo-content";
import { getSiteUrl } from "@/lib/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();
  const products = await listStorefrontProducts();

  const staticPages = [
    "",
    "/catalogo",
    "/guias",
    "/divulgacao",
    "/politica-de-cookies",
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

  const categoryPages = categoryLandingEntries.map((entry) => ({
    url: `${base}/categorias/${entry.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.75
  }));

  const guidePages = guideEntries.map((guide) => ({
    url: `${base}/guias/${guide.slug}`,
    lastModified: new Date("2026-03-15"),
    changeFrequency: "monthly" as const,
    priority: 0.72
  }));

  return [...staticPages, ...categoryPages, ...guidePages, ...productPages];
}
