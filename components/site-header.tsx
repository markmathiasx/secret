"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Bot, Search, ShoppingBag, User, LogOut, Scale } from "lucide-react";
import { brand, socialLinks, whatsappNumber } from "@/lib/constants";
import { Modal } from "@/components/modal";
import { AuthModal } from "@/components/auth-modal";
import { useAuth } from "@/components/auth-context";
import { useCompatibility } from "@/components/compatibility-context";
import { useCompare } from "@/components/compare-context";

const navLinks = [
  { href: "/catalogo", label: "Catalogo" },
  { href: "/compatibilidade", label: "Compatibilidade" },
  { href: "/configurador/nozzle-hotend", label: "Configurador" },
  { href: "/kits", label: "Kits" },
  { href: "/guias", label: "Guias" },
  { href: "/b2b", label: "B2B" },
  { href: "/suporte", label: "Suporte" },
];

export function SiteHeader() {
  const [isVisible, setIsVisible] = useState(false);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { selectedModel, setSelectedModel } = useCompatibility();
  const { compareIds } = useCompare();

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <header className={`sticky top-0 z-50 overflow-x-hidden border-b border-[#e7d8c3] bg-[#fff8ef]/95 backdrop-blur-xl transition-all duration-500 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"}`}>
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
            <span className="hidden md:inline">Pix com desconto e parcelamento no checkout</span>
            <a href={socialLinks.instagram} target="_blank" rel="noreferrer" className="max-w-full truncate text-slate-700 transition hover:text-slate-900 sm:max-w-none">
              @{brand.instagramHandle}
            </a>
          </div>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-7xl flex-wrap items-start justify-between gap-3 px-3 py-3 sm:items-center sm:gap-4 sm:px-6 sm:py-4">
        <Link href="/" className="flex min-w-0 flex-1 items-center gap-3 sm:flex-none">
          <Image src="/logo-mdh.jpg" alt="Logo MDH 3D" width={48} height={48} className="rounded-2xl border border-[#e9dcc8] object-cover" />
          <div className="min-w-0">
            <p className="text-lg font-bold tracking-[0.12em] text-slate-900">MDH 3D</p>
            <p className="truncate text-xs text-slate-600">Marketplace de pecas e kits para A1 Mini</p>
          </div>
        </Link>

        <form action="/catalogo" className="hidden min-w-[320px] flex-1 items-center rounded-full border border-[#e7d8c3] bg-white px-4 py-3 lg:flex lg:max-w-xl">
          <Search className="h-4 w-4 text-slate-400" />
          <input
            type="search"
            name="q"
            placeholder="Busque por SKU, PN, termo tecnico ou sintoma..."
            className="ml-3 w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
          />
          <button type="submit" className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white">
            Buscar
          </button>
        </form>

        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:flex-nowrap sm:justify-end">
          <button onClick={() => setIsAssistantOpen(true)} className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-[#e5d4be] bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-[#fff3e2] sm:flex-none">
            <Bot className="h-4 w-4" />
            Assistente
          </button>
          <Link href="/comparar" className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-[#e5d4be] bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-[#fff3e2] sm:flex-none">
            <Scale className="h-4 w-4" />
            Comparar {compareIds.length ? `(${compareIds.length})` : ""}
          </Link>
          {user ? (
            <button onClick={signOut} className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-[#e5d4be] bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-[#fff3e2] sm:flex-none">
              <LogOut className="h-4 w-4" />
              Sair
            </button>
          ) : (
            <button onClick={() => setIsAuthModalOpen(true)} className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-[#e5d4be] bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-[#fff3e2] sm:flex-none">
              <User className="h-4 w-4" />
              Entrar
            </button>
          )}
          <a href={`https://wa.me/${whatsappNumber}`} className="hidden rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 sm:inline-flex">
            WhatsApp
          </a>
          <Link href="/checkout" className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 sm:flex-none">
            <ShoppingBag className="h-4 w-4" />
            Checkout
          </Link>
        </div>
      </div>

      <nav className="mx-auto w-full max-w-7xl overflow-x-hidden px-3 pb-3 sm:px-6 sm:pb-4">
        <div className="flex min-w-max items-center gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <Link href="/" className="shrink-0 whitespace-nowrap rounded-full border border-[#e5d4be] bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-700">
            Inicio
          </Link>
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="shrink-0 whitespace-nowrap rounded-full border border-[#e5d4be] bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-700 hover:bg-[#fff3e2]">
              {link.label}
            </Link>
          ))}
        </div>
      </nav>

      <Modal isOpen={isAssistantOpen} onClose={() => setIsAssistantOpen(false)} title="Assistente MDH">
        <div className="p-6">
          <p className="text-sm leading-7 text-slate-700">
            Use o assistente para validar compatibilidade, escolher kits e comparar opcoes por SKU/PN antes do checkout.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link href="/configurador/nozzle-hotend" className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-white">
              Abrir configurador
            </Link>
            <Link href="/guias" className="rounded-full border border-[#e5d4be] bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-700">
              Ver guias
            </Link>
          </div>
        </div>
      </Modal>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </header>
  );
}
