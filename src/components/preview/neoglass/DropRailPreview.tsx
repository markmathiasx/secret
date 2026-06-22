"use client";

import { ChevronRight } from "lucide-react";
import { ProductGlassCardPreview } from "@/src/components/preview/neoglass/ProductGlassCardPreview";
import type { NeoGlassPreviewDropRail } from "@/src/components/preview/neoglass/types";

export function DropRailPreview({ rail }: { rail: NeoGlassPreviewDropRail }) {
  return (
    <section className="neo-drop-rail" data-testid={`neoglass-rail-${rail.id}`}>
      <div className="neo-rail-heading">
        <span>STLFLIX</span>
        <div>
          <h3>{rail.title}</h3>
          <p>{rail.subtitle}</p>
        </div>
        <ChevronRight aria-hidden="true" />
      </div>
      <div className="neo-rail-track">
        {rail.products.map((product) => (
          <ProductGlassCardPreview key={`${rail.id}-${product.id}`} product={product} compact />
        ))}
      </div>
    </section>
  );
}
