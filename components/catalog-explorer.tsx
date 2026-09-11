"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState, type FormEvent } from "react";
import { ArrowRight, Check, Copy, Heart, Search, ShoppingBag, X } from "lucide-react";
import type { Product } from "@/lib/catalog";
import { getProductUrl } from "@/lib/product-routing";
import { getProductSearchScore } from "@/lib/catalog-content";
import {
  CATALOG_OBJECT_TYPE_LABELS,
  CATALOG_UNIVERSE_LABELS,
  getCatalogGameIdentity,
  matchesCatalogFacets,
  matchesCatalogGroup,
  normalizeCatalogFilter,
  parseCatalogPrice,
  readCatalogFacets,
} from "@/lib/catalog-filters";
import { SafeProductImage } from "@/components/safe-product-image";
import { ProductPriceStack } from "@/components/product-price-stack";
import { getProductImageCandidates, getProductImageAlt } from "@/lib/product-images";
import { isProductRealPhoto, isProductVisualVerified } from "@/lib/product-visuals";
import { useCart } from "@/lib/cart-context";
import { trackAddToCart, trackSelectItem } from "@/lib/analytics";

type Props = {
  products: Product[];
  basePath?: string;
  initialQuery?: string;
  initialCategory?: string;
  initialCollection?: string;
  initialVisualMode?: "all" | "verified" | "real";
  initialAvailability?: string;
  initialMaterial?: string;
  initialIntent?: string;
  initialOrder?: string;
  initialCustomizableOnly?: boolean;
  initialPriceMin?: number;
  initialPriceMax?: number;
  prioritizeInitialImages?: boolean;
  initialPage?: number;
};
const PAGE_SIZE = 18;
const FAVORITES_KEY = "mdh_catalog_favorites";
const labels: Record<string, string> = { type: "Tipo", style: "Estilo", universe: "Universo", character: "Personagem", useCase: "Uso", objectType: "Tipo de objeto", category: "Categoria", collection: "Coleção", custom: "Personalizáveis", min: "Preço mínimo", max: "Preço máximo", q: "Busca", material: "Material", status: "Disponibilidade", favorites: "Favoritos", mode: "Imagem", intent: "Finalidade" };
const displayValues: Record<string, string> = { keychain: "Chaveiros", chibi: "Chibis", home: "Casa", games: "Games", "league-of-legends": "League of Legends", valorant: "Valorant", "1": "Sim" };

export function CatalogExplorer(props: Props) {
  return <Suspense fallback={<p role="status">Carregando filtros…</p>}><Explorer {...props} /></Suspense>;
}

function Explorer({ products, basePath = "/catalogo", ...defaults }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchKey = searchParams.toString();
  const { addItem } = useCart();
  const [favorites, setFavorites] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  const [added, setAdded] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [query, setQuery] = useState(searchParams.get("q") ?? defaults.initialQuery ?? "");
  useEffect(() => { setQuery(searchParams.get("q") ?? defaults.initialQuery ?? ""); }, [searchParams, defaults.initialQuery]);
  useEffect(() => {
    setFiltersOpen(window.matchMedia("(min-width: 1001px)").matches);
    try {
      const stored: unknown = JSON.parse(localStorage.getItem(FAVORITES_KEY) || "[]");
      if (Array.isArray(stored)) setFavorites(stored.filter((value): value is string => typeof value === "string"));
    } catch {}
  }, []);
  useEffect(() => {
    if (!added) return;
    const timer = window.setTimeout(() => setAdded(""), 2500);
    return () => window.clearTimeout(timer);
  }, [added]);

  const facets = readCatalogFacets(searchParams);
  const category = searchParams.get("category") ?? defaults.initialCategory ?? "Todas";
  const collection = searchParams.get("collection") ?? defaults.initialCollection ?? "Todas";
  const intent = searchParams.get("intent") ?? defaults.initialIntent ?? "";
  const material = searchParams.get("material") ?? defaults.initialMaterial ?? "Todos";
  const availability = searchParams.get("status") ?? defaults.initialAvailability ?? "Todos";
  const mode = searchParams.get("mode") ?? defaults.initialVisualMode ?? "all";
  const sort = searchParams.get("sort") ?? defaults.initialOrder ?? "Destaques";
  const term = searchParams.get("q") ?? defaults.initialQuery ?? "";
  const minPrice = parseCatalogPrice(searchParams.get("min") ?? searchParams.get("minPrice")) ?? defaults.initialPriceMin;
  const maxPrice = parseCatalogPrice(searchParams.get("max") ?? searchParams.get("maxPrice")) ?? defaults.initialPriceMax;
  const custom = searchParams.has("custom") ? searchParams.get("custom") === "1" : defaults.initialCustomizableOnly;
  const categories = [...new Set(products.map((product) => product.category))];
  const universes = [...new Set(products.map((product) => getCatalogGameIdentity(product).universe).filter(Boolean))].sort((left, right) => (CATALOG_UNIVERSE_LABELS[left] || left).localeCompare(CATALOG_UNIVERSE_LABELS[right] || right, "pt-BR"));
  const characters = [...new Set(products.flatMap((product) => {
    const identity = getCatalogGameIdentity(product);
    return !facets.universe || facets.universe === identity.universe ? identity.characters : [];
  }))];
  const materials = [...new Set(products.map((product) => product.material).filter(Boolean))];
  const objectTypes = [...new Set(products.map((product) => product.objectType).filter((value): value is NonNullable<Product["objectType"]> => Boolean(value)))].sort((left, right) => (CATALOG_OBJECT_TYPE_LABELS[left] || left).localeCompare(CATALOG_OBJECT_TYPE_LABELS[right] || right, "pt-BR"));
  const filtered = useMemo(() => {
    const params = new URLSearchParams(searchKey);
    const activeFacets = readCatalogFacets(params);
    const matched = products.map((product) => ({ product, score: term.trim() ? getProductSearchScore(product, term.trim()) : 1 })).filter(({ product, score }) =>
      score > 0 &&
      matchesCatalogGroup(product, category, "category") &&
      matchesCatalogGroup(product, collection, "collection") &&
      (!intent || (product.buyingIntents || []).some((value) => value === intent)) &&
      matchesCatalogFacets(product, activeFacets) &&
      (material === "Todos" || material === product.material) &&
      (availability === "Todos" || availability === product.status) &&
      (minPrice === undefined || product.pricePix >= minPrice) &&
      (maxPrice === undefined || product.pricePix <= maxPrice) &&
      (!custom || product.customizable) &&
      (params.get("favorites") !== "1" || favorites.includes(product.id)) &&
      (mode === "all" || (mode === "real" ? isProductRealPhoto(product) : isProductVisualVerified(product)))
    );
    matched.sort((left, right) => {
      if (term && left.score !== right.score) return right.score - left.score;
      if (sort === "Preço" || sort === "Menor preço") return left.product.pricePix - right.product.pricePix;
      if (sort === "Maior preço") return right.product.pricePix - left.product.pricePix;
      if (sort === "Nome") return left.product.name.localeCompare(right.product.name, "pt-BR");
      if (sort === "Menor prazo") return Number(left.product.productionWindow.match(/\d+/)?.[0] || 999) - Number(right.product.productionWindow.match(/\d+/)?.[0] || 999);
      if (sort === "Mais Recentes") return right.product.id.localeCompare(left.product.id);
      return Number(right.product.featured) - Number(left.product.featured);
    });
    return matched.map(({ product }) => product);
  }, [products, searchKey, term, category, collection, intent, material, availability, minPrice, maxPrice, custom, mode, favorites, sort]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const requestedPage = Number(searchParams.get("page") ?? defaults.initialPage ?? 1);
  const page = Math.min(totalPages, Number.isFinite(requestedPage) ? Math.max(1, Math.floor(requestedPage)) : 1);
  const visible = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function update(changes: Record<string, string | null>, paging = false) {
    const params = new URLSearchParams(searchKey);
    Object.entries(changes).forEach(([key, value]) => { if (value === null || value === "") params.delete(key); else params.set(key, value); });
    if (!paging) params.delete("page");
    router.push(`${basePath}${params.size ? "?" + params.toString() : ""}`, { scroll: false });
  }
  function submitSearch(event: FormEvent<HTMLFormElement>) { event.preventDefault(); update({ q: query.trim() || null }); }
  function toggleFavorite(id: string) {
    const next = favorites.includes(id) ? favorites.filter((value) => value !== id) : [...favorites, id];
    setFavorites(next);
    try { localStorage.setItem(FAVORITES_KEY, JSON.stringify(next)); } catch {}
  }
  function productHref(product: Product) {
    const from = basePath + (searchKey ? "?" + searchKey : "");
    return getProductUrl(product) + "?" + new URLSearchParams({ from, focus: product.id }).toString();
  }
  const chips = [...searchParams.entries()].filter(([key, value]) => key !== "sort" && key !== "page" && value);
  const categoryValue = category === "Todas" ? "" : category;

  return (
    <div className="experience-catalog" data-catalog-results={filtered.length}>
      <form onSubmit={submitSearch} className="experience-search mb-5"><Search size={18} aria-hidden="true" /><input aria-label="Buscar no catálogo" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Busque uma peça, personagem ou ideia" /><button type="submit" aria-label="Pesquisar"><ArrowRight size={18} /></button></form>
      <div className="experience-catalog-toolbar">
        <div role="status" aria-live="polite"><strong>{filtered.length}</strong> {filtered.length === 1 ? "peça encontrada" : "peças encontradas"}</div>
        <div className="flex flex-wrap items-center gap-3">
          <button type="button" className="btn-secondary gap-2 px-3 py-2 text-xs" aria-pressed={searchParams.get("favorites") === "1"} onClick={() => update({ favorites: searchParams.get("favorites") === "1" ? null : "1" })}><Heart size={15} />Favoritos ({favorites.length})</button>
          <button type="button" className="experience-copy-button" aria-label="Copiar link desta seleção" onClick={async () => { try { await navigator.clipboard.writeText(window.location.href); setCopied(true); } catch { setCopied(false); } }}>{copied ? <Check size={18} /> : <Copy size={18} />}</button>
          <label className="text-sm">Ordenar <select className="experience-select ml-2" aria-label="Ordenar produtos" value={sort} onChange={(event) => update({ sort: event.target.value })}>{["Destaques", "Preço", "Maior preço", "Nome", "Mais Recentes", "Menor prazo"].map((value) => <option key={value}>{value}</option>)}</select></label>
        </div>
      </div>
      <div className="experience-catalog-layout">
        <aside aria-label="Filtros de produtos">
          <details className="experience-filter-panel" open={filtersOpen} onToggle={(event) => setFiltersOpen(event.currentTarget.open)}>
            <summary>Filtrar produtos</summary>
            <div className="experience-filter-fields">
              <label>Categoria<select aria-label="Categoria" value={categoryValue} onChange={(event) => update({ category: event.target.value || null })}><option value="">Todas</option>{categoryValue && !categories.includes(categoryValue) ? <option value={categoryValue}>{displayValues[categoryValue] || categoryValue}</option> : null}{categories.map((value) => <option key={value}>{value}</option>)}</select></label>
              <label>Tipo<select value={facets.type} onChange={(event) => update({ type: event.target.value || null })}><option value="">Todos</option><option value="keychain">Chaveiros</option></select></label>
              <label>Tipo de objeto<select value={facets.objectType} onChange={(event) => update({ objectType: event.target.value || null })}><option value="">Todos</option>{objectTypes.map((value) => <option key={value} value={normalizeCatalogFilter(value)}>{CATALOG_OBJECT_TYPE_LABELS[value] || value}</option>)}</select></label>
              <label>Estilo<select value={facets.style} onChange={(event) => update({ style: event.target.value || null })}><option value="">Todos</option><option value="chibi">Chibi</option></select></label>
              <label>Universo do game<select value={facets.universe} onChange={(event) => update({ universe: event.target.value || null, character: null })}><option value="">Todos</option>{universes.map((value) => <option key={value} value={value}>{CATALOG_UNIVERSE_LABELS[value] || value.replaceAll("-", " ")}</option>)}</select></label>
              {characters.length ? <label>Personagem<select value={facets.character} onChange={(event) => update({ character: event.target.value || null })}><option value="">Todos</option>{characters.map((value) => <option key={value} value={value}>{value.charAt(0).toUpperCase() + value.slice(1)}</option>)}</select></label> : null}
              <label>Material<select value={material} onChange={(event) => update({ material: event.target.value === "Todos" ? null : event.target.value })}><option>Todos</option>{materials.map((value) => <option key={value}>{value}</option>)}</select></label>
              <label>Disponibilidade<select value={availability} onChange={(event) => update({ status: event.target.value === "Todos" ? null : event.target.value })}><option>Todos</option><option>Pronta entrega</option><option>Sob encomenda</option></select></label>
              <form key={searchKey} onSubmit={(event) => { event.preventDefault(); const form = new FormData(event.currentTarget); update({ min: String(form.get("min") || "") || null, max: String(form.get("max") || "") || null, minPrice: null, maxPrice: null }); }}>
                <div className="grid grid-cols-2 gap-2"><label>De (R$)<input type="number" name="min" min="0" step=".01" defaultValue={minPrice ?? ""} placeholder="0" /></label><label>Até (R$)<input type="number" name="max" min="0" step=".01" defaultValue={maxPrice ?? ""} placeholder="Sem limite" /></label></div>
                <button className="btn-secondary mt-2 w-full text-xs" type="submit">Aplicar preço</button>
              </form>
              <label className="!flex items-center gap-2"><input type="checkbox" checked={Boolean(custom)} onChange={(event) => update({ custom: event.target.checked ? "1" : "0" })} /> Personalizáveis</label>
              <button className="text-left text-sm text-blue-200 underline underline-offset-4 min-h-11" type="button" onClick={() => router.push(basePath, { scroll: false })}>Limpar filtros</button>
            </div>
          </details>
        </aside>
        <div className="min-w-0">
          {chips.length ? <div className="mb-5 flex flex-wrap gap-2" aria-label="Filtros ativos">{chips.map(([key, value]) => <button key={key} className="experience-filter-chip" onClick={() => update({ [key]: null })}>{labels[key] || key}: {displayValues[value] || value}<X size={13} aria-hidden="true" /><span className="sr-only">Remover filtro</span></button>)}</div> : null}
          <div className="experience-product-grid">
            {visible.map((product, index) => (
              <article className="experience-product" id={`produto-${product.id}`} data-product-card={product.id} key={product.id}>
                <div className="experience-product-image">
                  <Link href={productHref(product)} prefetch={false} onClick={() => trackSelectItem(product, "Catalogo", index)}><SafeProductImage candidates={getProductImageCandidates(product)} alt={getProductImageAlt(product)} priority={Boolean(defaults.prioritizeInitialImages && index < 3)} sizes="(max-width: 620px) 48vw, (max-width: 1000px) 32vw, 280px" className="absolute inset-0 h-full w-full object-contain" /></Link>
                  <button type="button" className="experience-favorite" aria-pressed={favorites.includes(product.id)} aria-label={`Favoritar ${product.name}`} onClick={() => toggleFavorite(product.id)}><Heart size={18} fill={favorites.includes(product.id) ? "currentColor" : "none"} /></button>
                </div>
                <div className="experience-product-body">
                  <p className="experience-product-category">{product.category}</p>
                  <h3><Link href={productHref(product)} prefetch={false}>{product.name}</Link></h3>
                  <p className="experience-product-detail">{product.material} · {product.productionWindow}</p>
                  <ProductPriceStack product={product} compact />
                  <div className="mt-auto pt-4 flex gap-2">
                    <Link href={productHref(product)} prefetch={false} className="btn-secondary flex-1 px-2 text-xs">{product.pricingMode === "faixa-auditada" ? "Ver peça" : "Pedir orçamento"}</Link>
                    {product.pricingMode === "faixa-auditada" ? <button className="btn-primary !px-3" type="button" aria-label={`Adicionar ${product.name} ao carrinho`} onClick={() => { addItem({ productId: product.id, quantity: 1, title: product.name, pricePix: product.pricePix, priceCard: product.priceCard, image: product.images?.[0] || product.image }); trackAddToCart(product, 1); setAdded(product.id); }}>{added === product.id ? <Check size={17} /> : <ShoppingBag size={17} />}</button> : null}
                  </div>
                </div>
              </article>
            ))}
          </div>
          {!visible.length ? <div className="experience-empty" role="status"><Search size={30} /><h3>Ainda não há uma peça autêntica nesta combinação.</h3><p>Não exibimos produtos inventados. Remova um filtro ou veja os itens reais já disponíveis no catálogo.</p><button className="btn-primary mt-5" onClick={() => router.push(basePath, { scroll: false })}>Ver todo o catálogo</button></div> : null}
          {totalPages > 1 ? <nav className="experience-pagination" aria-label="Páginas do catálogo"><button className="btn-secondary" disabled={page <= 1} onClick={() => update({ page: String(page - 1) }, true)}>Anterior</button><label>Página <select className="experience-select" aria-label="Selecionar página" value={page} onChange={(event) => update({ page: event.target.value }, true)}>{Array.from({ length: totalPages }, (_, index) => <option key={index + 1} value={index + 1}>{index + 1}</option>)}</select> de {totalPages}</label><button className="btn-secondary" disabled={page >= totalPages} onClick={() => update({ page: String(page + 1) }, true)}>Próxima</button></nav> : null}
          <p className="sr-only" role="status">{added ? "Produto adicionado ao carrinho" : copied ? "Link copiado" : ""}</p>
        </div>
      </div>
    </div>
  );
}
