export const CARD_PRICE_FLAT_FEE = 1;

export function normalizeMoney(value: unknown) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? roundToCents(value) : 0;
  }

  if (typeof value === "string") {
    const normalized = value
      .trim()
      .replace(/[^\d,.-]/g, "")
      .replace(/\.(?=\d{3}(?:\D|$))/g, "")
      .replace(",", ".");
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? roundToCents(parsed) : 0;
  }

  return 0;
}

export function roundToCents(value: number) {
  return Math.round((Number.isFinite(value) ? value : 0) * 100) / 100;
}

export function calculateCardPrice(pricePix: unknown) {
  return roundToCents(normalizeMoney(pricePix) + CARD_PRICE_FLAT_FEE);
}

export function formatPixPrice(value: unknown) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(normalizeMoney(value));
}

export function formatCardPrice(value: unknown) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(calculateCardPrice(value));
}

export function ensureCardIsPixPlus1<T extends { pricePix?: unknown; priceCard?: unknown; price?: unknown }>(product: T) {
  const pricePix = normalizeMoney(product.pricePix ?? product.price ?? 0);
  return {
    ...product,
    price: pricePix,
    pricePix,
    priceCard: calculateCardPrice(pricePix),
  };
}

export const ensureCardIsPixPlus3 = ensureCardIsPixPlus1;
