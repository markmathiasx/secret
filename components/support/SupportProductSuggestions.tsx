"use client";

import { SupportProductCard } from "@/components/support/SupportProductCard";
import type { SupportProduct } from "@/lib/support/support-types";

export function SupportProductSuggestions({
  products,
  whatsappNumber,
}: {
  products: SupportProduct[];
  whatsappNumber: string;
}) {
  if (!products.length) return null;

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {products.map((product) => (
        <SupportProductCard key={product.id} product={product} whatsappNumber={whatsappNumber} />
      ))}
    </div>
  );
}
