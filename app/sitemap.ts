import type { MetadataRoute } from "next";
import { catalog, getProductUrl } from "@/lib/catalog";
import { getSiteUrl } from "@/lib/env";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl();

  const staticPages = [
    "",
    "/catalogo",
    "/presentes-3d",
    "/brindes-personalizados-3d",
    "/setup-e-organizacao-3d",
    "/colecionaveis-geek-3d",
    "/decoracao-3d-para-casa",
    "/divulgacao",
    "/login",
    "/politica-de-privacidade",
    "/termos",
    "/trocas-e-devolucoes",
    "/entregas",
    "/faq",
    "/checkout"
  ].map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.7
  }));

  const productPages = catalog.slice(0, 1000).map((product) => ({
    url: `${base}${getProductUrl(product)}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.6
  }));

  return [...staticPages, ...productPages];
}
