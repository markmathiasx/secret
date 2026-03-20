"use client";

import { useDeferredValue, useMemo, useState, useTransition } from "react";
import { categories, collections, type Product, type VisualType } from "@/lib/catalog";
import { ProductCard } from "@/components/product-card";

const PAGE_SIZE = 24;

type SortMode = "featured" | "price-asc" | "price-desc" | "lead-time" | "best-margin";
type VisualFilter = "all" | VisualType;

const visualFilterLabels: Record<VisualFilter, string> = {
  all: "Todos os visuais",
  "foto-real": "Foto real",
  "render-fiel": "Render fiel",
  conceitual: "Conceitual"
};

export function CatalogExplorer({ products }: { products: Product[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Todos");
  const [collection, setCollection] = useState("Todas");
  const [sortMode, setSortMode] = useState<SortMode>("featured");
  const [visualFilter, setVisualFilter] = useState<VisualFilter>("all");
  const [readyNowOnly, setReadyNowOnly] = useState(false);
  const [visible, setVisible] = useState(PAGE_SIZE);
  const deferredQuery = useDeferredValue(query);
  const [isPending, startTransition] = useTransition();

  const visualSummary = useMemo(() => {
    const summary = {
      all: products.length,
      "foto-real": 0,
      "render-fiel": 0,
      conceitual: 0
    } as Record<VisualFilter, number>;

    for (const item of products) {
      summary[item.visualType] += 1;
    }

    return summary;
  }, [products]);

  const filtered = useMemo(() => {
    const q = deferredQuery.trim().toLowerCase();

    const items = products.filter((item) => {
      const matchQuery = !q
        ? true
        : [item.name, item.category, item.theme, item.description, item.collection, item.material, item.finish, ...item.tags]
            .join(" ")
            .toLowerCase()
            .includes(q);
      const matchCategory = category === "Todos" ? true : item.category === category;
      const matchCollection = collection === "Todas" ? true : item.collection === collection;
      const matchVisual = visualFilter === "all" ? true : item.visualType === visualFilter;
      const matchReadyNow = readyNowOnly ? item.fulfillment === "Pronta entrega" : true;
      return matchQuery && matchCategory && matchCollection && matchVisual && matchReadyNow;
    });

    return items.sort((a, b) => {
      if (sortMode === "price-asc") return a.pricePix - b.pricePix;
      if (sortMode === "price-desc") return b.pricePix - a.pricePix;
      if (sortMode === "lead-time") return a.hours - b.hours;
      if (sortMode === "best-margin") return b.priceCard - b.pricePix - (a.priceCard - a.pricePix);
      if (a.featured !== b.featured) return a.featured ? -1 : 1;
      return a.pricePix - b.pricePix;
    });
  }, [category, collection, deferredQuery, products, readyNowOnly, sortMode, visualFilter]);

  const visibleItems = filtered.slice(0, visible);
  const readyNowCount = filtered.filter((item) => item.fulfillment === "Pronta entrega").length;

  function resetVisible() {
    setVisible(PAGE_SIZE);
  }

  function clearFilters() {
    startTransition(() => {
      setQuery("");
      setCategory("Todos");
      setCollection("Todas");
      setSortMode("featured");
      setVisualFilter("all");
      setReadyNowOnly(false);
      setVisible(PAGE_SIZE);
    });
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
                const nextValue = event.target.value;
                startTransition(() => {
                  setQuery(nextValue);
                  resetVisible();
                });
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
                startTransition(() => {
                  setCategory(event.target.value);
                  resetVisible();
                });
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
                startTransition(() => {
                  setCollection(event.target.value);
                  resetVisible();
                });
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
                startTransition(() => {
                  setSortMode(event.target.value as SortMode);
                  resetVisible();
                });
              }}
              className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
            >
              <option value="featured">Mais relevantes</option>
              <option value="price-asc">Menor preço</option>
              <option value="price-desc">Maior preço</option>
              <option value="lead-time">Menor prazo</option>
              <option value="best-margin">Maior margem sugerida</option>
            </select>
          </label>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {(Object.keys(visualFilterLabels) as VisualFilter[]).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => {
                startTransition(() => {
                  setVisualFilter(item);
                  resetVisible();
                });
              }}
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                visualFilter === item
                  ? "border-cyan-300/45 bg-cyan-300/14 text-cyan-50"
                  : "border-white/10 bg-white/5 text-white/70 hover:text-white"
              }`}
            >
              {visualFilterLabels[item]} ({visualSummary[item]})
            </button>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <label className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-2 text-xs text-white/75">
            <input
              type="checkbox"
              checked={readyNowOnly}
              onChange={(event) => {
                startTransition(() => {
                  setReadyNowOnly(event.target.checked);
                  resetVisible();
                });
              }}
              className="h-4 w-4 accent-cyan-300"
            />
            Mostrar so pronta entrega
          </label>
          <button
            type="button"
            onClick={clearFilters}
            className="rounded-full border border-white/12 bg-white/5 px-3 py-2 text-xs font-semibold text-white/75"
          >
            Limpar filtros
          </button>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-white/60">
          <span>{filtered.length} resultados</span>
          {isPending ? <span className="text-cyan-100/85">Atualizando...</span> : null}
          <span className="h-1 w-1 rounded-full bg-white/30" />
          <span>{readyNowCount} com pronta entrega</span>
          <span className="h-1 w-1 rounded-full bg-white/30" />
          <span>Visual do item sinalizado por tipo de midia</span>
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
