"use client";

import React from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { formatCurrency } from "@/lib/utils";

export type CartItem = {
  id: string;
  slug: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  weight?: number;
  dimensions?: {
    width: number;
    height: number;
    depth: number;
  };
  options?: Record<string, any>;
};

type CartStore = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
  isInCart: (id: string) => boolean;
};

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (newItem) => {
        set((state) => {
          const existingItem = state.items.find((item) => item.id === newItem.id);
          
          if (existingItem) {
            return {
              items: state.items.map((item) =>
                item.id === newItem.id
                  ? { ...item, quantity: item.quantity + 1 }
                  : item
              ),
            };
          }
          
          return {
            items: [...state.items, { ...newItem, quantity: 1 }],
          };
        });
      },
      
      removeItem: (id) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        }));
      },
      
      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id);
          return;
        }
        
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, quantity } : item
          ),
        }));
      },
      
      clearCart: () => {
        set({ items: [] });
      },
      
      getTotalPrice: () => {
        return get().items.reduce((total, item) => total + item.price * item.quantity, 0);
      },
      
      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },
      
      isInCart: (id) => {
        return get().items.some((item) => item.id === id);
      },
    }),
    {
      name: "mdh-cart",
      partialize: (state) => ({ items: state.items }),
    }
  )
);

// Hook para carrinho com sincronização Redis (server-side)
export function useCartWithSync() {
  const cart = useCart();
  
  // Função para sincronizar com Redis (chamada pelo servidor)
  const syncWithServer = async () => {
    try {
      const response = await fetch("/api/cart/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: cart.items }),
      });
      
      if (!response.ok) {
        console.error("Failed to sync cart with server");
      }
    } catch (error) {
      console.error("Cart sync error:", error);
    }
  };
  
  // Sincroniza quando o carrinho muda (debounced)
  React.useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (cart.items.length > 0) {
        syncWithServer();
      }
    }, 1000);
    
    return () => clearTimeout(timeoutId);
  }, [cart.items]);
  
  return cart;
}
