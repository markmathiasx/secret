import type { MetadataRoute } from "next";
import { catalog, getProductUrl } from "@/lib/catalog";
import { absoluteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages = [
    "",
    "/catalogo",
    "/divulgacao",
    "/login",
    "/politica-de-privacidade",
    "/termos",
    "/trocas-e-devolucoes",
    "/entregas",
    "/faq"
  ].map((path) => ({
    url: absoluteUrl(path),
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.7
  }));

  const productPages = catalog.map((product) => ({
    url: absoluteUrl(getProductUrl(product)),
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.6
  }));

  return [...staticPages, ...productPages];
}
