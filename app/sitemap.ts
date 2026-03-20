import type { MetadataRoute } from "next";
import { catalog, getProductUrl } from "@/lib/catalog";
import { getSiteUrl } from "@/lib/env";
import { guides } from "@/lib/guides";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl();

  const staticPages = [
    "",
    "/catalogo",
    "/lojA1mini",
    "/compatibilidade",
    "/configurador/nozzle-hotend",
    "/kits",
    "/comparar",
    "/guias",
    "/b2b",
    "/suporte",
    "/suporte/envio",
    "/suporte/trocas-devolucoes",
    "/suporte/garantia",
    "/suporte/contato",
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

  const guidePages = guides.map((guide) => ({
    url: `${base}/guias/${guide.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.65,
  }));

  return [...staticPages, ...productPages, ...guidePages];
}
