"use client";

import { useEffect, useMemo, useState } from "react";
import { buildCartWhatsappUrl } from "@/lib/mdh-store/links";
import { trackSmartStoreEvent } from "@/lib/mdh-store/analytics";

export type SmartCartProduct = {
  slug: string;
  name: string;
  sku: string;
  price: number;
  image?: string;
};

export type SmartCartItem = SmartCartProduct & {
  quantity: number;
};

const CART_KEY = "mdh3d_smart_cart";
const CART_EVENT = "mdh3d_smart_cart_change";

function readCart() {
  if (typeof window === "undefined") return [] as SmartCartItem[];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(CART_KEY) || "[]");
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((item) => item && typeof item.slug === "string" && typeof item.name === "string")
      .map((item) => ({
        slug: item.slug,
        name: item.name,
        sku: typeof item.sku === "string" ? item.sku : "",
        price: Number.isFinite(Number(item.price)) ? Number(item.price) : 0,
        image: typeof item.image === "string" ? item.image : undefined,
        quantity: Math.min(99, Math.max(1, Math.floor(Number(item.quantity) || 1))),
      }));
  } catch {
    return [];
  }
}

function writeCart(items: SmartCartItem[]) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(CART_KEY, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent(CART_EVENT));
  }
}

export function useSmartCart() {
  const [items, setItems] = useState<SmartCartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setItems(readCart());
    setHydrated(true);
    function syncCart() {
      setItems(readCart());
    }
    window.addEventListener(CART_EVENT, syncCart);
    return () => window.removeEventListener(CART_EVENT, syncCart);
  }, []);

  const subtotal = useMemo(() => items.reduce((sum, item) => sum + item.price * item.quantity, 0), [items]);
  const count = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items]);

  function commit(updater: (current: SmartCartItem[]) => SmartCartItem[]) {
    setItems((current) => {
      const next = updater(current);
      writeCart(next);
      return next;
    });
  }

  function add(product: SmartCartProduct, quantity = 1) {
    commit((current) => {
      const existing = current.find((item) => item.slug === product.slug);
      const nextQuantity = Math.min(99, Math.max(1, Math.floor(quantity)));
      if (existing) {
        return current.map((item) =>
          item.slug === product.slug ? { ...item, quantity: Math.min(99, item.quantity + nextQuantity) } : item
        );
      }
      return [...current, { ...product, quantity: nextQuantity }];
    });
    trackSmartStoreEvent("add_to_cart", {
      item_id: product.sku || product.slug,
      item_name: product.name,
      value: product.price,
      currency: "BRL",
      quantity,
    });
  }

  function remove(slug: string) {
    commit((current) => current.filter((item) => item.slug !== slug));
  }

  function update(slug: string, quantity: number) {
    commit((current) =>
      current.map((item) => (item.slug === slug ? { ...item, quantity: Math.min(99, Math.max(1, Math.floor(quantity) || 1)) } : item))
    );
  }

  function clear() {
    commit(() => []);
  }

  function checkoutUrl(whatsappNumber: string) {
    const pageUrl = typeof window !== "undefined" ? window.location.href : "";
    return buildCartWhatsappUrl(items, { total: subtotal, pageUrl, whatsappNumber });
  }

  function trackCheckout() {
    trackSmartStoreEvent("checkout_whatsapp", {
      value: subtotal,
      currency: "BRL",
      items: items.map((item) => ({ item_id: item.sku || item.slug, item_name: item.name, quantity: item.quantity })),
    });
  }

  return { hydrated, items, subtotal, count, add, remove, update, clear, checkoutUrl, trackCheckout };
}
