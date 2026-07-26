export type OperationalCostProduct = {
  name: string;
  category?: string;
  subcategory?: string;
  collection?: string;
  tags?: string[];
  customizable?: boolean;
  finish?: string;
  material?: string;
  grams?: number;
  estimatedGrams?: number;
  hardwareCost?: number;
  retailPackagingCost?: number;
  shippingSuppliesCost?: number;
  failureReservePercent?: number;
  designSetupCost?: number;
};

export const OPERATIONAL_COST_DEFAULTS = Object.freeze({
  keychainSplitRing: 0.22,
  keychainChain: 0.18,
  keychainMetalHardware: 0.4,
  keychainRetailPackaging: 0.25,
  keychainPersonalizationSetup: 5,
  smallShippingEnvelope: 0.45,
  shippingLabel: 0.15,
  tapeAndProtection: 0.1,
  mediumShippingSupplies: 1.4,
  failureReservePercent: 8,
  overheadPercent: 8,
  targetGrossMarginPercent: 30,
});

function finiteNonNegative(value: unknown, fallback: number) {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 ? value : fallback;
}

function normalizedText(product: OperationalCostProduct) {
  return [
    product.name,
    product.category,
    product.subcategory,
    product.collection,
    product.finish,
    product.material,
    ...(product.tags || []),
  ]
    .filter(Boolean)
    .join(" ")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export function isKeychainProduct(product: OperationalCostProduct) {
  const blob = normalizedText(product);
  return ["chaveiro", "keychain", "pingente", "tag pet", "tag de identificacao"].some((term) =>
    blob.includes(term)
  );
}

export function inferPackQuantity(product: OperationalCostProduct) {
  const blob = normalizedText(product);
  const matches = [
    blob.match(/(?:kit|lote|pacote)\s*(?:com\s*)?(\d{1,3})/),
    blob.match(/(\d{1,3})\s*(?:unidades|unidade|un\b|pcs\b|pecas|peças|chaveiros)/),
  ];
  for (const match of matches) {
    const quantity = Number(match?.[1]);
    if (Number.isFinite(quantity) && quantity >= 1 && quantity <= 500) return Math.floor(quantity);
  }
  return 1;
}

export function getOperationalCostExtras(product: OperationalCostProduct) {
  const isKeychain = isKeychainProduct(product);
  const packQuantity = isKeychain ? inferPackQuantity(product) : 1;
  const grams = finiteNonNegative(product.estimatedGrams ?? product.grams, 0);
  const blob = normalizedText(product);
  const isMediumParcel = grams > 80 || blob.includes("premium") || packQuantity >= 10;
  const isBatch = ["lote", "atacado", "corporativo", "brinde"].some((term) => blob.includes(term));

  const defaultShippingSupplies = isMediumParcel
    ? OPERATIONAL_COST_DEFAULTS.mediumShippingSupplies
    : OPERATIONAL_COST_DEFAULTS.smallShippingEnvelope +
      OPERATIONAL_COST_DEFAULTS.shippingLabel +
      OPERATIONAL_COST_DEFAULTS.tapeAndProtection;

  return {
    isKeychain,
    isBatch,
    packQuantity,
    hardware: finiteNonNegative(
      product.hardwareCost,
      isKeychain ? OPERATIONAL_COST_DEFAULTS.keychainMetalHardware * packQuantity : 0
    ),
    retailPackaging: finiteNonNegative(
      product.retailPackagingCost,
      isKeychain ? OPERATIONAL_COST_DEFAULTS.keychainRetailPackaging * packQuantity : 0
    ),
    shippingSupplies: finiteNonNegative(product.shippingSuppliesCost, defaultShippingSupplies),
    failureReservePercent: Math.min(
      100,
      finiteNonNegative(product.failureReservePercent, OPERATIONAL_COST_DEFAULTS.failureReservePercent)
    ),
    designSetup: finiteNonNegative(
      product.designSetupCost,
      isKeychain && product.customizable
        ? OPERATIONAL_COST_DEFAULTS.keychainPersonalizationSetup
        : 0
    ),
    actualFreightIncluded: false,
  };
}
