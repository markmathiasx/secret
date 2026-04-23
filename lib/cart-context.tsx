"use client";

import { useEffect } from "react";
import type { LocalCartItem } from "@/lib/cart-store";
import { useCartStore } from "@/lib/cart-store";

type CartContextValue = {
  hydrated: boolean;
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

export function CartProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (typeof window !== "undefined") {
      void useCartStore.persist.rehydrate();
    }
  }, []);

  return <>{children}</>;
}

export function useCart(): CartContextValue {
  const hydrated = useCartStore((state) => state.hydrated);
  const items = useCartStore((state) => state.items);
  const isDrawerOpen = useCartStore((state) => state.isDrawerOpen);
  const addItem = useCartStore((state) => state.addItem);
  const removeItem = useCartStore((state) => state.removeItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const clearCart = useCartStore((state) => state.clearCart);
  const openDrawer = useCartStore((state) => state.openDrawer);
  const closeDrawer = useCartStore((state) => state.closeDrawer);

  return {
    hydrated,
    items,
    count: items.reduce((sum, item) => sum + item.quantity, 0),
    subtotalPix: items.reduce((sum, item) => sum + item.pricePix * item.quantity, 0),
    subtotalCard: items.reduce((sum, item) => sum + item.priceCard * item.quantity, 0),
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    isDrawerOpen,
    openDrawer,
    closeDrawer,
  };
}
