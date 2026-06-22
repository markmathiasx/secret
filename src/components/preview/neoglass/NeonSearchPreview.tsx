"use client";

import { Search, SlidersHorizontal } from "lucide-react";

type NeonSearchPreviewProps = {
  query: string;
  category: string;
  categories: string[];
  resultCount: number;
  onQueryChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
};

export function NeonSearchPreview({
  query,
  category,
  categories,
  resultCount,
  onQueryChange,
  onCategoryChange,
}: NeonSearchPreviewProps) {
  const allCategories = ["Todos", ...categories];

  return (
    <section className="neo-section neo-search-market" data-testid="neoglass-search">
      <div className="neo-section-heading">
        <p className="neo-eyebrow">
          <Search aria-hidden="true" />
          Marketplace search
        </p>
        <h2>Busca rápida por presente, setup, geek, casa e sob medida.</h2>
      </div>

      <div className="neo-search-panel">
        <label className="neo-search-input">
          <Search aria-hidden="true" />
          <input
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Busque por produto, SKU ou categoria"
            type="search"
            aria-label="Buscar produtos no preview NeoGlass"
          />
        </label>
        <div className="neo-filter-chips" aria-label="Categorias do preview">
          {allCategories.map((item) => (
            <button
              key={item}
              type="button"
              className={item === category ? "is-active" : ""}
              onClick={() => onCategoryChange(item)}
            >
              {item}
            </button>
          ))}
        </div>
        <div className="neo-search-meta">
          <SlidersHorizontal aria-hidden="true" />
          <span>{resultCount} produtos reais filtrados nesta prévia</span>
        </div>
      </div>
    </section>
  );
}
