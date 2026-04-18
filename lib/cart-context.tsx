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
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    const current = readLocalCart();
    const updated = current.map((item) =>
      item.productId === productId
        ? { ...item, quantity: Math.max(1, Math.min(20, quantity)), updatedAt: new Date().toISOString() }
        : item
    );
    replaceLocalCart(updated);
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
