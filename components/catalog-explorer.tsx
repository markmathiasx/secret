'use client';

import Link from 'next/link';
import { startTransition, useDeferredValue, useEffect, useMemo, useState } from 'react';
import { Clock3, Copy, Filter, Sparkles } from 'lucide-react';
import { categories, collections, getProductUrl, type Product } from '@/lib/catalog';
import { buildProductSearchText } from '@/lib/catalog-content';
import { ProductImageGallery } from '@/components/product-image-gallery';
import { ProductVisualBadge } from '@/components/product-visual-authenticity';
import { isProductVisualVerified } from '@/lib/product-visuals';
import { formatCurrency } from '@/lib/utils';

const PAGE_SIZE = 24;
const FAVORITES_KEY = 'mdh_catalog_favorites';
const RECENT_KEY = 'mdh_catalog_recent';
const ORDER_OPTIONS = ['Mais Recentes', 'Preço', 'Nome', 'Maior lucro', 'Menor prazo'] as const;
const PURCHASE_INTENTS = ['Geral', 'Compra rápida', 'Economia', 'Presente', 'Atacado'] as const;

type CatalogAvailability = 'Todos' | Product['status'];
type PurchaseIntent = (typeof PURCHASE_INTENTS)[number];
type CatalogOrder = (typeof ORDER_OPTIONS)[number];

function sanitizeOption(value: string | undefined, options: string[]) {
  return value && options.includes(value) ? value : 'Todas';
}

function sanitizeAvailability(value: CatalogAvailability | undefined): CatalogAvailability {
  return value === 'Pronta entrega' || value === 'Sob encomenda' ? value : 'Todos';
}

function sanitizePurchaseIntent(value: string | undefined): PurchaseIntent {
  return PURCHASE_INTENTS.includes(value as PurchaseIntent) ? (value as PurchaseIntent) : 'Geral';
}

function sanitizeOrder(value: string | undefined): CatalogOrder {
  return ORDER_OPTIONS.includes(value as CatalogOrder) ? (value as CatalogOrder) : 'Mais Recentes';
}

function sanitizeMaterial(value: string | undefined, materialOptions: string[]) {
  return value && materialOptions.includes(value) ? value : 'Todos';
}

function clampRangeValue(value: number | undefined, min: number, max: number) {
  if (!Number.isFinite(value)) return undefined;
  return Math.min(max, Math.max(min, Number(value)));
}

function parseMinProductionDays(windowLabel: string) {
  const values = [...windowLabel.matchAll(/\d+/g)].map((match) => Number(match[0])).filter(Number.isFinite);
  return values.length ? Math.min(...values) : 7;
}

function getQuantityDiscount(quantity: number) {
  if (quantity >= 20) return 0.15;
  if (quantity >= 10) return 0.1;
  if (quantity >= 5) return 0.05;
  return 0;
}

function getStockUrgency(product: Product) {
  if (product.readyToShip && product.stock <= 2) return 'Últimas unidades';
  if (product.readyToShip && product.stock <= 5) return 'Estoque enxuto';
  if (!product.readyToShip && parseMinProductionDays(product.productionWindow) <= 2) return 'Produção rápida';
  return '';
}

function buildWhatsAppQuote(product: Product, quantity: number) {
  const message = `Oi! Quero fechar ${quantity}x ${product.name} (${product.sku}).`;
  return `https://wa.me/5521920137249?text=${encodeURIComponent(message)}`;
}

function safeReadIds(key: string) {
  if (typeof window === 'undefined') return [] as string[];
  try {
    const raw = window.localStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((value) => typeof value === 'string') : [];
  } catch {
    return [] as string[];
  }
}

function saveIds(key: string, value: string[]) {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(key, JSON.stringify(value));
  }
}

export function CatalogExplorer({
  products,
  initialQuery = '',
  initialCategory = 'Todas',
  initialCollection = 'Todas',
  initialVerifiedOnly = false,
  initialAvailability = 'Todos',
  initialMaterial = 'Todos',
  initialIntent = 'Geral',
  initialOrder = 'Mais Recentes',
  initialCustomizableOnly = false,
  initialPriceMin,
  initialPriceMax,
}: {
  products: Product[];
  initialQuery?: string;
  initialCategory?: string;
  initialCollection?: string;
  initialVerifiedOnly?: boolean;
  initialAvailability?: CatalogAvailability;
  initialMaterial?: string;
  initialIntent?: string;
  initialOrder?: string;
  initialCustomizableOnly?: boolean;
  initialPriceMin?: number;
  initialPriceMax?: number;
}) {
  const priceLimits = useMemo(() => {
    const values = products.map((item) => item.pricePix);
    const min = Math.max(10, Math.floor(Math.min(...values) / 10) * 10);
    const max = Math.max(120, Math.ceil(Math.max(...values) / 10) * 10);
    return { min, max };
  }, [products]);

  const economyThreshold = useMemo(() => {
    const sorted = [...products].sort((a, b) => a.pricePix - b.pricePix);
    const index = Math.max(0, Math.floor(sorted.length * 0.35) - 1);
    return sorted[index]?.pricePix ?? priceLimits.max;
  }, [priceLimits.max, products]);

  const materialOptions = useMemo(() => ['Todos', ...new Set(products.map((item) => item.material))], [products]);

  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState(sanitizeOption(initialCategory, categories));
  const [collection, setCollection] = useState(sanitizeOption(initialCollection, collections));
  const [availability, setAvailability] = useState<CatalogAvailability>(sanitizeAvailability(initialAvailability));
  const [verifiedOnly, setVerifiedOnly] = useState(initialVerifiedOnly);
  const [selectedMaterial, setSelectedMaterial] = useState('Todos');
  const [purchaseIntent, setPurchaseIntent] = useState<PurchaseIntent>('Geral');
  const [customizableOnly, setCustomizableOnly] = useState(initialCustomizableOnly);
  const [order, setOrder] = useState<CatalogOrder>('Mais Recentes');
  const [priceRange, setPriceRange] = useState<[number, number]>([priceLimits.min, priceLimits.max]);
  const [quantity, setQuantity] = useState(1);
  const [page, setPage] = useState(1);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [recentIds, setRecentIds] = useState<string[]>([]);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [shareCopied, setShareCopied] = useState(false);
  const deferredQuery = useDeferredValue(query);

  useEffect(() => {
    setFavoriteIds(safeReadIds(FAVORITES_KEY));
    setRecentIds(safeReadIds(RECENT_KEY));
  }, []);

  useEffect(() => {
    saveIds(FAVORITES_KEY, favoriteIds);
  }, [favoriteIds]);

  useEffect(() => {
    saveIds(RECENT_KEY, recentIds);
  }, [recentIds]);

  useEffect(() => {
    const minValue = clampRangeValue(initialPriceMin, priceLimits.min, priceLimits.max) ?? priceLimits.min;
    const maxValue = clampRangeValue(initialPriceMax, priceLimits.min, priceLimits.max) ?? priceLimits.max;

    setQuery(initialQuery);
    setCategory(sanitizeOption(initialCategory, categories));
    setCollection(sanitizeOption(initialCollection, collections));
    setVerifiedOnly(initialVerifiedOnly);
    setAvailability(sanitizeAvailability(initialAvailability));
    setSelectedMaterial(sanitizeMaterial(initialMaterial, materialOptions));
    setPurchaseIntent(sanitizePurchaseIntent(initialIntent));
    setOrder(sanitizeOrder(initialOrder));
    setCustomizableOnly(initialCustomizableOnly);
    setPriceRange([Math.min(minValue, maxValue), Math.max(minValue, maxValue)]);
    setPage(1);
  }, [
    initialAvailability,
    initialCategory,
    initialCollection,
    initialCustomizableOnly,
    initialIntent,
    initialMaterial,
    initialOrder,
    initialPriceMax,
    initialPriceMin,
    initialQuery,
    initialVerifiedOnly,
    materialOptions,
    priceLimits.max,
    priceLimits.min,
  ]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let items = products.filter((item) => {
      const matchQuery = !q || buildProductSearchText(item).includes(q);
      const matchCategory = category === 'Todas' || item.category === category;
      const matchCollection = collection === 'Todas' || item.collection === collection;
      const matchAvailability = availability === 'Todos' || item.status === availability;
      const matchPrice = item.pricePix >= priceRange[0] && item.pricePix <= priceRange[1];
      const matchVerified = !verifiedOnly || isProductVisualVerified(item);
      const matchMaterial = selectedMaterial === 'Todos' || item.material === selectedMaterial;
      const matchCustomizable = !customizableOnly || item.customizable;

      let matchIntent = true;
      if (purchaseIntent === 'Compra rápida') {
        matchIntent = item.readyToShip || parseMinProductionDays(item.productionWindow) <= 2;
      } else if (purchaseIntent === 'Economia') {
        matchIntent = item.pricePix <= economyThreshold;
      } else if (purchaseIntent === 'Presente') {
        matchIntent = item.category === 'Presentes Criativos' || item.tags.some((tag) => tag.toLowerCase().includes('presente'));
      } else if (purchaseIntent === 'Atacado') {
        matchIntent = item.customizable || item.category === 'Utilidades Reais' || item.category === 'Setup & Organização';
      }

      return matchQuery && matchCategory && matchCollection && matchAvailability && matchPrice && matchVerified && matchMaterial && matchCustomizable && matchIntent;
    });

    if (order === 'Preço') items = items.sort((a, b) => a.pricePix - b.pricePix);
    if (order === 'Nome') items = items.sort((a, b) => a.name.localeCompare(b.name));
    if (order === 'Maior lucro') items = items.sort((a, b) => (b.estimatedUnitProfit ?? 0) - (a.estimatedUnitProfit ?? 0));
    if (order === 'Menor prazo') items = items.sort((a, b) => parseMinProductionDays(a.productionWindow) - parseMinProductionDays(b.productionWindow));
    if (order === 'Mais Recentes') items = items.sort((a, b) => b.id.localeCompare(a.id));

    return items;
  }, [products, query, category, collection, availability, priceRange, verifiedOnly, selectedMaterial, customizableOnly, purchaseIntent, economyThreshold, order]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const visibleItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const readyCount = filtered.filter((item) => item.status === 'Pronta entrega').length;
  const verifiedCount = filtered.filter((item) => isProductVisualVerified(item)).length;
  const customizableCount = filtered.filter((item) => item.customizable).length;
  const bundleDiscount = getQuantityDiscount(quantity);
  const fastestLeadTime = filtered.length ? Math.min(...filtered.map((item) => parseMinProductionDays(item.productionWindow))) : null;
  const averageTicket = filtered.length ? Math.round(filtered.reduce((sum, item) => sum + item.pricePix, 0) / filtered.length) : null;
  const activeFilterCount = [query.trim(), category !== 'Todas', collection !== 'Todas', availability !== 'Todos', verifiedOnly, selectedMaterial !== 'Todos', purchaseIntent !== 'Geral', customizableOnly, priceRange[0] !== priceLimits.min, priceRange[1] !== priceLimits.max, order !== 'Mais Recentes'].filter(Boolean).length;

  const compareProducts = useMemo(() => compareIds.map((id) => products.find((item) => item.id === id)).filter(Boolean) as Product[], [compareIds, products]);
  const favoriteProducts = useMemo(() => favoriteIds.map((id) => products.find((item) => item.id === id)).filter(Boolean) as Product[], [favoriteIds, products]);
  const recentProducts = useMemo(() => recentIds.map((id) => products.find((item) => item.id === id)).filter(Boolean) as Product[], [recentIds, products]);

  const sharePath = useMemo(() => {
    const params = new URLSearchParams();
    if (query.trim()) params.set('q', query.trim());
    if (category !== 'Todas') params.set('category', category);
    if (collection !== 'Todas') params.set('collection', collection);
    if (availability !== 'Todos') params.set('status', availability);
    if (verifiedOnly) params.set('mode', 'verified');
    if (selectedMaterial !== 'Todos') params.set('material', selectedMaterial);
    if (purchaseIntent !== 'Geral') params.set('intent', purchaseIntent);
    if (customizableOnly) params.set('custom', '1');
    if (order !== 'Mais Recentes') params.set('sort', order);
    if (priceRange[0] !== priceLimits.min) params.set('min', String(priceRange[0]));
    if (priceRange[1] !== priceLimits.max) params.set('max', String(priceRange[1]));
    const queryString = params.toString();
    return queryString ? `/catalogo?${queryString}` : '/catalogo';
  }, [availability, category, collection, customizableOnly, order, priceLimits.max, priceLimits.min, priceRange, purchaseIntent, query, selectedMaterial, verifiedOnly]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.history.replaceState({}, '', sharePath);
  }, [sharePath]);

  function safeSetPage(nextPage: number) {
    startTransition(() => {
      setPage(Math.max(1, Math.min(totalPages, nextPage)));
    });
  }

  function resetFilters() {
    setQuery(initialQuery);
    setCategory(sanitizeOption(initialCategory, categories));
    setCollection(sanitizeOption(initialCollection, collections));
    setOrder(sanitizeOrder(initialOrder));
    setPriceRange([priceLimits.min, priceLimits.max]);
    setVerifiedOnly(initialVerifiedOnly);
    setAvailability(sanitizeAvailability(initialAvailability));
    setSelectedMaterial(sanitizeMaterial(initialMaterial, materialOptions));
    setPurchaseIntent(sanitizePurchaseIntent(initialIntent));
    setCustomizableOnly(initialCustomizableOnly);
    setPage(1);
  }

  function toggleFavorite(productId: string) {
    setFavoriteIds((previous) => previous.includes(productId) ? previous.filter((id) => id !== productId) : [productId, ...previous].slice(0, 20));
  }

  function addRecent(productId: string) {
    setRecentIds((previous) => [productId, ...previous.filter((id) => id !== productId)].slice(0, 12));
  }

  function toggleCompare(productId: string) {
    setCompareIds((previous) => {
      if (previous.includes(productId)) return previous.filter((id) => id !== productId);
      if (previous.length >= 3) return [...previous.slice(1), productId];
      return [...previous, productId];
    });
  }

  async function copyShareLink() {
    if (typeof window === 'undefined') return;
    const absoluteUrl = new URL(sharePath, window.location.origin).toString();
    try {
      await navigator.clipboard.writeText(absoluteUrl);
      setShareCopied(true);
      window.setTimeout(() => setShareCopied(false), 1800);
    } catch {
      setShareCopied(false);
    }
  }

  const quickPresets = [
    { id: 'verified', label: 'Só validados', active: verifiedOnly, onClick: () => { setVerifiedOnly((value) => !value); safeSetPage(1); } },
    { id: 'ready', label: 'Pronta entrega', active: availability === 'Pronta entrega', onClick: () => { setAvailability((value) => value === 'Pronta entrega' ? 'Todos' : 'Pronta entrega'); safeSetPage(1); } },
    { id: 'gift', label: 'Presentes', active: purchaseIntent === 'Presente', onClick: () => { setPurchaseIntent((value) => value === 'Presente' ? 'Geral' : 'Presente'); safeSetPage(1); } },
    { id: 'fast', label: 'Compra rápida', active: purchaseIntent === 'Compra rápida', onClick: () => { setPurchaseIntent((value) => value === 'Compra rápida' ? 'Geral' : 'Compra rápida'); safeSetPage(1); } },
    { id: 'custom', label: 'Personalizáveis', active: customizableOnly, onClick: () => { setCustomizableOnly((value) => !value); safeSetPage(1); } },
  ];

  return (
    <div className="catalog-explorer-root space-y-6">
      <div className="catalog-filter-shell glass-panel p-3 sm:p-4 md:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs uppercase tracking-[0.2em] text-cyan-100/75">Explorador comercial</p>
            <h2 className="mt-2 text-2xl font-black text-white md:text-3xl">
              Monte uma vitrine pronta para comprar, compartilhar ou mandar no WhatsApp.
            </h2>
            <p className="mt-3 text-sm leading-7 text-white/68">
              Os filtros refinam a seleção em tempo real e a URL acompanha a curadoria para você salvar ou enviar uma seleção já pronta.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={copyShareLink} className="btn-secondary gap-2 px-4 py-3 text-sm">
              <Copy className="h-4 w-4" />
              {shareCopied ? 'Link copiado' : 'Copiar vitrine'}
            </button>
            <button type="button" onClick={resetFilters} className="btn-glass gap-2 px-4 py-3 text-sm">
              <Filter className="h-4 w-4" />
              Limpar filtros
            </button>
          </div>
        </div>

        <div className="mt-5 grid gap-3 lg:grid-cols-4">
          <div className="surface-stat rounded-[22px] px-4 py-4">
            <p className="text-[11px] uppercase tracking-[0.18em] text-white/50">Resultados atuais</p>
            <p className="mt-3 text-2xl font-black text-white">{filtered.length}</p>
            <p className="mt-1 text-xs text-white/60">com {activeFilterCount} filtros ativos</p>
          </div>
          <div className="surface-stat rounded-[22px] px-4 py-4">
            <p className="text-[11px] uppercase tracking-[0.18em] text-white/50">Autenticidade</p>
            <p className="mt-3 text-2xl font-black text-white">{verifiedCount}</p>
            <p className="mt-1 text-xs text-white/60">com visual validado</p>
          </div>
          <div className="surface-stat rounded-[22px] px-4 py-4">
            <p className="text-[11px] uppercase tracking-[0.18em] text-white/50">Velocidade</p>
            <p className="mt-3 text-2xl font-black text-white">{fastestLeadTime ? `${fastestLeadTime}d` : '--'}</p>
            <p className="mt-1 text-xs text-white/60">menor prazo base encontrado</p>
          </div>
          <div className="surface-stat rounded-[22px] px-4 py-4">
            <p className="text-[11px] uppercase tracking-[0.18em] text-white/50">Ticket médio</p>
            <p className="mt-3 text-2xl font-black text-white">{averageTicket ? formatCurrency(averageTicket) : '--'}</p>
            <p className="mt-1 text-xs text-white/60">{customizableCount} personalizáveis</p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {quickPresets.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={preset.onClick}
              className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                preset.active
                  ? 'border-cyan-300/35 bg-cyan-300/12 text-cyan-50'
                  : 'border-white/10 bg-white/5 text-white/75'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>

        <div className="catalog-filter-grid mt-4 grid gap-3 md:gap-4 xl:grid-cols-3 2xl:grid-cols-[1.1fr_0.42fr_0.42fr_0.42fr_0.42fr_0.42fr_0.42fr]">
          <label className="text-sm text-white/70">
            <span className="mb-2 block">Buscar</span>
            <input
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                safeSetPage(1);
              }}
              placeholder="Ex: vaso, suporte, anime..."
              className="field-base"
            />
          </label>

          <label className="text-sm text-white/70">
            <span className="mb-2 block">Categoria</span>
            <select
              value={category}
              onChange={(event) => {
                setCategory(event.target.value);
                safeSetPage(1);
              }}
              className="field-base"
            >
              <option>Todas</option>
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
                safeSetPage(1);
              }}
              className="field-base"
            >
              <option>Todas</option>
              {collections.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>

          <label className="text-sm text-white/70">
            <span className="mb-2 block">Disponibilidade</span>
            <select
              value={availability}
              onChange={(event) => {
                setAvailability(event.target.value as CatalogAvailability);
                safeSetPage(1);
              }}
              className="field-base"
            >
              <option>Todos</option>
              <option>Pronta entrega</option>
              <option>Sob encomenda</option>
            </select>
          </label>

          <label className="text-sm text-white/70">
            <span className="mb-2 block">Material</span>
            <select
              value={selectedMaterial}
              onChange={(event) => {
                setSelectedMaterial(event.target.value);
                safeSetPage(1);
              }}
              className="field-base"
            >
              {materialOptions.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>

          <label className="text-sm text-white/70">
            <span className="mb-2 block">Intenção</span>
            <select
              value={purchaseIntent}
              onChange={(event) => {
                setPurchaseIntent(event.target.value as PurchaseIntent);
                safeSetPage(1);
              }}
              className="field-base"
            >
              {PURCHASE_INTENTS.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          </label>

          <label className="text-sm text-white/70">
            <span className="mb-2 block">Ordenar</span>
            <select value={order} onChange={(event) => setOrder(event.target.value as CatalogOrder)} className="field-base">
              {ORDER_OPTIONS.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          <label className="text-sm text-white/70">
            <span className="mb-2 block">Preço</span>
            <input
              type="range"
              min={priceLimits.min}
              max={priceLimits.max}
              step={5}
              value={priceRange[0]}
              onChange={(event) => setPriceRange([Number(event.target.value), priceRange[1]])}
              className="w-full accent-cyan-400"
            />
            <input
              type="range"
              min={priceLimits.min}
              max={priceLimits.max}
              step={5}
              value={priceRange[1]}
              onChange={(event) => setPriceRange([priceRange[0], Number(event.target.value)])}
              className="mt-2 w-full accent-cyan-400"
            />
            <div className="mt-1 flex justify-between text-xs text-white/60">
              <span>R$ {priceRange[0]}</span>
              <span>R$ {priceRange[1]}</span>
            </div>
          </label>

          <label className="text-sm text-white/70">
            <span className="mb-2 block">Quantidade</span>
            <input
              type="range"
              min={1}
              max={30}
              step={1}
              value={quantity}
              onChange={(event) => setQuantity(Number(event.target.value))}
              className="w-full accent-emerald-400"
            />
            <div className="mt-1 flex justify-between text-xs text-white/60">
              <span>{quantity} un.</span>
              <span>{Math.round(bundleDiscount * 100)}% off</span>
            </div>
          </label>

          <div className="surface-stat rounded-[20px] px-4 py-4 text-xs text-emerald-100">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              <span className="font-semibold uppercase tracking-[0.18em]">Simulador ativo</span>
            </div>
            <p className="mt-3 leading-6 text-white/72">
              A quantidade já recalcula economia estimada e ajuda a separar compra unitária, presente, revenda ou lote.
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-white/60">
          <span>{filtered.length} produtos</span>
          <span className="h-1 w-1 rounded-full bg-white/30" />
          <span>{readyCount} pronta entrega</span>
          <span className="h-1 w-1 rounded-full bg-white/30" />
          <span>{verifiedCount} validados</span>
          <span className="h-1 w-1 rounded-full bg-white/30" />
          <span>Página {currentPage} de {totalPages}</span>
          <span className="h-1 w-1 rounded-full bg-white/30" />
          <span>Busca ativa: {deferredQuery || 'tudo'}</span>
        </div>
      </div>

      {compareProducts.length > 0 ? (
        <div className="glass-panel rounded-[24px] border border-cyan-300/20 bg-cyan-300/8 p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-cyan-100">Comparador ({compareProducts.length}/3)</p>
            <button
              type="button"
              onClick={() => setCompareIds([])}
              className="rounded-full border border-cyan-300/30 bg-cyan-300/10 px-3 py-1 text-xs font-semibold text-cyan-100"
            >
              Limpar
            </button>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {compareProducts.map((product) => (
              <article key={product.id} className="rounded-[18px] border border-white/10 bg-black/20 p-3">
                <h3 className="line-clamp-2 text-sm font-semibold text-white">{product.name}</h3>
                <p className="mt-1 text-xs text-white/60">{formatCurrency(product.pricePix)} no Pix</p>
                <p className="text-xs text-white/60">Prazo: {product.productionWindow}</p>
                <p className="text-xs text-white/60">Lucro: {formatCurrency(product.estimatedUnitProfit ?? 0)}</p>
              </article>
            ))}
          </div>
        </div>
      ) : null}

      {favoriteProducts.length > 0 || recentProducts.length > 0 ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="glass-panel rounded-[20px] border border-white/10 bg-black/20 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-white/55">Favoritos</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {favoriteProducts.slice(0, 8).map((product) => (
                <Link
                  key={product.id}
                  href={getProductUrl(product)}
                  onClick={() => addRecent(product.id)}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80"
                >
                  {product.name}
                </Link>
              ))}
            </div>
          </div>
          <div className="glass-panel rounded-[20px] border border-white/10 bg-black/20 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-white/55">Vistos recentemente</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {recentProducts.slice(0, 8).map((product) => (
                <Link
                  key={product.id}
                  href={getProductUrl(product)}
                  onClick={() => addRecent(product.id)}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80"
                >
                  {product.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      <div className="catalog-products-grid grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {visibleItems.map((product) => {
          const isFavorite = favoriteIds.includes(product.id);
          const isCompared = compareIds.includes(product.id);
          const urgency = getStockUrgency(product);
          const subtotal = product.pricePix * quantity;
          const total = subtotal * (1 - bundleDiscount);
          const savings = subtotal - total;

          return (
            <article
              key={product.id}
              className={`catalog-product-card group relative overflow-hidden rounded-[28px] border p-5 transition-all duration-500 hover:-translate-y-2 hover:scale-[1.018] ${
                isProductVisualVerified(product)
                  ? 'border-white/10 bg-card hover:border-cyan-200/45'
                  : 'border-amber-300/20 bg-[linear-gradient(180deg,rgba(245,158,11,0.10),rgba(255,255,255,0.03))] hover:border-amber-300/40'
              }`}
            >
              <div className="pointer-events-none absolute inset-0 rounded-[28px] border border-cyan-200/0 transition-colors duration-500 group-hover:border-cyan-200/25" />
              <ProductImageGallery product={product} compact />

              <div className="mt-2 flex flex-wrap gap-2">
                {product.featured ? (
                  <span className="rounded-full border border-amber-300/25 bg-amber-300/10 px-3 py-1 text-[11px] font-semibold text-amber-100">
                    Mais vendido
                  </span>
                ) : null}
                {urgency ? (
                  <span className="rounded-full border border-rose-300/25 bg-rose-300/10 px-3 py-1 text-[11px] font-semibold text-rose-100">
                    {urgency}
                  </span>
                ) : null}
                <ProductVisualBadge product={product} />
              </div>

              <div className="mt-4 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-[0.18em] text-cyan-200/80">{product.category}</p>
                  <h3 className="mt-2 line-clamp-2 break-words text-base font-semibold text-white sm:text-lg">
                    {product.name}
                  </h3>
                  <p className="mt-2 min-h-0 line-clamp-4 text-sm leading-6 text-white/62 sm:min-h-[72px] md:line-clamp-3">
                    {product.description}
                  </p>
                </div>
                <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/60">
                  {product.productionWindow}
                </span>
              </div>

              <div className="mt-4 rounded-[18px] border border-white/10 bg-black/20 p-3 text-xs text-white/65">
                <p className="font-semibold text-white/85">
                  {product.pricingMode === 'faixa-auditada' ? 'Compra direta' : 'Projeto sob medida'}
                </p>
                <p className="mt-1">{product.pricingNarrative}</p>
                <div className="mt-2 flex flex-wrap items-center gap-3">
                  <span className="text-emerald-200">{quantity}x: {formatCurrency(total)}</span>
                  {bundleDiscount > 0 ? <span>Economia {formatCurrency(savings)}</span> : null}
                </div>
              </div>

              <div className="mt-5 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="text-xs text-white/45">Preço Pix</p>
                  <p className="text-2xl font-bold text-white">{formatCurrency(product.pricePix)}</p>
                  <p className="text-xs text-white/55">12x de {formatCurrency(product.priceCard / 12)}</p>
                  <div className="mt-2 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.16em] text-white/48">
                    <Clock3 className="h-3.5 w-3.5" />
                    {product.productionWindow}
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Link
                    href={getProductUrl(product)}
                    onClick={() => addRecent(product.id)}
                    className="btn-secondary px-4 py-2 text-center text-sm font-semibold text-cyan-100"
                  >
                    {product.pricingMode === 'faixa-auditada' ? 'Comprar' : 'Orçar'}
                  </Link>
                  <a
                    href={buildWhatsAppQuote(product, quantity)}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-glass px-4 py-2 text-center text-xs font-semibold text-emerald-100"
                  >
                    WhatsApp
                  </a>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => toggleFavorite(product.id)}
                  className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                    isFavorite ? 'border-amber-300/30 bg-amber-300/12 text-amber-100' : 'border-white/10 bg-white/5 text-white/70'
                  }`}
                >
                  {isFavorite ? 'Favoritado' : 'Favoritar'}
                </button>
                <button
                  type="button"
                  onClick={() => toggleCompare(product.id)}
                  className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                    isCompared ? 'border-cyan-300/30 bg-cyan-300/12 text-cyan-100' : 'border-white/10 bg-white/5 text-white/70'
                  }`}
                >
                  {isCompared ? 'No comparador' : 'Comparar'}
                </button>
              </div>
            </article>
          );
        })}
      </div>

      {visibleItems.length === 0 ? (
        <div className="glass-panel rounded-[28px] border border-white/10 bg-white/5 p-8 text-center">
          <p className="text-sm uppercase tracking-[0.18em] text-cyan-200/80">Sem resultado</p>
          <h3 className="mt-3 text-2xl font-bold text-white">Nenhum item bateu com esse filtro.</h3>
          <p className="mt-3 text-sm leading-7 text-white/65">
            Ajuste intenção, material, faixa de preço ou disponibilidade para encontrar peças com mais fit comercial.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button type="button" onClick={resetFilters} className="btn-secondary">
              Limpar filtros
            </button>
            <Link href="/imagem-para-impressao-3d" className="btn-primary">
              Pedir sob medida
            </Link>
          </div>
        </div>
      ) : null}

      {totalPages > 1 ? (
        <div className="flex flex-wrap items-center justify-center gap-2">
          <button
            onClick={() => safeSetPage(currentPage - 1)}
            className="btn-glass px-4 py-2 text-sm font-semibold text-white/75 disabled:opacity-50"
            disabled={currentPage === 1}
          >
            Anterior
          </button>
          {[...Array(totalPages)].map((_, index) => (
            <button
              key={index}
              onClick={() => safeSetPage(index + 1)}
              className={`rounded-full border px-4 py-2 text-sm font-semibold ${
                currentPage === index + 1 ? 'border-cyan-300/35 bg-cyan-300/12 text-cyan-50' : 'border-white/10 bg-white/5 text-white/75'
              }`}
            >
              {index + 1}
            </button>
          ))}
          <button
            onClick={() => safeSetPage(currentPage + 1)}
            className="btn-glass px-4 py-2 text-sm font-semibold text-white/75 disabled:opacity-50"
            disabled={currentPage === totalPages}
          >
            Próxima
          </button>
        </div>
      ) : null}
    </div>
  );
}
