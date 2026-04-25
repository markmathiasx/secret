"use client";

import { useEffect } from "react";
import { clearLocalCart } from "@/lib/cart-store";

export function ClearCartOnMount() {
  useEffect(() => {
    clearLocalCart();
  }, []);

  return null;
}
