"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { findProduct, type Product } from "@/lib/catalog";

const STORAGE_KEY = "mdh-storefront-state";

type CartEntry = {
  productId: string;
  quantity: number;
};

export type SavedQuote = {
  id: string;
  productId: string;
  productName: string;
  paymentMethod: string;
  neighborhood: string;
  colorPreference: string;
  estimatedPricePix: number;
  estimatedPriceCard: number;
  estimatedDeliveryFee: number;
  estimatedTotalPix: number;
  createdAt: string;
};

type StoreState = {
  cart: CartEntry[];
  favorites: string[];
  quotes: SavedQuote[];
};

type CartItem = CartEntry & {
  product: Product;
  subtotalPix: number;
  subtotalCard: number;
};

type StoreContextValue = {
  hydrated: boolean;
  cartItems: CartItem[];
  favoriteIds: string[];
  favoriteProducts: Product[];
  quotes: SavedQuote[];
  cartCount: number;
  cartSubtotalPix: number;
  cartSubtotalCard: number;
  isFavorite: (productId: string) => boolean;
  addToCart: (productId: string, quantity?: number) => void;
  setCartQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  toggleFavorite: (productId: string) => void;
  addQuote: (quote: SavedQuote) => void;
  removeQuote: (quoteId: string) => void;
};

const defaultState: StoreState = {
  cart: [],
  favorites: [],
  quotes: []
};

const StoreContext = createContext<StoreContextValue | null>(null);

function sanitizeState(value: unknown): StoreState {
  if (!value || typeof value !== "object") return defaultState;

  const maybeState = value as Partial<StoreState>;
  const cart = Array.isArray(maybeState.cart)
    ? maybeState.cart
        .filter((item): item is CartEntry => Boolean(item?.productId))
        .map((item) => ({
          productId: item.productId,
          quantity: Math.max(1, Number(item.quantity || 1))
        }))
    : [];

  const favorites = Array.isArray(maybeState.favorites)
    ? Array.from(new Set(maybeState.favorites.filter((item): item is string => typeof item === "string")))
    : [];

  const quotes = Array.isArray(maybeState.quotes)
    ? maybeState.quotes.filter(
        (item): item is SavedQuote =>
          Boolean(item?.id && item?.productId && item?.productName && item?.createdAt)
      )
    : [];

  return { cart, favorites, quotes };
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<StoreState>(defaultState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setState(sanitizeState(JSON.parse(raw)));
    } catch {
      setState(defaultState);
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [hydrated, state]);

  const cartItems = useMemo(
    () =>
      state.cart
        .map((entry) => {
          const product = findProduct(entry.productId);
          if (!product) return null;
          return {
            ...entry,
            product,
            subtotalPix: Number((product.pricePix * entry.quantity).toFixed(2)),
            subtotalCard: Number((product.priceCard * entry.quantity).toFixed(2))
          };
        })
        .filter((item): item is CartItem => Boolean(item)),
    [state.cart]
  );

  const favoriteProducts = useMemo(
    () =>
      state.favorites
        .map((productId) => findProduct(productId))
        .filter((item): item is Product => Boolean(item)),
    [state.favorites]
  );

  const value = useMemo<StoreContextValue>(() => {
    const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);
    const cartSubtotalPix = Number(cartItems.reduce((total, item) => total + item.subtotalPix, 0).toFixed(2));
    const cartSubtotalCard = Number(cartItems.reduce((total, item) => total + item.subtotalCard, 0).toFixed(2));

    return {
      hydrated,
      cartItems,
      favoriteIds: state.favorites,
      favoriteProducts,
      quotes: state.quotes,
      cartCount,
      cartSubtotalPix,
      cartSubtotalCard,
      isFavorite(productId) {
        return state.favorites.includes(productId);
      },
      addToCart(productId, quantity = 1) {
        setState((current) => {
          const existing = current.cart.find((item) => item.productId === productId);
          if (!existing) {
            return {
              ...current,
              cart: [...current.cart, { productId, quantity: Math.max(1, quantity) }]
            };
          }

          return {
            ...current,
            cart: current.cart.map((item) =>
              item.productId === productId
                ? { ...item, quantity: item.quantity + Math.max(1, quantity) }
                : item
            )
          };
        });
      },
      setCartQuantity(productId, quantity) {
        setState((current) => ({
          ...current,
          cart:
            quantity <= 0
              ? current.cart.filter((item) => item.productId !== productId)
              : current.cart.map((item) =>
                  item.productId === productId ? { ...item, quantity } : item
                )
        }));
      },
      removeFromCart(productId) {
        setState((current) => ({
          ...current,
          cart: current.cart.filter((item) => item.productId !== productId)
        }));
      },
      clearCart() {
        setState((current) => ({ ...current, cart: [] }));
      },
      toggleFavorite(productId) {
        setState((current) => ({
          ...current,
          favorites: current.favorites.includes(productId)
            ? current.favorites.filter((item) => item !== productId)
            : [productId, ...current.favorites]
        }));
      },
      addQuote(quote) {
        setState((current) => ({
          ...current,
          quotes: [quote, ...current.quotes.filter((item) => item.id !== quote.id)].slice(0, 20)
        }));
      },
      removeQuote(quoteId) {
        setState((current) => ({
          ...current,
          quotes: current.quotes.filter((item) => item.id !== quoteId)
        }));
      }
    };
  }, [cartItems, favoriteProducts, hydrated, state.favorites, state.quotes]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error("useStore must be used inside StoreProvider.");
  }
  return context;
}
