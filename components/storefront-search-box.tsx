"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowUpRight, Clock3, Search } from "lucide-react";

export type StorefrontSearchProduct = {
  id: string;
  name: string;
  category: string;
  collection: string;
  tags: string[];
  href: string;
};

type StorefrontSearchBoxProps = {
  products: StorefrontSearchProduct[];
  actionPath?: string;
  placeholder?: string;
  quickQueries?: string[];
  compact?: boolean;
};

type SearchSuggestion =
  | { id: string; type: "recent"; label: string; helper: string }
  | { id: string; type: "query"; label: string; helper: string }
  | { id: string; type: "product"; label: string; helper: string; href: string };

const RECENT_SEARCHES_KEY = "mdh_storefront_recent_searches_v2";

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function readRecentSearches() {
  if (typeof window === "undefined") return [] as string[];
  try {
    const raw = window.localStorage.getItem(RECENT_SEARCHES_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((item) => typeof item === "string") : [];
  } catch {
    return [] as string[];
  }
}

function persistRecentSearch(term: string, current: string[]) {
  if (typeof window === "undefined") return;
  const next = [term, ...current.filter((item) => item !== term)].slice(0, 6);
  window.localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(next));
}

function productMatchesQuery(product: StorefrontSearchProduct, query: string) {
  const haystack = normalizeText([product.name, product.category, product.collection, ...product.tags].join(" "));
  return haystack.includes(query);
}

export function StorefrontSearchBox({
  products,
  actionPath = "/busca",
  placeholder = "Busque por chaveiro, suporte, luminaria ou lote...",
  quickQueries = [],
  compact = false,
}: StorefrontSearchBoxProps) {
  const router = useRouter();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const normalizedQuery = normalizeText(query);

  useEffect(() => {
    setRecentSearches(readRecentSearches());
  }, []);

  useEffect(() => {
    function handlePointer(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointer);
    return () => document.removeEventListener("mousedown", handlePointer);
  }, []);

  const suggestions = useMemo(() => {
    const items: SearchSuggestion[] = [];
    const recentMatches = recentSearches
      .filter((item) => !normalizedQuery || normalizeText(item).includes(normalizedQuery))
      .slice(0, normalizedQuery ? 3 : 4);

    recentMatches.forEach((item) => {
      items.push({
        id: `recent-${item}`,
        type: "recent",
        label: item,
        helper: "Busca recente",
      });
    });

    if (!normalizedQuery) {
      return items;
    }

    if (!recentMatches.some((item) => normalizeText(item) === normalizedQuery)) {
      items.push({
        id: `query-${normalizedQuery}`,
        type: "query",
        label: query.trim(),
        helper: "Buscar no catalogo",
      });
    }

    products
      .filter((product) => productMatchesQuery(product, normalizedQuery))
      .slice(0, 6)
      .forEach((product) => {
        items.push({
          id: `product-${product.id}`,
          type: "product",
          label: product.name,
          helper: `${product.category} • ${product.collection}`,
          href: product.href,
        });
      });

    return items.slice(0, 8);
  }, [normalizedQuery, products, query, recentSearches]);

  function goToSearch(term: string) {
    const trimmed = term.trim();
    if (!trimmed) return;
    persistRecentSearch(trimmed, recentSearches);
    setRecentSearches((current) => [trimmed, ...current.filter((item) => item !== trimmed)].slice(0, 6));
    setOpen(false);
    router.push(`${actionPath}?q=${encodeURIComponent(trimmed)}`);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    goToSearch(query);
  }

  const shellClass = compact
    ? "rounded-[18px] border border-white/10 bg-black/25 p-2"
    : "rounded-[24px] border border-white/10 bg-white/[0.06] p-2 shadow-[0_18px_48px_rgba(2,8,23,0.26)]";

  return (
    <div ref={rootRef} className="relative">
      <form onSubmit={handleSubmit} className={shellClass}>
        <div className="flex flex-col gap-2 sm:flex-row">
          <label className="flex min-h-14 flex-1 items-center gap-3 rounded-[18px] bg-black/25 px-4">
            <Search className="h-5 w-5 text-emerald-100" />
            <span className="sr-only">Buscar no catalogo da MDH 3D</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onFocus={() => setOpen(true)}
              placeholder={placeholder}
              className="w-full bg-transparent text-base text-white outline-none placeholder:text-white/42"
              autoComplete="off"
              name="q"
            />
          </label>
          <button type="submit" className="btn-primary min-h-14 justify-center px-5">
            Buscar
          </button>
        </div>
      </form>

      {open && suggestions.length > 0 ? (
        <div className="absolute inset-x-0 top-full z-30 mt-2 overflow-hidden rounded-[20px] border border-white/10 bg-[#08131b] shadow-[0_24px_64px_rgba(2,8,23,0.42)]">
          <div className="max-h-[360px] overflow-y-auto p-2">
            {suggestions.map((suggestion) =>
              suggestion.type === "product" ? (
                <Link
                  key={suggestion.id}
                  href={suggestion.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-between gap-3 rounded-[16px] px-4 py-3 text-left transition hover:bg-white/[0.06]"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-white">{suggestion.label}</p>
                    <p className="mt-1 truncate text-xs text-white/52">{suggestion.helper}</p>
                  </div>
                  <ArrowUpRight className="h-4 w-4 shrink-0 text-cyan-100" />
                </Link>
              ) : (
                <button
                  key={suggestion.id}
                  type="button"
                  onClick={() => goToSearch(suggestion.label)}
                  className="flex w-full items-center gap-3 rounded-[16px] px-4 py-3 text-left transition hover:bg-white/[0.06]"
                >
                  <Clock3 className="h-4 w-4 shrink-0 text-white/38" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-white">{suggestion.label}</p>
                    <p className="mt-1 truncate text-xs text-white/52">{suggestion.helper}</p>
                  </div>
                </button>
              )
            )}
          </div>
        </div>
      ) : null}

      {quickQueries.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {quickQueries.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => goToSearch(item)}
              className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-2 text-xs font-semibold text-white/78 transition hover:border-cyan-300/25 hover:text-cyan-100"
            >
              {item}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
