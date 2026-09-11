"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Menu, Search, ShoppingBag, UserRound, X } from "lucide-react";
import { useCustomerSession } from "@/lib/customer-session-client";
import { useCart } from "@/lib/cart-context";
import { getCatalogDirectoryLinks } from "@/lib/catalog-directories";

type SiteHeaderProps = {
  cardCheckoutReady: boolean;
  aiAssistantReady: boolean;
  aiAssistantModel: string;
  aiAssistantProvider: "openai" | "groq" | "ollama" | "ai_gateway" | "fallback";
  liveChatMode: "chatwoot" | "native" | "whatsapp";
};

const navigation = [
  { label: "Explorar catálogo", href: "/catalogo" },
  ...getCatalogDirectoryLinks(),
  { label: "Feito para você", href: "/sob-medida" },
];

export function SiteHeader(_props: SiteHeaderProps) {
  const pathname = usePathname();
  const session = useCustomerSession();
  const { count } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  useEffect(() => {
    if (!mobileOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileOpen(false);
        menuButton.current?.focus();
      }
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [mobileOpen]);

  return (
    <header className="experience-header">
      <div className="experience-announcement">
        <span>Produção autoral no Rio · Ideias ganham forma</span>
        <Link href="/como-funciona">Conheça a MDH 3D <span aria-hidden="true">↗</span></Link>
      </div>
      <div className="experience-header-main">
        <Link href="/" className="experience-wordmark" aria-label="MDH 3D — início">
          <span className="experience-mark" aria-hidden="true"><i>M</i><span>◆</span></span>
          <span>MDH <b>3D</b><span className="experience-wordmark-detail">OBJETOS · DESIGN · FUTURO</span></span>
        </Link>
        <form action="/catalogo" role="search" className="experience-search">
          <Search size={18} aria-hidden="true" />
          <input type="search" name="q" aria-label="Buscar produtos" placeholder="O que você quer criar ou encontrar?" />
          <button type="submit" aria-label="Buscar no catálogo"><span aria-hidden="true">↗</span></button>
        </form>
        <div className="experience-header-actions">
          <Link href="/rastrear" className="experience-orders-link">Acompanhar pedido</Link>
          <Link href={session.loggedIn ? "/conta" : "/login"} className="experience-icon-link" aria-label="Minha conta">
            <UserRound size={21} aria-hidden="true" /><span className="experience-action-label">Conta</span>
          </Link>
          <Link href="/carrinho" className="experience-icon-link" aria-label={`Carrinho, ${count} itens`}>
            <ShoppingBag size={21} aria-hidden="true" /><span className="experience-cart-count" aria-live="polite">{count}</span>
          </Link>
          <button ref={menuButton} type="button" className="experience-menu-button" aria-label={mobileOpen ? "Fechar menu" : "Abrir menu"} aria-expanded={mobileOpen} aria-controls="experience-mobile-menu" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X size={23} /> : <Menu size={23} />}
          </button>
        </div>
      </div>
      <nav className="experience-nav" aria-label="Coleções principais">
        {navigation.map((item) => <Link key={item.href} href={item.href} prefetch={false} aria-current={pathname === item.href ? "page" : undefined}>{item.label}</Link>)}
        <Link href="/atendimento" className="experience-nav-help">Precisa de ajuda?</Link>
      </nav>
      {mobileOpen ? (
        <nav id="experience-mobile-menu" className="experience-mobile-menu" aria-label="Menu principal">
          {navigation.map((item) => <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}>{item.label}<span aria-hidden="true">↗</span></Link>)}
          <Link href="/conta">Minha conta e pedidos</Link>
          <Link href="/rastrear">Acompanhar pedido</Link>
          <Link href="/atendimento">Falar com a equipe</Link>
        </nav>
      ) : null}
    </header>
  );
}
