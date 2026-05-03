import type { CartItemInput } from "@/lib/cart-types";

export const FIXED_SHIPPING_BRL = 15;

export function calculateCartTotals(items: CartItemInput[], shippingOverride?: number) {
  const quantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotalPix = items.reduce((sum, item) => sum + item.pricePix * item.quantity, 0);
  const subtotalCard = items.reduce((sum, item) => sum + item.priceCard * item.quantity, 0);
  const shipping = Number((shippingOverride ?? FIXED_SHIPPING_BRL).toFixed(2));

  return {
    quantity,
    subtotalPix: Number(subtotalPix.toFixed(2)),
    subtotalCard: Number(subtotalCard.toFixed(2)),
    shipping,
    totalPix: Number((subtotalPix + shipping).toFixed(2)),
    totalCard: Number((subtotalCard + shipping).toFixed(2)),
  };
}

export function summarizeCartItems(items: CartItemInput[]) {
  return items
    .map((item) => `${item.quantity}x ${item.title}${item.personalizationText ? ` (${item.personalizationText})` : ""}`)
    .join(" • ");
}
