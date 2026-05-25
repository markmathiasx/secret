import { findProduct, getProductUrl, type Product as CatalogProduct } from "@/lib/catalog";
import { calculateCardPrice } from "@/lib/payment-pricing";
import { slugify } from "@/lib/utils";

type ProductCopy = {
  shortDescription: string;
  longDescription: string;
  featured?: boolean;
  acceptsPersonalizationText?: boolean;
  personalizationLabel?: string;
  personalizationPlaceholder?: string;
};

export type StorefrontProduct = {
  id: string;
  sourceId: string | null;
  sku: string;
  slug: string;
  href: string;
  name: string;
  category: string;
  shortDescription: string;
  longDescription: string;
  images: string[];
  stock: number;
  tags: string[];
  price: number;
  pricePix: number;
  priceCard: number;
  priceFromLabel: string;
  material: string;
  finish: string;
  productionWindow: string;
  featured: boolean;
  customizable: boolean;
  acceptsPersonalizationText: boolean;
  personalizationLabel?: string;
  personalizationPlaceholder?: string;
};

const curatedSourceIds = [
  "mdh-a1-001",
  "mdh-a1-002",
  "mdh-a1-003",
  "mdh-a1-008",
  "mdh-a1-009",
  "mdh-a1-017",
  "mdh-a1-019",
  "mdh-a1-023",
  "mdh-a1-026",
  "mdh-a1-031",
  "mdh-a1-040",
  "mdh-a1-048",
] as const;

const copyBySourceId: Record<(typeof curatedSourceIds)[number], ProductCopy> = {
  "mdh-a1-001": {
    shortDescription: "Suporte 3D para headset com design Arc, base firme e visual profissional.",
    longDescription:
      "Peça pensada para organizar seu setup sem perder a estética. Funciona bem em home office ou quarto gamer, com produção local no Rio.",
    featured: true,
  },
  "mdh-a1-002": {
    shortDescription: "Dock para controle Solo, compatível com PS5, Xbox e Switch.",
    longDescription:
      "Base estável e minimalista para manter seu controle sempre à mão e seu setup organizado.",
    featured: true,
  },
  "mdh-a1-003": {
    shortDescription: "Suporte para celular Tilt com ângulo otimizado para videochamadas.",
    longDescription:
      "Compacto e funcional, ideal para deixar na mesa de trabalho ou cabeceira.",
    featured: true,
  },
  "mdh-a1-008": {
    shortDescription: "Suporte para notebook Lift, par robusto para melhor ergonomia.",
    longDescription:
      "Eleva seu notebook para uma melhor postura e resfriamento, feito em PETG resistente.",
    featured: true,
  },
  "mdh-a1-009": {
    shortDescription: "Vaso geométrico Geo Mini com acabamento Silk luxuoso.",
    longDescription:
      "Peça decorativa marcante para suculentas ou para compor prateleiras e mesas.",
    featured: true,
  },
  "mdh-a1-017": {
    shortDescription: "Seu nome ou palavra em 3D com design exclusivo Desk.",
    longDescription:
      "Personalize sua mesa com seu nome em relevo e acabamento de alta qualidade.",
    featured: true,
    acceptsPersonalizationText: true,
    personalizationLabel: "Nome ou palavra",
    personalizationPlaceholder: "Ex.: Marina, Gamer, Studio",
  },
  "mdh-a1-019": {
    shortDescription: "Placa Pix Premium para balcão ou recepção.",
    longDescription:
      "Expositor profissional para seu QR Code do Pix, facilitando as vendas do seu negócio.",
    featured: true,
    acceptsPersonalizationText: true,
    personalizationLabel: "Chave Pix (opcional para o QR)",
    personalizationPlaceholder: "Ex.: seu-email@site.com",
  },
  "mdh-a1-023": {
    shortDescription: "Colecionável autoral Guardião Chibi com acabamento Matte.",
    longDescription:
      "Peça exclusiva MDH 3D, com design expressivo para colecionadores.",
    featured: true,
  },
  "mdh-a1-026": {
    shortDescription: "Máscara Samurai em suporte, peça premium de colecionador.",
    longDescription:
      "Destaque absoluto para qualquer estante geek ou setup temático oriental.",
    featured: true,
  },
  "mdh-a1-031": {
    shortDescription: "Placa Gamer Neon Frame com visual moderno e vibrante.",
    longDescription:
      "Ideal para dar aquele clima de stream ou quarto gamer com design inspirado em neon.",
    featured: true,
  },
  "mdh-a1-040": {
    shortDescription: "Luminária Orb Mini para iluminação decorativa e difusa.",
    longDescription:
      "Cria um ambiente aconchegante com design esférico minimalista.",
    featured: true,
  },
  "mdh-a1-048": {
    shortDescription: "Projeto 3D personalizado sob medida para suas necessidades.",
    longDescription:
      "Modelagem e impressão para projetos especiais que não estão no catálogo.",
    featured: true,
    acceptsPersonalizationText: true,
    personalizationLabel: "Descreva sua ideia",
    personalizationPlaceholder: "Ex.: Peça técnica, topo de bolo específico, etc.",
  },
};

function assertProduct(productId: string) {
  const product = findProduct(productId);
  if (!product) {
    throw new Error(`Produto base não encontrado para ${productId}.`);
  }
  return product;
}

function buildStorefrontProduct(product: CatalogProduct, copy: ProductCopy, overrides?: Partial<StorefrontProduct>): StorefrontProduct {
  const slug = overrides?.slug || product.slug || slugify(product.name);
  const pricePix = overrides?.pricePix ?? product.pricePix;

  return {
    id: overrides?.id || product.id,
    sourceId: overrides?.sourceId ?? product.id,
    sku: overrides?.sku || product.sku,
    slug,
    href: overrides?.href || getProductUrl({ ...product, slug }),
    name: overrides?.name || product.name,
    category: overrides?.category || product.category,
    shortDescription: copy.shortDescription,
    longDescription: copy.longDescription,
    images: overrides?.images || product.images || [product.image || ""].filter(Boolean),
    stock: overrides?.stock ?? Math.max(1, product.stock),
    tags: overrides?.tags || product.tags,
    price: overrides?.price ?? pricePix,
    pricePix,
    priceCard: calculateCardPrice(pricePix),
    priceFromLabel: overrides?.priceFromLabel || `A partir de R$ ${pricePix.toFixed(2).replace(".", ",")}`,
    material: overrides?.material || product.material,
    finish: overrides?.finish || product.finish,
    productionWindow: overrides?.productionWindow || product.productionWindow,
    featured: overrides?.featured ?? copy.featured ?? product.featured,
    customizable: overrides?.customizable ?? product.customizable,
    acceptsPersonalizationText:
      overrides?.acceptsPersonalizationText ?? copy.acceptsPersonalizationText ?? false,
    personalizationLabel: overrides?.personalizationLabel || copy.personalizationLabel,
    personalizationPlaceholder:
      overrides?.personalizationPlaceholder || copy.personalizationPlaceholder,
  };
}

const curatedProducts = curatedSourceIds.map((sourceId) =>
  buildStorefrontProduct(assertProduct(sourceId), copyBySourceId[sourceId])
);

export const storefrontProducts: StorefrontProduct[] = [
  ...curatedProducts,
];

export const bestsellerStorefrontProducts = storefrontProducts.filter(p => p.featured).slice(0, 4);
export const highlightStorefrontProducts = storefrontProducts.filter(p => p.featured).slice(4, 8);

export function findStorefrontProductById(id: string) {
  return storefrontProducts.find((p) => p.id === id) || null;
}

export function resolveStorefrontHref(id: string) {
  const p = findStorefrontProductById(id);
  return p ? p.href : "/catalogo";
}
