"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import {
  ChevronDown,
  Menu,
  MessageCircleMore,
  Minus,
  Plus,
  Search,
  ShoppingBag,
  Trash2,
  UserRound,
  X
} from "lucide-react";
import { ProductMediaImage } from "@/components/product-media-image";
import { categories, getProductUrl, type Product } from "@/lib/catalog";
import { useCart } from "@/components/cart-provider";
import { brand, socialLinks, whatsappMessage, whatsappNumber } from "@/lib/constants";
import { trackEvent, trackWhatsAppClick } from "@/lib/analytics-client";
import { formatCurrency } from "@/lib/utils";

const links = [
  { href: "/", label: "Início" },
  { href: "/catalogo", label: "Catálogo" },
  { href: "/entregas", label: "Frete & prazo" },
  { href: "/faq", label: "Duvidas" },
  { href: "/divulgacao", label: "Parcerias" }
];

function buildCatalogHref(query: string, category?: string) {
  const params = new URLSearchParams();

  if (query) params.set("q", query);
  if (category) params.set("category", category);

  const queryString = params.toString();
  return queryString ? `/catalogo?${queryString}` : "/catalogo";
}

type SiteHeaderClientProps = {
  customer?: {
    fullName: string;
    email: string;
  } | null;
};

export function SiteHeaderClient({ customer = null }: SiteHeaderClientProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryParam = searchParams.get("q") || "";
  const categoryParam = searchParams.get("category") || "";
  const [query, setQuery] = useState(queryParam);
  const [categoryMenuOpen, setCategoryMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState<Product[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
  const categoryMenuRef = useRef<HTMLDivElement | null>(null);
  const searchRef = useRef<HTMLDivElement | null>(null);
  const cartCloseButtonRef = useRef<HTMLButtonElement | null>(null);
  const mobileNavCloseButtonRef = useRef<HTMLButtonElement | null>(null);
  const cartLastFocusedRef = useRef<HTMLElement | null>(null);
  const mobileNavLastFocusedRef = useRef<HTMLElement | null>(null);
  const { items, count, hydrated, clearCart, removeItem, updateQuantity, subtotalPix, subtotalCard } = useCart();

  useEffect(() => {
    setQuery(queryParam);
  }, [queryParam]);

  useEffect(() => {
    if (query.trim().length < 2) {
      setSearchSuggestions([]);
      setSearchOpen(false);
      setSearchLoading(false);
      setActiveSuggestionIndex(-1);
      return;
    }

    const controller = new AbortController();
    const timeoutId = window.setTimeout(async () => {
      setSearchLoading(true);
      try {
        const response = await fetch(`/api/catalog/search?q=${encodeURIComponent(query.trim())}`, {
          signal: controller.signal
        });
        const data = await response.json();
        setSearchSuggestions(Array.isArray(data?.items) ? data.items : []);
        setSearchOpen(true);
        setActiveSuggestionIndex(-1);
      } catch {
        setSearchSuggestions([]);
        setActiveSuggestionIndex(-1);
      } finally {
        setSearchLoading(false);
      }
    }, 180);

    return () => {
      controller.abort();
      window.clearTimeout(timeoutId);
      setSearchLoading(false);
    };
  }, [query]);

  useEffect(() => {
    if (!categoryMenuOpen) return;

    function handlePointerDown(event: MouseEvent) {
      if (!categoryMenuRef.current?.contains(event.target as Node)) {
        setCategoryMenuOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setCategoryMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [categoryMenuOpen]);

  useEffect(() => {
    if (!searchOpen) return;

    function handlePointerDown(event: MouseEvent) {
      if (!searchRef.current?.contains(event.target as Node)) {
        setSearchOpen(false);
        setActiveSuggestionIndex(-1);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [searchOpen]);

  useEffect(() => {
    if (!cartOpen) return;

    const previousOverflow = document.body.style.overflow;
    cartLastFocusedRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setCartOpen(false);
      }
    }

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);
    window.setTimeout(() => cartCloseButtonRef.current?.focus(), 0);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      window.setTimeout(() => cartLastFocusedRef.current?.focus(), 0);
    };
  }, [cartOpen]);

  useEffect(() => {
    if (!mobileNavOpen) return;

    const previousOverflow = document.body.style.overflow;
    mobileNavLastFocusedRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMobileNavOpen(false);
      }
    }

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);
    window.setTimeout(() => mobileNavCloseButtonRef.current?.focus(), 0);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      window.setTimeout(() => mobileNavLastFocusedRef.current?.focus(), 0);
    };
  }, [mobileNavOpen]);

  const whatsappHref = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

  const cartLines = useMemo(() => items, [items]);

  const cartWhatsappHref = useMemo(() => {
    if (!cartLines.length) return whatsappHref;

    const lines = cartLines
      .map(
        (entry) =>
          `- ${entry.snapshot.name} x${entry.quantity} (${formatCurrency(entry.snapshot.pricePix)} no Pix cada)`
      )
      .join("\n");

    const message = `Oi! Separei estes itens no site da ${brand.name}:\n\n${lines}\n\nTotal estimado no Pix: ${formatCurrency(
      subtotalPix
    )}\nPode continuar comigo por aqui?`;

    return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
  }, [cartLines, subtotalPix, whatsappHref]);

  const allProductsHref = buildCatalogHref(queryParam);
  const activeSuggestion =
    activeSuggestionIndex >= 0 && activeSuggestionIndex < searchSuggestions.length
      ? searchSuggestions[activeSuggestionIndex]
      : null;

  function handleSearchKeyDown(event: ReactKeyboardEvent<HTMLInputElement>) {
    if (!searchOpen || (!searchSuggestions.length && !searchLoading)) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveSuggestionIndex((current) => {
        const next = current + 1;
        return next >= searchSuggestions.length ? 0 : next;
      });
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveSuggestionIndex((current) => {
        if (current <= 0) return searchSuggestions.length - 1;
        return current - 1;
      });
      return;
    }

    if (event.key === "Escape") {
      setSearchOpen(false);
      setActiveSuggestionIndex(-1);
      return;
    }

    if (event.key === "Enter" && activeSuggestion) {
      event.preventDefault();
      setSearchOpen(false);
      window.location.assign(getProductUrl(activeSuggestion));
    }
  }

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
        <div className="border-b border-white/10 bg-[linear-gradient(90deg,rgba(16,185,129,0.16),rgba(34,211,238,0.16),rgba(251,191,36,0.16))]">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-2 text-[11px] uppercase tracking-[0.22em] text-white/70 sm:px-6">
            <span>Loja oficial MDH 3D</span>
            <span className="hidden md:inline">Pix com melhor preço</span>
            <span className="hidden lg:inline">Presentes, setup e personalizados com atendimento rapido</span>
            <a href={socialLinks.instagram} target="_blank" rel="noreferrer" className="text-cyan-100 transition hover:text-white">
              @{brand.instagramHandle}
            </a>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid gap-4 py-4 lg:grid-cols-[auto_minmax(0,1fr)_auto] lg:items-center">
            <Link href="/" className="flex min-w-0 items-center gap-3">
              <Image src="/logo-mdh.jpg" alt="Logo MDH 3D" width={50} height={50} className="rounded-2xl border border-white/10 object-cover" />
              <div className="min-w-0">
                <p className="truncate text-lg font-semibold tracking-[0.18em] text-white">MDH 3D</p>
                <p className="truncate text-xs text-white/55">presentes criativos, setup, decoracao e pecas sob encomenda</p>
              </div>
            </Link>

            <div className="relative" ref={searchRef}>
              <form
                action="/catalogo"
                onSubmit={() => {
                  trackEvent("search", {
                    source: "header",
                    query,
                    category: categoryParam || "all"
                  });
                  setSearchOpen(false);
                }}
                className="group flex items-center rounded-full border border-white/12 bg-white/5 px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] transition focus-within:border-cyan-300/40 focus-within:bg-white/8"
              >
                <Search className="h-4 w-4 text-white/45" />
                <input
                  type="search"
                  name="q"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  onFocus={() => setSearchOpen(searchSuggestions.length > 0)}
                  onKeyDown={handleSearchKeyDown}
                  placeholder="Busque por anime, suporte, vaso, organizador..."
                  className="ml-3 w-full bg-transparent text-sm text-white outline-none placeholder:text-white/35"
                  aria-label="Buscar no catálogo"
                  aria-expanded={searchOpen}
                  aria-controls="header-search-suggestions"
                  aria-activedescendant={activeSuggestion ? `header-search-option-${activeSuggestion.id}` : undefined}
                  autoComplete="off"
                />
                {categoryParam ? <input type="hidden" name="category" value={categoryParam} /> : null}
                <button
                  type="submit"
                  className="ml-3 rounded-full border border-cyan-400/25 bg-cyan-400/12 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-100 transition hover:border-cyan-300/55 hover:bg-cyan-300/18"
                >
                  Buscar
                </button>
              </form>

              {searchOpen ? (
                <div
                  id="header-search-suggestions"
                  role="listbox"
                  className="absolute left-0 right-0 top-[calc(100%+0.75rem)] z-20 overflow-hidden rounded-[28px] border border-white/10 bg-slate-950/95 p-3 shadow-2xl backdrop-blur-xl"
                >
                  <div className="mb-3 flex items-center justify-between px-2">
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-white/45">Sugestões de busca</p>
                      <p className="mt-1 text-xs text-white/40">Tente por tema, tipo de presente, utilidade ou ambiente.</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {["anime", "geek", "presente", "decoração"].map((scope) => (
                        <button
                          key={scope}
                          type="button"
                          onClick={() => setQuery(scope)}
                          className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] text-white/70"
                        >
                          {scope}
                        </button>
                      ))}
                    </div>
                  </div>

                  {searchLoading ? (
                    <div className="grid gap-2" aria-live="polite">
                      {[0, 1, 2].map((item) => (
                        <div key={item} className="flex items-center gap-3 rounded-[22px] border border-white/10 bg-white/5 p-3">
                          <div className="h-14 w-14 animate-pulse rounded-2xl bg-white/10" />
                          <div className="flex-1 space-y-2">
                            <div className="h-4 w-2/3 animate-pulse rounded-full bg-white/10" />
                            <div className="h-3 w-1/2 animate-pulse rounded-full bg-white/10" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : searchSuggestions.length ? (
                    <div className="grid gap-2">
                      {searchSuggestions.map((product, index) => (
                        <Link
                          key={product.id}
                          id={`header-search-option-${product.id}`}
                          href={getProductUrl(product)}
                          onClick={() => {
                            trackEvent("search", {
                              source: "header_typeahead",
                              query,
                              productId: product.id,
                              category: product.category
                            });
                            setSearchOpen(false);
                            setActiveSuggestionIndex(-1);
                          }}
                          role="option"
                          aria-selected={activeSuggestionIndex === index}
                          className={`flex items-center gap-3 rounded-[22px] border bg-white/5 p-3 transition hover:border-cyan-300/35 ${
                            activeSuggestionIndex === index ? "border-cyan-300/35" : "border-white/10"
                          }`}
                        >
                          <ProductMediaImage product={product} className="h-14 w-14 rounded-2xl object-cover" />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-white">{product.name}</p>
                            <p className="mt-1 text-xs text-white/50">
                              {product.category} • {formatCurrency(product.pricePix)} no Pix
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-[22px] border border-dashed border-white/10 bg-black/20 px-4 py-4 text-sm text-white/55">
                      Ainda nao apareceu uma sugestao boa para esse termo. Abra o catalogo completo e refine pela selecao da loja.
                    </div>
                  )}
                </div>
              ) : null}
            </div>

            <div className="flex items-center justify-end gap-2 sm:gap-3">
              <Link
                href={customer ? "/conta" : "/login"}
                className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-3 text-sm font-medium text-white/78 transition hover:border-white/20 hover:text-white lg:inline-flex"
              >
                <UserRound className="h-4 w-4" />
                <span>{customer ? "Conta" : "Entrar"}</span>
              </Link>

              {!customer ? (
                <Link
                  href="/login?mode=register"
                  className="hidden items-center gap-2 rounded-full border border-cyan-400/25 bg-cyan-400/12 px-3 py-3 text-sm font-medium text-cyan-100 transition hover:border-cyan-300/55 hover:bg-cyan-300/18 xl:inline-flex"
                >
                  <UserRound className="h-4 w-4" />
                  <span>Cadastrar</span>
                </Link>
              ) : null}

              <Link
                href="/acompanhar-pedido"
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-3 text-sm font-medium text-white/78 transition hover:border-white/20 hover:text-white"
              >
                <UserRound className="h-4 w-4" />
                <span className="hidden xl:inline">Acompanhar</span>
              </Link>

              <button
                type="button"
                onClick={() => setCartOpen(true)}
                className="relative inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-3 text-sm font-medium text-white/85 transition hover:border-white/20 hover:text-white"
                aria-label="Abrir carrinho"
              >
                <ShoppingBag className="h-4 w-4" />
                <span className="hidden xl:inline">Carrinho</span>
                <span className="inline-flex min-w-6 items-center justify-center rounded-full bg-cyan-300 px-1.5 py-0.5 text-[11px] font-bold text-slate-950">
                  {hydrated ? count : 0}
                </span>
              </button>

              <a
                href={whatsappHref}
                target="_blank"
                rel="noreferrer"
                onClick={() => trackWhatsAppClick({ placement: "header_primary" })}
                className="inline-flex items-center gap-2 rounded-full border border-emerald-400/25 bg-emerald-400/14 px-3 py-3 text-sm font-semibold text-emerald-100 transition hover:border-emerald-300/55 hover:bg-emerald-300/18"
              >
                <MessageCircleMore className="h-4 w-4" />
                <span className="hidden md:inline">WhatsApp</span>
              </a>

              <button
                type="button"
                onClick={() => setMobileNavOpen(true)}
                className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 p-3 text-white/82 transition hover:text-white lg:hidden"
                aria-label="Abrir navegação"
              >
                <Menu className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 border-t border-white/10 py-3">
            <nav className="flex items-center gap-2 overflow-x-auto pb-1">
              <div className="relative" ref={categoryMenuRef}>
                <button
                  type="button"
                  onClick={() => setCategoryMenuOpen((current) => !current)}
                  className="inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-cyan-400/18 bg-cyan-400/10 px-4 py-2 text-sm font-semibold text-cyan-100 transition hover:border-cyan-300/40 hover:bg-cyan-300/12"
                >
                  Categorias
                  <ChevronDown className={`h-4 w-4 transition ${categoryMenuOpen ? "rotate-180" : ""}`} />
                </button>

                {categoryMenuOpen ? (
                  <div className="absolute left-0 top-[calc(100%+0.75rem)] z-10 w-[min(92vw,34rem)] rounded-[28px] border border-white/10 bg-slate-950/95 p-4 shadow-2xl backdrop-blur-xl">
                    <div className="mb-3 flex items-center justify-between">
                      <p className="text-xs uppercase tracking-[0.2em] text-white/45">Navegue por categoria</p>
                      <Link
                        href={allProductsHref}
                        onClick={() => setCategoryMenuOpen(false)}
                        className="text-sm font-medium text-cyan-100 transition hover:text-white"
                      >
                        Ver toda a colecao
                      </Link>
                    </div>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {categories.map((category) => (
                        <Link
                          key={category}
                          href={buildCatalogHref(queryParam, category)}
                          onClick={() => setCategoryMenuOpen(false)}
                          className={`rounded-2xl border px-4 py-3 text-sm transition ${
                            categoryParam === category
                              ? "border-cyan-300/50 bg-cyan-400/12 text-cyan-100"
                              : "border-white/10 bg-white/5 text-white/78 hover:border-white/20 hover:text-white"
                          }`}
                        >
                          {category}
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>

              {links.map((link) => {
                const active = pathname === link.href;

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`whitespace-nowrap rounded-full border px-4 py-2 text-sm transition ${
                      active
                        ? "border-white/20 bg-white/12 text-white"
                        : "border-white/10 bg-white/5 text-white/70 hover:border-white/20 hover:text-white"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
              <Link
                href="/acompanhar-pedido"
                className="hidden whitespace-nowrap rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70 transition hover:text-white md:inline-flex"
              >
                Pedido
              </Link>
            </nav>

            <div className="hidden items-center gap-2 lg:flex">
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs uppercase tracking-[0.18em] text-white/50">
                Curadoria MDH 3D
              </span>
              <span className="rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-2 text-xs uppercase tracking-[0.18em] text-amber-100">
                Pix com melhor valor
              </span>
            </div>
          </div>
        </div>
      </header>

      {cartOpen ? (
        <div className="fixed inset-0 z-[80] bg-slate-950/72 backdrop-blur-sm" onClick={() => setCartOpen(false)}>
          <aside
            role="dialog"
            aria-modal="true"
            aria-label="Carrinho"
            onClick={(event) => event.stopPropagation()}
            className="ml-auto flex h-full w-full max-w-xl flex-col border-l border-white/10 bg-[linear-gradient(180deg,rgba(9,14,28,0.98),rgba(3,7,18,0.98))] shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-5">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-cyan-200/80">Carrinho da loja</p>
                <h2 className="mt-2 text-2xl font-black text-white">{count} item(ns) escolhidos</h2>
              </div>
              <button
                ref={cartCloseButtonRef}
                type="button"
                onClick={() => setCartOpen(false)}
                className="rounded-full border border-white/10 bg-white/5 p-2 text-white/80 transition hover:text-white"
                aria-label="Fechar carrinho"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {cartLines.length ? (
              <>
                <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
                  {cartLines.map((entry) => (
                      <div key={entry.productId} className="rounded-[28px] border border-white/10 bg-white/5 p-4">
                      <div className="flex gap-4">
                        <Link href={getProductUrl(entry.snapshot)} onClick={() => setCartOpen(false)} className="shrink-0">
                          <ProductMediaImage
                            product={{
                              imagePath: entry.snapshot.imagePath,
                              name: entry.snapshot.name,
                              sku: entry.snapshot.sku,
                              category: entry.snapshot.category
                            }}
                            className="h-24 w-24 rounded-[20px] border border-white/10 object-cover"
                          />
                        </Link>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="text-xs uppercase tracking-[0.2em] text-cyan-200/75">{entry.snapshot.category}</p>
                              <Link
                                href={getProductUrl(entry.snapshot)}
                                onClick={() => setCartOpen(false)}
                                className="mt-1 block truncate text-lg font-semibold text-white transition hover:text-cyan-100"
                              >
                                {entry.snapshot.name}
                              </Link>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeItem(entry.productId)}
                              className="rounded-full border border-white/10 bg-white/5 p-2 text-white/55 transition hover:text-white"
                              aria-label={`Remover ${entry.snapshot.name}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>

                          <div className="mt-3 flex items-center justify-between gap-3">
                            <div>
                              <p className="text-xs text-white/45">Pix</p>
                              <p className="text-lg font-bold text-white">{formatCurrency(entry.snapshot.pricePix)}</p>
                            </div>

                            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-2 py-1">
                              <button
                                type="button"
                                onClick={() => updateQuantity(entry.productId, entry.quantity - 1)}
                                className="rounded-full p-1 text-white/70 transition hover:text-white"
                                aria-label={`Diminuir quantidade de ${entry.snapshot.name}`}
                              >
                                <Minus className="h-4 w-4" />
                              </button>
                              <span className="min-w-7 text-center text-sm font-semibold text-white">{entry.quantity}</span>
                              <button
                                type="button"
                                onClick={() => updateQuantity(entry.productId, entry.quantity + 1)}
                                className="rounded-full p-1 text-white/70 transition hover:text-white"
                                aria-label={`Aumentar quantidade de ${entry.snapshot.name}`}
                              >
                                <Plus className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-white/10 px-5 py-5">
                  <div className="rounded-[28px] border border-white/10 bg-white/5 p-5">
                    <div className="flex items-center justify-between text-sm text-white/65">
                      <span>Total estimado no Pix</span>
                      <span className="text-xl font-black text-white">{formatCurrency(subtotalPix)}</span>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-sm text-white/55">
                      <span>Total no cartão</span>
                      <span>{formatCurrency(subtotalCard)}</span>
                    </div>
                    <p className="mt-4 text-sm leading-6 text-white/55">
                      Feche pelo checkout ou leve essa selecao para o WhatsApp com a mensagem pronta, sem perder itens, valores e observacoes.
                    </p>

                    <div className="mt-5 grid gap-3">
                      <a
                        href={cartWhatsappHref}
                        target="_blank"
                        rel="noreferrer"
                        onClick={() => trackWhatsAppClick({ placement: "cart_drawer", itemCount: cartLines.length })}
                        className="inline-flex items-center justify-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/15 px-5 py-3 text-sm font-semibold text-emerald-100 transition hover:border-emerald-300/55 hover:bg-emerald-300/18"
                      >
                        <MessageCircleMore className="h-4 w-4" />
                        Enviar carrinho no WhatsApp
                      </a>

                      <div className="flex gap-3">
                        <Link
                          href="/carrinho"
                          onClick={() => setCartOpen(false)}
                          className="flex-1 rounded-full border border-white/10 bg-white/5 px-4 py-3 text-center text-sm font-semibold text-white/80 transition hover:text-white"
                        >
                          Abrir carrinho
                        </Link>
                        <button
                          type="button"
                          onClick={clearCart}
                          className="rounded-full border border-white/10 bg-black/20 px-4 py-3 text-sm font-semibold text-white/60 transition hover:text-white"
                        >
                          Limpar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-1 flex-col items-center justify-center px-5 text-center">
                <div className="rounded-full border border-white/10 bg-white/5 p-5">
                  <ShoppingBag className="h-8 w-8 text-cyan-200" />
                </div>
                <h2 className="mt-5 text-2xl font-black text-white">Carrinho vazio</h2>
                <p className="mt-3 max-w-sm text-sm leading-7 text-white/60">
                  Explore o catalogo, abra o quick view e monte sua selecao com calma antes de fechar o pedido.
                </p>
                <Link
                  href="/catalogo"
                  onClick={() => setCartOpen(false)}
                  className="mt-6 rounded-full border border-cyan-400/25 bg-cyan-400/12 px-5 py-3 text-sm font-semibold text-cyan-100 transition hover:border-cyan-300/55 hover:bg-cyan-300/18"
                >
                  Abrir catálogo
                </Link>
              </div>
            )}
          </aside>
        </div>
      ) : null}

      {mobileNavOpen ? (
        <div className="fixed inset-0 z-[78] bg-slate-950/78 backdrop-blur-sm lg:hidden" onClick={() => setMobileNavOpen(false)}>
          <aside
            role="dialog"
            aria-modal="true"
            aria-label="Navegação da loja"
            onClick={(event) => event.stopPropagation()}
            className="ml-auto flex h-full w-full max-w-sm flex-col border-l border-white/10 bg-[linear-gradient(180deg,rgba(9,14,28,0.98),rgba(3,7,18,0.98))] p-5 shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-cyan-200/80">Navegação</p>
                <h2 className="mt-2 text-2xl font-black text-white">Acesse a loja sem perder a compra</h2>
              </div>
              <button
                ref={mobileNavCloseButtonRef}
                type="button"
                onClick={() => setMobileNavOpen(false)}
                className="rounded-full border border-white/10 bg-white/5 p-2 text-white/80"
                aria-label="Fechar navegação"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-6 grid gap-2">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileNavOpen(false)}
                  className="rounded-[24px] border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white/84"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="mt-6 grid gap-2">
              <Link
                href={customer ? "/conta" : "/login"}
                onClick={() => setMobileNavOpen(false)}
                className="rounded-[24px] border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/78"
              >
                {customer ? "Minha conta" : "Entrar na conta"}
              </Link>
              {!customer ? (
                <Link
                  href="/login?mode=register"
                  onClick={() => setMobileNavOpen(false)}
                  className="rounded-[24px] border border-cyan-400/25 bg-cyan-400/12 px-4 py-3 text-sm font-semibold text-cyan-100"
                >
                  Criar conta
                </Link>
              ) : null}
              <Link
                href="/acompanhar-pedido"
                onClick={() => setMobileNavOpen(false)}
                className="rounded-[24px] border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/78"
              >
                Acompanhar pedido
              </Link>
              <Link
                href="/catalogo"
                onClick={() => setMobileNavOpen(false)}
                className="rounded-[24px] border border-cyan-400/25 bg-cyan-400/12 px-4 py-3 text-sm font-semibold text-cyan-100"
              >
                Abrir catálogo agora
              </Link>
              <a
                href={whatsappHref}
                target="_blank"
                rel="noreferrer"
                onClick={() => {
                  trackWhatsAppClick({ placement: "header_mobile_menu" });
                  setMobileNavOpen(false);
                }}
                className="rounded-[24px] border border-emerald-400/25 bg-emerald-400/14 px-4 py-3 text-sm font-semibold text-emerald-100"
              >
                Falar no WhatsApp
              </a>
            </div>

            <div className="mt-auto rounded-[28px] border border-white/10 bg-white/5 p-4 text-sm text-white/62">
              {customer
                ? `Sessao ativa para ${customer.fullName}. Sua conta ajuda a repetir pedidos e acompanhar compras sem perder o funil principal.`
                : "Presentes, utilidades e decoracao com compra guiada. A conta propria da loja e opcional para comprar, mas agiliza recompras e acompanhamento."}
            </div>
          </aside>
        </div>
      ) : null}
    </>
  );
}
