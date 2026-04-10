"use client";

export type LocalCartItem = {
  productId: string;
  quantity: number;
  title: string;
  pricePix: number;
  priceCard: number;
  image?: string;
  updatedAt: string;
};

const CART_STORAGE_KEY = "mdh:cart:v1";
export const cartChangeEvent = "mdh:cart-change";

function safeWindow() {
  return typeof window !== "undefined" ? window : null;
}

export function emitCartChange() {
  safeWindow()?.dispatchEvent(new CustomEvent(cartChangeEvent));
}

export function readLocalCart() {
  const currentWindow = safeWindow();
  if (!currentWindow) return [] as LocalCartItem[];

  try {
    const raw = currentWindow.localStorage.getItem(CART_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? (parsed as LocalCartItem[]) : [];
  } catch {
    return [] as LocalCartItem[];
  }
}

export function writeLocalCart(items: LocalCartItem[]) {
  const currentWindow = safeWindow();
  if (!currentWindow) return;
  currentWindow.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  emitCartChange();
}

export function addLocalCartItem(item: Omit<LocalCartItem, "updatedAt">) {
  const current = readLocalCart();
  const existing = current.find((entry) => entry.productId === item.productId);

  if (existing) {
    existing.quantity = item.quantity;
    existing.title = item.title;
    existing.pricePix = item.pricePix;
    existing.priceCard = item.priceCard;
    existing.image = item.image;
    existing.updatedAt = new Date().toISOString();
    writeLocalCart([...current]);
    return existing;
  }

  const nextItem: LocalCartItem = {
    ...item,
    updatedAt: new Date().toISOString(),
  };
  writeLocalCart([nextItem, ...current]);
  return nextItem;
}

export function getLocalCartCount() {
  return readLocalCart().reduce((sum, item) => sum + item.quantity, 0);
}
