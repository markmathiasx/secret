"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut as authSignOut } from "next-auth/react";
import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  Bot,
  Boxes,
  Gamepad2,
  Instagram,
  LogOut,
  Menu,
  MessageCircleMore,
  PackageCheck,
  Search,
  ShoppingBag,
  ShoppingCart,
  User,
  X,
} from "lucide-react";
import { emitCustomerAuthChange, useCustomerSession } from "@/lib/customer-session-client";
import { useCart } from "@/lib/cart-context";
import { CommerceAssistantDialog } from "@/components/commerce-assistant-dialog";
import { HeaderCommandPalette } from "@/components/header-command-palette";
import { brand, socialLinks, whatsappNumber } from "@/lib/constants";

const navLinks = [
  { href: "/catalogo", label: "Catálogo" },
  { href: "/jogue", label: "Jogue" },
  { href: "/guia-primeira-impressao-3d", label: "Como funciona" },
  { href: "/blog", label: "Blog" },
  { href: "/atendimento", label: "Atendimento" },
];

const commerceShortcuts = [
  { href: "/catalogo?mode=verified", label: "Mídia validada", icon: BadgeCheck },
  { href: "/catalogo?status=Pronta%20entrega", label: "Pronta entrega", icon: PackageCheck },
  { href: "/catalogo?intent=presentear", label: "Ideias de presente", icon: ShoppingBag },
  { href: "/imagem-para-impressao-3d", label: "Enviar STL", icon: Boxes },
  { href: "/jogue", label: "Print Quest", icon: Gamepad2 },
] as const;


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
  liveChatMode,
}: {
  cardCheckoutReady: boolean;
  aiAssistantReady: boolean;
  aiAssistantModel: string;
  aiAssistantProvider: "openai" | "groq" | "ollama" | "ai_gateway" | "fallback";
  liveChatMode: "chatwoot" | "native" | "whatsapp";
}) {
  const pathname = usePathname();
  const session = useCustomerSession();
  const { count: cartCount, openDrawer } = useCart();
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 20);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
    await Promise.allSettled([
      authSignOut({ redirect: false, callbackUrl: "/" }),
      fetch("/api/auth/logout", { method: "POST", credentials: "same-origin", cache: "no-store" }),
    ]);
    emitCustomerAuthChange();
    window.location.assign("/");
  }

  return (
    <>
      <header className={`mdh-site-header sticky top-0 z-50 border-b border-white/10 transition-all duration-300 ${scrolled ? "is-scrolled" : ""}`}>
        <div className="border-b border-white/10 bg-[linear-gradient(90deg,rgba(34,211,238,0.15),rgba(124,58,237,0.12),rgba(132,204,22,0.10))]">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 overflow-x-hidden px-4 py-2 text-[11px] uppercase tracking-[0.22em] text-white/72 sm:px-6">
            <span className="shrink-0">MDH 3D Lab • Rio de Janeiro</span>
            <span className="hidden md:inline shrink-0">
              Pix imediato • cartão + R$ 3 • atendimento humano
            </span>
            <span className="hidden sm:inline rounded-full border border-emerald-300/25 bg-emerald-300/10 px-3 py-1 text-[10px] font-semibold text-emerald-100 shrink-0">
              Produção local e acabamento sob medida
            </span>
            <a
              href={socialLinks.instagram}
              target="_blank"
              rel="noreferrer"
              className="hidden items-center gap-1.5 rounded-full border border-pink-300/20 bg-pink-300/10 px-3 py-1 text-[10px] font-semibold text-pink-50 transition hover:bg-pink-300/16 xl:inline-flex"
            >
              <Instagram className="h-3.5 w-3.5" />
              @{brand.instagramHandle}
            </a>

          </div>
        </div>

        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <Link href="/" className="group flex w-[168px] flex-none items-center gap-3 sm:w-[190px] xl:w-[230px]">
            <Image
              src="/logo-mdh.jpg"
              alt="Logo MDH 3D"
              width={52}
              height={52}
              className="rounded-[8px] border border-cyan-300/20 object-cover shadow-[0_0_24px_rgba(103,232,249,0.18)] transition-transform duration-300 group-hover:scale-105"
            />
            <div className="min-w-0">
              <p className="truncate text-lg font-semibold tracking-[0.18em] text-white transition-colors duration-300 group-hover:text-cyan-glow">
                MDH 3D
              </p>
              <p className="hidden text-xs leading-5 text-white/55 2xl:block">
                Presentes, utilidades, decoração e projetos sob medida em impressão 3D
              </p>
            </div>
          </Link>

          <form
            action="/catalogo"
            className="mdh-header-search hidden min-w-[260px] flex-1 items-center rounded-[8px] px-4 py-3 lg:flex lg:max-w-md 2xl:max-w-xl"
            autoComplete="off"
          >
            <Search className="h-4 w-4 text-white/45" />
            <input
              type="search"
              name="q"
              placeholder="Busque por presente, miniatura, suporte, chaveiro, decoração..."
              className="ml-3 w-full bg-transparent text-white outline-none placeholder:text-white/35"
              style={{ fontSize: '16px' }}
            />
            <button type="submit" className="btn-secondary ml-3 whitespace-nowrap px-4 py-2 text-sm">
              Buscar
            </button>
          </form>

          <div className="hidden items-center gap-2 lg:flex flex-nowrap">
            <div className="hidden 2xl:block">
              <HeaderCommandPalette />
            </div>
            <div className="hidden 2xl:block">
              <button type="button" onClick={() => setAssistantOpen(true)} className="btn-glass whitespace-nowrap">
                <Bot className="mr-2 h-4 w-4 shrink-0" />
                Consultor MDH
              </button>
            </div>
            <a href={`https://wa.me/${whatsappNumber}`} className="btn-whatsapp whitespace-nowrap">
              <MessageCircleMore className="mr-2 h-4 w-4 shrink-0" />
              WhatsApp
            </a>
            <Link href="/jogue" prefetch={false} className="btn-glass whitespace-nowrap">
              <Gamepad2 className="mr-2 h-4 w-4 shrink-0" />
              Jogue
            </Link>
            <a href={socialLinks.instagram} target="_blank" rel="noreferrer" className="btn-glass whitespace-nowrap">
              <Instagram className="mr-2 h-4 w-4 shrink-0" />
              Instagram
            </a>

            {session.loggedIn ? (
              <>
                <Link href="/conta" prefetch={false} className="btn-glass whitespace-nowrap">
                  <User className="mr-2 h-4 w-4 shrink-0" />
                  {userLabel}
                </Link>
                <button type="button" onClick={signOut} className="btn-glass whitespace-nowrap">
                  <LogOut className="mr-2 h-4 w-4 shrink-0" />
                  Sair
                </button>
              </>
            ) : (
              <Link href="/login" prefetch={false} className="btn-glass whitespace-nowrap">
                <User className="mr-2 h-4 w-4 shrink-0" />
                Minha conta
              </Link>
            )}

            <button type="button" onClick={openDrawer} className="btn-glass gap-2 px-4 py-3 whitespace-nowrap">
              <ShoppingCart className="h-4 w-4 shrink-0" />
              Carrinho
              <motion.span
                key={cartCount}
                initial={{ scale: 1.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                aria-live="polite"
                aria-atomic="true"
                className="rounded-full border border-white/10 bg-black/25 px-2 py-0.5 text-[11px] text-white/80"
              >
                {cartCount}
              </motion.span>
            </button>
          </div>

          <div className="flex items-center gap-2 lg:hidden">
            <Link href="/catalogo" prefetch={false} className="btn-glass px-3 py-3" aria-label="Buscar no catálogo">
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

        <nav className="mx-auto hidden max-w-7xl items-center gap-2 overflow-x-auto px-4 pb-4 sm:px-6 2xl:flex">
          {nav.map((link) => (
            <Link key={link.href} href={link.href} prefetch={false} className={`chip-nav whitespace-nowrap ${link.active ? "chip-nav-active" : ""}`}>
              {link.label}
            </Link>
          ))}

        </nav>

        {mobileOpen ? (
          <div id="mdh-mobile-menu" className="border-t border-white/10 px-4 pb-4 sm:px-6 md:hidden">
            <div className="mobile-drawer-shell mt-3 rounded-[28px] p-4">
              <form action="/catalogo" className="flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-3" autoComplete="off">
                <Search className="h-4 w-4 text-white/45" />
                <input
                  type="search"
                  name="q"
                  placeholder="Buscar no catálogo"
                  className="ml-3 w-full bg-transparent text-white outline-none placeholder:text-white/35"
                  style={{ fontSize: '16px' }}
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
                    prefetch={false}
                    className={`chip-nav justify-between ${link.active ? "chip-nav-active" : ""}`}
                  >
                    <span>{link.label}</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                ))}
              </div>

              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {commerceShortcuts.map((shortcut) => {
                  const Icon = shortcut.icon;
                  return (
                    <Link key={shortcut.href} href={shortcut.href} prefetch={false} className="chip-nav justify-between">
                      <span className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        {shortcut.label}
                      </span>
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  );
                })}
              </div>

              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                <HeaderCommandPalette />
                <button type="button" onClick={() => setAssistantOpen(true)} className="btn-glass justify-center">
                  <Bot className="mr-2 h-4 w-4" />
                  Consultor MDH
                </button>
                <a href={socialLinks.instagram} target="_blank" rel="noreferrer" className="btn-glass justify-center">
                  <Instagram className="mr-2 h-4 w-4" />
                  @{brand.instagramHandle}
                </a>
                <button type="button" onClick={openDrawer} className="btn-glass justify-center">
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Carrinho ({cartCount})
                </button>
                {session.loggedIn ? (
                  <button type="button" onClick={signOut} className="btn-glass justify-center">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sair
                  </button>
                ) : (
                  <Link href="/login" prefetch={false} className="btn-glass justify-center">
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
        liveChatMode={liveChatMode}
      />
    </>
  );
}
