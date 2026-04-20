"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import type { LocalCartItem } from "@/lib/cart-store";
import {
  readLocalCart,
  addLocalCartItem,
  removeLocalCartItem,
  replaceLocalCart,
  clearLocalCart,
  cartChangeEvent,
} from "@/lib/cart-store";

type CartContextValue = {
  items: LocalCartItem[];
  count: number;
  subtotalPix: number;
  subtotalCard: number;
  addItem: (item: Omit<LocalCartItem, "updatedAt">) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  isDrawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

async function syncCartMutation(payload: Record<string, unknown>) {
  const response = await fetch("/api/cart", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "same-origin",
    cache: "no-store",
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));
  return {
    ok: response.ok,
    status: response.status,
    cart: Array.isArray(data?.cart?.items) ? data.cart.items : null,
  };
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<LocalCartItem[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  function refresh() {
    setItems(readLocalCart());
  }

  useEffect(() => {
    refresh();
    window.addEventListener(cartChangeEvent, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(cartChangeEvent, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  const addItem = useCallback((item: Omit<LocalCartItem, "updatedAt">) => {
    addLocalCartItem(item);
    setIsDrawerOpen(true);
  }, []);

  const removeItem = useCallback((productId: string) => {
    removeLocalCartItem(productId);
    void syncCartMutation({ action: "remove", productId }).catch(() => null);
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    const nextQuantity = Math.trunc(quantity);
    const current = readLocalCart();

    if (nextQuantity <= 0) {
      replaceLocalCart(current.filter((item) => item.productId !== productId));
      void syncCartMutation({ action: "remove", productId }).catch(() => null);
      return;
    }

    const updated = current.map((item) =>
      item.productId === productId
        ? { ...item, quantity: Math.max(1, Math.min(20, nextQuantity)), updatedAt: new Date().toISOString() }
        : item
    );
    replaceLocalCart(updated);
    void syncCartMutation({ action: "set", productId, quantity: Math.max(1, Math.min(20, nextQuantity)) }).catch(() => null);
  }, []);

  const clearCart = useCallback(() => {
    clearLocalCart();
  }, []);

  const count = items.reduce((s, i) => s + i.quantity, 0);
  const subtotalPix = items.reduce((s, i) => s + i.pricePix * i.quantity, 0);
  const subtotalCard = items.reduce((s, i) => s + i.priceCard * i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        count,
        subtotalPix,
        subtotalCard,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        isDrawerOpen,
        openDrawer: () => setIsDrawerOpen(true),
        closeDrawer: () => setIsDrawerOpen(false),
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
