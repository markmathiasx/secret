"use client";

import { useMemo, useState } from "react";
import { categories, collections, type Product } from "@/lib/catalog";
import { ProductCard } from "@/components/product-card";

const PAGE_SIZE = 24;

type SortMode = "featured" | "price-asc" | "price-desc" | "lead-time";

export function CatalogExplorer({ products }: { products: Product[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Todos");
  const [collection, setCollection] = useState("Todas");
  const [sortMode, setSortMode] = useState<SortMode>("featured");
  const [visible, setVisible] = useState(PAGE_SIZE);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    const items = products.filter((item) => {
      const matchQuery = !q
        ? true
        : [item.name, item.category, item.theme, item.description, item.collection, item.material, item.finish, ...item.tags]
            .join(" ")
            .toLowerCase()
            .includes(q);
      const matchCategory = category === "Todos" ? true : item.category === category;
      const matchCollection = collection === "Todas" ? true : item.collection === collection;
      return matchQuery && matchCategory && matchCollection;
    });

    return items.sort((a, b) => {
      if (sortMode === "price-asc") return a.pricePix - b.pricePix;
      if (sortMode === "price-desc") return b.pricePix - a.pricePix;
      if (sortMode === "lead-time") return a.hours - b.hours;
      if (a.featured !== b.featured) return a.featured ? -1 : 1;
      return a.pricePix - b.pricePix;
    });
  }, [category, collection, products, query, sortMode]);

  const visibleItems = filtered.slice(0, visible);

  function resetVisible() {
    setVisible(PAGE_SIZE);
  }

  return (
    <div className="space-y-7">
      <div className="rounded-[32px] border border-white/10 bg-white/5 p-5">
        <div className="grid gap-4 xl:grid-cols-[1.2fr_0.4fr_0.4fr_0.4fr]">
          <label className="text-sm text-white/70">
            <span className="mb-2 block">Buscar peça, tema ou uso</span>
            <input
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                resetVisible();
              }}
              placeholder="Ex.: suporte de controle, hello kitty, vaso, organizador..."
              className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
            />
          </label>

          <label className="text-sm text-white/70">
            <span className="mb-2 block">Categoria</span>
            <select
              value={category}
              onChange={(event) => {
                setCategory(event.target.value);
                resetVisible();
              }}
              className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
            >
              <option>Todos</option>
              {categories.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>

          <label className="text-sm text-white/70">
            <span className="mb-2 block">Coleção</span>
            <select
              value={collection}
              onChange={(event) => {
                setCollection(event.target.value);
                resetVisible();
              }}
              className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
            >
              <option>Todas</option>
              {collections.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>

          <label className="text-sm text-white/70">
            <span className="mb-2 block">Ordenar</span>
            <select
              value={sortMode}
              onChange={(event) => {
                setSortMode(event.target.value as SortMode);
                resetVisible();
              }}
              className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
            >
              <option value="featured">Mais relevantes</option>
              <option value="price-asc">Menor preço</option>
              <option value="price-desc">Maior preço</option>
              <option value="lead-time">Menor prazo</option>
            </select>
          </label>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-white/60">
          <span>{filtered.length} resultados</span>
          <span className="h-1 w-1 rounded-full bg-white/30" />
          <span>Material, prazo e status exibidos no card</span>
          <span className="h-1 w-1 rounded-full bg-white/30" />
          <span>Prévia conceitual sinalizada com clareza</span>
        </div>
      </div>

      {visibleItems.length ? (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {visibleItems.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="rounded-[32px] border border-white/10 bg-white/5 p-10 text-center">
          <p className="text-xl font-semibold text-white">Nenhuma peça encontrada com esse filtro.</p>
          <p className="mt-3 text-sm text-white/60">Tente buscar por tema, categoria ou remova um dos filtros ativos.</p>
        </div>
      )}

      {visible < filtered.length ? (
        <div className="flex flex-wrap justify-center gap-3">
          <button
            onClick={() => setVisible((previous) => previous + PAGE_SIZE)}
            className="rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-white"
          >
            Carregar mais {Math.min(PAGE_SIZE, filtered.length - visible)} itens
          </button>
          <button
            onClick={() => setVisible(filtered.length)}
            className="rounded-full border border-cyan-300/30 bg-cyan-300/12 px-6 py-3 text-sm font-semibold text-cyan-50"
          >
            Mostrar todos
          </button>
        </div>
      ) : null}
    </div>
  );
}
