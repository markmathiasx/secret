"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Boxes,
  Command,
  Heart,
  Package,
  Search,
  Sparkles,
} from "lucide-react";
import { catalog, featuredCatalog, getProductUrl } from "@/lib/catalog";
import { catalogShortcutLinks, customerSegments } from "@/lib/constants";
import { useCustomerSession } from "@/lib/customer-session-client";
import { getMemberKey, listFavorites } from "@/lib/member-store";

type PaletteEntry = {
  id: string;
  label: string;
  href: string;
  note: string;
  group: string;
  icon: "route" | "product" | "favorite" | "segment";
};

const RECENT_KEY = "mdh_catalog_recent";

function readRecentIds() {
  if (typeof window === "undefined") return [] as string[];
  try {
    const raw = window.localStorage.getItem(RECENT_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((item) => typeof item === "string") : [];
  } catch {
    return [];
  }
}

const primaryRoutes: PaletteEntry[] = [
  {
    id: "route-catalog",
    label: "Abrir catálogo completo",
    href: "/catalogo",
    note: "explorar toda a vitrine",
    group: "Atalhos",
    icon: "route",
  },
  {
    id: "route-checkout",
    label: "Ir para checkout",
    href: "/checkout",
    note: "fechar pedido com pix ou cartão",
    group: "Atalhos",
    icon: "route",
  },
  {
    id: "route-custom",
    label: "Enviar STL ou referência",
    href: "/imagem-para-impressao-3d",
    note: "pedir peça sob medida",
    group: "Atalhos",
    icon: "route",
  },
  {
    id: "route-delivery",
    label: "Consultar entregas",
    href: "/entregas",
    note: "frete e prazo no Rio de Janeiro",
    group: "Atalhos",
    icon: "route",
  },
];

function getIcon(kind: PaletteEntry["icon"]) {
  if (kind === "product") return Package;
  if (kind === "favorite") return Heart;
  if (kind === "segment") return Boxes;
  return Sparkles;
}

export function HeaderCommandPalette() {
  const session = useCustomerSession();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [recentIds, setRecentIds] = useState<string[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);

  useEffect(() => {
    function handleKeydown(event: KeyboardEvent) {
      const isMetaK = (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k";
      const isSlash = event.key === "/" && !event.ctrlKey && !event.metaKey && !event.altKey;
      const target = event.target as HTMLElement | null;
      const isTyping =
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.tagName === "SELECT" ||
        target?.isContentEditable;

      if (isMetaK || (!isTyping && isSlash)) {
        event.preventDefault();
        setOpen((current) => !current);
      }

      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    setRecentIds(readRecentIds());
    const memberKey = getMemberKey({ id: session.user?.id, email: session.user?.email });
    setFavoriteIds(listFavorites(memberKey));
  }, [open, session.user?.email, session.user?.id]);

  const entries = useMemo(() => {
    const routeEntries = [
      ...primaryRoutes,
      ...catalogShortcutLinks.map((item) => ({
        id: `shortcut-${item.label}`,
        label: item.label,
        href: item.href,
        note: item.note,
        group: "Atalhos",
        icon: "route" as const,
      })),
      ...customerSegments.map((item) => ({
        id: `segment-${item.id}`,
        label: item.title,
        href: item.href,
        note: item.proof,
        group: "Entradas",
        icon: "segment" as const,
      })),
    ];

    const productEntries = featuredCatalog.slice(0, 10).map((product) => ({
      id: `product-${product.id}`,
      label: product.name,
      href: getProductUrl(product),
      note: `${product.category} • ${product.productionWindow}`,
      group: "Produtos em destaque",
      icon: "product" as const,
    }));

    const recentEntries = recentIds
      .map((id) => catalog.find((product) => product.id === id))
      .filter(Boolean)
      .slice(0, 6)
      .map((product) => ({
        id: `recent-${product!.id}`,
        label: product!.name,
        href: getProductUrl(product!),
        note: "visto recentemente",
        group: "Recentes",
        icon: "product" as const,
      }));

    const favoriteEntries = favoriteIds
      .map((id) => catalog.find((product) => product.id === id))
      .filter(Boolean)
      .slice(0, 6)
      .map((product) => ({
        id: `favorite-${product!.id}`,
        label: product!.name,
        href: getProductUrl(product!),
        note: "favoritado por você",
        group: "Favoritos",
        icon: "favorite" as const,
      }));

    return [...routeEntries, ...recentEntries, ...favoriteEntries, ...productEntries];
  }, [favoriteIds, recentIds]);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return entries;
    return entries.filter((entry) => `${entry.label} ${entry.note} ${entry.group}`.toLowerCase().includes(normalized));
  }, [entries, query]);

  const grouped = useMemo(() => {
    return filtered.reduce<Record<string, PaletteEntry[]>>((acc, entry) => {
      acc[entry.group] = acc[entry.group] || [];
      acc[entry.group].push(entry);
      return acc;
    }, {});
  }, [filtered]);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="btn-glass gap-2">
        <Search className="h-4 w-4" />
        Busca rápida
        <span className="rounded-full border border-white/10 bg-black/20 px-2 py-0.5 text-[11px] uppercase tracking-[0.16em] text-white/55">
          Ctrl K
        </span>
      </button>

      {open ? (
        <div className="fixed inset-0 z-[120] bg-slate-950/82 px-4 py-8 backdrop-blur-lg" onClick={() => setOpen(false)}>
          <div
            className="mx-auto max-w-4xl rounded-[32px] border border-white/12 bg-[linear-gradient(180deg,rgba(9,17,25,0.95),rgba(9,17,25,0.92))] p-5 shadow-[0_32px_80px_rgba(2,8,23,0.44)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center gap-3 rounded-[24px] border border-white/10 bg-white/5 px-4 py-3">
              <Search className="h-5 w-5 text-cyan-100" />
              <input
                autoFocus
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Busque produto, entrada de compra, checkout, entrega, STL..."
                className="w-full bg-transparent text-base text-white outline-none placeholder:text-white/35"
              />
              <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-white/50">
                <Command className="h-3.5 w-3.5" />
                esc fecha
              </span>
            </div>

            <div className="mt-4 max-h-[70vh] overflow-y-auto pr-1">
              {Object.entries(grouped).length > 0 ? (
                <div className="grid gap-5">
                  {Object.entries(grouped).map(([group, items]) => (
                    <section key={group}>
                      <p className="mb-3 text-xs uppercase tracking-[0.18em] text-cyan-100/75">{group}</p>
                      <div className="grid gap-2">
                        {items.map((entry) => {
                          const Icon = getIcon(entry.icon);
                          return (
                            <Link
                              key={entry.id}
                              href={entry.href}
                              onClick={() => setOpen(false)}
                              className="group flex items-center justify-between gap-4 rounded-[20px] border border-white/10 bg-white/5 px-4 py-4 transition hover:border-cyan-300/30 hover:bg-cyan-300/10"
                            >
                              <div className="flex min-w-0 items-center gap-3">
                                <span className="rounded-2xl border border-white/10 bg-black/20 p-3 text-cyan-100">
                                  <Icon className="h-4 w-4" />
                                </span>
                                <div className="min-w-0">
                                  <p className="truncate text-sm font-semibold text-white">{entry.label}</p>
                                  <p className="truncate text-xs text-white/55">{entry.note}</p>
                                </div>
                              </div>
                              <ArrowRight className="h-4 w-4 flex-shrink-0 text-white/35 transition group-hover:translate-x-1 group-hover:text-cyan-100" />
                            </Link>
                          );
                        })}
                      </div>
                    </section>
                  ))}
                </div>
              ) : (
                <div className="rounded-[24px] border border-white/10 bg-white/5 p-8 text-center">
                  <p className="text-sm uppercase tracking-[0.18em] text-cyan-100/75">Sem resultado</p>
                  <h3 className="mt-3 text-2xl font-black text-white">Nada bateu com essa busca rápida.</h3>
                  <p className="mt-3 text-sm leading-7 text-white/65">
                    Tente o nome de um produto, “Pix”, “entrega”, “STL”, “presente” ou “pronta entrega”.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
