import type { MetadataRoute } from "next";
import { getProductUrl } from "@/lib/catalog";
import { getCatalogSnapshot } from "@/lib/catalog-repository";
import { categoryPageConfigs } from "@/lib/category-pages";
import { getSiteUrl } from "@/lib/env";
import { salesLandings } from "@/lib/sales-landings";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();
  const catalog = await getCatalogSnapshot();

  const buildDate = new Date();
  const landingPaths = Object.values(salesLandings).map((landing) => landing.slug);
  const categoryPaths = categoryPageConfigs.map((config) => `/catalogo/categoria/${config.slug}`);

  const staticPages = [
    "",
    "/catalogo",
    "/imagem-para-impressao-3d",
    ...landingPaths,
    ...categoryPaths,
    "/divulgacao",
    "/politica-de-privacidade",
    "/termos",
    "/trocas-e-devolucoes",
    "/entregas",
    "/faq",
  ].map((path) => ({
    url: `${base}${path}`,
    lastModified: buildDate,
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : path === "/catalogo" ? 0.9 : 0.7
  }));

  const productPages = catalog.slice(0, 1000).map((product) => ({
    url: `${base}${getProductUrl(product)}`,
    lastModified: buildDate,
    changeFrequency: "weekly" as const,
    priority: 0.6
  }));

  return [...staticPages, ...productPages];
}
