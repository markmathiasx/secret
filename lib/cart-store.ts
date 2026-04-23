"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { CartItemInput } from "@/lib/cart-types";

export type LocalCartItem = CartItemInput & {
  updatedAt: string;
};

type CartStoreState = {
  hydrated: boolean;
  items: LocalCartItem[];
  isDrawerOpen: boolean;
  setHydrated: (value: boolean) => void;
  addItem: (item: Omit<LocalCartItem, "updatedAt">) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  replaceItems: (items: LocalCartItem[]) => void;
  clearCart: () => void;
  openDrawer: () => void;
  closeDrawer: () => void;
};

const CART_STORAGE_KEY = "mdh:cart:v2";
export const cartChangeEvent = "mdh:cart-change";

const memoryStorage = {
  getItem: () => null,
  setItem: () => undefined,
  removeItem: () => undefined,
};

function safeWindow() {
  return typeof window !== "undefined" ? window : null;
}

function emitCartChange() {
  safeWindow()?.dispatchEvent(new CustomEvent(cartChangeEvent));
}

function sanitizeQuantity(quantity: number) {
  return Math.min(20, Math.max(1, Math.trunc(quantity || 1)));
}

function sanitizeItems(items: LocalCartItem[]) {
  return items
    .filter((item) => item.productId && Number.isFinite(item.quantity) && item.quantity > 0)
    .map((item) => ({
      ...item,
      quantity: sanitizeQuantity(item.quantity),
      updatedAt: item.updatedAt || new Date().toISOString(),
    }));
}

export const useCartStore = create<CartStoreState>()(
  persist(
    (set, get) => ({
      hydrated: false,
      items: [],
      isDrawerOpen: false,
      setHydrated: (value) => set({ hydrated: value }),
      addItem: (item) => {
        const current = get().items;
        const existing = current.find((entry) => entry.productId === item.productId);

        if (existing) {
          const nextItems = current.map((entry) =>
            entry.productId === item.productId
              ? {
                  ...entry,
                  quantity: sanitizeQuantity(entry.quantity + item.quantity),
                  title: item.title,
                  pricePix: item.pricePix,
                  priceCard: item.priceCard,
                  image: item.image,
                  personalizationText: item.personalizationText,
                  updatedAt: new Date().toISOString(),
                }
              : entry
          );
          set({ items: nextItems, isDrawerOpen: true });
          emitCartChange();
          return;
        }

        set((state) => ({
          items: [
            {
              ...item,
              quantity: sanitizeQuantity(item.quantity),
              updatedAt: new Date().toISOString(),
            },
            ...state.items,
          ],
          isDrawerOpen: true,
        }));
        emitCartChange();
      },
      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((item) => item.productId !== productId),
        }));
        emitCartChange();
      },
      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }

        set((state) => ({
          items: state.items.map((item) =>
            item.productId === productId
              ? {
                  ...item,
                  quantity: sanitizeQuantity(quantity),
                  updatedAt: new Date().toISOString(),
                }
              : item
          ),
        }));
        emitCartChange();
      },
      replaceItems: (items) => {
        set({ items: sanitizeItems(items) });
        emitCartChange();
      },
      clearCart: () => {
        set({ items: [], isDrawerOpen: false });
        emitCartChange();
      },
      openDrawer: () => set({ isDrawerOpen: true }),
      closeDrawer: () => set({ isDrawerOpen: false }),
    }),
    {
      name: CART_STORAGE_KEY,
      storage: createJSONStorage(() => safeWindow()?.localStorage ?? memoryStorage),
      partialize: (state) => ({ items: state.items }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
        emitCartChange();
      },
    }
  )
);

export function readLocalCart() {
  return useCartStore.getState().items;
}

export function writeLocalCart(items: LocalCartItem[]) {
  useCartStore.getState().replaceItems(items);
}

export function replaceLocalCart(items: LocalCartItem[]) {
  useCartStore.getState().replaceItems(items);
}

export function addLocalCartItem(item: Omit<LocalCartItem, "updatedAt">) {
  useCartStore.getState().addItem(item);
  return readLocalCart().find((entry) => entry.productId === item.productId) || null;
}

export function removeLocalCartItem(productId: string) {
  useCartStore.getState().removeItem(productId);
}

export function clearLocalCart() {
  useCartStore.getState().clearCart();
}

export function getLocalCartCount() {
  return readLocalCart().reduce((sum, item) => sum + item.quantity, 0);
}

export function serializeLocalCart(items: LocalCartItem[]) {
  return sanitizeItems(items)
    .slice()
    .sort((left, right) => left.productId.localeCompare(right.productId))
    .map((item) => `${item.productId}:${item.quantity}`)
    .join("|");
}
