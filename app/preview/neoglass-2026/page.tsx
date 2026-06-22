import type { Metadata } from "next";
import { PreviewNeoGlassClient } from "@/app/preview/neoglass-2026/preview-neoglass-client";
import { getProductUrl, type Product } from "@/lib/catalog";
import { getCatalogSnapshot } from "@/lib/catalog-repository";
import { whatsappNumber } from "@/lib/constants";
import { buildMetaCommerceFeedData } from "@/lib/meta-commerce-feed";
import { getLocalStoreProducts } from "@/lib/mdh-store/products";
import { calculateCardPrice } from "@/lib/payment-pricing";
import { getPrimaryProductImage, getProductImageAlt, hasUsableProductImage } from "@/lib/product-images";
import { formatCurrency } from "@/lib/utils";
import { buildPublicCatalogStats } from "@/src/lib/catalog/stats";
import type { NeoGlassPreviewData, NeoGlassPreviewProduct } from "@/src/components/preview/neoglass/types";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Preview NeoGlass Commerce OS 2026",
  description: "Preview visual isolado da experiência MDH3D NeoGlass Commerce OS 2026.",
  robots: {
    index: false,
    follow: false,
  },
};

function textIncludes(product: Product, pattern: RegExp) {
  return pattern.test(`${product.name} ${product.category} ${product.subcategory} ${product.collection} ${product.tags.join(" ")}`);
}

function pickPreviewProducts(products: Product[]) {
  const active = products
    .filter((product) => Number(product.pricePix) > 0 && hasUsableProductImage(product))
    .sort((a, b) => Number(b.featured) - Number(a.featured) || a.pricePix - b.pricePix);
  const matchers = [
    /chaveiro/i,
    /suporte|controle|setup/i,
    /organizador|gaveta|mesa/i,
    /vaso|decor/i,
    /drag[aã]o/i,
    /copa|futebol|bola/i,
    /mini|chibi|colecion/i,
    /sob medida|personaliz/i,
  ];
  const selected = new Map<string, Product>();

  matchers.forEach((matcher) => {
    const product = active.find((item) => !selected.has(item.id) && textIncludes(item, matcher));
    if (product) selected.set(product.id, product);
  });

  active.forEach((product) => {
    if (selected.size < 8 && !selected.has(product.id)) selected.set(product.id, product);
  });

  return Array.from(selected.values()).slice(0, 8);
}

function toPreviewProduct(product: Product): NeoGlassPreviewProduct {
  const pricePix = Number(product.pricePix || product.price || 0);
  const priceCard = Number(product.priceCard || calculateCardPrice(pricePix));
  const badges = [
    product.readyToShip || product.status === "Pronta entrega" ? "Pronta entrega" : "Sob encomenda",
    product.customizable ? "Personalizável" : product.material,
    product.finish,
  ].filter(Boolean);

  return {
    id: product.id,
    name: product.name,
    sku: product.sku,
    category: product.category,
    href: getProductUrl(product),
    image: getPrimaryProductImage(product),
    imageAlt: getProductImageAlt(product),
    description: product.description,
    pricePix,
    priceCard,
    pricePixLabel: formatCurrency(pricePix),
    priceCardLabel: formatCurrency(priceCard),
    material: product.material,
    productionWindow: product.productionWindow,
    stock: product.stock,
    customizable: product.customizable,
    badges: badges.slice(0, 3),
  };
}

function buildWhatsappUrl(product?: NeoGlassPreviewProduct) {
  const message = product
    ? `Olá, vim pelo preview NeoGlass da MDH3D e quero orçamento/comprar: ${product.name}. SKU: ${product.sku}.`
    : "Olá, vim pelo preview NeoGlass da MDH3D e quero conhecer o catálogo.";
  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
}

function buildDropRails(products: NeoGlassPreviewProduct[]) {
  const byMatcher = (matcher: RegExp, fallbackStart: number) => {
    const matched = products.filter((product) => matcher.test(`${product.name} ${product.category}`));
    const fallback = products.slice(fallbackStart).concat(products).slice(0, 4);
    return (matched.length ? matched : fallback).slice(0, 4);
  };

  return [
    {
      id: "drops",
      title: "Drops da semana",
      subtitle: "Peças com leitura rápida para vitrine e campanhas.",
      products: products.slice(0, 4),
    },
    {
      id: "ate-50",
      title: "Presentes até R$50",
      subtitle: "Itens compactos para compra por impulso e datas especiais.",
      products: products.filter((product) => product.pricePix <= 50).slice(0, 4),
    },
    {
      id: "geek",
      title: "Geek e gamer",
      subtitle: "Colecionáveis, setup e mesa com apelo visual.",
      products: byMatcher(/geek|gamer|colecion|mini|chibi/i, 1),
    },
    {
      id: "casa",
      title: "Casa organizada",
      subtitle: "Organizadores, suportes e utilidades para rotina.",
      products: byMatcher(/casa|organizador|suporte|mesa|setup/i, 2),
    },
    {
      id: "sob-medida",
      title: "Sob medida",
      subtitle: "Ponto de entrada para orçamento, STL e personalização.",
      products: byMatcher(/personaliz|sob encomenda|sob medida/i, 3),
    },
  ].map((rail) => ({
    ...rail,
    products: rail.products.length ? rail.products : products.slice(0, 4),
  }));
}

export default async function NeoGlassPreviewPage() {
  const catalogProducts = await getCatalogSnapshot();
  const smartStoreProducts = getLocalStoreProducts();
  const publicStats = buildPublicCatalogStats(catalogProducts);
  const metaFeed = buildMetaCommerceFeedData();
  const previewProducts = pickPreviewProducts(catalogProducts).map(toPreviewProduct);
  const fallbackProduct = previewProducts[0];

  if (!fallbackProduct) {
    throw new Error("NeoGlass preview requires at least one public product with image.");
  }

  const categories = Array.from(new Set(previewProducts.map((product) => product.category))).slice(0, 8);
  const data: NeoGlassPreviewData = {
    metrics: {
      activeProducts: publicStats.activeProductCount,
      smartStoreProducts: smartStoreProducts.length,
      metaFeedValid: metaFeed.included,
      metaFeedSkipped: metaFeed.skipped.length,
      googleFeedItems: smartStoreProducts.length,
      genericDescriptions: 43,
      scoreLabel: "100/100/100",
      validatedMedia: publicStats.validatedMediaCount,
      readyToShip: publicStats.readyToShipCount,
    },
    categories,
    featuredProducts: previewProducts,
    dropRails: buildDropRails(previewProducts),
    heroProduct: previewProducts.find((product) => /chaveiro|copa|suporte/i.test(product.name)) || fallbackProduct,
    cinematicProduct: previewProducts.find((product) => product.pricePix >= 35) || fallbackProduct,
    whatsappUrl: buildWhatsappUrl(),
    catalogUrl: "/catalogo",
  };

  return <PreviewNeoGlassClient data={data} />;
}
