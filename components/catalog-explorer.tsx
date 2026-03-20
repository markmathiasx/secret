"use client";

import Link from "next/link";
import { useDeferredValue, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal, ShieldCheck, Scale, PackageCheck } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { getProductUrl, type Product, type ProductType, technicalScopes } from "@/lib/catalog";
import { ProductImageGallery } from "@/components/product-image-gallery";
import { useCompatibility } from "@/components/compatibility-context";
import { useCompare } from "@/components/compare-context";

const PAGE_SIZE = 18;
const controlClassName =
  "h-11 w-full rounded-2xl border border-[#e7d8c3] bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-200";

const typeLabels: Record<ProductType, string> = {
  spare_part: "Spare parts",
  upgrade: "Upgrades",
  consumable: "Consumables",
  kit: "Kits",
  accessory: "Accessories",
};

function clampPriceRange(nextMin: number, nextMax: number, min: number, max: number): [number, number] {
  const safeMin = Math.max(min, Math.min(nextMin, max));
  const safeMax = Math.min(max, Math.max(nextMax, min));
  return safeMin <= safeMax ? [safeMin, safeMax] : [safeMax, safeMax];
}

export function CatalogExplorer({ products }: { products: Product[] }) {
  const searchParams = useSearchParams();
  const { selectedModel, setSelectedModel } = useCompatibility();
  const { compareIds, isInCompare, toggleCompare } = useCompare();

  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [typeFilter, setTypeFilter] = useState<"all" | ProductType>("all");
  const [scopeFilter, setScopeFilter] = useState<"all" | string>("all");
  const [stockFilter, setStockFilter] = useState<"all" | "ready">("all");
  const [sort, setSort] = useState<"curadoria" | "price_asc" | "price_desc" | "rating">("curadoria");
  const [page, setPage] = useState(1);

  const liveQuery = useDeferredValue(query);
  const priceBounds = useMemo(() => {
    const values = products.map((item) => item.pricePix);
    const min = Math.floor(Math.min(...values) / 5) * 5;
    const max = Math.ceil(Math.max(...values) / 5) * 5;
    return { min, max };
  }, [products]);
  const [priceRange, setPriceRange] = useState<[number, number]>([priceBounds.min, priceBounds.max]);

  const filtered = useMemo(() => {
    const normalizedQuery = liveQuery.trim().toLowerCase();
    const list = products.filter((item) => {
      const matchQuery = !normalizedQuery
        ? true
        : [
            item.name,
            item.sku,
            item.description,
            item.category,
            item.subcategory,
            item.technical.partNumber || "",
            item.technical.typeProduct,
            item.technical.componentScope,
            ...(item.tags || []),
            ...(item.technical.symptomTags || []),
          ]
            .join(" ")
            .toLowerCase()
            .includes(normalizedQuery);

      const matchCompatibility = item.technical.compatibilityModels.includes(selectedModel);
      const matchType = typeFilter === "all" ? true : item.technical.typeProduct === typeFilter;
      const matchScope = scopeFilter === "all" ? true : item.technical.componentScope === scopeFilter;
      const matchStock = stockFilter === "all" ? true : item.status === "Pronta entrega";
      const matchPrice = item.pricePix >= priceRange[0] && item.pricePix <= priceRange[1];
      return matchQuery && matchCompatibility && matchType && matchScope && matchStock && matchPrice;
    });

    if (sort === "price_asc") return [...list].sort((a, b) => a.pricePix - b.pricePix);
    if (sort === "price_desc") return [...list].sort((a, b) => b.pricePix - a.pricePix);
    if (sort === "rating") return [...list].sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount);

    return [...list].sort((a, b) => {
      if (Number(b.realPhoto) !== Number(a.realPhoto)) return Number(b.realPhoto) - Number(a.realPhoto);
      if (Number(b.status === "Pronta entrega") !== Number(a.status === "Pronta entrega")) {
        return Number(b.status === "Pronta entrega") - Number(a.status === "Pronta entrega");
      }
      return b.rating - a.rating;
    });
  }, [liveQuery, priceRange, products, scopeFilter, selectedModel, sort, stockFilter, typeFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const visibleItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const clearFilters = () => {
    setQuery("");
    setTypeFilter("all");
    setScopeFilter("all");
    setStockFilter("all");
    setSort("curadoria");
    setPriceRange([priceBounds.min, priceBounds.max]);
    setPage(1);
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
      <aside className="space-y-5 xl:sticky xl:top-24 xl:self-start">
        <div className="rounded-[30px] border border-[#e8dac7] bg-[#fff8ef] p-5 shadow-[0_18px_44px_rgba(15,23,42,0.07)]">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-black text-slate-900">Compatibilidade ativa</h2>
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="mt-2 text-sm text-slate-600">Filtro persistente em todo o site para evitar compra errada.</p>
          <select
            value={selectedModel}
            onChange={(event) => setSelectedModel(event.target.value as "A1 Mini" | "A1")}
            className={`${controlClassName} mt-4`}
            aria-label="Modelo de compatibilidade"
          >
            <option value="A1 Mini">A1 Mini</option>
            <option value="A1">A1</option>
          </select>
        </div>

        <div className="rounded-[30px] border border-[#e8dac7] bg-white p-5 shadow-[0_18px_44px_rgba(15,23,42,0.07)]">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black text-slate-900">Filtros tecnicos</h3>
            <SlidersHorizontal className="h-4 w-4 text-slate-500" />
          </div>

          <div className="mt-4 space-y-4">
            <label className="block text-sm text-slate-700">
              Busca por SKU, PN, termo ou sintoma
              <div className="relative mt-2">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input value={query} onChange={(event) => setQuery(event.target.value)} className={`${controlClassName} pl-10`} placeholder="Ex.: A1M, FAH019, entupimento..." />
              </div>
            </label>

            <label className="block text-sm text-slate-700">
              Tipo de produto
              <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value as "all" | ProductType)} className={`${controlClassName} mt-2`}>
                <option value="all">Todos</option>
                {Object.entries(typeLabels).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </label>

            <label className="block text-sm text-slate-700">
              Escopo tecnico
              <select value={scopeFilter} onChange={(event) => setScopeFilter(event.target.value)} className={`${controlClassName} mt-2`}>
                <option value="all">Todos</option>
                {technicalScopes.map((scope) => (
                  <option key={scope} value={scope}>
                    {scope}
                  </option>
                ))}
              </select>
            </label>

            <label className="block text-sm text-slate-700">
              Disponibilidade
              <select value={stockFilter} onChange={(event) => setStockFilter(event.target.value as "all" | "ready")} className={`${controlClassName} mt-2`}>
                <option value="all">Todos</option>
                <option value="ready">Pronta entrega</option>
              </select>
            </label>

            <label className="block text-sm text-slate-700">
              Ordenacao
              <select value={sort} onChange={(event) => setSort(event.target.value as "curadoria" | "price_asc" | "price_desc" | "rating")} className={`${controlClassName} mt-2`}>
                <option value="curadoria">Curadoria marketplace</option>
                <option value="price_asc">Menor preco</option>
                <option value="price_desc">Maior preco</option>
                <option value="rating">Melhor avaliacao</option>
              </select>
            </label>

            <div className="rounded-2xl border border-[#eadcc8] bg-[#fff8ef] p-4">
              <p className="text-sm font-semibold text-slate-700">Faixa de preco</p>
              <p className="mt-1 text-xs text-slate-500">
                {formatCurrency(priceRange[0])} - {formatCurrency(priceRange[1])}
              </p>
              <div className="mt-3 grid gap-3">
                <input
                  type="range"
                  min={priceBounds.min}
                  max={priceBounds.max}
                  step={5}
                  value={priceRange[0]}
                  onChange={(event) =>
                    setPriceRange((current) => clampPriceRange(Number(event.target.value), current[1], priceBounds.min, priceBounds.max))
                  }
                  className="w-full accent-orange-500"
                />
                <input
                  type="range"
                  min={priceBounds.min}
                  max={priceBounds.max}
                  step={5}
                  value={priceRange[1]}
                  onChange={(event) =>
                    setPriceRange((current) => clampPriceRange(current[0], Number(event.target.value), priceBounds.min, priceBounds.max))
                  }
                  className="w-full accent-orange-500"
                />
              </div>
            </div>

            <button onClick={clearFilters} className="w-full rounded-full border border-[#e7d8c3] bg-[#fff3e2] px-4 py-2 text-sm font-semibold text-slate-700">
              Limpar filtros
            </button>
          </div>
        </div>
      </aside>

      <div className="space-y-6">
        <section className="rounded-[30px] border border-[#e8dac7] bg-white p-6 shadow-[0_18px_44px_rgba(15,23,42,0.07)]">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Resultado filtrado</p>
              <h2 className="mt-2 text-3xl font-black text-slate-900">{filtered.length} itens compatveis com {selectedModel}</h2>
              <p className="mt-2 text-sm text-slate-600">Busca tecnica por SKU/PN/sintoma com fotos reais e ficha de compatibilidade.</p>
            </div>
            <Link href="/comparar" className="inline-flex items-center gap-2 rounded-full border border-[#e5d4be] bg-[#fff8ef] px-4 py-2 text-sm font-semibold text-slate-700">
              <Scale className="h-4 w-4" />
              Comparador ({compareIds.length}/4)
            </Link>
          </div>
        </section>

        <div className="grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
          {visibleItems.map((product) => (
            <article key={product.id} className="rounded-[30px] border border-[#eadcc8] bg-white p-4 shadow-[0_18px_40px_rgba(15,23,42,0.07)]">
              <ProductImageGallery product={product} compact />
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-full bg-[#fff0da] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-orange-700">Foto real</span>
                <span className="rounded-full bg-[#eef7ec] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-700">{product.status}</span>
                <span className="rounded-full bg-[#e8f4ff] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-sky-700">{typeLabels[product.technical.typeProduct]}</span>
              </div>

              <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">{product.category}</p>
              <h3 className="mt-2 text-xl font-black text-slate-900">{product.name}</h3>
              <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">{product.description}</p>

              <div className="mt-4 rounded-2xl border border-[#eadcc8] bg-[#fff8ef] p-3">
                <p className="text-xs text-slate-500">SKU: {product.sku}</p>
                <p className="mt-1 text-xs text-slate-500">Compatibilidade: {product.technical.compatibilityModels.join(" / ")}</p>
              </div>

              <div className="mt-4 flex items-end justify-between gap-3">
                <div>
                  <p className="text-xs text-slate-500">Preco no Pix</p>
                  <p className="text-2xl font-black text-slate-900">{formatCurrency(product.pricePix)}</p>
                  <p className="text-xs text-slate-500">{product.parcelamentoMax}x de {formatCurrency(product.priceCard / product.parcelamentoMax)}</p>
                </div>
                <div className="grid gap-2">
                  <button
                    type="button"
                    onClick={() => toggleCompare(product.id)}
                    className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] ${
                      isInCompare(product.id)
                        ? "border-orange-300 bg-orange-100 text-orange-800"
                        : "border-[#e5d4be] bg-white text-slate-700"
                    }`}
                  >
                    {isInCompare(product.id) ? "No comparador" : "Comparar"}
                  </button>
                  <Link href={getProductUrl(product)} className="rounded-full bg-slate-900 px-4 py-2 text-center text-xs font-semibold uppercase tracking-[0.12em] text-white">
                    Ver produto
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>

        {totalPages > 1 ? (
          <div className="flex flex-wrap items-center justify-center gap-2 rounded-2xl border border-[#e8dac7] bg-[#fff8ef] px-4 py-4">
            <button onClick={() => setPage((value) => Math.max(1, value - 1))} disabled={currentPage === 1} className="rounded-full border border-[#e7d8c3] bg-white px-4 py-2 text-sm font-semibold text-slate-700 disabled:opacity-50">
              Anterior
            </button>
            <span className="px-4 text-sm font-semibold text-slate-700">
              Pagina {currentPage} de {totalPages}
            </span>
            <button onClick={() => setPage((value) => Math.min(totalPages, value + 1))} disabled={currentPage === totalPages} className="rounded-full border border-[#e7d8c3] bg-white px-4 py-2 text-sm font-semibold text-slate-700 disabled:opacity-50">
              Proxima
            </button>
          </div>
        ) : null}

        {!visibleItems.length ? (
          <div className="rounded-2xl border border-[#e8dac7] bg-white p-8 text-center">
            <p className="text-lg font-semibold text-slate-900">Nenhum item encontrado para o filtro atual.</p>
            <p className="mt-2 text-sm text-slate-600">Ajuste compatibilidade, faixa de preco ou termo tecnico da busca.</p>
            <button onClick={clearFilters} className="mt-4 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
              Resetar filtros
            </button>
          </div>
        ) : null}

        <div className="rounded-2xl border border-[#e8dac7] bg-white p-4 text-sm text-slate-600">
          <p className="inline-flex items-center gap-2 font-semibold text-slate-800">
            <PackageCheck className="h-4 w-4 text-emerald-600" />
            Aviso tecnico de seguranca
          </p>
          <p className="mt-2">
            Desligue e desconecte da tomada antes de qualquer manutencao. Nao toque no hotend sem resfriamento completo.
          </p>
        </div>
      </div>
    </div>
  );
}
