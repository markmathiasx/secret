import commercialStorefrontJson from "@/data/commercial-storefront.json";
import { calculateCardPrice } from "@/lib/payment-pricing";
import { getProductUrl } from "@/lib/product-routing";

type ProductCopy = {
  shortDescription: string;
  longDescription: string;
  featured?: boolean;
  acceptsPersonalizationText?: boolean;
  personalizationLabel?: string;
  personalizationPlaceholder?: string;
};

type StorefrontSourceProduct = {
  name: string;
  description: string;
  category: string;
  subcategory?: string;
  tags?: string[];
  pricePix: number;
  material: string;
  finish: string;
  productionWindow: string;
  stock?: number;
  featured?: boolean;
  customizable?: boolean;
};

type CommercialStorefrontJson = {
  publicProductIds: string[];
  products: Record<string, StorefrontSourceProduct>;
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

const storefrontConfig = commercialStorefrontJson as CommercialStorefrontJson;
const curatedSourceIds = [...storefrontConfig.publicProductIds];

const copyBySourceId: Record<string, ProductCopy> = {
  "mdh-013": {
    shortDescription: "Suporte 3D para headphone com acabamento limpo, base firme e visual profissional para setup.",
    longDescription:
      "Peça pensada para quem quer organizar a bancada sem perder estética. Funciona bem em home office, setup gamer e presente útil, com produção local no Rio e prazo curto para fechamento.",
    featured: true,
  },
  "mdh-014": {
    shortDescription: "Organizador de cabos para mesa, rack ou bancada com instalação simples e visual discreto.",
    longDescription:
      "Ideal para eliminar fios soltos no setup, no escritório ou em estações de atendimento. É um item de ticket acessível, recorrente em reposição e bom para compra rápida pela web.",
    featured: true,
  },
  "mdh-015": {
    shortDescription: "Suporte para celular com boa estabilidade para videochamada, estudos, cozinha ou mesa de trabalho.",
    longDescription:
      "Resolve uso diário com uma peça compacta, leve e fácil de presentear. Funciona bem para clientes que querem utilidade imediata e compra direta sem briefing longo.",
    featured: true,
  },
  "mdh-016": {
    shortDescription: "Chaveiro 3D personalizável para nome, frase curta, logo ou ação promocional.",
    longDescription:
      "Ótimo para brinde, lembrança, evento e venda em lote. A personalização simples ajuda a converter rápido, especialmente para pedidos corporativos ou presentes de baixo ticket.",
    featured: true,
    acceptsPersonalizationText: true,
    personalizationLabel: "Nome, frase ou referência do chaveiro",
    personalizationPlaceholder: "Ex.: Ana Clara, Team RJ 2026 ou logo circular em preto",
  },
  "mdh-017": {
    shortDescription: "Suporte para controle PS5 com leitura premium, base segura e cara de produto acabado.",
    longDescription:
      "Peça com apelo forte para setup gamer, presente geek e organização da bancada. Entra bem em campanhas de conversão porque combina desejo visual com utilidade clara.",
  },
  "mdh-019": {
    shortDescription: "Porta-copos geek em impressão 3D para mesa gamer, home office ou presente temático.",
    longDescription:
      "É um item simples de explicar, fácil de comprar por impulso e ótimo para kits. Pode ser vendido sozinho, em pares ou em combos com outras utilidades do setup.",
  },
  "mdh-022": {
    shortDescription: "Organizador de canetas e acessórios de mesa para escritório, estudo ou bancada criativa.",
    longDescription:
      "Ajuda a organizar materiais do dia a dia com visual limpo e fabricação local. Funciona bem para clientes que buscam utilidade e boa apresentação sem depender de customização complexa.",
  },
  "mdh-025": {
    shortDescription: "Vaso geométrico decorativo para mesa, estante, aparador ou presente de casa nova.",
    longDescription:
      "Produto de decoração com boa percepção de valor e compra direta. É indicado para clientes que querem presentear ou compor ambientes com uma peça leve e marcante.",
  },
  "mdh-028": {
    shortDescription: "Luminária LED personalizada para nome, frase, logo ou peça decorativa com alto impacto visual.",
    longDescription:
      "Excelente produto para presente, quarto gamer, mesa de trabalho e ações promocionais. Tem potencial alto de compartilhamento em conteúdo e boa conversão com prova visual e CTA direto.",
    acceptsPersonalizationText: true,
    personalizationLabel: "Texto da luminária",
    personalizationPlaceholder: "Ex.: Studio MDH, Pedro, Setup Zone ou frase curta",
  },
  "mdh-029": {
    shortDescription: "Foto litofania em 3D para presente afetivo, decoração com iluminação e lembrança personalizada.",
    longDescription:
      "Converte bem para datas comemorativas porque transforma foto em peça física com valor emocional alto. É um produto comercial forte para intenção de presente e orçamento claro.",
    acceptsPersonalizationText: true,
    personalizationLabel: "Texto ou contexto da foto",
    personalizationPlaceholder: "Ex.: foto de casal, homenagem para mãe ou aniversário de 15 anos",
  },
  "mdh-038": {
    shortDescription: "Projeto 3D personalizado para nome, frase, presente, peça decorativa ou pedido sob medida.",
    longDescription:
      "Entrada comercial para quem ainda não encontrou a peça certa no catálogo. O cliente pode enviar texto, referência, logo, uso esperado ou briefing curto para receber uma proposta clara e seguir para produção.",
    featured: true,
    acceptsPersonalizationText: true,
    personalizationLabel: "Descreva o que você quer personalizado",
    personalizationPlaceholder: "Ex.: nome em 3D para mesa, topo de bolo, peça com logotipo ou referência de presente",
  },
  "mdh-053": {
    shortDescription: "Caixa organizadora modular com tampa para mesa, armário, home office ou bancada.",
    longDescription:
      "Organiza pequenos objetos com leitura mais premium do que caixas genéricas e ajuda a compor kits de organização. Funciona bem para quem quer utilidade prática com acabamento consistente.",
  },
};

function slugifyStorefrontName(value: string) {
  return value
    .normalize("NFD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-");
}

function skuFromProductId(productId: string) {
  const numeric = productId.match(/\d+/)?.[0] || productId;
  return `MDH-${numeric.padStart(4, "0")}`;
}

function imagePathsForProduct(productId: string) {
  return [
    `/products/catalog/${productId}.webp`,
    `/products/gallery/${productId}/2.webp`,
    `/products/gallery/${productId}/3.webp`,
  ];
}

function assertProduct(productId: string) {
  const product = storefrontConfig.products[productId];
  if (!product) {
    throw new Error(`Produto comercial não encontrado para ${productId}.`);
  }
  return product;
}

function getProductCopy(productId: string, product: StorefrontSourceProduct): ProductCopy {
  return (
    copyBySourceId[productId] || {
      shortDescription: product.description,
      longDescription: `${product.name} com produção local, preço claro e confirmação do prazo antes do envio.`,
      featured: product.featured,
      acceptsPersonalizationText: product.customizable,
    }
  );
}

function buildStorefrontProduct(
  productId: string,
  product: StorefrontSourceProduct,
  copy: ProductCopy,
  overrides?: Partial<StorefrontProduct>
): StorefrontProduct {
  const slug = overrides?.slug || slugifyStorefrontName(product.name);
  const pricePix = overrides?.pricePix ?? product.pricePix;
  const id = overrides?.id || productId;

  return {
    id,
    sourceId: overrides?.sourceId ?? productId,
    sku: overrides?.sku || skuFromProductId(productId),
    slug,
    href: overrides?.href || getProductUrl({ id: productId, slug, name: product.name }),
    name: overrides?.name || product.name,
    category: overrides?.category || product.category,
    shortDescription: copy.shortDescription,
    longDescription: copy.longDescription,
    images: overrides?.images || imagePathsForProduct(productId),
    stock: overrides?.stock ?? product.stock ?? 0,
    tags: overrides?.tags || product.tags || [],
    price: overrides?.price ?? pricePix,
    pricePix,
    priceCard: calculateCardPrice(pricePix),
    priceFromLabel: overrides?.priceFromLabel || `A partir de R$ ${pricePix.toFixed(2).replace(".", ",")}`,
    material: overrides?.material || product.material,
    finish: overrides?.finish || product.finish,
    productionWindow: overrides?.productionWindow || product.productionWindow,
    featured: overrides?.featured ?? copy.featured ?? product.featured ?? false,
    customizable: overrides?.customizable ?? product.customizable ?? false,
    acceptsPersonalizationText:
      overrides?.acceptsPersonalizationText ?? copy.acceptsPersonalizationText ?? false,
    personalizationLabel: overrides?.personalizationLabel || copy.personalizationLabel,
    personalizationPlaceholder:
      overrides?.personalizationPlaceholder || copy.personalizationPlaceholder,
  };
}

const curatedProducts = curatedSourceIds.map((sourceId) => {
  const product = assertProduct(sourceId);
  return buildStorefrontProduct(sourceId, product, getProductCopy(sourceId, product));
});

const customBase = assertProduct("mdh-038");

export const storefrontProducts: StorefrontProduct[] = [
  ...curatedProducts,
  buildStorefrontProduct("mdh-038", customBase, copyBySourceId["mdh-038"], {
    id: "mdh-custom",
    sourceId: null,
    sku: "MDH-CUSTOM",
    slug: "projeto-3d-personalizado",
    href: "/checkout",
    name: "Projeto 3D Personalizado",
    category: "Sob medida",
    stock: 99,
    price: 89.9,
    pricePix: 89.9,
    priceCard: calculateCardPrice(89.9),
    priceFromLabel: "Projetos a partir de R$ 89,90",
    material: "PLA Premium ou sob análise",
    finish: "Sob medida",
    productionWindow: "3 a 7 dias úteis",
    featured: true,
    customizable: true,
    acceptsPersonalizationText: true,
  }),
];

export const featuredStorefrontProducts = storefrontProducts.filter((product) => product.featured);
export const bestsellerStorefrontProducts = storefrontProducts.slice(0, 6);
export const highlightStorefrontProducts = storefrontProducts.slice(6, 12);

export function findStorefrontProductById(productId: string) {
  return storefrontProducts.find((product) => product.id === productId || product.sourceId === productId) || null;
}

export function findStorefrontProductBySlug(slug: string) {
  return storefrontProducts.find((product) => product.slug === slug) || null;
}

export function resolveStorefrontHref(productId: string) {
  const storefrontProduct = findStorefrontProductById(productId);
  if (storefrontProduct) {
    return storefrontProduct.href;
  }

  if (/^mdh-\d+$/i.test(productId)) {
    return getProductUrl({ id: productId, name: productId });
  }

  return "/catalogo";
}
