"use client";

<<<<<<< ours
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
=======
import { useMemo, useState } from "react";
import Link from "next/link";
import { categories, collections, getProductUrl, type Product } from "@/lib/catalog";
import { formatCurrency } from "@/lib/utils";
import { ProductImageGallery } from "@/components/product-image-gallery";
import { FavoriteButton } from "@/components/favorite-button";

const PAGE_SIZE = 60;
const badges = ["Mais vendido", "Foto real", "Pronta entrega", "Sob encomenda", "Personalizável"];

export function CatalogExplorer({ products }: { products: Product[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Todos");
  const [collection, setCollection] = useState("Todas");
  const [visible, setVisible] = useState(PAGE_SIZE);

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
      return matchQuery && matchCategory && matchCollection;
>>>>>>> theirs
    });
  }, [initialCategory, initialQuery, products.length]);

  const filteredAndSorted = useMemo(() => {
    const normalizedQuery = deferredQuery.trim().toLowerCase();
    const selectedCategorySet = new Set(selectedCategories);
    const selectedCollectionSet = new Set(selectedCollections);

<<<<<<< ours
    const filtered = products.filter((product) => {
      const searchPool = [product.name, product.category, product.theme, product.description, product.collection, ...product.tags]
        .join(" ")
        .toLowerCase();
=======
  return (
    <div className="space-y-6">
      <div className="rounded-[32px] border border-white/10 bg-white/5 p-5">
        <div className="grid gap-4 lg:grid-cols-[1.2fr_0.4fr_0.4fr]">
          <label className="text-sm text-white/70">
            <span className="mb-2 block">Buscar peça</span>
            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setVisible(PAGE_SIZE);
              }}
              placeholder="Busque por tema, categoria ou uso"
              className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
            />
          </label>
>>>>>>> theirs

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
  const quickSearchScopes = ["anime", "presente", "setup", "decoracao", "organizador", "personalizado"];
  const catalogHelpHref = buildWhatsAppLink(
    whatsappNumber,
    `Oi! Vim pelo catalogo da MDH 3D e quero ajuda para encontrar ${deferredQuery.trim() || "um produto ideal"}.`
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
    <div className="premium-panel rounded-[32px] p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-cyan-200/80">Filtros</p>
                <h2 className="mt-2 text-2xl font-black text-white">Encontre a peca certa para comprar agora</h2>
        </div>
        <div className="flex items-center gap-2">
          <div className="premium-card rounded-full p-2 text-white/65">
            <SlidersHorizontal className="h-4 w-4" />
          </div>
          <button
            type="button"
            onClick={() => setMobileFiltersOpen(false)}
            ref={mobileFilterCloseButtonRef}
            className="premium-btn premium-btn-secondary premium-icon-btn lg:hidden"
            aria-label="Fechar filtros"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      <label className="mt-5 block text-sm text-white/68">
          <span className="mb-2 block">Buscar na colecao</span>
        <div className="premium-input-shell rounded-2xl px-4 py-3">
          <Search className="h-4 w-4 text-white/45" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="anime, presente, organizador, setup..."
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
              className="premium-chip px-3 py-1.5 text-xs font-medium"
            >
              {scope}
            </button>
          ))}
        </div>
      ) : null}

      {query.trim().length >= 2 ? (
        <div className="mt-4">
          <p className="text-[11px] uppercase tracking-[0.18em] text-white/45">Sugestoes da colecao</p>
          <div className="mt-2 grid gap-2">
            {searchTypeahead.length ? (
              searchTypeahead.map((product) => (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => setQuery(product.name)}
                  className="premium-card premium-card-hover flex items-center justify-between gap-3 rounded-[20px] px-3 py-2 text-left text-sm text-white/78 hover:text-white"
                >
                  <span className="truncate">{product.name}</span>
                  <span className="shrink-0 text-[11px] uppercase tracking-[0.18em] text-cyan-200/75">
                    {product.category}
                  </span>
                </button>
              ))
            ) : (
                <div className="premium-card rounded-[20px] border-dashed bg-black/20 px-3 py-3 text-sm text-white/55">
                Ainda nao apareceu a melhor sugestao para esse termo. Tente buscar por tema, tipo de presente ou utilidade da peca.
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
                className={`premium-card premium-card-hover flex cursor-pointer items-center justify-between rounded-2xl px-3 py-2.5 text-sm ${
                  active
                    ? "border-cyan-300/40 bg-cyan-400/10 text-cyan-100"
                    : "text-white/72 hover:text-white"
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
                className={`premium-card premium-card-hover flex cursor-pointer items-center justify-between rounded-2xl px-3 py-2.5 text-sm ${
                  active
                    ? "border-cyan-300/40 bg-cyan-400/10 text-cyan-100"
                    : "text-white/72 hover:text-white"
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
              className={`premium-card premium-card-hover flex cursor-pointer items-center justify-between rounded-2xl px-3 py-2.5 text-sm ${
                priceRange === range.id
                  ? "border-emerald-300/35 bg-emerald-400/10 text-emerald-100"
                  : "text-white/72 hover:text-white"
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
              className={`premium-card premium-card-hover flex cursor-pointer items-center justify-between rounded-2xl px-3 py-2.5 text-sm ${
                leadTime === item.id
                  ? "border-amber-300/35 bg-amber-300/10 text-amber-100"
                  : "text-white/72 hover:text-white"
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

      <label className="premium-card mt-5 flex items-center justify-between rounded-[24px] px-4 py-3 text-sm text-white/75">
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
        className="premium-btn premium-btn-ghost mt-5 w-full"
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
            className="premium-btn premium-btn-secondary px-4 py-2 text-sm"
          >
            <Filter className="h-4 w-4" />
            Filtros {activeFiltersCount ? `(${activeFiltersCount})` : ""}
          </button>
          <div className="premium-badge premium-badge-info px-3 py-2 text-xs">
            {filteredAndSorted.length} itens
          </div>
          <label className="min-w-0 flex-1">
            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value as SortOption)}
              className="premium-select rounded-full px-4 py-2 text-sm"
            >
              {sortOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>
<<<<<<< ours
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
=======

        <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-white/60">
          <span>{filtered.length} resultados disponíveis</span>
          <span className="h-1 w-1 rounded-full bg-white/30" />
          <span>Preço inicial, prazo e acabamento em todos os cards</span>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {visibleItems.map((product, index) => (
          <article key={product.id} className="group rounded-[28px] border border-white/10 bg-card p-5 transition hover:-translate-y-1 hover:border-cyan-300/30">
            <div className="relative">
              <ProductImageGallery product={product} compact />
              <div className="absolute right-3 top-3">
                <FavoriteButton productId={product.id} />
              </div>
            </div>
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs

        <div className="space-y-5">
            <div className="section-shell rounded-[32px] p-5">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
              <div>
<<<<<<< ours
                <p className="text-xs uppercase tracking-[0.22em] text-cyan-200/80">Vitrine curada</p>
                <h2 className="mt-2 text-3xl font-black text-white">{filteredAndSorted.length} produtos na sua selecao</h2>
                <p className="mt-2 text-sm leading-7 text-white/62">
                  Compare por preco, prazo, categoria e colecao sem perder a leitura elegante e organizada da vitrine.
                </p>
=======
                <p className="text-xs uppercase tracking-[0.2em] text-cyan-200/80">{product.category}</p>
                <h3 className="mt-2 text-lg font-semibold text-white">{product.name}</h3>
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
              </div>

              <label className="hidden text-sm text-white/68 lg:block">
                <span className="mb-2 block">Ordenar por</span>
                <select
                  value={sortBy}
                  onChange={(event) => setSortBy(event.target.value as SortOption)}
                  className="premium-select min-w-64"
                >
                  {sortOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
            <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-white/55">
              <span>
                Página {page} de {totalPages}
              </span>
              <span className="h-1 w-1 rounded-full bg-white/30" />
              <span>{activeFiltersCount} filtro(s) ativo(s)</span>
              <span className="h-1 w-1 rounded-full bg-white/30" />
              <span>Pix em destaque, prazo visivel e vitrine organizada</span>
            </div>

<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
            <div className="mt-4 flex flex-wrap gap-2">
              {["Mais pedidos", "Pix com melhor valor", "Filtros claros", "Compra simples"].map((item) => (
                <span key={item} className="premium-badge premium-badge-neutral h-auto px-3 py-1.5 text-xs">
                  {item}
                </span>
              ))}
=======
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="rounded-full border border-violet-300/25 bg-violet-400/10 px-2.5 py-1 text-[11px] text-violet-100">{badges[index % badges.length]}</span>
              <span className="rounded-full border border-white/10 px-2.5 py-1 text-[11px] text-white/75">PLA premium</span>
>>>>>>> theirs
=======
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="rounded-full border border-violet-300/25 bg-violet-400/10 px-2.5 py-1 text-[11px] text-violet-100">{badges[index % badges.length]}</span>
              <span className="rounded-full border border-white/10 px-2.5 py-1 text-[11px] text-white/75">PLA premium</span>
>>>>>>> theirs
=======
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="rounded-full border border-violet-300/25 bg-violet-400/10 px-2.5 py-1 text-[11px] text-violet-100">{badges[index % badges.length]}</span>
              <span className="rounded-full border border-white/10 px-2.5 py-1 text-[11px] text-white/75">PLA premium</span>
>>>>>>> theirs
=======
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="rounded-full border border-violet-300/25 bg-violet-400/10 px-2.5 py-1 text-[11px] text-violet-100">{badges[index % badges.length]}</span>
              <span className="rounded-full border border-white/10 px-2.5 py-1 text-[11px] text-white/75">PLA premium</span>
>>>>>>> theirs
=======
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="rounded-full border border-violet-300/25 bg-violet-400/10 px-2.5 py-1 text-[11px] text-violet-100">{badges[index % badges.length]}</span>
              <span className="rounded-full border border-white/10 px-2.5 py-1 text-[11px] text-white/75">PLA premium</span>
>>>>>>> theirs
=======
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="rounded-full border border-violet-300/25 bg-violet-400/10 px-2.5 py-1 text-[11px] text-violet-100">{badges[index % badges.length]}</span>
              <span className="rounded-full border border-white/10 px-2.5 py-1 text-[11px] text-white/75">PLA premium</span>
>>>>>>> theirs
=======
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="rounded-full border border-violet-300/25 bg-violet-400/10 px-2.5 py-1 text-[11px] text-violet-100">{badges[index % badges.length]}</span>
              <span className="rounded-full border border-white/10 px-2.5 py-1 text-[11px] text-white/75">PLA premium</span>
>>>>>>> theirs
=======
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="rounded-full border border-violet-300/25 bg-violet-400/10 px-2.5 py-1 text-[11px] text-violet-100">{badges[index % badges.length]}</span>
              <span className="rounded-full border border-white/10 px-2.5 py-1 text-[11px] text-white/75">PLA premium</span>
>>>>>>> theirs
=======
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="rounded-full border border-violet-300/25 bg-violet-400/10 px-2.5 py-1 text-[11px] text-violet-100">{badges[index % badges.length]}</span>
              <span className="rounded-full border border-white/10 px-2.5 py-1 text-[11px] text-white/75">PLA premium</span>
>>>>>>> theirs
=======
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="rounded-full border border-violet-300/25 bg-violet-400/10 px-2.5 py-1 text-[11px] text-violet-100">{badges[index % badges.length]}</span>
              <span className="rounded-full border border-white/10 px-2.5 py-1 text-[11px] text-white/75">PLA premium</span>
>>>>>>> theirs
=======
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="rounded-full border border-violet-300/25 bg-violet-400/10 px-2.5 py-1 text-[11px] text-violet-100">{badges[index % badges.length]}</span>
              <span className="rounded-full border border-white/10 px-2.5 py-1 text-[11px] text-white/75">PLA premium</span>
>>>>>>> theirs
=======
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="rounded-full border border-violet-300/25 bg-violet-400/10 px-2.5 py-1 text-[11px] text-violet-100">{badges[index % badges.length]}</span>
              <span className="rounded-full border border-white/10 px-2.5 py-1 text-[11px] text-white/75">PLA premium</span>
>>>>>>> theirs
            </div>
          </div>

<<<<<<< ours
          {paginated.length ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {paginated.map((product) => (
                <CatalogCard key={product.id} product={product} onQuickView={setQuickViewProduct} />
              ))}
=======
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="rounded-full border border-violet-300/25 bg-violet-400/10 px-2.5 py-1 text-[11px] text-violet-100">{badges[index % badges.length]}</span>
              <span className="rounded-full border border-white/10 px-2.5 py-1 text-[11px] text-white/75">PLA premium</span>
>>>>>>> theirs
=======
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="rounded-full border border-violet-300/25 bg-violet-400/10 px-2.5 py-1 text-[11px] text-violet-100">{badges[index % badges.length]}</span>
              <span className="rounded-full border border-white/10 px-2.5 py-1 text-[11px] text-white/75">PLA premium</span>
>>>>>>> theirs
=======
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="rounded-full border border-violet-300/25 bg-violet-400/10 px-2.5 py-1 text-[11px] text-violet-100">{badges[index % badges.length]}</span>
              <span className="rounded-full border border-white/10 px-2.5 py-1 text-[11px] text-white/75">PLA premium</span>
>>>>>>> theirs
=======
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="rounded-full border border-violet-300/25 bg-violet-400/10 px-2.5 py-1 text-[11px] text-violet-100">{badges[index % badges.length]}</span>
              <span className="rounded-full border border-white/10 px-2.5 py-1 text-[11px] text-white/75">PLA premium</span>
>>>>>>> theirs
=======
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="rounded-full border border-violet-300/25 bg-violet-400/10 px-2.5 py-1 text-[11px] text-violet-100">{badges[index % badges.length]}</span>
              <span className="rounded-full border border-white/10 px-2.5 py-1 text-[11px] text-white/75">PLA premium</span>
>>>>>>> theirs
=======
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="rounded-full border border-violet-300/25 bg-violet-400/10 px-2.5 py-1 text-[11px] text-violet-100">{badges[index % badges.length]}</span>
              <span className="rounded-full border border-white/10 px-2.5 py-1 text-[11px] text-white/75">PLA premium</span>
>>>>>>> theirs
=======
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="rounded-full border border-violet-300/25 bg-violet-400/10 px-2.5 py-1 text-[11px] text-violet-100">{badges[index % badges.length]}</span>
              <span className="rounded-full border border-white/10 px-2.5 py-1 text-[11px] text-white/75">PLA premium</span>
>>>>>>> theirs
=======
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="rounded-full border border-violet-300/25 bg-violet-400/10 px-2.5 py-1 text-[11px] text-violet-100">{badges[index % badges.length]}</span>
              <span className="rounded-full border border-white/10 px-2.5 py-1 text-[11px] text-white/75">PLA premium</span>
>>>>>>> theirs
=======
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="rounded-full border border-violet-300/25 bg-violet-400/10 px-2.5 py-1 text-[11px] text-violet-100">{badges[index % badges.length]}</span>
              <span className="rounded-full border border-white/10 px-2.5 py-1 text-[11px] text-white/75">PLA premium</span>
>>>>>>> theirs
=======
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="rounded-full border border-violet-300/25 bg-violet-400/10 px-2.5 py-1 text-[11px] text-violet-100">{badges[index % badges.length]}</span>
              <span className="rounded-full border border-white/10 px-2.5 py-1 text-[11px] text-white/75">PLA premium</span>
>>>>>>> theirs
=======
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="rounded-full border border-violet-300/25 bg-violet-400/10 px-2.5 py-1 text-[11px] text-violet-100">{badges[index % badges.length]}</span>
              <span className="rounded-full border border-white/10 px-2.5 py-1 text-[11px] text-white/75">PLA premium</span>
>>>>>>> theirs
            </div>
          ) : (
            <div className="section-shell rounded-[32px] px-6 py-12 text-center">
              <h3 className="text-2xl font-black text-white">Ainda não apareceu a peça certa</h3>
              <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-white/60">
                Ajuste a busca, a faixa de preço ou a categoria. Se preferir, fale com a MDH 3D no WhatsApp e receba sugestões mais alinhadas ao que você quer presentear, organizar ou decorar.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <button
                  type="button"
                  onClick={clearFilters}
                  className="premium-btn premium-btn-primary"
                >
                    Limpar selecao
                  </button>
                <a
                  href={catalogHelpHref}
                  target="_blank"
                  rel="noreferrer"
                  className="premium-btn premium-btn-emerald"
                >
                    Pedir ajuda no WhatsApp
                  </a>
=======
            <p className="mt-3 min-h-[72px] text-sm leading-6 text-white/62">{product.description}</p>

            <p className="mt-3 min-h-[72px] text-sm leading-6 text-white/62">{product.description}</p>

            <p className="mt-3 min-h-[72px] text-sm leading-6 text-white/62">{product.description}</p>

            <p className="mt-3 min-h-[72px] text-sm leading-6 text-white/62">{product.description}</p>

            <p className="mt-3 min-h-[72px] text-sm leading-6 text-white/62">{product.description}</p>

            <p className="mt-3 min-h-[72px] text-sm leading-6 text-white/62">{product.description}</p>

            <p className="mt-3 min-h-[72px] text-sm leading-6 text-white/62">{product.description}</p>

            <p className="mt-3 min-h-[72px] text-sm leading-6 text-white/62">{product.description}</p>

            <p className="mt-3 min-h-[72px] text-sm leading-6 text-white/62">{product.description}</p>

            <p className="mt-3 min-h-[72px] text-sm leading-6 text-white/62">{product.description}</p>

            <p className="mt-3 min-h-[72px] text-sm leading-6 text-white/62">{product.description}</p>

            <p className="mt-3 min-h-[72px] text-sm leading-6 text-white/62">{product.description}</p>

            <p className="mt-3 min-h-[72px] text-sm leading-6 text-white/62">{product.description}</p>

            <p className="mt-3 min-h-[72px] text-sm leading-6 text-white/62">{product.description}</p>

            <p className="mt-3 min-h-[72px] text-sm leading-6 text-white/62">{product.description}</p>

            <p className="mt-3 min-h-[72px] text-sm leading-6 text-white/62">{product.description}</p>

            <p className="mt-3 min-h-[72px] text-sm leading-6 text-white/62">{product.description}</p>

            <p className="mt-3 min-h-[72px] text-sm leading-6 text-white/62">{product.description}</p>

            <p className="mt-3 min-h-[72px] text-sm leading-6 text-white/62">{product.description}</p>

            <p className="mt-3 min-h-[72px] text-sm leading-6 text-white/62">{product.description}</p>

            <p className="mt-3 min-h-[72px] text-sm leading-6 text-white/62">{product.description}</p>

            <p className="mt-3 min-h-[72px] text-sm leading-6 text-white/62">{product.description}</p>

            <p className="mt-3 min-h-[72px] text-sm leading-6 text-white/62">{product.description}</p>

            <div className="mt-5 flex items-end justify-between gap-3">
              <div>
                <p className="text-xs text-white/45">A partir de</p>
                <p className="text-2xl font-bold text-white">{formatCurrency(product.pricePix)}</p>
                <p className="text-xs text-white/45">Acabamento fosco ou acetinado</p>
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
              </div>
            </div>
          )}

          <div className="premium-panel rounded-[32px] p-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <p className="text-sm text-white/60">
                Mostrando {rangeStart} a {rangeEnd} de {filteredAndSorted.length} itens
              </p>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                  disabled={page === 1}
                  className="premium-btn premium-btn-secondary px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Anterior
                </button>

                {pagination.map((pageNumber) => (
                  <button
                    key={pageNumber}
                    type="button"
                    onClick={() => setPage(pageNumber)}
                    className={`premium-btn px-4 py-2 text-sm ${
                      pageNumber === page
                        ? "premium-btn-secondary border-cyan-300/35 bg-cyan-400/12 text-cyan-100"
                        : "premium-btn-secondary"
                    }`}
                  >
                    {pageNumber}
                  </button>
                ))}

                <button
                  type="button"
                  onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                  disabled={page === totalPages}
                  className="premium-btn premium-btn-secondary px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
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
