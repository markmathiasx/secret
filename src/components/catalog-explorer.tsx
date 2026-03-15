"use client";

import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Filter, Search, SlidersHorizontal, Sparkles, X } from "lucide-react";
import { CatalogCard } from "@/components/catalog-card";
import { CatalogQuickView } from "@/components/catalog-quick-view";
import { trackEvent } from "@/lib/analytics-client";
import { categories, collections, type Product } from "@/lib/catalog";
import { whatsappNumber } from "@/lib/constants";
import { buildWhatsAppLink } from "@/lib/whatsapp";

const PAGE_SIZE = 20;

const priceRanges = [
  { id: "all", label: "Qualquer faixa" },
  { id: "under-40", label: "Até R$ 40" },
  { id: "40-70", label: "R$ 40 a R$ 70" },
  { id: "70-100", label: "R$ 70 a R$ 100" },
  { id: "100-plus", label: "Acima de R$ 100" }
] as const;

const leadTimes = [
  { id: "all", label: "Qualquer prazo" },
  { id: "24h", label: "Pronto em 24h" },
  { id: "1-2 dias", label: "1 a 2 dias" },
  { id: "2-4 dias", label: "2 a 4 dias" }
] as const;

const sortOptions = [
  { id: "featured", label: "Destaques primeiro" },
  { id: "price-asc", label: "Menor preço" },
  { id: "price-desc", label: "Maior preço" },
  { id: "fastest", label: "Menor prazo" },
  { id: "name", label: "Nome A-Z" }
] as const;

type SortOption = (typeof sortOptions)[number]["id"];

type CatalogExplorerProps = {
  products: Product[];
  initialQuery?: string;
  initialCategory?: string;
};

function matchesPriceRange(product: Product, rangeId: (typeof priceRanges)[number]["id"]) {
  if (rangeId === "all") return true;
  if (rangeId === "under-40") return product.pricePix <= 40;
  if (rangeId === "40-70") return product.pricePix > 40 && product.pricePix <= 70;
  if (rangeId === "70-100") return product.pricePix > 70 && product.pricePix <= 100;
  return product.pricePix > 100;
}

function matchesLeadTime(product: Product, leadTimeId: (typeof leadTimes)[number]["id"]) {
  if (leadTimeId === "all") return true;
  if (leadTimeId === "1-2 dias") return product.productionWindow === "1-2 dias";
  if (leadTimeId === "2-4 dias") return product.productionWindow === "2-4 dias";
  return product.productionWindow === leadTimeId;
}

function buildPagination(currentPage: number, totalPages: number) {
  const pages = new Set<number>([1, totalPages, currentPage, currentPage - 1, currentPage + 1]);
  return Array.from(pages).filter((page) => page >= 1 && page <= totalPages).sort((left, right) => left - right);
}

export function CatalogExplorer({
  products,
  initialQuery = "",
  initialCategory = ""
}: CatalogExplorerProps) {
  const [query, setQuery] = useState(initialQuery);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    categories.includes(initialCategory) ? [initialCategory] : []
  );
  const [selectedCollections, setSelectedCollections] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<(typeof priceRanges)[number]["id"]>("all");
  const [leadTime, setLeadTime] = useState<(typeof leadTimes)[number]["id"]>("all");
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>("featured");
  const [page, setPage] = useState(1);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const mobileFilterCloseButtonRef = useRef<HTMLButtonElement | null>(null);
  const lastFocusedElementRef = useRef<HTMLElement | null>(null);
  const deferredQuery = useDeferredValue(query);

  useEffect(() => {
    setQuery(initialQuery);
    setQuickViewProduct(null);
  }, [initialQuery]);

  useEffect(() => {
    setSelectedCategories(categories.includes(initialCategory) ? [initialCategory] : []);
    setQuickViewProduct(null);
  }, [initialCategory, initialQuery]);

  useEffect(() => {
    setSelectedCollections([]);
    setPriceRange("all");
    setLeadTime("all");
    setFeaturedOnly(false);
    setSortBy("featured");
    setPage(1);
  }, [initialCategory, initialQuery]);

  useEffect(() => {
    setPage(1);
  }, [deferredQuery, featuredOnly, leadTime, priceRange, selectedCategories, selectedCollections, sortBy]);

  useEffect(() => {
    if (!mobileFiltersOpen) return;

    const previousOverflow = document.body.style.overflow;
    lastFocusedElementRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMobileFiltersOpen(false);
      }
    }

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);
    window.setTimeout(() => mobileFilterCloseButtonRef.current?.focus(), 0);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      window.setTimeout(() => lastFocusedElementRef.current?.focus(), 0);
    };
  }, [mobileFiltersOpen]);

  useEffect(() => {
    trackEvent("view_category", {
      category: initialCategory || "all",
      query: initialQuery || "",
      totalProducts: products.length
    });
  }, [initialCategory, initialQuery, products.length]);

  const filteredAndSorted = useMemo(() => {
    const normalizedQuery = deferredQuery.trim().toLowerCase();
    const selectedCategorySet = new Set(selectedCategories);
    const selectedCollectionSet = new Set(selectedCollections);

    const filtered = products.filter((product) => {
      const searchPool = [product.name, product.category, product.theme, product.description, product.collection, ...product.tags]
        .join(" ")
        .toLowerCase();

      return (
        (normalizedQuery ? searchPool.includes(normalizedQuery) : true) &&
        (selectedCategorySet.size ? selectedCategorySet.has(product.category) : true) &&
        (selectedCollectionSet.size ? selectedCollectionSet.has(product.collection) : true) &&
        (featuredOnly ? product.featured : true) &&
        matchesPriceRange(product, priceRange) &&
        matchesLeadTime(product, leadTime)
      );
    });

    return filtered.sort((left, right) => {
      if (sortBy === "price-asc") return left.pricePix - right.pricePix;
      if (sortBy === "price-desc") return right.pricePix - left.pricePix;
      if (sortBy === "fastest") return left.hours - right.hours || left.pricePix - right.pricePix;
      if (sortBy === "name") return left.name.localeCompare(right.name, "pt-BR");
      if (left.featured !== right.featured) return Number(right.featured) - Number(left.featured);
      return left.hours - right.hours || left.pricePix - right.pricePix;
    });
  }, [deferredQuery, featuredOnly, leadTime, priceRange, products, selectedCategories, selectedCollections, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredAndSorted.length / PAGE_SIZE));

  useEffect(() => {
    setPage((current) => Math.min(current, totalPages));
  }, [totalPages]);

  const paginated = filteredAndSorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const pagination = buildPagination(page, totalPages);
  const activeFiltersCount =
    selectedCategories.length + selectedCollections.length + Number(priceRange !== "all") + Number(leadTime !== "all") + Number(featuredOnly);
  const rangeStart = filteredAndSorted.length ? (page - 1) * PAGE_SIZE + 1 : 0;
  const rangeEnd = filteredAndSorted.length ? Math.min(page * PAGE_SIZE, filteredAndSorted.length) : 0;
  const searchTypeahead = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (normalizedQuery.length < 2) return [];

    return products
      .filter((product) =>
        [product.name, product.category, product.theme, product.collection, ...product.tags]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery)
      )
      .slice(0, 4);
  }, [products, query]);
  const quickSearchScopes = ["anime", "geek", "presente", "decoração", "suporte", "personalizado"];
  const catalogHelpHref = buildWhatsAppLink(
    whatsappNumber,
    `Oi! Vim pelo catálogo da MDH 3D e quero ajuda para encontrar ${deferredQuery.trim() || "um produto ideal"}.`
  );

  function toggleInArray(value: string, currentValues: string[], setValues: (values: string[]) => void) {
    setValues(currentValues.includes(value) ? currentValues.filter((item) => item !== value) : [...currentValues, value]);
  }

  function clearFilters() {
    setQuery("");
    setSelectedCategories([]);
    setSelectedCollections([]);
    setPriceRange("all");
    setLeadTime("all");
    setFeaturedOnly(false);
    setSortBy("featured");
    setPage(1);
  }

  useEffect(() => {
    if (!deferredQuery.trim() && activeFiltersCount === 0 && sortBy === "featured") return;

    if (deferredQuery.trim()) {
      trackEvent("search", {
        source: "catalog_sidebar",
        query: deferredQuery.trim(),
        results: filteredAndSorted.length
      });
    }

    trackEvent("filter_change", {
      selectedCategories,
      selectedCollections,
      priceRange,
      leadTime,
      featuredOnly,
      sortBy,
      results: filteredAndSorted.length
    });
  }, [
    activeFiltersCount,
    deferredQuery,
    featuredOnly,
    filteredAndSorted.length,
    leadTime,
    priceRange,
    selectedCategories,
    selectedCollections,
    sortBy
  ]);

  const filterPanel = (
    <div className="rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] p-5 shadow-[0_18px_48px_rgba(2,8,23,0.28)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-cyan-200/80">Filtros</p>
          <h2 className="mt-2 text-2xl font-black text-white">Refine a vitrine</h2>
        </div>
        <div className="flex items-center gap-2">
          <div className="rounded-full border border-white/10 bg-white/5 p-2 text-white/65">
            <SlidersHorizontal className="h-4 w-4" />
          </div>
          <button
            type="button"
            onClick={() => setMobileFiltersOpen(false)}
            ref={mobileFilterCloseButtonRef}
            className="rounded-full border border-white/10 bg-white/5 p-2 text-white/65 lg:hidden"
            aria-label="Fechar filtros"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      <label className="mt-5 block text-sm text-white/68">
        <span className="mb-2 block">Buscar dentro do catálogo</span>
        <div className="flex items-center rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
          <Search className="h-4 w-4 text-white/45" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="hello kitty, suporte, vaso..."
            className="ml-3 w-full bg-transparent text-white outline-none placeholder:text-white/35"
            aria-label="Buscar dentro do catálogo"
          />
        </div>
      </label>

      {query.trim().length < 2 ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {quickSearchScopes.map((scope) => (
            <button
              key={scope}
              type="button"
              onClick={() => setQuery(scope)}
              className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/72 transition hover:text-white"
            >
              {scope}
            </button>
          ))}
        </div>
      ) : null}

      {query.trim().length >= 2 ? (
        <div className="mt-4">
          <p className="text-[11px] uppercase tracking-[0.18em] text-white/45">Autocomplete da vitrine</p>
          <div className="mt-2 grid gap-2">
            {searchTypeahead.length ? (
              searchTypeahead.map((product) => (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => setQuery(product.name)}
                  className="flex items-center justify-between gap-3 rounded-[20px] border border-white/10 bg-white/5 px-3 py-2 text-left text-sm text-white/78 transition hover:border-white/20 hover:text-white"
                >
                  <span className="truncate">{product.name}</span>
                  <span className="shrink-0 text-[11px] uppercase tracking-[0.18em] text-cyan-200/75">
                    {product.category}
                  </span>
                </button>
              ))
            ) : (
              <div className="rounded-[20px] border border-dashed border-white/10 bg-black/20 px-3 py-3 text-sm text-white/55">
                Nenhum autocomplete forte para esse termo ainda. Continue com a busca ou limpe o texto para explorar os atalhos.
              </div>
            )}
          </div>
        </div>
      ) : null}

      <div className="mt-5">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-white">Categorias</p>
          <span className="text-xs text-white/45">{selectedCategories.length || "Todas"}</span>
        </div>
        <div className="mt-3 grid gap-2">
          {categories.map((category) => {
            const active = selectedCategories.includes(category);

            return (
              <label
                key={category}
                className={`flex cursor-pointer items-center justify-between rounded-2xl border px-3 py-2.5 text-sm transition ${
                  active
                    ? "border-cyan-300/40 bg-cyan-400/10 text-cyan-100"
                    : "border-white/10 bg-white/5 text-white/72 hover:border-white/20 hover:text-white"
                }`}
              >
                <span>{category}</span>
                <input
                  type="checkbox"
                  checked={active}
                  onChange={() => toggleInArray(category, selectedCategories, setSelectedCategories)}
                  className="h-4 w-4 accent-cyan-300"
                />
              </label>
            );
          })}
        </div>
      </div>

      <div className="mt-5">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-white">Coleções</p>
          <span className="text-xs text-white/45">{selectedCollections.length || "Todas"}</span>
        </div>
        <div className="mt-3 grid gap-2">
          {collections.map((collection) => {
            const active = selectedCollections.includes(collection);

            return (
              <label
                key={collection}
                className={`flex cursor-pointer items-center justify-between rounded-2xl border px-3 py-2.5 text-sm transition ${
                  active
                    ? "border-cyan-300/40 bg-cyan-400/10 text-cyan-100"
                    : "border-white/10 bg-white/5 text-white/72 hover:border-white/20 hover:text-white"
                }`}
              >
                <span>{collection}</span>
                <input
                  type="checkbox"
                  checked={active}
                  onChange={() => toggleInArray(collection, selectedCollections, setSelectedCollections)}
                  className="h-4 w-4 accent-cyan-300"
                />
              </label>
            );
          })}
        </div>
      </div>

      <div className="mt-5">
        <p className="text-sm font-semibold text-white">Faixa de preço</p>
        <div className="mt-3 grid gap-2">
          {priceRanges.map((range) => (
            <label
              key={range.id}
              className={`flex cursor-pointer items-center justify-between rounded-2xl border px-3 py-2.5 text-sm transition ${
                priceRange === range.id
                  ? "border-emerald-300/35 bg-emerald-400/10 text-emerald-100"
                  : "border-white/10 bg-white/5 text-white/72 hover:border-white/20 hover:text-white"
              }`}
            >
              <span>{range.label}</span>
              <input
                type="radio"
                name="priceRange"
                checked={priceRange === range.id}
                onChange={() => setPriceRange(range.id)}
                className="h-4 w-4 accent-emerald-300"
              />
            </label>
          ))}
        </div>
      </div>

      <div className="mt-5">
        <p className="text-sm font-semibold text-white">Prazo de produção</p>
        <div className="mt-3 grid gap-2">
          {leadTimes.map((item) => (
            <label
              key={item.id}
              className={`flex cursor-pointer items-center justify-between rounded-2xl border px-3 py-2.5 text-sm transition ${
                leadTime === item.id
                  ? "border-amber-300/35 bg-amber-300/10 text-amber-100"
                  : "border-white/10 bg-white/5 text-white/72 hover:border-white/20 hover:text-white"
              }`}
            >
              <span>{item.label}</span>
              <input
                type="radio"
                name="leadTime"
                checked={leadTime === item.id}
                onChange={() => setLeadTime(item.id)}
                className="h-4 w-4 accent-amber-300"
              />
            </label>
          ))}
        </div>
      </div>

      <label className="mt-5 flex items-center justify-between rounded-[24px] border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/75">
        <span className="inline-flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-cyan-200" />
          Destaques da loja
        </span>
        <input
          type="checkbox"
          checked={featuredOnly}
          onChange={() => setFeaturedOnly((current) => !current)}
          className="h-4 w-4 accent-cyan-300"
        />
      </label>

      <button
        type="button"
        onClick={clearFilters}
        className="mt-5 w-full rounded-full border border-white/10 bg-black/20 px-4 py-3 text-sm font-semibold text-white/70 transition hover:text-white"
      >
        Limpar filtros
      </button>
    </div>
  );

  return (
    <>
      <div className="sticky top-28 z-30 mb-4 lg:hidden">
        <div className="glass-surface flex items-center gap-2 rounded-[28px] px-3 py-3">
          <button
            type="button"
            onClick={() => setMobileFiltersOpen(true)}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/84"
          >
            <Filter className="h-4 w-4" />
            Filtros {activeFiltersCount ? `(${activeFiltersCount})` : ""}
          </button>
          <div className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-100">
            {filteredAndSorted.length} itens
          </div>
          <label className="min-w-0 flex-1">
            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value as SortOption)}
              className="w-full rounded-full border border-white/10 bg-black/20 px-4 py-2 text-sm text-white outline-none"
            >
              {sortOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[18rem_minmax(0,1fr)]">
        <aside
          className={`${
            mobileFiltersOpen
              ? "fixed inset-0 z-[72] flex items-start justify-end bg-slate-950/78 p-4 backdrop-blur-sm lg:static lg:block lg:bg-transparent lg:p-0"
              : "hidden lg:block"
          }`}
          role={mobileFiltersOpen ? "dialog" : undefined}
          aria-modal={mobileFiltersOpen ? "true" : undefined}
          aria-label={mobileFiltersOpen ? "Filtros do catálogo" : undefined}
          onClick={mobileFiltersOpen ? () => setMobileFiltersOpen(false) : undefined}
        >
          <div className="w-full max-w-sm space-y-4 lg:sticky lg:top-36 lg:h-fit lg:max-w-none" onClick={(event) => event.stopPropagation()}>
            {filterPanel}
          </div>
        </aside>

        <div className="space-y-5">
          <div className="section-shell rounded-[32px] p-5">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-cyan-200/80">Vitrine da loja</p>
                <h2 className="mt-2 text-3xl font-black text-white">{filteredAndSorted.length} produtos filtrados</h2>
                <p className="mt-2 text-sm leading-7 text-white/62">
                  Cards mais densos, quick view, sinais visuais fortes e informações de preço já visíveis sem exigir clique desnecessário.
                </p>
              </div>

              <label className="hidden text-sm text-white/68 lg:block">
                <span className="mb-2 block">Ordenar por</span>
                <select
                  value={sortBy}
                  onChange={(event) => setSortBy(event.target.value as SortOption)}
                  className="min-w-64 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
                >
                  {sortOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-white/55">
              <span>
                Página {page} de {totalPages}
              </span>
              <span className="h-1 w-1 rounded-full bg-white/30" />
              <span>{activeFiltersCount} filtro(s) ativo(s)</span>
              <span className="h-1 w-1 rounded-full bg-white/30" />
              <span>autocomplete local + quick view + mídia estável</span>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {["Pix mais forte", "Quick view imediato", "Filtros previsíveis", "Checkout guest"].map((item) => (
                <span key={item} className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs uppercase tracking-[0.18em] text-white/60">
                  {item}
                </span>
              ))}
            </div>
          </div>

          {paginated.length ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {paginated.map((product) => (
                <CatalogCard key={product.id} product={product} onQuickView={setQuickViewProduct} />
              ))}
            </div>
          ) : (
            <div className="section-shell rounded-[32px] px-6 py-12 text-center">
              <h3 className="text-2xl font-black text-white">Nenhum item combinou com essa busca</h3>
              <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-white/60">
                Ajuste busca, faixa de preço ou categorias. Se preferir, fale com a MDH 3D no WhatsApp e a gente te ajuda a chegar no produto certo com mais rapidez.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <button
                  type="button"
                  onClick={clearFilters}
                  className="rounded-full border border-cyan-400/25 bg-cyan-400/12 px-5 py-3 text-sm font-semibold text-cyan-100 transition hover:border-cyan-300/55 hover:bg-cyan-300/18"
                >
                  Resetar vitrine
                </button>
                <a
                  href={catalogHelpHref}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border border-emerald-400/25 bg-emerald-400/14 px-5 py-3 text-sm font-semibold text-emerald-100 transition hover:border-emerald-300/55 hover:bg-emerald-300/18"
                >
                  Pedir ajuda no WhatsApp
                </a>
              </div>
            </div>
          )}

          <div className="rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-4 shadow-[0_18px_48px_rgba(2,8,23,0.22)]">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <p className="text-sm text-white/60">
                Mostrando {rangeStart} a {rangeEnd} de {filteredAndSorted.length} itens
              </p>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                  disabled={page === 1}
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/75 transition hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Anterior
                </button>

                {pagination.map((pageNumber) => (
                  <button
                    key={pageNumber}
                    type="button"
                    onClick={() => setPage(pageNumber)}
                    className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                      pageNumber === page
                        ? "border-cyan-300/35 bg-cyan-400/12 text-cyan-100"
                        : "border-white/10 bg-white/5 text-white/70 hover:text-white"
                    }`}
                  >
                    {pageNumber}
                  </button>
                ))}

                <button
                  type="button"
                  onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                  disabled={page === totalPages}
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/75 transition hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Próxima
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <CatalogQuickView product={quickViewProduct} open={Boolean(quickViewProduct)} onClose={() => setQuickViewProduct(null)} />
    </>
  );
}
