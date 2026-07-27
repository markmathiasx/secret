export type ProductAvailabilityMode = "in_stock" | "made_to_order" | "out_of_stock";

export type ProductAvailabilityLike = {
  availabilityMode?: string | null;
  stock?: number | null;
  status?: string | null;
  readyToShip?: boolean | null;
};

const VALID_AVAILABILITY_MODES = new Set<ProductAvailabilityMode>([
  "in_stock",
  "made_to_order",
  "out_of_stock",
]);

function normalizeText(value: unknown) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export function coerceProductAvailabilityMode(value: unknown): ProductAvailabilityMode | null {
  const normalized = normalizeText(value);

  if (!normalized) return null;
  if (VALID_AVAILABILITY_MODES.has(normalized as ProductAvailabilityMode)) {
    return normalized as ProductAvailabilityMode;
  }
  if (normalized.includes("made_to_order") || normalized.includes("sob encomenda") || normalized.includes("preorder")) {
    return "made_to_order";
  }
  if (normalized.includes("out_of_stock") || normalized.includes("indispon")) {
    return "out_of_stock";
  }
  if (normalized.includes("in_stock") || normalized.includes("pronta")) {
    return "in_stock";
  }

  return null;
}

export function getProductAvailabilityMode(product: ProductAvailabilityLike): ProductAvailabilityMode {
  const explicitMode = coerceProductAvailabilityMode(product.availabilityMode);
  if (explicitMode) return explicitMode;

  const stock = Math.max(0, Number(product.stock || 0));
  const normalizedStatus = normalizeText(product.status);

  if (product.readyToShip === true || normalizedStatus.includes("pronta entrega")) {
    return stock > 0 ? "in_stock" : "out_of_stock";
  }
  if (normalizedStatus.includes("sob encomenda") || product.readyToShip === false) {
    return "made_to_order";
  }

  return stock > 0 ? "in_stock" : "out_of_stock";
}

export function isInStockProduct(product: ProductAvailabilityLike) {
  return getProductAvailabilityMode(product) === "in_stock";
}

export function isMadeToOrderProduct(product: ProductAvailabilityLike) {
  return getProductAvailabilityMode(product) === "made_to_order";
}

export function isOutOfStockProduct(product: ProductAvailabilityLike) {
  return getProductAvailabilityMode(product) === "out_of_stock";
}

export function getPublicStockQuantity(product: ProductAvailabilityLike) {
  return isInStockProduct(product) ? Math.max(0, Number(product.stock || 0)) : 0;
}

export function getPublicAvailabilityLabel(product: ProductAvailabilityLike) {
  const availabilityMode = getProductAvailabilityMode(product);
  if (availabilityMode === "in_stock") return "Pronta entrega";
  if (availabilityMode === "made_to_order") return "Sob encomenda";
  return "Indisponível";
}

export function getStructuredDataAvailability(product: ProductAvailabilityLike) {
  const availabilityMode = getProductAvailabilityMode(product);
  if (availabilityMode === "in_stock") return "https://schema.org/InStock";
  if (availabilityMode === "made_to_order") return "https://schema.org/PreOrder";
  return "https://schema.org/OutOfStock";
}

export function getCommerceFeedAvailability(product: ProductAvailabilityLike) {
  const availabilityMode = getProductAvailabilityMode(product);
  if (availabilityMode === "in_stock") return "in stock";
  if (availabilityMode === "made_to_order") return "preorder";
  return "out of stock";
}

export function getMerchantFeedAvailability(product: ProductAvailabilityLike) {
  const availabilityMode = getProductAvailabilityMode(product);
  if (availabilityMode === "in_stock") return "in_stock";
  if (availabilityMode === "made_to_order") return "preorder";
  return "out_of_stock";
}
