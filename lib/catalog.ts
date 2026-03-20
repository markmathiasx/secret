import { deliveryZones } from "@/lib/constants";
import { slugify } from "@/lib/utils";

export type PaymentMethod = "pix" | "cartao" | "boleto";
export type SalesChannel = "site" | "mercadolivre" | "shopee" | "whatsapp";
export type ProductType = "spare_part" | "upgrade" | "consumable" | "kit" | "accessory";
export type SupplierType = "oem" | "aftermarket" | "dropship" | "remanufaturado";
export type OriginalityLevel = "OEM" | "Compativel" | "Remanufaturado" | "Usado de maquina nova";
export type CompatibilityModel = "A1 Mini" | "A1";
export type ComponentScope = "toolhead" | "extrusora" | "motion" | "mesa" | "eletronica" | "acessorios";

export type ProductTechnical = {
  compatibilityModels: CompatibilityModel[];
  compatibilityVerified: boolean;
  seriesCompatible?: string;
  partNumber?: string;
  typeProduct: ProductType;
  supplierType: SupplierType;
  originalityLevel: OriginalityLevel;
  componentScope: ComponentScope;
  nozzleDiameterMm?: 0.2 | 0.4 | 0.6 | 0.8;
  tempMaxC?: number;
  voltage?: string;
  connectors?: string;
  dimensionsMm?: string;
  packageDimensionsMm?: string;
  weightProductG?: number;
  weightPackageG?: number;
  installTimeMin?: number;
  toolsRequired?: string[];
  safetyWarnings: string[];
  cadFiles?: string[];
  cadLicense?: string;
  bomItems?: { sku: string; name: string; qty: number }[];
  crossRefSkus?: string[];
  symptomTags?: string[];
};

export type Product = {
  id: string;
  sku: string;
  name: string;
  category: string;
  subcategory: string;
  theme: string;
  collection: string;
  colors: string[];
  grams: number;
  hours: number;
  complexity: number;
  featured: boolean;
  description: string;
  tags: string[];
  price?: number;
  printTime?: string;
  plaWeight?: string;
  dimensions: string;
  images: string[];
  licenseType?: "personal" | "commercial";
  variants?: { color: string; available: boolean }[];
  pricePix: number;
  priceCard: number;
  marketplaceSuggested: number;
  productionWindow: string;
  imageHint: string;
  image?: string;
  material: string;
  finish: string;
  status: "Pronta entrega" | "Sob encomenda";
  stock: number;
  customizable: boolean;
  readyToShip?: boolean;
  realPhoto?: boolean;
  technical: ProductTechnical;
  seoTitle: string;
  seoMetaDescription: string;
  discountPixPct: number;
  parcelamentoMax: number;
  leadTimeDays: number;
  rating: number;
  reviewCount: number;
};

type CatalogSeed = {
  id: string;
  sku: string;
  name: string;
  imageSrc: string;
  description: string;
  pricePix: number;
  category?: string;
  subcategory?: string;
  theme?: string;
  collection?: string;
  colors?: string[];
  grams?: number;
  hours?: number;
  complexity?: number;
  featured?: boolean;
  tags?: string[];
  dimensions?: string;
  licenseType?: "personal" | "commercial";
  productionWindow?: string;
  imageHint?: string;
  material?: string;
  finish?: string;
  status?: "Pronta entrega" | "Sob encomenda";
  stock?: number;
  customizable?: boolean;
  technical?: Partial<ProductTechnical>;
  seoTitle?: string;
  seoMetaDescription?: string;
  discountPixPct?: number;
  parcelamentoMax?: number;
  leadTimeDays?: number;
  rating?: number;
  reviewCount?: number;
};

const filamentCostPerGram = 0.11;
const defaultWarnings = [
  "Desligue e desconecte da tomada antes de instalar ou remover qualquer peca.",
  "Aguarde resfriamento completo do hotend antes de tocar no conjunto (A1 Mini pode operar ate 300C).",
];

function toPriceEnding(value: number) {
  const base = Math.max(9, Math.ceil(value));
  return Number((base - 0.1).toFixed(2));
}

function toMoney(value: number) {
  return Number(value.toFixed(2));
}

function buildTechnical(seed: CatalogSeed): ProductTechnical {
  const grams = seed.grams ?? 50;
  const technical: ProductTechnical = {
    compatibilityModels: ["A1 Mini", "A1"],
    compatibilityVerified: true,
    seriesCompatible: "A1 Series",
    partNumber: seed.sku,
    typeProduct: "accessory",
    supplierType: "aftermarket",
    originalityLevel: "Compativel",
    componentScope: "acessorios",
    dimensionsMm: seed.dimensions ?? "100x100x100",
    packageDimensionsMm: "120x120x80",
    weightProductG: grams,
    weightPackageG: grams + 30,
    installTimeMin: 1,
    toolsRequired: [],
    safetyWarnings: defaultWarnings,
    ...seed.technical,
  };
  technical.safetyWarnings = seed.technical?.safetyWarnings?.length ? seed.technical.safetyWarnings : defaultWarnings;
  return technical;
}

function createProduct(seed: CatalogSeed): Product {
  const colors = seed.colors ?? ["Preto"];
  const grams = seed.grams ?? 50;
  const hours = seed.hours ?? 2;
  const complexity = seed.complexity ?? 1.2;
  const status = seed.status ?? "Pronta entrega";
  const material = seed.material ?? "PLA Premium";
  const finish = seed.finish ?? "Fosco";
  const dimensions = seed.dimensions ?? "10x10x10cm";
  const imageHint = seed.imageHint ?? seed.name.toLowerCase();
  const productionWindow = seed.productionWindow ?? (status === "Pronta entrega" ? "24h a 48h" : "3 a 5 dias");
  const discountPixPct = seed.discountPixPct ?? 10;
  const parcelamentoMax = seed.parcelamentoMax ?? 12;
  const leadTimeDays = seed.leadTimeDays ?? (status === "Pronta entrega" ? 1 : 4);
  const rating = seed.rating ?? 4.8;
  const reviewCount = seed.reviewCount ?? 18;

  return {
    id: seed.id,
    sku: seed.sku,
    name: seed.name,
    category: seed.category ?? "Accessories",
    subcategory: seed.subcategory ?? "Linha marketplace",
    theme: seed.theme ?? "marketplace",
    collection: seed.collection ?? "Fotos reais",
    colors,
    grams,
    hours,
    complexity,
    featured: seed.featured ?? true,
    description: seed.description,
    tags: seed.tags ?? ["a1 mini", "foto real", "marketplace"],
    pricePix: seed.pricePix,
    priceCard: toMoney(seed.pricePix * 1.12),
    marketplaceSuggested: toMoney(seed.pricePix * 1.18),
    price: seed.pricePix,
    printTime: `${hours}h`,
    plaWeight: `${grams}g`,
    dimensions,
    images: [seed.imageSrc],
    image: seed.imageSrc,
    licenseType: seed.licenseType ?? "commercial",
    variants: colors.map((color) => ({ color, available: true })),
    productionWindow,
    imageHint,
    material,
    finish,
    status,
    stock: seed.stock ?? 10,
    customizable: seed.customizable ?? false,
    readyToShip: status === "Pronta entrega",
    realPhoto: true,
    technical: buildTechnical(seed),
    seoTitle: seed.seoTitle ?? seed.name,
    seoMetaDescription: seed.seoMetaDescription ?? seed.description,
    discountPixPct,
    parcelamentoMax,
    leadTimeDays,
    rating,
    reviewCount,
  };
}

const baseCatalog: Product[] = [
  createProduct({
    id: "real-001",
    sku: "A1M-CONS-GRINDER-HEX-BLK-R1",
    name: "Moedor Hex Black para limpeza de residuos (A1 Mini)",
    imageSrc: "/products/foto-001-grinder-01.webp",
    description: "Foto real do moedor preto com textura lateral e tampa rosqueada para rotina de bancada.",
    pricePix: 49.9,
    category: "Consumables",
    subcategory: "Limpeza e manutencao",
    tags: ["moedor", "limpeza", "bancada", "a1 mini"],
    technical: { typeProduct: "consumable", symptomTags: ["limpeza", "residuo"] },
  }),
  createProduct({
    id: "real-002",
    sku: "A1M-UPG-GRINDER-TURBINE-BLK-R1",
    name: "Moedor Turbine Pro de dupla tampa (A1 Mini)",
    imageSrc: "/products/foto-002-grinder-02.webp",
    description: "Foto real com o moedor aberto mostrando dentes internos e montagem robusta.",
    pricePix: 59.9,
    category: "Upgrades",
    subcategory: "Bancada e processo",
    technical: { typeProduct: "upgrade", crossRefSkus: ["A1M-CONS-GRINDER-HEX-BLK-R1"] },
  }),
  createProduct({
    id: "real-003",
    sku: "A1M-ACC-PASTA-HOLDER-R1",
    name: "Suporte compacto para tubo de pasta ou cola",
    imageSrc: "/products/foto-003-porta-creme-dental.webp",
    description: "Foto real de suporte preto com canaletas para organizar cola e insumos ao lado da impressora.",
    pricePix: 24.9,
    category: "Accessories",
    subcategory: "Organizacao de bancada",
    customizable: true,
    technical: { typeProduct: "accessory" },
  }),
  createProduct({
    id: "real-004",
    sku: "A1M-ACC-DEMOGORGON-DISPLAY-R1",
    name: "Display Demogorgon 3D para setup de oficina",
    imageSrc: "/products/foto-004-demogorgon.webp",
    description: "Foto real da miniatura em cenario dark para vitrine e decoracao de estacao de trabalho.",
    pricePix: 89.9,
    status: "Sob encomenda",
    category: "Accessories",
    subcategory: "Decoracao geek",
    licenseType: "personal",
    technical: { compatibilityModels: ["A1 Mini"], typeProduct: "accessory" },
  }),
  createProduct({
    id: "real-005",
    sku: "A1M-ACC-KITTY-JEDI-R1",
    name: "Hello Kitty Jedi Edition para mesa de impressao",
    imageSrc: "/products/foto-005-hello-kitty-jedi.webp",
    description: "Foto real da personagem em base tematica para colecao e destaque na bancada.",
    pricePix: 79.9,
    status: "Sob encomenda",
    category: "Accessories",
    subcategory: "Decoracao geek",
    licenseType: "personal",
    technical: { compatibilityModels: ["A1 Mini"], typeProduct: "accessory" },
  }),
  createProduct({
    id: "real-006",
    sku: "A1M-SPARE-PLACA-PORTAL-R1",
    name: "Placa decorativa Portal para setup A1 Mini",
    imageSrc: "/products/foto-006-stencil-rick-morty.webp",
    description: "Foto real da placa vazada em mao com leitura forte para parede, setup e vitrine geek.",
    pricePix: 44.9,
    category: "Spare parts",
    subcategory: "Placa e recorte",
    customizable: true,
    technical: { typeProduct: "spare_part", cadFiles: ["/downloads/cad/placa-portal.stl"] },
  }),
  createProduct({
    id: "real-007",
    sku: "A1M-KIT-FAMILIA-CUSTOM-R1",
    name: "Kit estatueta familia personalizada",
    imageSrc: "/products/foto-007-familia-custom.webp",
    description: "Foto real da familia em base branca para presentes afetivos e encomendas sob medida.",
    pricePix: 159.9,
    category: "Kits",
    subcategory: "Personalizados",
    status: "Sob encomenda",
    customizable: true,
    technical: {
      typeProduct: "kit",
      bomItems: [
        { sku: "BASE-CUSTOM-WHITE", name: "Base personalizada", qty: 1 },
        { sku: "BONECO-CUSTOM-FAMILIA", name: "Conjunto de personagens", qty: 1 },
      ],
    },
  }),
  createProduct({
    id: "real-008",
    sku: "A1M-ACC-BONECA-RAINBOW-R1",
    name: "Boneca Arco-Iris para vitrine infantil",
    imageSrc: "/products/foto-008-boneca-crianca.webp",
    description: "Foto real da boneca em base com flores e arco-iris para decoracao infantil.",
    pricePix: 119.9,
    category: "Accessories",
    subcategory: "Decoracao infantil",
    status: "Sob encomenda",
    customizable: true,
    technical: { typeProduct: "accessory" },
  }),
  createProduct({
    id: "real-009",
    sku: "A1M-SPARE-CASE-LIGHTER-SKULL-R1",
    name: "Case Skull para isqueiro - reposicao premium",
    imageSrc: "/products/foto-009-case-isqueiro-caveira.webp",
    description: "Foto real do case preto com relevo de caveira e textura de pegada firme.",
    pricePix: 29.9,
    category: "Spare parts",
    subcategory: "Case de protecao",
    technical: { compatibilityModels: ["A1 Mini"], typeProduct: "spare_part" },
  }),
  createProduct({
    id: "real-010",
    sku: "A1M-ACC-HOMER-PIKA-R1",
    name: "Homer Pikachu Mashup para colecao geek",
    imageSrc: "/products/foto-010-homer-pikachu.webp",
    description: "Foto real da figure amarela segurando donut para setup geek e presentes.",
    pricePix: 74.9,
    category: "Accessories",
    subcategory: "Decoracao geek",
    status: "Sob encomenda",
    licenseType: "personal",
    technical: { compatibilityModels: ["A1 Mini"], typeProduct: "accessory" },
  }),
  createProduct({
    id: "real-011",
    sku: "A1M-CONS-KEYTAG-MASON-R1",
    name: "Chaveiro medalha personalizado premium",
    imageSrc: "/products/foto-011-chaveiro-maconaria.webp",
    description: "Foto real da medalha com corrente metalica para brindes e lotes personalizados.",
    pricePix: 22.9,
    featured: false,
    category: "Consumables",
    subcategory: "Chaveiros e tags",
    customizable: true,
    technical: { typeProduct: "consumable", cadFiles: ["/downloads/cad/chaveiro-medalha.stl"] },
  }),
  createProduct({
    id: "real-012",
    sku: "A1M-ACC-KEYCHAIN-BRASIL-R1",
    name: "Chaveiro Brasil multicor em camadas",
    imageSrc: "/products/foto-012-chaveiro-brasil.webp",
    description: "Foto real na mao mostrando bandeira e escudo em camadas para lembrancas e presentes.",
    pricePix: 18.9,
    category: "Accessories",
    subcategory: "Chaveiros e tags",
    customizable: true,
    technical: { typeProduct: "accessory" },
  }),
  createProduct({
    id: "real-013",
    sku: "A1M-ACC-KEYCHAIN-YOSHI-R1",
    name: "Chaveiro Yoshi verde para colecao gamer",
    imageSrc: "/products/foto-013-chaveiro-yoshi.webp",
    description: "Foto real do lote de chaveiros verdes em mesa de impressora para giro rapido.",
    pricePix: 19.9,
    category: "Accessories",
    subcategory: "Chaveiros e tags",
    technical: { typeProduct: "accessory", symptomTags: ["lote", "evento gamer"] },
  }),
  createProduct({
    id: "real-014",
    sku: "A1M-KIT-MASCOTE-GAMER-CAT-R1",
    name: "Kit mascote gata gamer personalizada",
    imageSrc: "/products/foto-014-gatinha-headset.webp",
    description: "Foto real da mascote laranja com headset para kits de creator e streamers.",
    pricePix: 69.9,
    category: "Kits",
    subcategory: "Mascotes custom",
    status: "Sob encomenda",
    customizable: true,
    technical: {
      compatibilityModels: ["A1 Mini"],
      typeProduct: "kit",
      bomItems: [
        { sku: "MASCOTE-CAT-BODY", name: "Corpo principal", qty: 1 },
        { sku: "MASCOTE-CAT-HEADSET", name: "Headset e aderecos", qty: 1 },
      ],
    },
  }),
];

const curatedCatalog: Product[] = baseCatalog;

export const catalog = curatedCatalog;
export const featuredCatalog = curatedCatalog.filter((item) => item.featured).slice(0, 12);
export const categories = Array.from(new Set(curatedCatalog.map((item) => item.category)));
export const collections = Array.from(new Set(curatedCatalog.map((item) => item.collection)));
export const technicalScopes = Array.from(new Set(curatedCatalog.map((item) => item.technical.componentScope)));
export const supportedCompatibilityModels: CompatibilityModel[] = ["A1 Mini", "A1"];

export function getProductUrl(product: Product) {
  return `/catalogo/${product.id}-${slugify(product.name)}`;
}

export function findProduct(id: string) {
  return curatedCatalog.find((item) => item.id === id);
}

export function findProductBySlug(slug: string) {
  return curatedCatalog.find((item) => getProductUrl(item).endsWith(slug));
}

export function getProductsByType(typeProduct: ProductType) {
  return curatedCatalog.filter((item) => item.technical.typeProduct === typeProduct);
}

export function searchCatalog(query: string) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return curatedCatalog;

  return curatedCatalog.filter((item) =>
    [
      item.name,
      item.category,
      item.subcategory,
      item.theme,
      item.description,
      item.collection,
      item.material,
      item.finish,
      item.sku,
      item.technical.partNumber || "",
      item.technical.typeProduct,
      item.technical.componentScope,
      ...(item.tags || []),
      ...(item.technical.symptomTags || []),
    ]
      .join(" ")
      .toLowerCase()
      .includes(normalized)
  );
}

export function calculateBaseCost(grams: number, hours: number, complexity = 1) {
  const material = grams * filamentCostPerGram;
  const machine = Math.max(2, hours * 2.75);
  const acabamento = Math.max(1.5, complexity * 2.2);
  return Number((material + machine + acabamento).toFixed(2));
}

export function calculateSalePrice(
  grams: number,
  hours: number,
  complexity = 1,
  paymentMethod: PaymentMethod = "pix",
  channel: SalesChannel = "site"
) {
  let price = calculateBaseCost(grams, hours, complexity) * 1.95;
  if (paymentMethod === "cartao") price *= 1.12;
  if (paymentMethod === "boleto") price *= 1.08;
  if (channel === "mercadolivre") price *= 1.15;
  if (channel === "shopee") price *= 1.12;
  return toPriceEnding(price);
}

export const defaultPricingExamples = [
  { title: "Chaveiro multicor", grams: 18, hours: 0.9, complexity: 1.12 },
  { title: "Case para isqueiro", grams: 26, hours: 1.1, complexity: 1.16 },
  { title: "Display colecionavel", grams: 96, hours: 4.9, complexity: 1.47 },
  { title: "Kit personalizado", grams: 162, hours: 7.4, complexity: 1.72 },
].map((item) => ({
  ...item,
  pricePix: calculateSalePrice(item.grams, item.hours, item.complexity, "pix", "site"),
  priceCard: calculateSalePrice(item.grams, item.hours, item.complexity, "cartao", "site"),
}));

export const deliverySummary = [...deliveryZones];
