"use client";

import { useEffect } from "react";
import { trackProductView } from "@/lib/analytics";

type ProductAnalyticsProps = {
  product: {
    id: string;
    sku?: string;
    name: string;
    category?: string;
    collection?: string;
    pricePix?: number;
  };
};

export function ProductAnalytics({ product }: ProductAnalyticsProps) {
  useEffect(() => {
    trackProductView(product);
  }, [product]);

  return null;
}
