import commercialStorefrontJson from "@/data/commercial-storefront.json";
import { getProductAvailabilityMode, type ProductAvailabilityMode } from "@/lib/product-availability";

type CommercialProductLike = {
  id: string;
  name: string;
  description?: string;
  category?: string;
  subcategory?: string;
  theme?: string;
  collection?: string;
  tags?: string[];
  material?: string;
  finish?: string;
  pricePix?: number;
  baseCost?: number;
  estimatedUnitCost?: number;
  images?: string[];
  image?: string;
  stock?: number;
  readyToShip?: boolean;
  status?: string;
  availabilityMode?: ProductAvailabilityMode;
  manualPriceOverride?: boolean;
  [key: string]: unknown;
};

type CommercialProductOverride = Partial<CommercialProductLike> & {
  name: string;
  description: string;
  pricePix: number;
  grams: number;
  hours: number;
  estimatedGrams: number;
  estimatedHours: number;
  postProcessMinutes: number;
  failureReservePercent: number;
  overheadPercent: number;
};

type CommercialStorefrontConfig = {
  version: string;
  brand: string;
  maximumPublicProducts: number;
  minimumGrossMarginPercent: number;
  idealMaterials: string[];
  blockedTerms: string[];
  publicProductIds: string[];
  products: Record<string, CommercialProductOverride>;
};

const config = commercialStorefrontJson as CommercialStorefrontConfig;
const publicIdSet = new Set(config.publicProductIds);
const normalizedBlockedTerms = config.blockedTerms.map(normalizeText);
const normalizedIdealMaterials = config.idealMaterials.map(normalizeText);

function normalizeText(value: unknown) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function productText(product: CommercialProductLike) {
  return normalizeText([
    product.name,
    product.description,
    product.category,
    product.subcategory,
    product.theme,
    product.collection,
    ...(product.tags || []),
  ].filter(Boolean).join(" "));
}

function hasIdealMaterial(material: unknown) {
  const normalized = normalizeText(material);
  return normalizedIdealMaterials.some((allowed) => normalized.includes(allowed));
}

function isPlaceholderCopy(product: CommercialProductLike) {
  const name = normalizeText(product.name);
  const description = normalizeText(product.description);
  return (
    /^item \d+ from /.test(name) ||
    description.startsWith("description for item ") ||
    name.includes("produto exemplo") ||
    description.includes("lorem ipsum")
  );
}

export const COMMERCIAL_STOREFRONT_CONFIG = config;
export const COMMERCIAL_STOREFRONT_IDS = Object.freeze([...config.publicProductIds]);

export function hasCommercialProductOverride(productId: string) {
  return Object.prototype.hasOwnProperty.call(config.products, productId);
}

export function applyCommercialProductOverride<T extends CommercialProductLike>(product: T): T {
  const override = config.products[product.id];
  const merged = override
    ? ({
        ...product,
        ...override,
        tags: [...(override.tags || product.tags || [])],
        manualPriceOverride: true,
      } as T)
    : product;
  const availabilityMode = getProductAvailabilityMode(merged);

  return {
    ...merged,
    availabilityMode,
    readyToShip: availabilityMode === "in_stock",
    stock: availabilityMode === "in_stock" ? Math.max(0, Number(merged.stock || 0)) : 0,
    status:
      availabilityMode === "in_stock"
        ? "Pronta entrega"
        : availabilityMode === "made_to_order"
          ? "Sob encomenda"
          : "Indisponível",
  } as T;
}

export function applyCommercialCatalogVisibility<T extends CommercialProductLike>(products: T[]): T[] {
  const byId = new Map(products.map((product) => [product.id, product]));
  return config.publicProductIds
    .map((id) => byId.get(id))
    .filter((product): product is T => Boolean(product));
}

export function assertCommercialCatalog(products: CommercialProductLike[]) {
  const issues: string[] = [];
  const ids = products.map((product) => product.id);
  const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
  const missing = config.publicProductIds.filter((id) => !ids.includes(id));
  const unexpected = ids.filter((id) => !publicIdSet.has(id));

  if (products.length !== config.maximumPublicProducts) {
    issues.push(`Quantidade pública ${products.length}; esperado ${config.maximumPublicProducts}.`);
  }
  if (duplicates.length) issues.push(`IDs duplicados: ${[...new Set(duplicates)].join(", ")}.`);
  if (missing.length) issues.push(`Produtos comerciais ausentes: ${missing.join(", ")}.`);
  if (unexpected.length) issues.push(`Produtos não autorizados na vitrine: ${unexpected.join(", ")}.`);

  for (const product of products) {
    const text = productText(product);
    const blocked = normalizedBlockedTerms.filter((term) => text.includes(term));
    const price = Number(product.pricePix || 0);
    const cost = Number(product.estimatedUnitCost ?? product.baseCost ?? 0);
    const grossMargin = price > 0 ? ((price - cost) / price) * 100 : 0;
    const images = [product.image, ...(product.images || [])].filter(Boolean);

    if (isPlaceholderCopy(product)) issues.push(`${product.id}: texto provisório.`);
    if (blocked.length) issues.push(`${product.id}: termos bloqueados: ${blocked.join(", ")}.`);
    if (!hasIdealMaterial(product.material)) issues.push(`${product.id}: material fora do perfil A1/A1 Mini: ${product.material}.`);
    if (normalizeText(product.description).length < 80) issues.push(`${product.id}: descrição curta.`);
    if (!images.length) issues.push(`${product.id}: sem imagem.`);
    if (!(price > 0)) issues.push(`${product.id}: preço Pix inválido.`);
    if (!(cost > 0)) issues.push(`${product.id}: custo completo inválido.`);
    if (price > 0 && cost > 0 && grossMargin + 0.01 < config.minimumGrossMarginPercent) {
      issues.push(`${product.id}: margem ${grossMargin.toFixed(2)}% abaixo de ${config.minimumGrossMarginPercent}%.`);
    }
  }

  if (issues.length) {
    throw new Error(`CURADORIA COMERCIAL BLOQUEADA:\n- ${issues.join("\n- ")}`);
  }
}
