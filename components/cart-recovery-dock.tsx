"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { MessageCircleMore, ShoppingBag, TimerReset, X } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { calculateCartTotals } from "@/lib/checkout";
import { whatsappNumber } from "@/lib/constants";
import { trackEvent, trackWhatsAppClick } from "@/lib/analytics";
import { formatCurrency } from "@/lib/utils";

const DISMISS_KEY = "mdh:cart-recovery-dismissed-at";
const HIDDEN_PATHS = ["/carrinho", "/checkout", "/admin", "/login", "/conta"];

function formatSavedAt(value?: string) {
  if (!value) return "agora";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "agora";
  return parsed.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

export function CartRecoveryDock() {
  const pathname = usePathname();
  const { hydrated, items } = useCart();
  const [visible, setVisible] = useState(false);
  const totals = useMemo(() => calculateCartTotals(items), [items]);
  const shouldHideByRoute = HIDDEN_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));
  const lastUpdatedAt = useMemo(() => {
    const dates = items
      .map((item) => item.updatedAt)
      .filter(Boolean)
      .sort();
    return dates[dates.length - 1];
  }, [items]);

  const whatsappHref = useMemo(() => {
    const lines = [
      "Oi! Quero fechar este carrinho da MDH 3D agora:",
      ...items.map((item) => `- ${item.quantity}x ${item.title}`),
      `Total estimado: ${formatCurrency(totals.totalPix)}`,
    ];
    return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(lines.join("\n"))}`;
  }, [items, totals.totalPix]);

  useEffect(() => {
    if (!hydrated || !items.length || shouldHideByRoute) {
      setVisible(false);
      return;
    }

    const dismissedAt = Number(window.sessionStorage.getItem(DISMISS_KEY) || 0);
    if (Date.now() - dismissedAt < 20 * 60 * 1000) {
      setVisible(false);
      return;
    }

    const timer = window.setTimeout(() => {
      setVisible(true);
      trackEvent("cart_recovery_dock_view", {
        item_count: totals.quantity,
        value: totals.totalPix,
      });
    }, 2500);

    return () => window.clearTimeout(timer);
  }, [hydrated, items.length, shouldHideByRoute, totals.quantity, totals.totalPix]);

  if (!visible || !items.length) return null;

  function dismiss() {
    window.sessionStorage.setItem(DISMISS_KEY, String(Date.now()));
    setVisible(false);
    trackEvent("cart_recovery_dock_dismiss", {
      item_count: totals.quantity,
      value: totals.totalPix,
    });
  }

  return (
    <aside className="fixed bottom-4 left-4 right-4 z-[118] rounded-[24px] border border-emerald-300/20 bg-slate-950/96 p-4 shadow-[0_24px_72px_rgba(2,8,23,0.55)] backdrop-blur-xl md:left-6 md:right-auto md:w-[420px]">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="rounded-full border border-emerald-300/25 bg-emerald-300/10 p-2 text-emerald-100">
            <ShoppingBag className="h-4 w-4" />
          </span>
          <div>
            <p className="text-sm font-black text-white">Carrinho pronto para fechar</p>
            <p className="mt-1 text-xs leading-6 text-white/62">
              {totals.quantity} item(ns), {formatCurrency(totals.totalPix)} no Pix. Salvo às {formatSavedAt(lastUpdatedAt)}.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={dismiss}
          className="rounded-full border border-white/10 bg-white/5 p-2 text-white/60 transition hover:text-white"
          aria-label="Ocultar recuperação de carrinho"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="mt-4 grid grid-cols-[1fr_auto] gap-2">
        <Link
          href="/checkout"
          onClick={() =>
            trackEvent("cart_recovery_checkout_click", {
              item_count: totals.quantity,
              value: totals.totalPix,
            })
          }
          className="btn-primary justify-center gap-2 py-3"
        >
          <TimerReset className="h-4 w-4" />
          Fechar agora
        </Link>
        <a
          href={whatsappHref}
          target="_blank"
          rel="noreferrer"
          onClick={() => trackWhatsAppClick("cart_recovery_dock")}
          className="btn-zap justify-center px-4 py-3"
          aria-label="Fechar carrinho pelo WhatsApp"
        >
          <MessageCircleMore className="h-4 w-4" />
        </a>
      </div>
    </aside>
  );
}
