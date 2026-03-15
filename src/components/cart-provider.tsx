"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { trackEvent } from "@/lib/analytics-client";
import type { Product } from "@/lib/catalog";

export type CartProductSnapshot = Pick<
  Product,
  "id" | "slug" | "sku" | "name" | "category" | "pricePix" | "priceCard" | "imagePath" | "productionWindow"
>;

export type CartEntry = {
  productId: string;
  quantity: number;
  snapshot: CartProductSnapshot;
};

export type CartCustomerDraft = {
  fullName: string;
  whatsapp: string;
  email: string;
  contactPreference: "whatsapp" | "email" | "phone";
  notes: string;
  postalCode: string;
  street: string;
  number: string;
  complement: string;
  reference: string;
  neighborhood: string;
  city: string;
  state: string;
};

export function toCartProductSnapshot(product: Product): CartProductSnapshot {
  return {
    id: product.id,
    slug: product.slug,
    sku: product.sku,
    name: product.name,
    category: product.category,
    pricePix: product.pricePix,
    priceCard: product.priceCard,
    imagePath: product.imagePath,
    productionWindow: product.productionWindow
  };
}

type CartContextValue = {
  items: CartEntry[];
  count: number;
  hydrated: boolean;
  customerDraft: CartCustomerDraft;
  subtotalPix: number;
  subtotalCard: number;
  addItem: (product: CartProductSnapshot, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  setCustomerDraft: (draft: Partial<CartCustomerDraft>) => void;
  clearCustomerDraft: () => void;
};

const CART_STORAGE_KEY = "mdh-store-cart-v2";
const CUSTOMER_STORAGE_KEY = "mdh-store-customer-v1";

const emptyCustomerDraft: CartCustomerDraft = {
  fullName: "",
  whatsapp: "",
  email: "",
  contactPreference: "whatsapp",
  notes: "",
  postalCode: "",
  street: "",
  number: "",
  complement: "",
  reference: "",
  neighborhood: "",
  city: "",
  state: "RJ"
};

const CartContext = createContext<CartContextValue | null>(null);

function parseStoredCart(raw: string | null): CartEntry[] {
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .map((entry) => {
        if (typeof entry?.productId !== "string") return null;
        if (!entry?.snapshot || typeof entry.snapshot?.name !== "string") return null;

        return {
          productId: entry.productId,
          quantity: Number.isFinite(entry?.quantity) ? Math.max(1, Math.floor(entry.quantity)) : 1,
          snapshot: {
            id: entry.snapshot.id || entry.productId,
            slug: entry.snapshot.slug || "",
            sku: entry.snapshot.sku || "",
            name: entry.snapshot.name,
            category: entry.snapshot.category || "",
            pricePix: Number(entry.snapshot.pricePix) || 0,
            priceCard: Number(entry.snapshot.priceCard) || 0,
            imagePath: entry.snapshot.imagePath || null,
            productionWindow: entry.snapshot.productionWindow || ""
          }
        } satisfies CartEntry;
      })
      .filter((entry): entry is CartEntry => Boolean(entry));
  } catch {
    return [];
  }
}

function parseCustomerDraft(raw: string | null): CartCustomerDraft {
  if (!raw) return emptyCustomerDraft;

  try {
    const parsed = JSON.parse(raw);
    return {
      ...emptyCustomerDraft,
      ...parsed
    };
  } catch {
    return emptyCustomerDraft;
  }
}

function mergeCustomerDrafts(initialDraft?: Partial<CartCustomerDraft>, storedDraft?: Partial<CartCustomerDraft>) {
  const next = {
    ...emptyCustomerDraft,
    ...(storedDraft || {})
  };

  if (initialDraft?.fullName?.trim()) {
    next.fullName = initialDraft.fullName;
  }

  if (initialDraft?.email?.trim()) {
    next.email = initialDraft.email;
  }

  return next;
}

export function CartProvider({
  children,
  initialCustomerDraft
}: {
  children: ReactNode;
  initialCustomerDraft?: Partial<CartCustomerDraft>;
}) {
  const [items, setItems] = useState<CartEntry[]>([]);
  const [customerDraft, setCustomerDraftState] = useState<CartCustomerDraft>(
    mergeCustomerDrafts(initialCustomerDraft)
  );
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setItems(parseStoredCart(window.localStorage.getItem(CART_STORAGE_KEY)));
    setCustomerDraftState(
      mergeCustomerDrafts(initialCustomerDraft, parseCustomerDraft(window.localStorage.getItem(CUSTOMER_STORAGE_KEY)))
    );
    setHydrated(true);
  }, [initialCustomerDraft]);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [hydrated, items]);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(CUSTOMER_STORAGE_KEY, JSON.stringify(customerDraft));
  }, [customerDraft, hydrated]);

  const value = useMemo<CartContextValue>(() => {
    const subtotalPix = items.reduce((total, entry) => total + entry.snapshot.pricePix * entry.quantity, 0);
    const subtotalCard = items.reduce((total, entry) => total + entry.snapshot.priceCard * entry.quantity, 0);

    return {
      items,
      customerDraft,
      hydrated,
      count: items.reduce((total, entry) => total + entry.quantity, 0),
      subtotalPix,
      subtotalCard,
      addItem(product, quantity = 1) {
        trackEvent("add_to_cart", {
          productId: product.id,
          sku: product.sku,
          name: product.name,
          category: product.category,
          quantity
        });
        setItems((current) => {
          const nextQuantity = Math.max(1, Math.floor(quantity));
          const existing = current.find((entry) => entry.productId === product.id);

          if (!existing) {
            return [...current, { productId: product.id, quantity: nextQuantity, snapshot: product }];
          }

          return current.map((entry) =>
            entry.productId === product.id
              ? { ...entry, quantity: entry.quantity + nextQuantity, snapshot: product }
              : entry
          );
        });
      },
      removeItem(productId) {
        setItems((current) => current.filter((entry) => entry.productId !== productId));
      },
      updateQuantity(productId, quantity) {
        const nextQuantity = Math.max(0, Math.floor(quantity));
        setItems((current) => {
          if (nextQuantity === 0) return current.filter((entry) => entry.productId !== productId);
          return current.map((entry) => (entry.productId === productId ? { ...entry, quantity: nextQuantity } : entry));
        });
      },
      clearCart() {
        setItems([]);
      },
      setCustomerDraft(draft) {
        setCustomerDraftState((current) => ({ ...current, ...draft }));
      },
      clearCustomerDraft() {
        setCustomerDraftState(emptyCustomerDraft);
      }
    };
  }, [customerDraft, hydrated, items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }

  return context;
}
