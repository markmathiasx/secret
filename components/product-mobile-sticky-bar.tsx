"use client";

import Link from "next/link";
import { MessageCircleMore, ShoppingBag } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export function ProductMobileStickyBar({
  checkoutHref,
  whatsappHref,
  pricePix,
  installmentText,
}: {
  checkoutHref: string;
  whatsappHref: string;
  pricePix: number;
  installmentText?: string;
}) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[#e8dac7] bg-[#fff8ef]/95 px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 shadow-[0_-20px_40px_rgba(15,23,42,0.14)] backdrop-blur xl:hidden">
      <div className="mx-auto flex max-w-7xl items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] uppercase tracking-[0.14em] text-slate-500">Preco Pix</p>
          <p className="truncate text-lg font-black text-slate-900">{formatCurrency(pricePix)}</p>
          {installmentText ? <p className="truncate text-[11px] text-slate-500">{installmentText}</p> : null}
        </div>
        <a
          href={whatsappHref}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-emerald-700"
        >
          <MessageCircleMore className="h-4 w-4" />
          WhatsApp
        </a>
        <Link href={checkoutHref} className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-white">
          <ShoppingBag className="h-4 w-4" />
          Checkout
        </Link>
      </div>
    </div>
  );
}
