"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { Bookmark, Bot, Heart, History, LogOut, Scale, Search, ShoppingBag, User } from "lucide-react";
import { brand, socialLinks, whatsappNumber } from "@/lib/constants";
import { Modal } from "@/components/modal";
import { AuthModal } from "@/components/auth-modal";
import { useAuth } from "@/components/auth-context";
import { useCompatibility } from "@/components/compatibility-context";
import { useCompare } from "@/components/compare-context";
import { useFavorites } from "@/components/favorites-context";
import { useRecentlyViewed } from "@/components/recently-viewed-context";
import { useSavedSearches } from "@/components/saved-searches-context";

const navLinks = [
  { href: "/catalogo", label: "Catalogo" },
  { href: "/favoritos", label: "Favoritos" },
  { href: "/recentes", label: "Recentes" },
  { href: "/buscas-salvas", label: "Buscas" },
  { href: "/compatibilidade", label: "Compatibilidade" },
  { href: "/configurador/nozzle-hotend", label: "Configurador" },
  { href: "/kits", label: "Kits" },
  { href: "/guias", label: "Guias" },
  { href: "/b2b", label: "B2B" },
  { href: "/suporte", label: "Suporte" },
];

function navClass(isActive: boolean) {
  return [
    "shrink-0 whitespace-nowrap rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] transition",
    isActive
      ? "border-slate-900 bg-slate-900 text-white"
      : "border-[#e5d4be] bg-white text-slate-700 hover:bg-[#fff3e2]",
  ].join(" ");
}

export function SiteHeader() {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(false);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { selectedModel, setSelectedModel } = useCompatibility();
  const { compareCount } = useCompare();
  const { favoriteCount } = useFavorites();
  const { recentIds } = useRecentlyViewed();
  const { savedSearchCount } = useSavedSearches();

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const personalCounts = useMemo(
    () => [
      { href: "/favoritos", icon: Heart, label: "Favoritos", count: favoriteCount },
      { href: "/recentes", icon: History, label: "Recentes", count: recentIds.length },
      { href: "/buscas-salvas", icon: Bookmark, label: "Buscas", count: savedSearchCount },
      { href: "/comparar", icon: Scale, label: "Comparar", count: compareCount },
    ],
    [compareCount, favoriteCount, recentIds.length, savedSearchCount]
  );
  const activeSection = useMemo(() => {
    const matched = navLinks.find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`));
    return matched?.label || (pathname === "/" ? "Início" : "Vitrine");
  }, [pathname]);

  return (
    <header
      className={`sticky top-0 z-50 overflow-x-hidden border-b border-[#e7d8c3] bg-[#fff8ef]/95 backdrop-blur-xl transition-all duration-500 ${
        isVisible ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0"
      }`}
    >
      <div className="border-b border-[#ecdcc7] bg-white/70">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-2 px-3 py-2 text-[10px] uppercase tracking-[0.16em] text-slate-600 sm:gap-3 sm:px-6 sm:text-[11px] sm:tracking-[0.2em]">
          <span>Curadoria real MDH 3D</span>
          <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:gap-3">
            <label className="inline-flex items-center gap-2 rounded-full border border-[#e5d4be] bg-white px-3 py-1 text-[10px] font-semibold text-slate-700">
              Modelo
              <select
                value={selectedModel}
                onChange={(event) => setSelectedModel(event.target.value as "A1 Mini" | "A1")}
                className="bg-transparent text-[10px] font-bold text-slate-900 outline-none"
                aria-label="Selecionar modelo de compatibilidade"
              >
                <option value="A1 Mini">A1 Mini</option>
                <option value="A1">A1</option>
              </select>
            </label>
            <span className="hidden md:inline">Pix com desconto, prova visual clara e suporte humano</span>
            <a
              href={socialLinks.instagram}
              target="_blank"
              rel="noreferrer"
              className="max-w-full truncate text-slate-700 transition hover:text-slate-900 sm:max-w-none"
            >
              @{brand.instagramHandle}
            </a>
          </div>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-7xl flex-wrap items-start justify-between gap-3 px-3 py-3 sm:items-center sm:gap-4 sm:px-6 sm:py-4">
        <Link href="/" className="flex min-w-0 flex-1 items-center gap-3 sm:flex-none">
          <Image
            src="/logo-mdh.jpg"
            alt="Logo MDH 3D"
            width={48}
            height={48}
            className="rounded-2xl border border-[#e9dcc8] object-cover"
          />
          <div className="min-w-0">
            <p className="text-lg font-bold tracking-[0.12em] text-slate-900">MDH 3D</p>
            <p className="truncate text-xs text-slate-600">Vitrine técnica com foco em peça real, decisão rápida e fechamento claro</p>
          </div>
        </Link>

        <form
          action="/catalogo"
          className="hidden min-w-[320px] flex-1 items-center rounded-full border border-[#e7d8c3] bg-white px-4 py-3 lg:flex lg:max-w-xl"
        >
          <Search className="h-4 w-4 text-slate-400" />
          <input
            type="search"
            name="q"
            placeholder="Busque por SKU, PN, personagem, tema, acabamento ou sintoma..."
            className="ml-3 w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
          />
          <button type="submit" className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white">
            Buscar
          </button>
        </form>

        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:flex-nowrap sm:justify-end">
          <button
            onClick={() => setIsAssistantOpen(true)}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-[#e5d4be] bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-[#fff3e2] sm:flex-none"
          >
            <Bot className="h-4 w-4" />
            Assistente
          </button>
          <a
            href={`https://wa.me/${whatsappNumber}`}
            className="hidden rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 sm:inline-flex"
          >
            WhatsApp
          </a>
          {user ? (
            <button
              onClick={signOut}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-[#e5d4be] bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-[#fff3e2] sm:flex-none"
            >
              <LogOut className="h-4 w-4" />
              Sair
            </button>
          ) : (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-[#e5d4be] bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-[#fff3e2] sm:flex-none"
            >
              <User className="h-4 w-4" />
              Entrar
            </button>
          )}
          <Link
            href="/conta"
            className="hidden rounded-full border border-[#e5d4be] bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-[#fff3e2] lg:inline-flex"
          >
            Minha conta
          </Link>
          <Link
            href="/checkout"
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 sm:flex-none"
          >
            <ShoppingBag className="h-4 w-4" />
            Checkout
          </Link>
        </div>
      </div>

      <div className="mx-auto w-full max-w-7xl px-3 pb-3 lg:hidden">
        <form action="/catalogo" className="flex items-center rounded-full border border-[#e7d8c3] bg-white px-4 py-3">
          <Search className="h-4 w-4 text-slate-400" />
          <input
            type="search"
            name="q"
            placeholder="SKU, personagem, tema, material..."
            className="ml-3 w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
          />
          <button type="submit" className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white">
            Buscar
          </button>
        </form>
      </div>

      <div className="mx-auto grid w-full max-w-7xl gap-2 px-3 pb-3 sm:px-6 lg:grid-cols-[minmax(0,1fr)_auto]">
        <div className="flex min-w-max items-center gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <Link href="/" className={navClass(pathname === "/")}>
            Inicio
          </Link>
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className={navClass(pathname === link.href || pathname.startsWith(`${link.href}/`))}>
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex min-w-max items-center gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {personalCounts.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="inline-flex items-center gap-2 rounded-full border border-[#e5d4be] bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-700"
              >
                <Icon className="h-3.5 w-3.5" />
                {item.label} {item.count ? `(${item.count})` : ""}
              </Link>
            );
          })}
        </div>
      </div>

      <div className="border-t border-[#ecdcc7] bg-white/60">
        <div className="mx-auto grid w-full max-w-7xl gap-2 px-3 py-2 text-[11px] text-slate-600 sm:grid-cols-[1fr_1fr_1fr_auto] sm:px-6">
          <span>Pronta entrega destacada nas vitrines</span>
          <span>Foto real e conceitual sempre separadas</span>
          <span>Atalhos para favoritos, recentes e buscas salvas</span>
          <span className="font-semibold text-slate-800">Área atual: {activeSection}</span>
        </div>
      </div>

      <div className="border-t border-[#f0e5d6] bg-[#fff8ef]">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center gap-2 px-3 py-2 text-[11px] text-slate-600 sm:px-6">
          <span className="font-semibold uppercase tracking-[0.14em] text-slate-500">Sugestões de busca</span>
          {["foto real", "chibi", "organizador", "presente", "pronta entrega"].map((item) => (
            <Link
              key={item}
              href={`/catalogo?q=${encodeURIComponent(item)}`}
              className="rounded-full border border-[#e5d4be] bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-700 transition hover:bg-[#fff3e2]"
            >
              {item}
            </Link>
          ))}
        </div>
      </div>

      <Modal isOpen={isAssistantOpen} onClose={() => setIsAssistantOpen(false)} title="Assistente MDH">
        <div className="p-6">
          <p className="text-sm leading-7 text-slate-700">
            Use o assistente para validar compatibilidade, montar uma rota de compra rápida e decidir entre itens com foto real, prazo e preço Pix.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link
              href="/configurador/nozzle-hotend"
              className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-white"
            >
              Abrir configurador
            </Link>
            <Link
              href="/buscas-salvas"
              className="rounded-full border border-[#e5d4be] bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-700"
            >
              Ver buscas salvas
            </Link>
          </div>
        </div>
      </Modal>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </header>
  );
}
