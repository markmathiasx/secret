"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ArrowUp, Check, Copy, Package, Share2, ShoppingBag, Upload } from "lucide-react";

export function RouteActionDock() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > 220);
    }

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const actions = useMemo(() => {
    if (pathname.startsWith("/checkout")) {
      return [
        { id: "catalog", href: "/catalogo", label: "Catálogo", icon: Package },
        { id: "upload", href: "/imagem-para-impressao-3d", label: "Sob medida", icon: Upload },
      ];
    }
    if (pathname.startsWith("/catalogo")) {
      return [
        { id: "home", href: "/", label: "Início", icon: ShoppingBag },
        { id: "checkout", href: "/checkout", label: "Checkout", icon: Package },
      ];
    }
    return [
      { id: "catalog", href: "/catalogo", label: "Catálogo", icon: Package },
      { id: "upload", href: "/imagem-para-impressao-3d", label: "Enviar STL", icon: Upload },
    ];
  }, [pathname]);

  async function copyCurrentPage() {
    try {
      const url = window.location.href;
      if (navigator.share) {
        await navigator.share({ title: document.title, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  if (!visible || pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-3 z-[90] flex justify-center px-3 md:bottom-5">
      <div className="pointer-events-auto flex items-center gap-2 rounded-full border border-white/12 bg-slate-950/84 px-3 py-2 shadow-[0_18px_40px_rgba(2,8,23,0.32)] backdrop-blur-xl">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Link key={action.id} href={action.href} className="chip-nav text-[12px]">
              <Icon className="h-4 w-4" />
              {action.label}
            </Link>
          );
        })}
        <button type="button" onClick={copyCurrentPage} className="chip-nav text-[12px]">
          {copied ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
          {copied ? "Copiado" : "Compartilhar"}
        </button>
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="chip-nav text-[12px]"
        >
          <ArrowUp className="h-4 w-4" />
          Topo
        </button>
      </div>
    </div>
  );
}
