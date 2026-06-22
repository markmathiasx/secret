"use client";

import { useMemo, useState } from "react";
import { NeoGlassPreviewShell } from "@/src/components/preview/neoglass/NeoGlassPreviewShell";
import type { NeoGlassPreviewData } from "@/src/components/preview/neoglass/types";

export function PreviewNeoGlassClient({ data }: { data: NeoGlassPreviewData }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Todos");

  const filteredProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return data.featuredProducts.filter((product) => {
      const categoryMatches = category === "Todos" || product.category === category;
      if (!categoryMatches) return false;
      if (!normalizedQuery) return true;
      return `${product.name} ${product.sku} ${product.category} ${product.description}`.toLowerCase().includes(normalizedQuery);
    });
  }, [category, data.featuredProducts, query]);

  return (
    <NeoGlassPreviewShell
      data={data}
      query={query}
      category={category}
      filteredProducts={filteredProducts}
      onQueryChange={setQuery}
      onCategoryChange={setCategory}
    />
  );
}
