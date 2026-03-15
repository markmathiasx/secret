"use client";

import { useMemo, useState } from "react";
import { categories, collections, type Product } from "@/lib/catalog";
import { CatalogGrid } from "@/components/catalog-grid";

const PAGE_SIZE = 24;

type SortMode = "destaque" | "preco" | "prazo";

export function CatalogExplorer({ products }: { products: Product[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Todas");
  const [collection, setCollection] = useState("Todas");
  const [sortMode, setSortMode] = useState<SortMode>("destaque");
  const [visible, setVisible] = useState(PAGE_SIZE);

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    const items = products.filter((item) => {
      const matchQuery = !normalizedQuery
        ? true
        : [item.name, item.category, item.theme, item.collection, item.description, ...item.tags]
            .join(" ")
            .toLowerCase()
            .includes(normalizedQuery);

      const matchCategory = category === "Todas" ? true : item.category === category;
      const matchCollection = collection === "Todas" ? true : item.collection === collection;

      return matchQuery && matchCategory && matchCollection;
    });

    return items.sort((a, b) => {
      if (sortMode === "preco") return a.pricePix - b.pricePix;
      if (sortMode === "prazo") return a.productionWindow.localeCompare(b.productionWindow);
      return Number(b.featured) - Number(a.featured) || Number(b.readyToShip) - Number(a.readyToShip);
    });
  }, [category, collection, products, query, sortMode]);

  const visibleItems = filtered.slice(0, visible);

  return (
    <div className="space-y-6">
      <div className="rounded-[32px] border border-white/10 bg-white/5 p-5">
        <div className="grid gap-4 xl:grid-cols-[1.2fr_0.4fr_0.4fr_0.4fr]">
          <label className="text-sm text-white/70">
            <span className="mb-2 block">Buscar no catalogo</span>
            <input
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setVisible(PAGE_SIZE);
              }}
              placeholder="Buscar por tema, categoria, uso ou nome da peca"
              className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
            />
          </label>

          <label className="text-sm text-white/70">
            <span className="mb-2 block">Categoria</span>
            <select
              value={category}
              onChange={(event) => {
                setCategory(event.target.value);
                setVisible(PAGE_SIZE);
              }}
              className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
            >
              <option value="Todas">Todas</option>
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          <label className="text-sm text-white/70">
            <span className="mb-2 block">Colecao</span>
            <select
              value={collection}
              onChange={(event) => {
                setCollection(event.target.value);
                setVisible(PAGE_SIZE);
              }}
              className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
            >
              <option value="Todas">Todas</option>
              {collections.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          <label className="text-sm text-white/70">
            <span className="mb-2 block">Ordenar</span>
            <select
              value={sortMode}
              onChange={(event) => setSortMode(event.target.value as SortMode)}
              className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
            >
              <option value="destaque">Mais relevantes</option>
              <option value="preco">Menor preco</option>
              <option value="prazo">Prazo mais rapido</option>
            </select>
          </label>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-sm text-white/60">
          <p>
            {filtered.length} item(ns) encontrados. Exibindo {visibleItems.length}.
          </p>
          <div className="flex flex-wrap gap-2">
            {["Mais vendido", "Foto real", "Personalizavel", "Sob encomenda", "Pronta entrega"].map((item) => (
              <span key={item} className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs text-white/75">
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>

      <CatalogGrid products={visibleItems} />

      {visible < filtered.length ? (
        <div className="flex justify-center">
          <button
            onClick={() => setVisible((current) => current + PAGE_SIZE)}
            className="rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Carregar mais itens
          </button>
        </div>
      ) : null}
    </div>
  );
}
