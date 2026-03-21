"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Bot,
  Instagram,
  LogOut,
  Menu,
  Search,
  ShoppingBag,
  User,
  X,
} from "lucide-react";
import { brand, socialLinks, whatsappNumber } from "@/lib/constants";
import { emitCustomerAuthChange, useCustomerSession } from "@/lib/customer-session-client";
import { CommerceAssistantDialog } from "@/components/commerce-assistant-dialog";

const navLinks = [
  { href: "/", label: "Início" },
  { href: "/catalogo", label: "Catálogo" },
  { href: "/imagem-para-impressao-3d", label: "Personalizados" },
  { href: "/entregas", label: "Entregas" },
  { href: "/faq", label: "FAQ" },
  { href: "/divulgacao", label: "Conteúdo" },
];

function isLinkActive(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

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
  const pathname = usePathname();
  const session = useCustomerSession();
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const userLabel = session.user?.displayName || session.user?.email?.split("@")[0] || "Minha conta";
  const nav = useMemo(
    () =>
      navLinks.map((link) => ({
        ...link,
        active: isLinkActive(pathname, link.href),
      })),
    [pathname]
  );

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  async function signOut() {
    await fetch("/api/auth/logout", { method: "POST", credentials: "same-origin", cache: "no-store" });
    emitCustomerAuthChange();
    window.location.href = "/";
  }

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[linear-gradient(180deg,rgba(9,17,25,0.84),rgba(9,17,25,0.78))] shadow-[0_18px_54px_rgba(2,8,23,0.16)] backdrop-blur-2xl">
        <div className="border-b border-white/10 bg-[linear-gradient(90deg,rgba(3,233,244,0.14),rgba(123,44,191,0.1),rgba(37,211,102,0.12))]">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-2 text-[11px] uppercase tracking-[0.22em] text-white/72 sm:px-6">
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

        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Link href="/" className="group flex min-w-0 items-center gap-3">
            <Image
              src="/logo-mdh.jpg"
              alt="Logo MDH 3D"
              width={52}
              height={52}
              className="rounded-2xl border border-white/10 object-cover shadow-[0_0_24px_rgba(103,232,249,0.15)] transition-transform duration-300 group-hover:scale-110"
            />
            <div className="min-w-0">
              <p className="truncate text-lg font-semibold tracking-[0.18em] text-white transition-colors duration-300 group-hover:text-cyan-glow">
                MDH 3D
              </p>
              <p className="hidden text-xs text-white/55 lg:block">
                Presentes, utilidades, decoração e projetos sob medida em impressão 3D
              </p>
            </div>
          </Link>

          <form
            action="/catalogo"
            className="hidden min-w-[320px] flex-1 items-center rounded-full border border-white/10 bg-white/5 px-4 py-3 shadow-[0_12px_28px_rgba(2,8,23,0.14)] lg:flex lg:max-w-xl"
          >
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

          <div className="hidden items-center gap-2 lg:flex">
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

            <a href={`https://wa.me/${whatsappNumber}`} className="btn-zap">
              WhatsApp
            </a>

            <Link href="/checkout" className="btn-primary gap-2 px-5 py-3">
              <ShoppingBag className="h-4 w-4" />
              Fechar pedido
            </Link>
          </div>

          <div className="flex items-center gap-2 lg:hidden">
            <Link href="/catalogo" className="btn-glass px-3 py-3" aria-label="Buscar no catálogo">
              <Search className="h-4 w-4" />
            </Link>
            <button
              type="button"
              onClick={() => setMobileOpen((value) => !value)}
              className="btn-glass px-3 py-3"
              aria-expanded={mobileOpen}
              aria-controls="mdh-mobile-menu"
              aria-label={mobileOpen ? "Fechar menu" : "Abrir menu"}
            >
              {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <nav className="mx-auto hidden max-w-7xl items-center gap-2 overflow-x-auto px-4 pb-4 sm:px-6 md:flex">
          {nav.map((link) => (
            <Link key={link.href} href={link.href} className={`chip-nav whitespace-nowrap ${link.active ? "chip-nav-active" : ""}`}>
              {link.label}
            </Link>
          ))}
          <a href={socialLinks.instagram} target="_blank" rel="noreferrer" className="chip-nav ml-auto">
            <Instagram className="h-4 w-4" /> Instagram
          </a>
        </nav>

        {mobileOpen ? (
          <div id="mdh-mobile-menu" className="border-t border-white/10 px-4 pb-4 sm:px-6 md:hidden">
            <div className="mobile-drawer-shell mt-3 rounded-[28px] p-4">
              <form action="/catalogo" className="flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-3">
                <Search className="h-4 w-4 text-white/45" />
                <input
                  type="search"
                  name="q"
                  placeholder="Buscar no catálogo"
                  className="ml-3 w-full bg-transparent text-sm text-white outline-none placeholder:text-white/35"
                />
                <button type="submit" className="btn-secondary ml-3 px-4 py-2 text-sm">
                  Ir
                </button>
              </form>

              <div className="mt-4 grid gap-2">
                {nav.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`chip-nav justify-between ${link.active ? "chip-nav-active" : ""}`}
                  >
                    <span>{link.label}</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                ))}
              </div>

              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                <button type="button" onClick={() => setAssistantOpen(true)} className="btn-glass justify-center">
                  <Bot className="mr-2 h-4 w-4" />
                  Consultor MDH
                </button>
                <a href={`https://wa.me/${whatsappNumber}`} className="btn-zap justify-center">
                  WhatsApp
                </a>
                <Link href="/checkout" className="btn-primary justify-center">
                  <ShoppingBag className="mr-2 h-4 w-4" />
                  Fechar pedido
                </Link>
                {session.loggedIn ? (
                  <button type="button" onClick={signOut} className="btn-glass justify-center">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sair
                  </button>
                ) : (
                  <Link href="/login" className="btn-glass justify-center">
                    <User className="mr-2 h-4 w-4" />
                    Minha conta
                  </Link>
                )}
              </div>
            </div>
          </div>
        ) : null}
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
