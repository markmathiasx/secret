"use client";

import type { Product } from "@/lib/catalog";
import { PremiumCard } from "@/components/product/PremiumCard";

export function CatalogGrid({ products, prioritizeFirstImages = true }: { products: Product[]; prioritizeFirstImages?: boolean }) {
  return (
    <ul className="grid gap-5 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4" role="list">
      {products.map((product, index) => (
        <li key={product.id} className="min-w-0">
          <PremiumCard product={product} index={index} priority={prioritizeFirstImages && index < 4} />
        </li>
      ))}
    </ul>
  );
}
