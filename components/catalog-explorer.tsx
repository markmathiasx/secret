'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { startTransition, useDeferredValue, useEffect, useMemo, useState } from 'react';
import {
  BadgeCheck,
  ChevronRight,
  Clock3,
  Copy,
  Filter,
  Heart,
  History,
  MessageCircleMore,
  RotateCcw,
  Sparkles,
  Target,
} from 'lucide-react';
import { categories, collections, getProductUrl, type Product } from '@/lib/catalog';
import { getProductSearchScore } from '@/lib/catalog-content';
import { ProductImageGallery } from '@/components/product-image-gallery';
import { ProductVisualBadge } from '@/components/product-visual-authenticity';
import { isProductRealPhoto, isProductVisualVerified } from '@/lib/product-visuals';
import { formatCurrency } from '@/lib/utils';

const PAGE_SIZE = 24;
const FAVORITES_KEY = 'mdh_catalog_favorites';
const RECENT_KEY = 'mdh_catalog_recent';
const RECENT_SEARCHES_KEY = 'mdh_catalog_recent_searches';
const SAVED_VIEWS_KEY = 'mdh_catalog_saved_views';
const ORDER_OPTIONS = ['Mais Recentes', 'Preço', 'Nome', 'Maior lucro', 'Menor prazo'] as const;
const PURCHASE_INTENTS = ['Geral', 'Compra rápida', 'Economia', 'Presente', 'Atacado'] as const;

type CatalogAvailability = 'Todos' | Product['status'];
type PurchaseIntent = (typeof PURCHASE_INTENTS)[number];
type CatalogOrder = (typeof ORDER_OPTIONS)[number];
type VisualMode = 'all' | 'verified' | 'real';
type SavedCatalogView = {
  id: string;
  label: string;
  path: string;
  count: number;
};

function sanitizeOption(value: string | undefined, options: string[]) {
  return value && options.includes(value) ? value : 'Todas';
}

function sanitizeAvailability(value: CatalogAvailability | undefined): CatalogAvailability {
  return value === 'Pronta entrega' || value === 'Sob encomenda' ? value : 'Todos';
}

function sanitizeVisualMode(value: string | undefined): VisualMode {
  return value === 'verified' || value === 'real' ? value : 'all';
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

function buildSelectionWhatsApp(items: Product[], quantity: number) {
  const shortlist = items.slice(0, 6);
  const lines = shortlist.map((item, index) => `${index + 1}. ${item.name} (${item.sku}) - ${formatCurrency(item.pricePix)}`);
  const message = [
    `Oi! Quero revisar esta seleção da MDH 3D para ${quantity} unidade(s):`,
    ...lines,
    'Pode me ajudar a fechar a melhor opção?',
  ].join('\n');
  return `https://wa.me/5521920137249?text=${encodeURIComponent(message)}`;
}

function buildFavoritesWhatsApp(items: Product[]) {
  const shortlist = items.slice(0, 8);
  const lines = shortlist.map((item, index) => `${index + 1}. ${item.name} (${item.sku})`);
  const message = [
    'Oi! Quero revisar meus favoritos da MDH 3D:',
    ...lines,
    'Pode me orientar sobre prazo, material e melhor fechamento?',
  ].join('\n');
  return `https://wa.me/5521920137249?text=${encodeURIComponent(message)}`;
}

function shouldIgnoreCardActivation(target: EventTarget | null) {
  return target instanceof Element && Boolean(target.closest("a, button, input, select, textarea, [role='button'], [data-card-interactive='true']"));
}

function getVisiblePagination(currentPage: number, totalPages: number) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages = new Set<number>([1, totalPages, currentPage, currentPage - 1, currentPage + 1]);
  const ordered = [...pages].filter((page) => page >= 1 && page <= totalPages).sort((a, b) => a - b);
  const output: Array<number | string> = [];

  ordered.forEach((page, index) => {
    output.push(page);
    const next = ordered[index + 1];
    if (next && next - page > 1) {
      output.push(`ellipsis-${page}`);
    }
  });

  return output;
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

function safeReadViews() {
  if (typeof window === 'undefined') return [] as SavedCatalogView[];
  try {
    const raw = window.localStorage.getItem(SAVED_VIEWS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [] as SavedCatalogView[];
    return parsed.filter((item) =>
      item &&
      typeof item === 'object' &&
      typeof item.id === 'string' &&
      typeof item.label === 'string' &&
      typeof item.path === 'string' &&
      typeof item.count === 'number'
    ) as SavedCatalogView[];
  } catch {
    return [] as SavedCatalogView[];
  }
}

function saveViews(value: SavedCatalogView[]) {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(SAVED_VIEWS_KEY, JSON.stringify(value));
  }
}

export function CatalogExplorer({
  products,
  initialQuery = '',
  initialCategory = 'Todas',
  initialCollection = 'Todas',
  initialVisualMode = 'all',
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
  initialVisualMode?: VisualMode;
  initialAvailability?: CatalogAvailability;
  initialMaterial?: string;
  initialIntent?: string;
  initialOrder?: string;
  initialCustomizableOnly?: boolean;
  initialPriceMin?: number;
  initialPriceMax?: number;
}) {
  const router = useRouter();

  function openProduct(product: Product) {
    addRecent(product.id);
    router.push(getProductUrl(product));
  }

  function compareBySelectedOrder(a: Product, b: Product, selectedOrder: CatalogOrder) {
    if (selectedOrder === 'Preço') return a.pricePix - b.pricePix;
    if (selectedOrder === 'Nome') return a.name.localeCompare(b.name);
    if (selectedOrder === 'Maior lucro') return (b.estimatedUnitProfit ?? 0) - (a.estimatedUnitProfit ?? 0);
    if (selectedOrder === 'Menor prazo') return parseMinProductionDays(a.productionWindow) - parseMinProductionDays(b.productionWindow);
    return b.id.localeCompare(a.id);
  }

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
  const [visualMode, setVisualMode] = useState<VisualMode>(sanitizeVisualMode(initialVisualMode));
  const [selectedMaterial, setSelectedMaterial] = useState('Todos');
  const [purchaseIntent, setPurchaseIntent] = useState<PurchaseIntent>('Geral');
  const [customizableOnly, setCustomizableOnly] = useState(initialCustomizableOnly);
  const [order, setOrder] = useState<CatalogOrder>('Mais Recentes');
  const [priceRange, setPriceRange] = useState<[number, number]>([priceLimits.min, priceLimits.max]);
  const [quantity, setQuantity] = useState(1);
  const [page, setPage] = useState(1);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [recentIds, setRecentIds] = useState<string[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [savedViews, setSavedViews] = useState<SavedCatalogView[]>([]);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [shareCopied, setShareCopied] = useState(false);
  const deferredQuery = useDeferredValue(query);

  useEffect(() => {
    setFavoriteIds(safeReadIds(FAVORITES_KEY));
    setRecentIds(safeReadIds(RECENT_KEY));
    setRecentSearches(safeReadIds(RECENT_SEARCHES_KEY));
    setSavedViews(safeReadViews());
  }, []);

  useEffect(() => {
    saveIds(FAVORITES_KEY, favoriteIds);
  }, [favoriteIds]);

  useEffect(() => {
    saveIds(RECENT_KEY, recentIds);
  }, [recentIds]);

  useEffect(() => {
    saveIds(RECENT_SEARCHES_KEY, recentSearches);
  }, [recentSearches]);

  useEffect(() => {
    saveViews(savedViews);
  }, [savedViews]);

  useEffect(() => {
    const minValue = clampRangeValue(initialPriceMin, priceLimits.min, priceLimits.max) ?? priceLimits.min;
    const maxValue = clampRangeValue(initialPriceMax, priceLimits.min, priceLimits.max) ?? priceLimits.max;

    setQuery(initialQuery);
    setCategory(sanitizeOption(initialCategory, categories));
    setCollection(sanitizeOption(initialCollection, collections));
    setVisualMode(sanitizeVisualMode(initialVisualMode));
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
    initialVisualMode,
    materialOptions,
    priceLimits.max,
    priceLimits.min,
  ]);

  const filtered = useMemo(() => {
    const normalizedQuery = deferredQuery.trim();
    let items = products
      .map((item) => {
        const searchScore = normalizedQuery ? getProductSearchScore(item, normalizedQuery) : 1;
        return { item, searchScore };
      })
      .filter(({ item, searchScore }) => {
      const matchQuery = !normalizedQuery || searchScore > 0;
      const matchCategory = category === 'Todas' || item.category === category;
      const matchCollection = collection === 'Todas' || item.collection === collection;
      const matchAvailability = availability === 'Todos' || item.status === availability;
      const matchPrice = item.pricePix >= priceRange[0] && item.pricePix <= priceRange[1];
      const matchVisual =
        visualMode === 'all' ? true : visualMode === 'real' ? isProductRealPhoto(item) : isProductVisualVerified(item);
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

      return matchQuery && matchCategory && matchCollection && matchAvailability && matchPrice && matchVisual && matchMaterial && matchCustomizable && matchIntent;
    });

    items = items.sort((left, right) => {
      if (normalizedQuery && right.searchScore !== left.searchScore) {
        return right.searchScore - left.searchScore;
      }
      return compareBySelectedOrder(left.item, right.item, order);
    });

    return items.map(({ item }) => item);
  }, [products, deferredQuery, category, collection, availability, priceRange, visualMode, selectedMaterial, customizableOnly, purchaseIntent, economyThreshold, order]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const visibleItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const readyCount = filtered.filter((item) => item.status === 'Pronta entrega').length;
  const realPhotoCount = filtered.filter((item) => isProductRealPhoto(item)).length;
  const verifiedCount = filtered.filter((item) => isProductVisualVerified(item)).length;
  const customizableCount = filtered.filter((item) => item.customizable).length;
  const bundleDiscount = getQuantityDiscount(quantity);
  const fastestLeadTime = filtered.length ? Math.min(...filtered.map((item) => parseMinProductionDays(item.productionWindow))) : null;
  const averageTicket = filtered.length ? Math.round(filtered.reduce((sum, item) => sum + item.pricePix, 0) / filtered.length) : null;
  const activeFilterCount = [query.trim(), category !== 'Todas', collection !== 'Todas', availability !== 'Todos', visualMode !== 'all', selectedMaterial !== 'Todos', purchaseIntent !== 'Geral', customizableOnly, priceRange[0] !== priceLimits.min, priceRange[1] !== priceLimits.max, order !== 'Mais Recentes'].filter(Boolean).length;

  const compareProducts = useMemo(() => compareIds.map((id) => products.find((item) => item.id === id)).filter(Boolean) as Product[], [compareIds, products]);
  const favoriteProducts = useMemo(() => favoriteIds.map((id) => products.find((item) => item.id === id)).filter(Boolean) as Product[], [favoriteIds, products]);
  const recentProducts = useMemo(() => recentIds.map((id) => products.find((item) => item.id === id)).filter(Boolean) as Product[], [recentIds, products]);
  const paginationItems = useMemo(() => getVisiblePagination(currentPage, totalPages), [currentPage, totalPages]);
  const selectionWhatsAppUrl = useMemo(() => buildSelectionWhatsApp(filtered, quantity), [filtered, quantity]);
  const favoritesWhatsAppUrl = useMemo(() => buildFavoritesWhatsApp(favoriteProducts), [favoriteProducts]);
  const selectionNarrative = useMemo(() => {
    if (!filtered.length) {
      return 'A combinação atual ficou apertada. Vale abrir preço, material ou disponibilidade para recuperar opções mais próximas.';
    }
    if (purchaseIntent === 'Presente') {
      return 'A seleção está puxando itens com leitura mais rápida e bom apelo visual para presentear sem precisar explicar demais.';
    }
    if (purchaseIntent === 'Compra rápida') {
      return 'O recorte atual prioriza itens com saída mais curta para encurtar a conversa e acelerar o fechamento.';
    }
    if (purchaseIntent === 'Economia') {
      return 'A vitrine está inclinada para ticket mais enxuto, sem perder referências com potencial de conversão.';
    }
    if (purchaseIntent === 'Atacado') {
      return 'O foco atual é em itens que conseguem conversar melhor com lote, personalização e repetição de pedido.';
    }
    if (visualMode === 'real') {
      return 'A curadoria está filtrando apenas itens com foto real do objeto físico para reduzir qualquer ambiguidade visual antes da compra.';
    }
    if (visualMode === 'verified') {
      return 'A curadoria está filtrando por foto real e render fiel para manter prova visual forte sem misturar referência conceitual.';
    }
    return `A seleção mistura ${readyCount} itens de pronta entrega, ${realPhotoCount} fotos reais e ${customizableCount} opções com espaço para ajuste.`;
  }, [customizableCount, filtered.length, purchaseIntent, readyCount, realPhotoCount, visualMode]);
  const activeFilterChips = [
    query.trim()
      ? {
          id: 'query',
          label: `Busca: ${query.trim()}`,
          clear: () => {
            setQuery('');
            safeSetPage(1);
          },
        }
      : null,
    category !== 'Todas'
      ? {
          id: 'category',
          label: category,
          clear: () => {
            setCategory('Todas');
            safeSetPage(1);
          },
        }
      : null,
    collection !== 'Todas'
      ? {
          id: 'collection',
          label: collection,
          clear: () => {
            setCollection('Todas');
            safeSetPage(1);
          },
        }
      : null,
    availability !== 'Todos'
      ? {
          id: 'availability',
          label: availability,
          clear: () => {
            setAvailability('Todos');
            safeSetPage(1);
          },
        }
      : null,
    selectedMaterial !== 'Todos'
      ? {
          id: 'material',
          label: selectedMaterial,
          clear: () => {
            setSelectedMaterial('Todos');
            safeSetPage(1);
          },
        }
      : null,
    purchaseIntent !== 'Geral'
      ? {
          id: 'intent',
          label: purchaseIntent,
          clear: () => {
            setPurchaseIntent('Geral');
            safeSetPage(1);
          },
        }
      : null,
    visualMode === 'real'
      ? {
          id: 'visual-real',
          label: 'Só foto real',
          clear: () => {
            setVisualMode('all');
            safeSetPage(1);
          },
        }
      : visualMode === 'verified'
      ? {
          id: 'visual-verified',
          label: 'Foto + render',
          clear: () => {
            setVisualMode('all');
            safeSetPage(1);
          },
        }
      : null,
    customizableOnly
      ? {
          id: 'custom',
          label: 'Personalizáveis',
          clear: () => {
            setCustomizableOnly(false);
            safeSetPage(1);
          },
        }
      : null,
    priceRange[0] !== priceLimits.min || priceRange[1] !== priceLimits.max
      ? {
          id: 'price',
          label: `Faixa ${formatCurrency(priceRange[0])} - ${formatCurrency(priceRange[1])}`,
          clear: () => {
            setPriceRange([priceLimits.min, priceLimits.max]);
            safeSetPage(1);
          },
        }
      : null,
  ].filter(Boolean) as { id: string; label: string; clear: () => void }[];
  const smartSpotlights = useMemo(() => {
    const picks: Array<{
      id: string;
      title: string;
      description: string;
      badge: string;
      accent: string;
      product: Product;
    }> = [];
    const seen = new Set<string>();

    const register = (
      id: string,
      title: string,
      description: string,
      badge: string,
      accent: string,
      product?: Product
    ) => {
      if (!product || seen.has(product.id)) return;
      seen.add(product.id);
      picks.push({ id, title, description, badge, accent, product });
    };

    const cheapest = [...filtered].sort((a, b) => a.pricePix - b.pricePix)[0];
    const fastest = [...filtered].sort(
      (a, b) => parseMinProductionDays(a.productionWindow) - parseMinProductionDays(b.productionWindow)
    )[0];
    const verifiedPick = filtered.find((item) => isProductVisualVerified(item));
    const customPick = filtered.find((item) => item.customizable);

    register(
      'best-entry',
      'Melhor porta de entrada',
      'A peça que está mais alinhada com o recorte atual e tende a explicar bem a curadoria.',
      'entrada',
      'border-cyan-300/20 bg-cyan-300/10 text-cyan-100',
      filtered[0]
    );
    register(
      'fastest',
      'Opção mais rápida',
      'A melhor escolha para quem quer reduzir conversa e encurtar janela de produção.',
      'agilidade',
      'border-emerald-300/20 bg-emerald-300/10 text-emerald-100',
      fastest
    );
    register(
      'cheapest',
      'Menor ticket',
      'Ajuda a iniciar a compra com um valor mais leve e menos barreira de entrada.',
      'economia',
      'border-amber-300/20 bg-amber-300/10 text-amber-100',
      cheapest
    );
    register(
      'verified',
      'Prova visual forte',
      'Quando a conversa pede mais confiança, esta é a peça que melhor sustenta a decisão.',
      'confiança',
      'border-violet-300/20 bg-violet-300/10 text-violet-100',
      verifiedPick
    );
    register(
      'custom',
      'Espaço para personalizar',
      'Boa referência para quem quer adaptar cor, escala, acabamento ou briefing.',
      'sob medida',
      'border-white/12 bg-white/5 text-white/80',
      customPick
    );

    return picks.slice(0, 4);
  }, [filtered]);

  const sharePath = useMemo(() => {
    const params = new URLSearchParams();
    if (query.trim()) params.set('q', query.trim());
    if (category !== 'Todas') params.set('category', category);
    if (collection !== 'Todas') params.set('collection', collection);
    if (availability !== 'Todos') params.set('status', availability);
    if (visualMode !== 'all') params.set('mode', visualMode);
    if (selectedMaterial !== 'Todos') params.set('material', selectedMaterial);
    if (purchaseIntent !== 'Geral') params.set('intent', purchaseIntent);
    if (customizableOnly) params.set('custom', '1');
    if (order !== 'Mais Recentes') params.set('sort', order);
    if (priceRange[0] !== priceLimits.min) params.set('min', String(priceRange[0]));
    if (priceRange[1] !== priceLimits.max) params.set('max', String(priceRange[1]));
    const queryString = params.toString();
    return queryString ? `/catalogo?${queryString}` : '/catalogo';
  }, [availability, category, collection, customizableOnly, order, priceLimits.max, priceLimits.min, priceRange, purchaseIntent, query, selectedMaterial, visualMode]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.history.replaceState({}, '', sharePath);
  }, [sharePath]);

  useEffect(() => {
    const normalized = deferredQuery.trim();
    if (normalized.length < 2 || filtered.length === 0) return;
    setRecentSearches((previous) => [normalized, ...previous.filter((item) => item !== normalized)].slice(0, 8));
  }, [deferredQuery, filtered.length]);

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
    setVisualMode(sanitizeVisualMode(initialVisualMode));
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

  function buildViewLabel() {
    const parts = [
      query.trim() || null,
      category !== 'Todas' ? category : null,
      availability !== 'Todos' ? availability : null,
      purchaseIntent !== 'Geral' ? purchaseIntent : null,
      visualMode === 'real' ? 'só foto real' : visualMode === 'verified' ? 'foto + render' : null,
    ].filter(Boolean);

    if (!parts.length) return 'Vitrine geral';
    return parts.slice(0, 3).join(' • ');
  }

  function saveCurrentView() {
    const nextView: SavedCatalogView = {
      id: `${Date.now()}`,
      label: buildViewLabel(),
      path: sharePath,
      count: filtered.length,
    };

    setSavedViews((previous) => [nextView, ...previous.filter((item) => item.path !== sharePath)].slice(0, 6));
  }

  const quickPresets = [
    { id: 'real', label: 'Só foto real', active: visualMode === 'real', onClick: () => { setVisualMode((value) => value === 'real' ? 'all' : 'real'); safeSetPage(1); } },
    { id: 'verified', label: 'Foto + render', active: visualMode === 'verified', onClick: () => { setVisualMode((value) => value === 'verified' ? 'all' : 'verified'); safeSetPage(1); } },
    { id: 'ready', label: 'Pronta entrega', active: availability === 'Pronta entrega', onClick: () => { setAvailability((value) => value === 'Pronta entrega' ? 'Todos' : 'Pronta entrega'); safeSetPage(1); } },
    { id: 'gift', label: 'Presentes', active: purchaseIntent === 'Presente', onClick: () => { setPurchaseIntent((value) => value === 'Presente' ? 'Geral' : 'Presente'); safeSetPage(1); } },
    { id: 'fast', label: 'Compra rápida', active: purchaseIntent === 'Compra rápida', onClick: () => { setPurchaseIntent((value) => value === 'Compra rápida' ? 'Geral' : 'Compra rápida'); safeSetPage(1); } },
    { id: 'custom', label: 'Personalizáveis', active: customizableOnly, onClick: () => { setCustomizableOnly((value) => !value); safeSetPage(1); } },
  ];
  const rescueActions = [
    visualMode === 'real'
      ? { id: 'relax-real', label: 'Aceitar render fiel', onClick: () => { setVisualMode('verified'); safeSetPage(1); } }
      : visualMode === 'verified'
      ? { id: 'relax-verified', label: 'Liberar referência visual', onClick: () => { setVisualMode('all'); safeSetPage(1); } }
      : null,
    availability !== 'Todos'
      ? { id: 'all-availability', label: 'Voltar disponibilidade', onClick: () => { setAvailability('Todos'); safeSetPage(1); } }
      : null,
    purchaseIntent !== 'Geral'
      ? { id: 'general-intent', label: 'Buscar sem intenção fixa', onClick: () => { setPurchaseIntent('Geral'); safeSetPage(1); } }
      : null,
    category !== 'Todas'
      ? { id: 'all-category', label: 'Abrir todas as categorias', onClick: () => { setCategory('Todas'); safeSetPage(1); } }
      : null,
    query.trim()
      ? { id: 'clear-query', label: 'Limpar busca digitada', onClick: () => { setQuery(''); safeSetPage(1); } }
      : null,
  ].filter(Boolean) as { id: string; label: string; onClick: () => void }[];

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
            <button type="button" onClick={saveCurrentView} className="btn-secondary gap-2 px-4 py-3 text-sm">
              <Sparkles className="h-4 w-4" />
              Salvar recorte
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
            <p className="text-[11px] uppercase tracking-[0.18em] text-white/50">Fotos reais</p>
            <p className="mt-3 text-2xl font-black text-white">{realPhotoCount}</p>
            <p className="mt-1 text-xs text-white/60">{verifiedCount} com foto ou render fiel</p>
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

        {recentSearches.length > 0 ? (
          <div className="mt-4">
            <p className="text-xs uppercase tracking-[0.18em] text-white/45">Buscas recentes que deram resultado</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {recentSearches.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => {
                    setQuery(item);
                    safeSetPage(1);
                  }}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white/75 transition hover:border-cyan-300/25 hover:text-cyan-100"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {savedViews.length > 0 ? (
          <div className="mt-4">
            <p className="text-xs uppercase tracking-[0.18em] text-white/45">Vitrines salvas</p>
            <div className="mt-2 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
              {savedViews.map((view) => (
                <Link key={view.id} href={view.path} className="rounded-[18px] border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/78 transition hover:border-cyan-300/25 hover:text-cyan-100">
                  <p className="font-semibold">{view.label}</p>
                  <p className="mt-1 text-xs text-white/50">{view.count} itens nesse recorte</p>
                </Link>
              ))}
            </div>
          </div>
        ) : null}

        {activeFilterChips.length > 0 ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {activeFilterChips.map((chip) => (
              <button
                key={chip.id}
                type="button"
                onClick={chip.clear}
                className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-2 text-xs font-semibold text-cyan-100 transition hover:border-cyan-300/35 hover:bg-cyan-300/15"
              >
                {chip.label}
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
            ))}
          </div>
        ) : null}

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
          <span>{realPhotoCount} foto real</span>
          <span className="h-1 w-1 rounded-full bg-white/30" />
          <span>{verifiedCount} validados</span>
          <span className="h-1 w-1 rounded-full bg-white/30" />
          <span>Página {currentPage} de {totalPages}</span>
          <span className="h-1 w-1 rounded-full bg-white/30" />
          <span>Busca ativa: {deferredQuery || 'tudo'}</span>
        </div>
      </div>

      {filtered.length > 0 ? (
        <div className="grid gap-4 xl:grid-cols-[1.12fr_0.88fr]">
          <div className="glass-panel rounded-[24px] border border-white/10 bg-black/20 p-4">
            <div className="mb-4 flex items-center gap-2">
              <Target className="h-4 w-4 text-cyan-100" />
              <p className="text-sm font-semibold text-cyan-100">Sugestões inteligentes da seleção</p>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {smartSpotlights.map((spotlight) => (
                <article key={spotlight.id} className="rounded-[20px] border border-white/10 bg-white/5 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] ${spotlight.accent}`}>
                        {spotlight.badge}
                      </p>
                      <h3 className="mt-3 text-lg font-bold text-white">{spotlight.title}</h3>
                    </div>
                    <BadgeCheck className="h-4 w-4 text-cyan-100/80" />
                  </div>
                  <p className="mt-3 text-sm leading-6 text-white/66">{spotlight.description}</p>
                  <div className="mt-4 rounded-[16px] border border-white/10 bg-black/20 p-3">
                    <p className="text-sm font-semibold text-white">{spotlight.product.name}</p>
                    <div className="mt-2 flex flex-wrap gap-2 text-xs text-white/58">
                      <span>{formatCurrency(spotlight.product.pricePix)}</span>
                      <span>•</span>
                      <span>{spotlight.product.productionWindow}</span>
                      <span>•</span>
                      <span>{spotlight.product.material}</span>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between gap-3">
                    <Link
                      href={getProductUrl(spotlight.product)}
                      onClick={() => addRecent(spotlight.product.id)}
                      className="btn-secondary px-4 py-2 text-sm"
                    >
                      Abrir produto
                    </Link>
                    <a
                      href={buildWhatsAppQuote(spotlight.product, quantity)}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-100 transition hover:text-emerald-50"
                    >
                      Pedir no WhatsApp
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="glass-panel rounded-[24px] border border-white/10 bg-black/20 p-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-emerald-100" />
              <p className="text-sm font-semibold text-emerald-100">Leitura comercial da vitrine</p>
            </div>
            <h3 className="mt-4 text-2xl font-black text-white">
              {purchaseIntent === 'Geral' ? 'A seleção está pronta para virar atendimento ou checkout.' : `Foco atual: ${purchaseIntent}.`}
            </h3>
            <p className="mt-4 text-sm leading-7 text-white/68">{selectionNarrative}</p>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <div className="surface-stat rounded-[18px] px-4 py-4">
                <p className="text-[11px] uppercase tracking-[0.16em] text-white/50">Seleção para WhatsApp</p>
                <p className="mt-2 text-lg font-black text-white">{Math.min(filtered.length, 6)} itens</p>
              </div>
              <div className="surface-stat rounded-[18px] px-4 py-4">
                <p className="text-[11px] uppercase tracking-[0.16em] text-white/50">Simulação</p>
                <p className="mt-2 text-lg font-black text-white">{quantity} unidade(s)</p>
              </div>
              <div className="surface-stat rounded-[18px] px-4 py-4">
                <p className="text-[11px] uppercase tracking-[0.16em] text-white/50">Economia em lote</p>
                <p className="mt-2 text-lg font-black text-white">{Math.round(bundleDiscount * 100)}%</p>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {Array.from(new Set(filtered.slice(0, 10).map((item) => item.category))).slice(0, 4).map((label) => (
                <span key={label} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/72">
                  {label}
                </span>
              ))}
            </div>

            <div className="mt-6 grid gap-3">
              <a href={selectionWhatsAppUrl} target="_blank" rel="noreferrer" className="btn-whatsapp justify-center gap-2">
                <MessageCircleMore className="h-4 w-4" />
                Mandar seleção no WhatsApp
              </a>
              <div className="grid gap-3 sm:grid-cols-2">
                <button type="button" onClick={copyShareLink} className="btn-secondary justify-center gap-2">
                  <Copy className="h-4 w-4" />
                  {shareCopied ? 'Link copiado' : 'Copiar seleção'}
                </button>
                <Link href="/imagem-para-impressao-3d" className="btn-glass justify-center gap-2">
                  <ChevronRight className="h-4 w-4" />
                  Pedir sob medida
                </Link>
              </div>
            </div>
          </div>
        </div>
      ) : null}

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
                <div className="mt-3 flex items-center justify-between gap-3">
                  <Link href={getProductUrl(product)} onClick={() => addRecent(product.id)} className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-100 transition hover:text-cyan-50">
                    Abrir item
                  </Link>
                  <a href={buildWhatsAppQuote(product, quantity)} target="_blank" rel="noreferrer" className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-100 transition hover:text-emerald-50">
                    Pedir
                  </a>
                </div>
              </article>
            ))}
          </div>
        </div>
      ) : null}

      {favoriteProducts.length > 0 || recentProducts.length > 0 ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="glass-panel rounded-[20px] border border-white/10 bg-black/20 p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-white/55">
                <Heart className="h-3.5 w-3.5 text-amber-200" />
                Favoritos
              </p>
              {favoriteProducts.length > 0 ? (
                <a href={favoritesWhatsAppUrl} target="_blank" rel="noreferrer" className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-100 transition hover:text-emerald-50">
                  Enviar favoritos
                </a>
              ) : null}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
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
            <div className="flex items-center justify-between gap-3">
              <p className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-white/55">
                <History className="h-3.5 w-3.5 text-cyan-100" />
                Vistos recentemente
              </p>
              {recentProducts.length > 0 ? (
                <button
                  type="button"
                  onClick={() => setRecentIds([])}
                  className="text-xs font-semibold uppercase tracking-[0.16em] text-white/52 transition hover:text-white/80"
                >
                  Limpar
                </button>
              ) : null}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
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
        {visibleItems.map((product, index) => {
          const isFavorite = favoriteIds.includes(product.id);
          const isCompared = compareIds.includes(product.id);
          const urgency = getStockUrgency(product);
          const subtotal = product.pricePix * quantity;
          const total = subtotal * (1 - bundleDiscount);
          const savings = subtotal - total;

          return (
            <article
              key={product.id}
              className={`catalog-product-card group relative overflow-hidden rounded-[28px] border p-5 transition-all duration-500 ${
                isProductRealPhoto(product)
                  ? 'border-emerald-300/18 bg-card hover:border-emerald-200/45'
                  : isProductVisualVerified(product)
                  ? 'border-white/10 bg-card hover:border-cyan-200/45'
                  : 'border-amber-300/20 bg-[linear-gradient(180deg,rgba(245,158,11,0.10),rgba(255,255,255,0.03))] hover:border-amber-300/40'
              }`}
              role="link"
              tabIndex={0}
              aria-label={`Abrir ${product.name}`}
              onClick={(event) => {
                if (shouldIgnoreCardActivation(event.target)) return;
                openProduct(product);
              }}
              onKeyDown={(event) => {
                if (shouldIgnoreCardActivation(event.target)) return;
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  openProduct(product);
                }
              }}
            >
              <div className="pointer-events-none absolute inset-0 rounded-[28px] border border-cyan-200/0 transition-colors duration-500 group-hover:border-cyan-200/25" />
              <ProductImageGallery product={product} compact priority={index < 2} />

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
          {rescueActions.length > 0 ? (
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              {rescueActions.map((action) => (
                <button key={action.id} type="button" onClick={action.onClick} className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-xs font-semibold text-cyan-100 transition hover:border-cyan-300/35 hover:bg-cyan-300/15">
                  {action.label}
                </button>
              ))}
            </div>
          ) : null}
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
          {paginationItems.map((item) =>
            typeof item === 'string' ? (
              <span key={item} className="px-2 text-sm font-semibold text-white/45">
                ...
              </span>
            ) : (
              <button
                key={item}
                onClick={() => safeSetPage(item)}
                className={`rounded-full border px-4 py-2 text-sm font-semibold ${
                  currentPage === item ? 'border-cyan-300/35 bg-cyan-300/12 text-cyan-50' : 'border-white/10 bg-white/5 text-white/75'
                }`}
              >
                {item}
              </button>
            )
          )}
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
