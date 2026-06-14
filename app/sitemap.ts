import type { MetadataRoute } from "next";
import { getProductUrl } from "@/lib/catalog";
import { getCatalogSnapshot } from "@/lib/catalog-repository";
import { categoryPageConfigs } from "@/lib/category-pages";
import { getSiteUrl } from "@/lib/env";
import { salesLandings } from "@/lib/sales-landings";
import { blogPosts } from "@/lib/blog";
import { buildProductPagePath } from "@/lib/mdh-store/links";
import { getLocalStoreProducts } from "@/lib/mdh-store/products";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();
  const catalog = await getCatalogSnapshot();
  const smartStoreProducts = getLocalStoreProducts();

  const buildDate = new Date();
  const landingPaths = Object.values(salesLandings).map((landing) => landing.slug);
  const categoryPaths = categoryPageConfigs.map((config) => `/catalogo/categoria/${config.slug}`);

  const staticPages = [
    "",
    "/loja",
    "/catalogo",
    "/atendimento",
    "/jogue",
    "/imagem-para-impressao-3d",
    "/chaveiros-personalizados",
    "/presentes-ate-50",
    "/organizadores",
    "/setup-gamer",
    "/brindes-e-lotes",
    "/peca-sob-medida",
    ...landingPaths,
    ...categoryPaths,
    "/divulgacao",
    "/politica-de-privacidade",
    "/politica-de-envio",
    "/politica-de-troca",
    "/termos-de-compra",
    "/prazo-de-producao",
    "/comprar-na-mdh3d",
    "/termos",
    "/trocas-e-devolucoes",
    "/entregas",
    "/faq",
    "/indicacao",
    "/guia-primeira-impressao-3d",
    "/merchant/products.xml",
    "/feeds/google-shopping.xml",
    "/feeds/meta-catalog.csv",
    "/feeds/produtos.json",
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
  const blogPages = blogPosts.map((post) => ({
    url: `${base}/blog/${post.slug}`,
    lastModified: new Date(post.updatedAt),
    changeFrequency: "monthly" as const,
    priority: 0.65,
  }));
  const smartStorePages = smartStoreProducts.map((product) => ({
    url: `${base}${buildProductPagePath(product)}`,
    lastModified: buildDate,
    changeFrequency: "weekly" as const,
    priority: 0.65,
  }));

  return [...staticPages, ...productPages, ...smartStorePages, ...blogPages];
}
