"use client";

import Link from "next/link";
import { type ReactNode, useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  ArrowUp,
  Bookmark,
  Clock3,
  Filter,
  LayoutGrid,
  MessageCircleMore,
  PackageCheck,
  RotateCcw,
  Rows3,
  Scale,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Star,
  Tag,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import {
  categories,
  collections,
  getProductUrl,
  technicalScopes,
  type Product,
  type ProductType,
} from "@/lib/catalog";
import { FavoriteButton } from "@/components/favorite-button";
import { ProductShelf } from "@/components/product-shelf";
import { ProductImageGallery } from "@/components/product-image-gallery";
import { ShareButton } from "@/components/share-button";
import { useCompatibility } from "@/components/compatibility-context";
import { useCompare } from "@/components/compare-context";
import { useFavorites } from "@/components/favorites-context";
import { useRecentlyViewed } from "@/components/recently-viewed-context";
import { useSavedSearches } from "@/components/saved-searches-context";
import { whatsappMessage, whatsappNumber } from "@/lib/constants";

const PAGE_SIZE = 18;
const SEARCH_HISTORY_KEY = "mdh.catalog.search.history";
const SAVED_PRESET_KEY = "mdh.catalog.saved.preset";
const controlClassName =
  "h-11 w-full rounded-2xl border border-[#e7d8c3] bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-200";
const QUICK_SEARCHES = ["chibi", "decoracao", "organizador", "articulado", "sob encomenda", "pronta entrega", "foto real", "presente"];

const typeLabels: Record<ProductType, string> = {
  spare_part: "Spare parts",
  upgrade: "Upgrades",
  consumable: "Consumables",
  kit: "Kits",
  accessory: "Accessories",
};

type VisualFilter = "all" | "real" | "concept";
type CustomizationFilter = "all" | "custom" | "standard";
type SortMode = "curadoria" | "price_asc" | "price_desc" | "rating" | "lead_time" | "stock";
type ViewMode = "grid" | "list";
type DensityMode = "comfortable" | "compact";
type SavedPreset = {
  query: string;
  typeFilter: "all" | ProductType;
  scopeFilter: "all" | string;
  stockFilter: "all" | "ready";
  categoryFilter: string;
  collectionFilter: string;
  visualFilter: VisualFilter;
  customizationFilter: CustomizationFilter;
  themeFilter: string;
  materialFilter: string;
  finishFilter: string;
  favoritesOnly: boolean;
};

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function highlightText(text: string, query: string) {
  const normalized = query.trim();
  if (normalized.length < 2) return text;

  const matcher = new RegExp(`(${escapeRegExp(normalized)})`, "ig");
  const parts = text.split(matcher);
  return parts.map((part, index) =>
    part.toLowerCase() === normalized.toLowerCase() ? (
      <mark key={`${part}-${index}`} className="rounded bg-amber-100 px-1 text-slate-900">
        {part}
      </mark>
    ) : (
      <span key={`${part}-${index}`}>{part}</span>
    )
  );
}

function getVisualBadge(product: Product) {
  if (product.realPhoto) {
    return {
      label: "Foto real",
      className: "bg-[#fff0da] text-orange-700",
      helper: "Peça fotografada de verdade",
    };
  }

  return {
    label: "Imagem conceitual",
    className: "bg-[#efe9ff] text-violet-700",
    helper: "Visual de referência do produto",
  };
}

function clampPriceRange(nextMin: number, nextMax: number, min: number, max: number): [number, number] {
  const safeMin = Math.max(min, Math.min(nextMin, max));
  const safeMax = Math.min(max, Math.max(nextMax, min));
  return safeMin <= safeMax ? [safeMin, safeMax] : [safeMax, safeMax];
}

function buildWhatsAppHref(label: string) {
  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`${whatsappMessage}\n\n${label}`)}`;
}

export function CatalogExplorer({ products }: { products: Product[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const resultsRef = useRef<HTMLDivElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const { selectedModel, setSelectedModel } = useCompatibility();
  const { compareIds, clearCompare, isInCompare, toggleCompare, replaceCompare } = useCompare();
  const { favoriteIds } = useFavorites();
  const { recentIds } = useRecentlyViewed();
  const { savedSearches, saveSearch } = useSavedSearches();

  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [typeFilter, setTypeFilter] = useState<"all" | ProductType>((searchParams.get("type") as "all" | ProductType) || "all");
  const [scopeFilter, setScopeFilter] = useState<"all" | string>(searchParams.get("scope") || "all");
  const [stockFilter, setStockFilter] = useState<"all" | "ready">((searchParams.get("stock") as "all" | "ready") || "all");
  const [sort, setSort] = useState<SortMode>((searchParams.get("sort") as SortMode) || "curadoria");
  const [page, setPage] = useState(1);
  const [categoryFilter, setCategoryFilter] = useState(searchParams.get("category") || "all");
  const [collectionFilter, setCollectionFilter] = useState(searchParams.get("collection") || "all");
  const [visualFilter, setVisualFilter] = useState<VisualFilter>((searchParams.get("visual") as VisualFilter) || "all");
  const [customizationFilter, setCustomizationFilter] = useState<CustomizationFilter>((searchParams.get("customization") as CustomizationFilter) || "all");
  const [themeFilter, setThemeFilter] = useState(searchParams.get("theme") || "all");
  const [materialFilter, setMaterialFilter] = useState(searchParams.get("material") || "all");
  const [finishFilter, setFinishFilter] = useState(searchParams.get("finish") || "all");
  const [favoritesOnly, setFavoritesOnly] = useState(searchParams.get("favorites") === "1");
  const [viewMode, setViewMode] = useState<ViewMode>((searchParams.get("view") as ViewMode) || "grid");
  const [density, setDensity] = useState<DensityMode>((searchParams.get("density") as DensityMode) || "comfortable");
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [hasSavedPreset, setHasSavedPreset] = useState(false);

  const liveQuery = useDeferredValue(query);
  const priceBounds = useMemo(() => {
    const values = products.map((item) => item.pricePix);
    const min = Math.floor(Math.min(...values) / 5) * 5;
    const max = Math.ceil(Math.max(...values) / 5) * 5;
    return { min, max };
  }, [products]);
  const [priceRange, setPriceRange] = useState<[number, number]>([priceBounds.min, priceBounds.max]);
  const categoryCounts = useMemo(
    () => Object.fromEntries(categories.map((category) => [category, products.filter((item) => item.category === category).length])),
    [products]
  );
  const collectionCounts = useMemo(
    () => Object.fromEntries(collections.map((collection) => [collection, products.filter((item) => item.collection === collection).length])),
    [products]
  );
  const scopeCounts = useMemo(
    () => Object.fromEntries(technicalScopes.map((scope) => [scope, products.filter((item) => item.technical.componentScope === scope).length])),
    [products]
  );
  const themes = useMemo(() => Array.from(new Set(products.map((item) => item.theme))).sort(), [products]);
  const materials = useMemo(() => Array.from(new Set(products.map((item) => item.material))).sort(), [products]);
  const finishes = useMemo(() => Array.from(new Set(products.map((item) => item.finish))).sort(), [products]);
  const themeCounts = useMemo(
    () => Object.fromEntries(themes.map((theme) => [theme, products.filter((item) => item.theme === theme).length])),
    [products, themes]
  );
  const materialCounts = useMemo(
    () => Object.fromEntries(materials.map((material) => [material, products.filter((item) => item.material === material).length])),
    [materials, products]
  );
  const finishCounts = useMemo(
    () => Object.fromEntries(finishes.map((finish) => [finish, products.filter((item) => item.finish === finish).length])),
    [finishes, products]
  );
  const searchSuggestions = useMemo(
    () =>
      Array.from(
        new Set(
          [
            ...recentSearches,
            ...products.flatMap((item) => [item.name, item.sku, item.collection, item.category, ...item.tags.slice(0, 2)]),
          ].filter(Boolean)
        )
      ).slice(0, 48),
    [products, recentSearches]
  );
  const favoriteProducts = useMemo(
    () => favoriteIds.map((id) => products.find((item) => item.id === id)).filter(Boolean) as Product[],
    [favoriteIds, products]
  );
  const recentProducts = useMemo(
    () => recentIds.map((id) => products.find((item) => item.id === id)).filter(Boolean) as Product[],
    [products, recentIds]
  );

  useEffect(() => {
    setPriceRange((current) => clampPriceRange(current[0], current[1], priceBounds.min, priceBounds.max));
  }, [priceBounds.max, priceBounds.min]);

  useEffect(() => {
    const min = Number(searchParams.get("min"));
    const max = Number(searchParams.get("max"));
    if (!Number.isFinite(min) && !Number.isFinite(max)) return;
    setPriceRange([
      Number.isFinite(min) ? min : priceBounds.min,
      Number.isFinite(max) ? max : priceBounds.max,
    ]);
  }, [priceBounds.max, priceBounds.min, searchParams]);

  useEffect(() => {
    try {
      const rawHistory = window.localStorage.getItem(SEARCH_HISTORY_KEY);
      if (rawHistory) {
        const parsed = JSON.parse(rawHistory);
        if (Array.isArray(parsed)) {
          setRecentSearches(parsed.filter((item): item is string => typeof item === "string").slice(0, 8));
        }
      }

      setHasSavedPreset(Boolean(window.localStorage.getItem(SAVED_PRESET_KEY)));
    } catch {
      setRecentSearches([]);
      setHasSavedPreset(false);
    }
  }, []);

  useEffect(() => {
    const normalized = liveQuery.trim();
    if (normalized.length < 3) return;

    const timeoutId = window.setTimeout(() => {
      setRecentSearches((current) => {
        const next = [normalized, ...current.filter((item) => item.toLowerCase() !== normalized.toLowerCase())].slice(0, 8);
        window.localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(next));
        return next;
      });
    }, 600);

    return () => window.clearTimeout(timeoutId);
  }, [liveQuery]);

  useEffect(() => {
    setPage(1);
  }, [
    categoryFilter,
    collectionFilter,
    customizationFilter,
    favoritesOnly,
    finishFilter,
    liveQuery,
    materialFilter,
    priceRange,
    scopeFilter,
    sort,
    stockFilter,
    themeFilter,
    typeFilter,
    visualFilter,
  ]);

  useEffect(() => {
    if (page <= 1) return;
    resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [page]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "/") return;
      const target = event.target as HTMLElement | null;
      const isTyping =
        target?.tagName === "INPUT" || target?.tagName === "TEXTAREA" || Boolean(target?.getAttribute("contenteditable"));
      if (isTyping) return;
      event.preventDefault();
      searchInputRef.current?.focus();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (categoryFilter !== "all") params.set("category", categoryFilter);
    if (collectionFilter !== "all") params.set("collection", collectionFilter);
    if (typeFilter !== "all") params.set("type", typeFilter);
    if (scopeFilter !== "all") params.set("scope", scopeFilter);
    if (stockFilter !== "all") params.set("stock", stockFilter);
    if (sort !== "curadoria") params.set("sort", sort);
    if (visualFilter !== "all") params.set("visual", visualFilter);
    if (customizationFilter !== "all") params.set("customization", customizationFilter);
    if (themeFilter !== "all") params.set("theme", themeFilter);
    if (materialFilter !== "all") params.set("material", materialFilter);
    if (finishFilter !== "all") params.set("finish", finishFilter);
    if (priceRange[0] !== priceBounds.min) params.set("min", String(priceRange[0]));
    if (priceRange[1] !== priceBounds.max) params.set("max", String(priceRange[1]));
    if (favoritesOnly) params.set("favorites", "1");
    if (viewMode !== "grid") params.set("view", viewMode);
    if (density !== "comfortable") params.set("density", density);

    const target = params.toString() ? `${pathname}?${params.toString()}` : pathname;
    router.replace(target, { scroll: false });
  }, [
    categoryFilter,
    collectionFilter,
    customizationFilter,
    density,
    favoritesOnly,
    finishFilter,
    materialFilter,
    pathname,
    priceBounds.max,
    priceBounds.min,
    priceRange,
    query,
    router,
    scopeFilter,
    sort,
    stockFilter,
    themeFilter,
    typeFilter,
    viewMode,
    visualFilter,
  ]);

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
            item.collection,
            item.theme,
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
      const matchCategory = categoryFilter === "all" ? true : item.category === categoryFilter;
      const matchCollection = collectionFilter === "all" ? true : item.collection === collectionFilter;
      const matchTheme = themeFilter === "all" ? true : item.theme === themeFilter;
      const matchMaterial = materialFilter === "all" ? true : item.material === materialFilter;
      const matchFinish = finishFilter === "all" ? true : item.finish === finishFilter;
      const matchVisual =
        visualFilter === "all"
          ? true
          : visualFilter === "real"
            ? item.realPhoto
            : item.visualKind === "concept_image";
      const matchFavorites = favoritesOnly ? favoriteIds.includes(item.id) : true;
      const matchCustomization =
        customizationFilter === "all"
          ? true
          : customizationFilter === "custom"
            ? item.customizable
            : !item.customizable;
      const matchPrice = item.pricePix >= priceRange[0] && item.pricePix <= priceRange[1];

      return (
        matchQuery &&
        matchCompatibility &&
        matchType &&
        matchScope &&
        matchStock &&
        matchCategory &&
        matchCollection &&
        matchTheme &&
        matchMaterial &&
        matchFinish &&
        matchVisual &&
        matchFavorites &&
        matchCustomization &&
        matchPrice
      );
    });

    if (sort === "price_asc") return [...list].sort((a, b) => a.pricePix - b.pricePix);
    if (sort === "price_desc") return [...list].sort((a, b) => b.pricePix - a.pricePix);
    if (sort === "rating") return [...list].sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount);
    if (sort === "lead_time") return [...list].sort((a, b) => a.leadTimeDays - b.leadTimeDays || a.pricePix - b.pricePix);
    if (sort === "stock") return [...list].sort((a, b) => b.stock - a.stock || b.rating - a.rating);

    return [...list].sort((a, b) => {
      if (Number(b.realPhoto) !== Number(a.realPhoto)) return Number(b.realPhoto) - Number(a.realPhoto);
      if (Number(b.status === "Pronta entrega") !== Number(a.status === "Pronta entrega")) {
        return Number(b.status === "Pronta entrega") - Number(a.status === "Pronta entrega");
      }
      if (Number(b.customizable) !== Number(a.customizable)) return Number(b.customizable) - Number(a.customizable);
      return b.rating - a.rating;
    });
  }, [
    categoryFilter,
    collectionFilter,
    customizationFilter,
    favoriteIds,
    favoritesOnly,
    finishFilter,
    liveQuery,
    materialFilter,
    priceRange,
    products,
    scopeFilter,
    selectedModel,
    sort,
    stockFilter,
    themeFilter,
    typeFilter,
    visualFilter,
  ]);

  const stats = useMemo(() => {
    const ready = filtered.filter((item) => item.status === "Pronta entrega").length;
    const real = filtered.filter((item) => item.realPhoto).length;
    const custom = filtered.filter((item) => item.customizable).length;
    const avgLead =
      filtered.length > 0 ? Math.round(filtered.reduce((total, item) => total + item.leadTimeDays, 0) / filtered.length) : 0;
    const avgPix =
      filtered.length > 0 ? filtered.reduce((total, item) => total + item.pricePix, 0) / filtered.length : 0;
    const avgRating =
      filtered.length > 0 ? filtered.reduce((total, item) => total + item.rating, 0) / filtered.length : 0;
    return { ready, real, custom, avgLead, avgPix, avgRating };
  }, [filtered]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const visibleItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const topPick = filtered[0];
  const resultNarrative = filtered.length
    ? `${filtered.length} itens encontrados • ${stats.real} com foto real • média ${formatCurrency(stats.avgPix || 0)} no Pix`
    : "Nenhum item encontrado com a combinação atual";
  const gridClass =
    viewMode === "grid"
      ? density === "compact"
        ? "grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"
        : "grid gap-5 md:grid-cols-2 2xl:grid-cols-3"
      : "grid gap-4 grid-cols-1";

  const activeFilters = [
    categoryFilter !== "all" ? { label: `Categoria: ${categoryFilter}`, clear: () => setCategoryFilter("all") } : null,
    collectionFilter !== "all" ? { label: `Coleção: ${collectionFilter}`, clear: () => setCollectionFilter("all") } : null,
    typeFilter !== "all" ? { label: `Tipo: ${typeLabels[typeFilter]}`, clear: () => setTypeFilter("all") } : null,
    scopeFilter !== "all" ? { label: `Escopo: ${scopeFilter}`, clear: () => setScopeFilter("all") } : null,
    stockFilter !== "all" ? { label: "Pronta entrega", clear: () => setStockFilter("all") } : null,
    themeFilter !== "all" ? { label: `Tema: ${themeFilter}`, clear: () => setThemeFilter("all") } : null,
    materialFilter !== "all" ? { label: `Material: ${materialFilter}`, clear: () => setMaterialFilter("all") } : null,
    finishFilter !== "all" ? { label: `Acabamento: ${finishFilter}`, clear: () => setFinishFilter("all") } : null,
    visualFilter !== "all"
      ? { label: visualFilter === "real" ? "Só foto real" : "Só imagem conceitual", clear: () => setVisualFilter("all") }
      : null,
    favoritesOnly ? { label: "Somente favoritos", clear: () => setFavoritesOnly(false) } : null,
    customizationFilter !== "all"
      ? {
          label: customizationFilter === "custom" ? "Personalizáveis" : "Sem personalização",
          clear: () => setCustomizationFilter("all"),
        }
      : null,
    query ? { label: `Busca: ${query}`, clear: () => setQuery("") } : null,
    priceRange[0] !== priceBounds.min || priceRange[1] !== priceBounds.max
      ? { label: `${formatCurrency(priceRange[0])} - ${formatCurrency(priceRange[1])}`, clear: () => setPriceRange([priceBounds.min, priceBounds.max]) }
      : null,
  ].filter(Boolean) as { label: string; clear: () => void }[];

  const clearFilters = () => {
    setQuery("");
    setTypeFilter("all");
    setScopeFilter("all");
    setStockFilter("all");
    setSort("curadoria");
    setCategoryFilter("all");
    setCollectionFilter("all");
    setVisualFilter("all");
    setCustomizationFilter("all");
    setThemeFilter("all");
    setMaterialFilter("all");
    setFinishFilter("all");
    setFavoritesOnly(false);
    setViewMode("grid");
    setDensity("comfortable");
    setPriceRange([priceBounds.min, priceBounds.max]);
    setPage(1);
  };

  const saveCurrentPreset = () => {
    const preset: SavedPreset = {
      query,
      typeFilter,
      scopeFilter,
      stockFilter,
      categoryFilter,
      collectionFilter,
      visualFilter,
      customizationFilter,
      themeFilter,
      materialFilter,
      finishFilter,
      favoritesOnly,
    };
    window.localStorage.setItem(SAVED_PRESET_KEY, JSON.stringify(preset));
    setHasSavedPreset(true);
  };

  const applySavedPreset = () => {
    try {
      const raw = window.localStorage.getItem(SAVED_PRESET_KEY);
      if (!raw) return;
      const preset = JSON.parse(raw) as Partial<SavedPreset>;
      setQuery(preset.query || "");
      setTypeFilter((preset.typeFilter as "all" | ProductType) || "all");
      setScopeFilter(preset.scopeFilter || "all");
      setStockFilter((preset.stockFilter as "all" | "ready") || "all");
      setCategoryFilter(preset.categoryFilter || "all");
      setCollectionFilter(preset.collectionFilter || "all");
      setVisualFilter((preset.visualFilter as VisualFilter) || "all");
      setCustomizationFilter((preset.customizationFilter as CustomizationFilter) || "all");
      setThemeFilter(preset.themeFilter || "all");
      setMaterialFilter(preset.materialFilter || "all");
      setFinishFilter(preset.finishFilter || "all");
      setFavoritesOnly(Boolean(preset.favoritesOnly));
    } catch {
      setHasSavedPreset(false);
    }
  };

  const recentSearchHref = `${pathname}${typeof window !== "undefined" ? window.location.search : ""}`;
  const generatedSearchLabel = [
    query.trim() || null,
    categoryFilter !== "all" ? categoryFilter : null,
    typeFilter !== "all" ? typeLabels[typeFilter] : null,
    visualFilter === "real" ? "foto real" : null,
    stockFilter === "ready" ? "pronta entrega" : null,
  ]
    .filter(Boolean)
    .join(" • ") || `Recorte ${selectedModel}`;

  const noResultsHref = buildWhatsAppHref(`Preciso de ajuda para encontrar um item no catálogo da ${selectedModel}.`);
  const compareCandidateIds = filtered.slice(0, 4).map((item) => item.id);
  const recoverySuggestions = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const base = Array.from(
      new Set([
        ...QUICK_SEARCHES,
        ...products.flatMap((item) => [item.theme, item.collection, item.category, ...item.tags.slice(0, 3)]),
      ])
    ).filter(Boolean);

    if (!normalized) return base.slice(0, 6);

    return base
      .filter((item) => item.toLowerCase().includes(normalized) || normalized.includes(item.toLowerCase()))
      .slice(0, 6);
  }, [products, query]);

  return (
    <div className="grid gap-6 xl:grid-cols-[340px_minmax(0,1fr)]">
      <aside className="space-y-5 xl:sticky xl:top-24 xl:self-start">
        <div className="rounded-[30px] border border-[#e8dac7] bg-[#fff8ef] p-5 shadow-[0_18px_44px_rgba(15,23,42,0.07)]">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-black text-slate-900">Compatibilidade ativa</h2>
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="mt-2 text-sm text-slate-600">Modelo persistente em todo o site para reduzir erro de compra.</p>
          <select
            value={selectedModel}
            onChange={(event) => setSelectedModel(event.target.value as "A1 Mini" | "A1")}
            className={`${controlClassName} mt-4`}
            aria-label="Modelo de compatibilidade"
          >
            <option value="A1 Mini">A1 Mini</option>
            <option value="A1">A1</option>
          </select>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            <div className="rounded-2xl border border-[#eadcc8] bg-white p-3">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Prova visual</p>
              <p className="mt-2 text-sm font-semibold text-slate-900">Foto real e imagem conceitual aparecem sempre identificadas.</p>
            </div>
            <div className="rounded-2xl border border-[#eadcc8] bg-white p-3">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Atalho comercial</p>
              <a href={buildWhatsAppHref(`Quero ajuda para fechar um pedido da linha ${selectedModel}.`)} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-emerald-700">
                <MessageCircleMore className="h-4 w-4" />
                Falar com atendimento
              </a>
            </div>
          </div>
        </div>

        <div className="rounded-[30px] border border-[#e8dac7] bg-white p-5 shadow-[0_18px_44px_rgba(15,23,42,0.07)]">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black text-slate-900">Filtros técnicos</h3>
            <SlidersHorizontal className="h-4 w-4 text-slate-500" />
          </div>

          <div className="mt-4 space-y-4">
            <label className="block text-sm text-slate-700">
              Busca por SKU, PN, termo ou sintoma
              <div className="relative mt-2">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  ref={searchInputRef}
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  className={`${controlClassName} pl-10`}
                  placeholder="Ex.: A1M, FAH019, entupimento..."
                  list="catalog-search-suggestions"
                />
                <datalist id="catalog-search-suggestions">
                  {searchSuggestions.map((item) => (
                    <option key={item} value={item} />
                  ))}
                </datalist>
              </div>
            </label>

            <div>
              <p className="text-sm text-slate-700">Atalhos rápidos</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {QUICK_SEARCHES.map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => setQuery(term)}
                    className="rounded-full border border-[#eadcc8] bg-[#fff8ef] px-3 py-1 text-xs font-semibold text-slate-700"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>

            {recentSearches.length ? (
              <div>
                <p className="text-sm text-slate-700">Buscas recentes</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {recentSearches.map((term) => (
                    <button
                      key={term}
                      type="button"
                      onClick={() => setQuery(term)}
                      className="rounded-full border border-[#eadcc8] bg-white px-3 py-1 text-xs font-semibold text-slate-700"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            <div>
              <p className="text-sm text-slate-700">Presets comerciais</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <button type="button" onClick={() => { setVisualFilter("real"); setStockFilter("ready"); }} className="rounded-full border border-[#eadcc8] bg-[#fff8ef] px-3 py-1 text-xs font-semibold text-slate-700">
                  Foto real + pronta entrega
                </button>
                <button type="button" onClick={() => { setQuery("organizador"); setCategoryFilter("Accessories"); }} className="rounded-full border border-[#eadcc8] bg-[#fff8ef] px-3 py-1 text-xs font-semibold text-slate-700">
                  Setup organizado
                </button>
                <button type="button" onClick={() => { setCollectionFilter("Geek foto real"); setVisualFilter("real"); }} className="rounded-full border border-[#eadcc8] bg-[#fff8ef] px-3 py-1 text-xs font-semibold text-slate-700">
                  Geek com prova real
                </button>
                <button type="button" onClick={() => { setCustomizationFilter("custom"); setStockFilter("all"); }} className="rounded-full border border-[#eadcc8] bg-[#fff8ef] px-3 py-1 text-xs font-semibold text-slate-700">
                  Sob medida
                </button>
              </div>
            </div>

            <label className="block text-sm text-slate-700">
              Categoria comercial
              <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)} className={`${controlClassName} mt-2`}>
                <option value="all">Todas</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category} ({categoryCounts[category] || 0})
                  </option>
                ))}
              </select>
            </label>

            <label className="block text-sm text-slate-700">
              Coleção / prova visual
              <select value={collectionFilter} onChange={(event) => setCollectionFilter(event.target.value)} className={`${controlClassName} mt-2`}>
                <option value="all">Todas</option>
                {collections.map((collection) => (
                  <option key={collection} value={collection}>
                    {collection} ({collectionCounts[collection] || 0})
                  </option>
                ))}
              </select>
            </label>

            <label className="block text-sm text-slate-700">
              Tema / linha visual
              <select value={themeFilter} onChange={(event) => setThemeFilter(event.target.value)} className={`${controlClassName} mt-2`}>
                <option value="all">Todos</option>
                {themes.map((theme) => (
                  <option key={theme} value={theme}>
                    {theme} ({themeCounts[theme] || 0})
                  </option>
                ))}
              </select>
            </label>

            <label className="block text-sm text-slate-700">
              Material
              <select value={materialFilter} onChange={(event) => setMaterialFilter(event.target.value)} className={`${controlClassName} mt-2`}>
                <option value="all">Todos</option>
                {materials.map((material) => (
                  <option key={material} value={material}>
                    {material} ({materialCounts[material] || 0})
                  </option>
                ))}
              </select>
            </label>

            <label className="block text-sm text-slate-700">
              Acabamento
              <select value={finishFilter} onChange={(event) => setFinishFilter(event.target.value)} className={`${controlClassName} mt-2`}>
                <option value="all">Todos</option>
                {finishes.map((finish) => (
                  <option key={finish} value={finish}>
                    {finish} ({finishCounts[finish] || 0})
                  </option>
                ))}
              </select>
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
              Escopo técnico
              <select value={scopeFilter} onChange={(event) => setScopeFilter(event.target.value)} className={`${controlClassName} mt-2`}>
                <option value="all">Todos</option>
                {technicalScopes.map((scope) => (
                  <option key={scope} value={scope}>
                    {scope} ({scopeCounts[scope] || 0})
                  </option>
                ))}
              </select>
            </label>

            <label className="block text-sm text-slate-700">
              Visual principal
              <select value={visualFilter} onChange={(event) => setVisualFilter(event.target.value as VisualFilter)} className={`${controlClassName} mt-2`}>
                <option value="all">Todos</option>
                <option value="real">Somente foto real</option>
                <option value="concept">Somente imagem conceitual</option>
              </select>
            </label>

            <label className="block text-sm text-slate-700">
              Personalização
              <select
                value={customizationFilter}
                onChange={(event) => setCustomizationFilter(event.target.value as CustomizationFilter)}
                className={`${controlClassName} mt-2`}
              >
                <option value="all">Todos</option>
                <option value="custom">Personalizáveis</option>
                <option value="standard">Padrão</option>
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
              Recorte salvo
              <div className={`mt-2 grid gap-2 ${hasSavedPreset ? "sm:grid-cols-3" : "sm:grid-cols-2"}`}>
                <button
                  type="button"
                  onClick={() => setFavoritesOnly((current) => !current)}
                  className={`rounded-2xl border px-4 py-3 text-sm font-semibold ${
                    favoritesOnly ? "border-orange-300 bg-orange-100 text-orange-800" : "border-[#eadcc8] bg-white text-slate-700"
                  }`}
                >
                  Somente favoritos
                </button>
                <button
                  type="button"
                  onClick={saveCurrentPreset}
                  className="rounded-2xl border border-[#eadcc8] bg-white px-4 py-3 text-sm font-semibold text-slate-700"
                >
                  Salvar preset atual
                </button>
                {hasSavedPreset ? (
                  <button
                    type="button"
                    onClick={applySavedPreset}
                    className="rounded-2xl border border-[#eadcc8] bg-white px-4 py-3 text-sm font-semibold text-slate-700"
                  >
                    Aplicar preset salvo
                  </button>
                ) : null}
              </div>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() =>
                    saveSearch({
                      label: generatedSearchLabel,
                      url: recentSearchHref,
                      summary: `${filtered.length} item(ns) compatíveis com ${selectedModel} neste recorte.`,
                    })
                  }
                  className="rounded-2xl border border-[#eadcc8] bg-[#fff8ef] px-4 py-3 text-sm font-semibold text-slate-700"
                >
                  Salvar busca atual
                </button>
                <Link href="/buscas-salvas" className="rounded-2xl border border-[#eadcc8] bg-white px-4 py-3 text-center text-sm font-semibold text-slate-700">
                  Abrir buscas salvas
                </Link>
              </div>
            </label>

            <label className="block text-sm text-slate-700">
              Ordenação
              <select value={sort} onChange={(event) => setSort(event.target.value as SortMode)} className={`${controlClassName} mt-2`}>
                <option value="curadoria">Curadoria marketplace</option>
                <option value="price_asc">Menor preço</option>
                <option value="price_desc">Maior preço</option>
                <option value="rating">Melhor avaliação</option>
                <option value="lead_time">Menor prazo</option>
                <option value="stock">Maior estoque</option>
              </select>
            </label>

            <div className="rounded-2xl border border-[#eadcc8] bg-[#fff8ef] p-4">
              <p className="text-sm font-semibold text-slate-700">Faixa de preço</p>
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
              <div className="mt-3 flex flex-wrap gap-2">
                {[
                  { label: "Entrada", values: [priceBounds.min, Math.min(priceBounds.min + 40, priceBounds.max)] as [number, number] },
                  { label: "Médio", values: [Math.max(priceBounds.min, 50), Math.min(priceBounds.max, 90)] as [number, number] },
                  { label: "Premium", values: [Math.max(priceBounds.min, 90), priceBounds.max] as [number, number] },
                ].map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => setPriceRange(preset.values)}
                    className="rounded-full border border-[#eadcc8] bg-white px-3 py-1 text-xs font-semibold text-slate-700"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-[#eadcc8] bg-white p-4">
              <p className="text-sm font-semibold text-slate-700">Modo de exibição</p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setViewMode("grid")}
                  className={`inline-flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold ${
                    viewMode === "grid" ? "border-orange-300 bg-orange-100 text-orange-800" : "border-[#eadcc8] bg-[#fff8ef] text-slate-700"
                  }`}
                >
                  <LayoutGrid className="h-4 w-4" />
                  Grade
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("list")}
                  className={`inline-flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold ${
                    viewMode === "list" ? "border-orange-300 bg-orange-100 text-orange-800" : "border-[#eadcc8] bg-[#fff8ef] text-slate-700"
                  }`}
                >
                  <Rows3 className="h-4 w-4" />
                  Lista
                </button>
              </div>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setDensity("comfortable")}
                  className={`rounded-2xl border px-4 py-3 text-sm font-semibold ${
                    density === "comfortable" ? "border-orange-300 bg-orange-100 text-orange-800" : "border-[#eadcc8] bg-[#fff8ef] text-slate-700"
                  }`}
                >
                  Densidade confortável
                </button>
                <button
                  type="button"
                  onClick={() => setDensity("compact")}
                  className={`rounded-2xl border px-4 py-3 text-sm font-semibold ${
                    density === "compact" ? "border-orange-300 bg-orange-100 text-orange-800" : "border-[#eadcc8] bg-[#fff8ef] text-slate-700"
                  }`}
                >
                  Densidade compacta
                </button>
              </div>
            </div>

            <button
              onClick={clearFilters}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-[#e7d8c3] bg-[#fff3e2] px-4 py-2 text-sm font-semibold text-slate-700"
            >
              <RotateCcw className="h-4 w-4" />
              Limpar filtros
            </button>
          </div>
        </div>
      </aside>

      <div className="space-y-6">
        <section ref={resultsRef} className="rounded-[30px] border border-[#e8dac7] bg-white p-6 shadow-[0_18px_44px_rgba(15,23,42,0.07)]">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Resultado filtrado</p>
              <h2 className="mt-2 text-3xl font-black text-slate-900">
                {filtered.length} itens compatíveis com {selectedModel}
              </h2>
              <p className="mt-2 max-w-3xl text-sm text-slate-600">
                Busca técnica por SKU, PN e sintoma com curadoria comercial, contexto visual explícito e atalhos para decisão rápida.
              </p>
              <p className="mt-2 text-sm font-semibold text-slate-700">{resultNarrative}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <ShareButton
                url={recentSearchHref}
                title={`Catálogo filtrado ${selectedModel}`}
                text={`Separei ${filtered.length} itens no catálogo da MDH 3D.`}
              />
              <button
                type="button"
                onClick={() =>
                  saveSearch({
                    label: generatedSearchLabel,
                    url: recentSearchHref,
                    summary: `${filtered.length} item(ns) compatíveis com ${selectedModel} neste recorte.`,
                  })
                }
                className="inline-flex items-center gap-2 rounded-full border border-[#e5d4be] bg-[#fff8ef] px-4 py-2 text-sm font-semibold text-slate-700"
              >
                <Tag className="h-4 w-4" />
                Salvar recorte
              </button>
              <Link href="/buscas-salvas" className="inline-flex items-center gap-2 rounded-full border border-[#e5d4be] bg-[#fff8ef] px-4 py-2 text-sm font-semibold text-slate-700">
                <Bookmark className="h-4 w-4" />
                Buscas ({savedSearches.length})
              </Link>
              <Link href="/comparar" className="inline-flex items-center gap-2 rounded-full border border-[#e5d4be] bg-[#fff8ef] px-4 py-2 text-sm font-semibold text-slate-700">
                <Scale className="h-4 w-4" />
                Comparador ({compareIds.length}/4)
              </Link>
              {compareCandidateIds.length ? (
                <button
                  type="button"
                  onClick={() => replaceCompare(compareCandidateIds)}
                  className="inline-flex items-center gap-2 rounded-full border border-[#e5d4be] bg-[#fff8ef] px-4 py-2 text-sm font-semibold text-slate-700"
                >
                  <Scale className="h-4 w-4" />
                  Comparar top 4 do recorte
                </button>
              ) : null}
              <Link href="/compatibilidade" className="inline-flex items-center gap-2 rounded-full border border-[#e5d4be] bg-[#fff8ef] px-4 py-2 text-sm font-semibold text-slate-700">
                <Filter className="h-4 w-4" />
                Matriz técnica
              </Link>
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Fotos reais no recorte" value={String(stats.real)} helper="Prova visual direta da peça" />
            <StatCard label="Pronta entrega" value={String(stats.ready)} helper="Itens com saída mais rápida" />
            <StatCard label="Personalizáveis" value={String(stats.custom)} helper="Produtos com briefing sob medida" />
            <StatCard label="Lead time médio" value={`${stats.avgLead || 0} dia(s)`} helper="Prazo comercial do recorte atual" />
            <StatCard label="Preço médio Pix" value={formatCurrency(stats.avgPix || 0)} helper="Faixa média do recorte atual" />
            <StatCard label="Nota média" value={stats.avgRating ? stats.avgRating.toFixed(1) : "0.0"} helper="Confiança geral do recorte" />
            <StatCard label="Favoritos salvos" value={String(favoriteIds.length)} helper="Itens guardados no seu navegador" />
            <StatCard label="Histórico recente" value={String(recentIds.length)} helper="Produtos vistos na navegação atual" />
          </div>

          {topPick ? (
            <div className="mt-5 rounded-[24px] border border-[#eadcc8] bg-[#fff8ef] p-4">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Destaque automático do recorte</p>
                  <h3 className="mt-2 text-xl font-black text-slate-900">{topPick.name}</h3>
                  <p className="mt-2 max-w-3xl text-sm text-slate-600">
                    Melhor posicionado pela curadoria atual, combinando prova visual, disponibilidade, personalização e avaliação.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full bg-white px-3 py-2 text-xs font-semibold text-slate-700">{formatCurrency(topPick.pricePix)} no Pix</span>
                  <span className="rounded-full bg-white px-3 py-2 text-xs font-semibold text-slate-700">{topPick.productionWindow}</span>
                  <Link href={getProductUrl(topPick)} className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
                    Abrir destaque
                  </Link>
                </div>
              </div>
            </div>
          ) : null}

          {activeFilters.length ? (
            <div className="mt-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Filtros ativos</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {activeFilters.map((filter) => (
                  <button
                    key={filter.label}
                    type="button"
                    onClick={filter.clear}
                    className="rounded-full border border-[#eadcc8] bg-[#fff8ef] px-3 py-1 text-xs font-semibold text-slate-700"
                  >
                    {filter.label} ×
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {compareIds.length ? (
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-[24px] border border-[#eadcc8] bg-[#fff8ef] p-4">
              <div>
                <p className="text-sm font-semibold text-slate-900">Comparador em andamento</p>
                <p className="mt-1 text-sm text-slate-600">Você já separou {compareIds.length} item(ns). Dá para limpar ou abrir a comparação agora.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={clearCompare} className="rounded-full border border-[#e5d4be] bg-white px-4 py-2 text-sm font-semibold text-slate-700">
                  Limpar comparador
                </button>
                <Link href="/comparar" className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
                  Abrir comparação
                </Link>
              </div>
            </div>
          ) : null}

          <div className="sticky top-3 z-20 mt-5 xl:hidden">
            <div className="flex items-center justify-between gap-3 rounded-[22px] border border-[#e5d4be] bg-[rgba(255,248,239,0.94)] px-4 py-3 shadow-[0_10px_30px_rgba(15,23,42,0.12)] backdrop-blur">
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Resumo mobile</p>
                <p className="truncate text-sm font-semibold text-slate-900">
                  {filtered.length} item(ns) • {compareIds.length}/4 no comparador
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {activeFilters.length ? (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="rounded-full border border-[#eadcc8] bg-white px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-700"
                  >
                    Limpar
                  </button>
                ) : null}
                {compareCandidateIds.length ? (
                  <button
                    type="button"
                    onClick={() => replaceCompare(compareCandidateIds)}
                    className="rounded-full bg-slate-900 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-white"
                  >
                    Top 4
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        </section>

        <div className={gridClass} aria-live="polite">
          {visibleItems.map((product) => {
            const visualBadge = getVisualBadge(product);
            const pixSavings = product.priceCard - product.pricePix;
            const whatsappHref = buildWhatsAppHref(`Tenho interesse em ${product.name} (${product.sku}).`);
            const productUrl =
              typeof window === "undefined" ? getProductUrl(product) : `${window.location.origin}${getProductUrl(product)}`;
            const stockLabel = product.stock <= 2 ? "Últimas unidades" : product.stock >= 8 ? "Estoque folgado" : "Lote ativo";

            return (
              <article
                key={product.id}
                className={`rounded-[30px] border border-[#eadcc8] bg-white shadow-[0_18px_40px_rgba(15,23,42,0.07)] ${
                  density === "compact" ? "p-3" : "p-4"
                } ${viewMode === "list" ? "grid gap-4 md:grid-cols-[280px_minmax(0,1fr)] md:items-start" : ""}`}
              >
                <div>
                  <ProductImageGallery product={product} compact />
                </div>

                <div className="min-w-0">
                  <div className="mt-1 flex flex-wrap items-start justify-between gap-3">
                    <div className="flex flex-wrap gap-2">
                      <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] ${visualBadge.className}`}>{visualBadge.label}</span>
                      <span className="rounded-full bg-[#eef7ec] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-700">{product.status}</span>
                      <span className="rounded-full bg-[#e8f4ff] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-sky-700">{typeLabels[product.technical.typeProduct]}</span>
                      <span className="rounded-full bg-[#fff8ef] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-700">{stockLabel}</span>
                      {product.customizable ? (
                        <span className="rounded-full bg-[#fff0da] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-orange-700">Personalizável</span>
                      ) : null}
                    </div>
                    <div className="flex items-center gap-2">
                      <FavoriteButton productId={product.id} label={product.name} />
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">{product.category}</p>
                    <div className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600">
                      <Star className="h-3.5 w-3.5 fill-current text-amber-400" />
                      {product.rating.toFixed(1)} ({product.reviewCount})
                    </div>
                  </div>

                  <h3 className={`mt-2 font-black text-slate-900 ${density === "compact" ? "text-lg" : "text-xl"}`}>
                    {highlightText(product.name, query)}
                  </h3>
                  <p className={`mt-2 text-sm leading-6 text-slate-600 ${density === "compact" ? "line-clamp-2" : "line-clamp-3"}`}>
                    {highlightText(product.description, query)}
                  </p>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <InfoPill icon={<Tag className="h-3.5 w-3.5" />} label="SKU" value={product.sku} />
                    <InfoPill icon={<Clock3 className="h-3.5 w-3.5" />} label="Prazo" value={product.productionWindow} />
                    <InfoPill icon={<Sparkles className="h-3.5 w-3.5" />} label="Coleção" value={product.collection} />
                    <InfoPill icon={<PackageCheck className="h-3.5 w-3.5" />} label="Estoque" value={`${product.stock} un.`} />
                  </div>

                  <div className="mt-4 rounded-2xl border border-[#eadcc8] bg-[#fff8ef] p-3">
                    <p className="text-xs font-semibold text-slate-800">{visualBadge.helper}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      Compatibilidade: {product.technical.compatibilityModels.join(" / ")} • Escopo: {product.technical.componentScope}
                    </p>
                    <p className="mt-2 text-xs text-slate-500">
                      Tema: {product.theme} • Material: {product.material} • Acabamento: {product.finish}
                    </p>
                    {product.visualKind === "concept_image" ? (
                      <p className="mt-2 text-xs text-violet-700">A imagem principal serve como referência de vitrine. A peça final segue o título, as medidas e o briefing do anúncio.</p>
                    ) : null}
                  </div>

                  <div className="mt-4 flex items-end justify-between gap-3">
                    <div>
                      <p className="text-xs text-slate-500">Preço no Pix</p>
                      <p className="text-2xl font-black text-slate-900">{formatCurrency(product.pricePix)}</p>
                      <p className="text-xs text-slate-500">
                        {product.parcelamentoMax}x de {formatCurrency(product.priceCard / product.parcelamentoMax)} • economia Pix {formatCurrency(pixSavings)}
                      </p>
                    </div>
                    <div className="text-right text-xs text-slate-500">
                      <p>Lead time: {product.leadTimeDays} dia(s)</p>
                      <p>{product.readyToShip ? "Saída rápida" : "Produção sob curadoria"}</p>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-2">
                    <div className="grid gap-2 sm:grid-cols-2">
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
                    <div className="grid gap-2 sm:grid-cols-2">
                      <a
                        href={whatsappHref}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center gap-2 rounded-full border border-[#d7e8da] bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-emerald-700"
                      >
                        <MessageCircleMore className="h-4 w-4" />
                        Fechar pelo WhatsApp
                      </a>
                      <ShareButton url={productUrl} title={product.name} text={`Olha esse item: ${product.name}`} className="justify-center text-xs uppercase tracking-[0.12em]" />
                    </div>
                    {query.trim().length >= 2 ? (
                      <p className="text-xs text-slate-500">
                        Leitura rápida: este card foi destacado porque conversa com a busca atual por{" "}
                        <span className="font-semibold text-slate-700">{query.trim()}</span>.
                      </p>
                    ) : null}
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {totalPages > 1 ? (
          <div className="flex flex-wrap items-center justify-center gap-2 rounded-2xl border border-[#e8dac7] bg-[#fff8ef] px-4 py-4">
            <button onClick={() => setPage((value) => Math.max(1, value - 1))} disabled={currentPage === 1} className="rounded-full border border-[#e7d8c3] bg-white px-4 py-2 text-sm font-semibold text-slate-700 disabled:opacity-50">
              Anterior
            </button>
            <span className="px-4 text-sm font-semibold text-slate-700">
              Página {currentPage} de {totalPages}
            </span>
            <button onClick={() => setPage((value) => Math.min(totalPages, value + 1))} disabled={currentPage === totalPages} className="rounded-full border border-[#e7d8c3] bg-white px-4 py-2 text-sm font-semibold text-slate-700 disabled:opacity-50">
              Próxima
            </button>
          </div>
        ) : null}

        {!visibleItems.length ? (
          <div className="rounded-2xl border border-[#e8dac7] bg-white p-8 text-center">
            <p className="text-lg font-semibold text-slate-900">Nenhum item encontrado para o filtro atual.</p>
            <p className="mt-2 text-sm text-slate-600">Ajuste compatibilidade, prova visual, categoria ou termo técnico da busca.</p>
            {recoverySuggestions.length ? (
              <div className="mt-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Talvez você quis dizer</p>
                <div className="mt-3 flex flex-wrap justify-center gap-2">
                  {recoverySuggestions.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setQuery(item)}
                      className="rounded-full border border-[#eadcc8] bg-[#fff8ef] px-3 py-2 text-xs font-semibold text-slate-700"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
            <div className="mt-4 flex flex-wrap justify-center gap-3">
              <button onClick={clearFilters} className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
                Resetar filtros
              </button>
              <a href={noResultsHref} target="_blank" rel="noreferrer" className="rounded-full border border-[#d7e8da] bg-white px-4 py-2 text-sm font-semibold text-emerald-700">
                Pedir ajuda no WhatsApp
              </a>
            </div>
          </div>
        ) : null}

        {favoriteProducts.length ? (
          <ProductShelf
            title="Favoritos dentro do mesmo fluxo"
            description="Seus salvos ficam acessíveis no meio da navegação para você não perder momentum entre busca, comparação e orçamento."
            products={favoriteProducts}
            href="/favoritos"
            hrefLabel="Abrir favoritos"
            variant="favorites"
          />
        ) : null}

        {recentProducts.length ? (
          <ProductShelf
            title="Retome de onde parou"
            description="Os últimos produtos visitados ficam ao alcance para comparar, revisar prova visual e fechar pedido mais rápido."
            products={recentProducts}
            href="/recentes"
            hrefLabel="Abrir recentes"
            variant="recent"
          />
        ) : null}

        {savedSearches.length ? (
          <section className="rounded-[28px] border border-[#e8dac7] bg-white p-5">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Memória do catálogo</p>
                <h3 className="mt-2 text-xl font-black text-slate-900">Buscas salvas dentro do fluxo</h3>
                <p className="mt-2 text-sm leading-7 text-slate-600">
                  Seus melhores recortes ficam prontos para reabrir, comparar ou compartilhar sem refazer filtro por filtro.
                </p>
              </div>
              <Link href="/buscas-salvas" className="rounded-full border border-[#e5d4be] bg-[#fff8ef] px-4 py-2 text-sm font-semibold text-slate-700">
                Ver todas
              </Link>
            </div>
            <div className="mt-4 grid gap-3 xl:grid-cols-3">
              {savedSearches.slice(0, 3).map((item) => (
                <Link key={item.id} href={item.url} className="rounded-2xl border border-[#eadcc8] bg-[#fff8ef] p-4 transition hover:-translate-y-0.5">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Busca salva</p>
                  <p className="mt-2 font-black text-slate-900">{item.label}</p>
                  <p className="mt-2 text-sm text-slate-600">{item.summary}</p>
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[28px] border border-[#e8dac7] bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Ajuda de decisão</p>
            <h3 className="mt-2 text-xl font-black text-slate-900">Dúvidas comuns antes do fechamento</h3>
            <div className="mt-4 grid gap-3">
              {[
                {
                  question: "Como sei se a foto é real?",
                  answer: "Cada card e cada PDP mostram um selo explícito diferenciando foto real de imagem conceitual.",
                },
                {
                  question: "Como encontro algo rápido?",
                  answer: "Você pode buscar por nome, SKU, tipo de uso, coleção, material, acabamento, tema e até por sintoma.",
                },
                {
                  question: "Posso guardar itens para depois?",
                  answer: "Sim. Favoritos e vistos recentemente ficam salvos no navegador e ganharam páginas próprias.",
                },
              ].map((item) => (
                <div key={item.question} className="rounded-2xl border border-[#eadcc8] bg-[#fff8ef] p-4">
                  <p className="font-semibold text-slate-900">{item.question}</p>
                  <p className="mt-2 text-sm text-slate-600">{item.answer}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[28px] border border-[#e8dac7] bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Entrega local</p>
            <h3 className="mt-2 text-xl font-black text-slate-900">Faixas rápidas do Rio e arredores</h3>
            <div className="mt-4 grid gap-3">
              {[
                "Centro e Zona Portuária • 1 dia útil",
                "Zona Norte • 1 a 2 dias úteis",
                "Zona Sul • 1 a 2 dias úteis",
                "Barra / Jacarepaguá • 1 a 3 dias úteis",
              ].map((item) => (
                <div key={item} className="rounded-2xl border border-[#eadcc8] bg-[#fff8ef] px-4 py-3 text-sm font-semibold text-slate-700">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-[#e8dac7] bg-white p-4 text-sm text-slate-600">
          <p className="inline-flex items-center gap-2 font-semibold text-slate-800">
            <PackageCheck className="h-4 w-4 text-emerald-600" />
            Aviso técnico de segurança
          </p>
          <p className="mt-2">
            Desligue e desconecte da tomada antes de qualquer manutenção. Não toque no hotend sem resfriamento completo.
          </p>
        </div>

        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="inline-flex items-center gap-2 rounded-full border border-[#e8dac7] bg-white px-5 py-3 text-sm font-semibold text-slate-700"
          >
            <ArrowUp className="h-4 w-4" />
            Voltar ao topo
          </button>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, helper }: { label: string; value: string; helper: string }) {
  return (
    <div className="rounded-[24px] border border-[#eadcc8] bg-[#fff8ef] p-4">
      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-black text-slate-900">{value}</p>
      <p className="mt-2 text-xs text-slate-500">{helper}</p>
    </div>
  );
}

function InfoPill({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[#eadcc8] bg-white p-3">
      <p className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
        {icon}
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-slate-900">{value}</p>
    </div>
  );
}
