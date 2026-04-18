import type { MetadataRoute } from "next";
import { getProductUrl } from "@/lib/catalog";
import { getCatalogSnapshot } from "@/lib/catalog-repository";
import { getSiteUrl } from "@/lib/env";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();
  const catalog = await getCatalogSnapshot();

  const staticPages = [
    "",
    "/catalogo",
    "/imagem-para-impressao-3d",
    "/presentes-3d",
    "/brindes-personalizados-3d",
    "/setup-e-organizacao-3d",
    "/colecionaveis-geek-3d",
    "/decoracao-3d-para-casa",
    "/divulgacao",
    "/politica-de-privacidade",
    "/termos",
    "/trocas-e-devolucoes",
    "/entregas",
    "/faq",
  ].map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : path === "/catalogo" ? 0.9 : 0.7
  }));

  const productPages = catalog.slice(0, 1000).map((product) => ({
    url: `${base}${getProductUrl(product)}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.6
  }));

  return [...staticPages, ...productPages];
}
