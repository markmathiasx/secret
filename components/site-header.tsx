"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Bot, Instagram, LogOut, Search, ShoppingBag, User } from "lucide-react";
import { brand, socialLinks, whatsappNumber } from "@/lib/constants";
import { emitCustomerAuthChange, useCustomerSession } from "@/lib/customer-session-client";
import { CommerceAssistantDialog } from "@/components/commerce-assistant-dialog";

const navLinks = [
  { href: "/", label: "Início" },
  { href: "/catalogo", label: "Catálogo" },
  { href: "/imagem-para-impressao-3d", label: "Personalizados" },
  { href: "/entregas", label: "Entregas" },
  { href: "/faq", label: "FAQ" },
  { href: "/divulgacao", label: "Conteúdo" }
];

export function SiteHeader({
  cardCheckoutReady,
  aiAssistantReady,
  aiAssistantModel,
  aiAssistantProvider,
}: {
  cardCheckoutReady: boolean;
  aiAssistantReady: boolean;
  aiAssistantModel: string;
  aiAssistantProvider: "openai" | "groq" | "ollama" | "fallback";
}) {
  const session = useCustomerSession();
  const [assistantOpen, setAssistantOpen] = useState(false);

  async function signOut() {
    await fetch("/api/auth/logout", { method: "POST", credentials: "same-origin", cache: "no-store" });
    emitCustomerAuthChange();
    window.location.href = "/";
  }

  const userLabel = session.user?.displayName || session.user?.email?.split("@")[0] || "Minha conta";

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/82 backdrop-blur-2xl">
        <div className="border-b border-white/10 bg-gradient-to-r from-cyan-400/16 via-emerald-400/10 to-cyan-400/10">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-2 text-[11px] uppercase tracking-[0.22em] text-white/70 sm:px-6">
            <span>MDH 3D • Produção local no Rio</span>
            <span className="hidden md:inline">
              {cardCheckoutReady
                ? "Pix imediato • cartão online • atendimento humano"
                : "Pix imediato • orçamento claro • atendimento humano"}
            </span>
            <a href={socialLinks.instagram} target="_blank" rel="noreferrer" className="text-cyan-100 transition hover:text-cyan-glow">
              @{brand.instagramHandle}
            </a>
          </div>
        </div>

        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Link href="/" className="flex items-center gap-3 group">
            <Image src="/logo-mdh.jpg" alt="Logo MDH 3D" width={48} height={48} className="rounded-2xl border border-white/10 object-cover shadow-[0_0_24px_rgba(103,232,249,0.15)] transition-transform duration-300 group-hover:scale-110" />
            <div>
              <p className="text-lg font-semibold tracking-[0.18em] text-white transition-colors duration-300 group-hover:text-cyan-glow">MDH 3D</p>
              <p className="text-xs text-white/55">Presentes, utilidades, decoração e projetos sob medida em impressão 3D</p>
            </div>
          </Link>

          <form action="/catalogo" className="hidden min-w-[320px] flex-1 items-center rounded-full border border-white/10 bg-white/5 px-4 py-3 lg:flex lg:max-w-xl">
            <Search className="h-4 w-4 text-white/45" />
            <input
              type="search"
              name="q"
              placeholder="Busque por presente, miniatura, suporte, chaveiro, decoração..."
              className="ml-3 w-full bg-transparent text-sm text-white outline-none placeholder:text-white/35"
            />
            <button type="submit" className="btn-secondary ml-3 px-4 py-2 text-sm">
              Buscar
            </button>
          </form>

          <div className="flex items-center gap-2">
            <button type="button" onClick={() => setAssistantOpen(true)} className="btn-glass">
              <Bot className="mr-2 h-4 w-4" />
              Consultor MDH
            </button>

            {session.loggedIn ? (
              <>
                <Link href="/conta" className="btn-glass">
                  <User className="mr-2 h-4 w-4" />
                  {userLabel}
                </Link>
                <button type="button" onClick={signOut} className="btn-glass">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sair
                </button>
              </>
            ) : (
              <Link href="/login" className="btn-glass">
                <User className="mr-2 h-4 w-4" />
                Minha conta
              </Link>
            )}

            <a href={`https://wa.me/${whatsappNumber}`} className="btn-zap hidden sm:inline-flex">
              WhatsApp
            </a>

            <Link href="/checkout" className="btn-primary gap-2 px-5 py-3">
              <ShoppingBag className="h-4 w-4" />
              Fechar pedido
            </Link>
          </div>
        </div>

        <nav className="mx-auto flex max-w-7xl items-center gap-2 overflow-x-auto px-4 pb-4 sm:px-6">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="chip-nav whitespace-nowrap">
              {link.label}
            </Link>
          ))}
          <a href={socialLinks.instagram} target="_blank" rel="noreferrer" className="chip-nav ml-auto hidden md:inline-flex">
            <Instagram className="h-4 w-4" /> Instagram
          </a>
        </nav>
      </header>

      <CommerceAssistantDialog
        open={assistantOpen}
        onClose={() => setAssistantOpen(false)}
        cardCheckoutReady={cardCheckoutReady}
        aiAssistantReady={aiAssistantReady}
        aiAssistantModel={aiAssistantModel}
        aiAssistantProvider={aiAssistantProvider}
      />
    </>
  );
}
