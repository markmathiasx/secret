"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { categories, collections, type Product } from "@/lib/catalog";
import { StoreProductCard } from "@/components/store-product-card";

const PAGE_SIZE = 24;

const sortOptions = [
  { value: "relevancia", label: "Mais relevantes" },
  { value: "pix-asc", label: "Menor preço" },
  { value: "pix-desc", label: "Maior preço" },
  { value: "nome", label: "Nome A-Z" },
  { value: "prazo", label: "Menor prazo" }
] as const;

export function CatalogExplorer({ products }: { products: Product[] }) {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Todos");
  const [collection, setCollection] = useState("Todas");
  const [color, setColor] = useState("Todas");
  const [sortBy, setSortBy] = useState<(typeof sortOptions)[number]["value"]>("relevancia");
  const [page, setPage] = useState(1);

  const colors = useMemo(
    () => Array.from(new Set(products.flatMap((product) => product.colors))).sort(),
    [products]
  );

  useEffect(() => {
    setQuery(searchParams.get("q") || "");
    setCategory(searchParams.get("categoria") || "Todos");
    setCollection("Todas");
    setColor("Todas");
    setSortBy("relevancia");
    setPage(1);
  }, [searchParams]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((item) => {
      const matchQuery = !q
        ? true
        : [item.name, item.category, item.theme, item.description, item.collection, ...item.tags]
            .join(" ")
            .toLowerCase()
            .includes(q);
      const matchCategory = category === "Todos" ? true : item.category === category;
      const matchCollection = collection === "Todas" ? true : item.collection === collection;
      const matchColor = color === "Todas" ? true : item.colors.includes(color);
      return matchQuery && matchCategory && matchCollection && matchColor;
    });
  }, [products, query, category, collection, color]);

  const sorted = useMemo(() => {
    const items = [...filtered];
    if (sortBy === "pix-asc") return items.sort((a, b) => a.pricePix - b.pricePix);
    if (sortBy === "pix-desc") return items.sort((a, b) => b.pricePix - a.pricePix);
    if (sortBy === "nome") return items.sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
    if (sortBy === "prazo") return items.sort((a, b) => a.hours - b.hours);
    return items;
  }, [filtered, sortBy]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = sorted.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const pageNumbers = Array.from(
    new Set([1, currentPage - 1, currentPage, currentPage + 1, totalPages].filter((value) => value >= 1 && value <= totalPages))
  );

  function resetPage() {
    setPage(1);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
      <aside className="space-y-4 rounded-[32px] border border-white/10 bg-white/5 p-5 lg:sticky lg:top-40 lg:h-fit">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Filtros</p>
          <h2 className="mt-2 text-2xl font-black text-white">Encontre mais rápido</h2>
          <p className="mt-3 text-sm leading-7 text-white/60">
            Busque por tema, cor, coleção ou categoria e refine a vitrine sem sair da página.
          </p>
        </div>

        <label className="block text-sm text-white/70">
          <span className="mb-2 block">Buscar</span>
          <input
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              resetPage();
            }}
            placeholder="Ex: hello kitty, vaso, suporte..."
            className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
          />
        </label>

        <label className="block text-sm text-white/70">
          <span className="mb-2 block">Categoria</span>
          <select
            value={category}
            onChange={(event) => {
              setCategory(event.target.value);
              resetPage();
            }}
            className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
          >
            <option>Todos</option>
            {categories.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>

        <label className="block text-sm text-white/70">
          <span className="mb-2 block">Coleção</span>
          <select
            value={collection}
            onChange={(event) => {
              setCollection(event.target.value);
              resetPage();
            }}
            className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
          >
            <option>Todas</option>
            {collections.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>

        <label className="block text-sm text-white/70">
          <span className="mb-2 block">Cor</span>
          <select
            value={color}
            onChange={(event) => {
              setColor(event.target.value);
              resetPage();
            }}
            className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
          >
            <option>Todas</option>
            {colors.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
      </aside>

      <div className="space-y-6">
        <div className="rounded-[32px] border border-white/10 bg-white/5 p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Vitrine filtrada</p>
              <h3 className="mt-2 text-2xl font-black text-white">{sorted.length} produtos encontrados</h3>
              <p className="mt-2 text-sm text-white/60">
                Cards com preço, Pix, parcelamento, quick view e botão de compra prontos para conversão.
              </p>
            </div>

            <label className="min-w-[220px] text-sm text-white/70">
              <span className="mb-2 block">Ordenar por</span>
              <select
                value={sortBy}
                onChange={(event) => {
                  setSortBy(event.target.value as (typeof sortOptions)[number]["value"]);
                  resetPage();
                }}
                className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        {pageItems.length ? (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {pageItems.map((product) => (
              <StoreProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="rounded-[32px] border border-dashed border-white/15 bg-white/5 p-10 text-center">
            <h3 className="text-2xl font-bold text-white">Nada encontrado com esses filtros</h3>
            <p className="mt-3 text-sm text-white/60">Tente limpar a busca, trocar a coleção ou voltar para “Todos”.</p>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-[32px] border border-white/10 bg-white/5 p-5">
          <p className="text-sm text-white/60">
            Página {currentPage} de {totalPages}
          </p>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={currentPage === 1}
              className="rounded-full border border-white/10 bg-black/20 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
            >
              Anterior
            </button>

            {pageNumbers.map((pageNumber) => (
              <button
                key={pageNumber}
                type="button"
                onClick={() => setPage(pageNumber)}
                className={`rounded-full px-4 py-2 text-sm font-semibold ${
                  pageNumber === currentPage
                    ? "bg-cyan-400 text-slate-950"
                    : "border border-white/10 bg-black/20 text-white"
                }`}
              >
                {pageNumber}
              </button>
            ))}

            <button
              type="button"
              onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
              disabled={currentPage === totalPages}
              className="rounded-full border border-white/10 bg-black/20 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
            >
              Próxima
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
