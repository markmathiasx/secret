"use client";

import { useEffect, useRef } from "react";
import { useCustomerSession } from "@/lib/customer-session-client";
import {
  readLocalCart,
  replaceLocalCart,
  serializeLocalCart,
  type LocalCartItem,
} from "@/lib/cart-store";

type ServerCartResponse = {
  ok?: boolean;
  cart?: {
    items?: Array<{
      productId: string;
      quantity: number;
      title: string;
      pricePix: number;
      priceCard: number;
      image?: string;
      updatedAt?: string;
    }>;
  } | null;
};

function syncStorageKey(userId: string) {
  return `mdh:cart:last-sync:${userId}`;
}

function mapServerItems(
  items: NonNullable<NonNullable<ServerCartResponse["cart"]>["items"]>
): LocalCartItem[] {
  return items.map((item) => ({
    productId: item.productId,
    quantity: item.quantity,
    title: item.title,
    pricePix: item.pricePix,
    priceCard: item.priceCard,
    image: item.image,
    updatedAt: item.updatedAt || new Date().toISOString(),
  }));
}

export function CartSessionBridge() {
  const session = useCustomerSession();
  const syncingRef = useRef(false);

  useEffect(() => {
    if (!session.ready || syncingRef.current) {
      return;
    }

    let active = true;

    async function syncCart() {
      const userId = session.user?.id || "guest";

      syncingRef.current = true;

      try {
        const localItems = readLocalCart();
        const localSignature = serializeLocalCart(localItems);
        const lastSyncedSignature = window.localStorage.getItem(syncStorageKey(userId)) || "";

        if (localItems.length > 0 && localSignature !== lastSyncedSignature) {
          const response = await fetch("/api/cart", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              action: "merge",
              items: localItems.map((item) => ({
                productId: item.productId,
                quantity: item.quantity,
              })),
            }),
          });
          const data = (await response.json().catch(() => ({}))) as ServerCartResponse;
          if (!active || !response.ok || !Array.isArray(data?.cart?.items)) return;

          const nextItems = mapServerItems(data.cart.items);
          replaceLocalCart(nextItems);
          window.localStorage.setItem(syncStorageKey(userId), serializeLocalCart(nextItems));
          return;
        }

        if (localItems.length === 0) {
          const response = await fetch("/api/cart", {
            cache: "no-store",
            credentials: "same-origin",
          });
          const data = (await response.json().catch(() => ({}))) as ServerCartResponse;
          if (!active || !response.ok || !Array.isArray(data?.cart?.items) || !data.cart.items.length) return;

          const nextItems = mapServerItems(data.cart.items);
          replaceLocalCart(nextItems);
          window.localStorage.setItem(syncStorageKey(userId), serializeLocalCart(nextItems));
        }
      } finally {
        syncingRef.current = false;
      }
    }

    void syncCart();

    return () => {
      active = false;
    };
  }, [session.ready, session.user?.id]);

  return null;
}
