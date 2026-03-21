"use client";

import { useEffect } from "react";
import { useRecentlyViewed } from "@/components/recently-viewed-context";

export function RecentlyViewedTracker({ productId }: { productId: string }) {
  const { trackProduct } = useRecentlyViewed();

  useEffect(() => {
    trackProduct(productId);
  }, [productId, trackProduct]);

  return null;
}
