"use client";

import Link from "next/link";
import { BadgeCheck, RefreshCw, ShieldCheck, Truck } from "lucide-react";
import type { ProductMarketplaceSignals, StoreReputationSummary } from "@/lib/marketplace-signals";

export function PurchaseProtectionBanner({
  summary,
  compact = false,
}: {
  summary?: StoreReputationSummary | ProductMarketplaceSignals | null;
  compact?: boolean;
}) {
  const rating = summary?.averageRating ?? null;
  const reviewCount = summary?.reviewCount ?? 0;

  return (
    <div className={`rounded-[28px] border border-emerald-300/20 bg-emerald-300/10 ${compact ? "p-4" : "p-5"}`}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 text-emerald-100">
            <ShieldCheck className="h-5 w-5" />
            <p className="text-xs uppercase tracking-[0.2em]">Compra protegida MDH</p>
          </div>
          <h3 className={`mt-3 font-black text-white ${compact ? "text-xl" : "text-2xl"}`}>
            Comprar aqui é ter produção local, suporte humano e troca clara.
          </h3>
          <p className="mt-3 text-sm leading-7 text-white/72">
            {rating !== null && reviewCount > 0
              ? `Reputação atual: ${rating.toFixed(1)}★ em ${reviewCount} avaliações aprovadas.`
              : "Reputação construída com pedidos reais, suporte direto e política pública de devolução."}
          </p>
        </div>

        <div className="flex flex-wrap gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/75">
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">Produção local RJ</span>
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">Troca em 7 dias</span>
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">Suporte humano</span>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <div className="rounded-[20px] border border-white/10 bg-black/20 p-4">
          <BadgeCheck className="h-5 w-5 text-cyan-100" />
          <p className="mt-3 text-sm font-semibold text-white">Foto real e pedido claro</p>
          <p className="mt-1 text-sm leading-6 text-white/62">Você compra com menos dúvida e mais previsibilidade visual.</p>
        </div>
        <div className="rounded-[20px] border border-white/10 bg-black/20 p-4">
          <RefreshCw className="h-5 w-5 text-emerald-100" />
          <p className="mt-3 text-sm font-semibold text-white">Troca e devolução explícitas</p>
          <p className="mt-1 text-sm leading-6 text-white/62">A política fica visível antes de fechar o pedido.</p>
        </div>
        <div className="rounded-[20px] border border-white/10 bg-black/20 p-4">
          <Truck className="h-5 w-5 text-violet-100" />
          <p className="mt-3 text-sm font-semibold text-white">Rastreio e acompanhamento</p>
          <p className="mt-1 text-sm leading-6 text-white/62">Acompanhe pedido, status e suporte sem depender de achismo.</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <Link href="/trocas-e-devolucoes" className="btn-secondary">
          Ver trocas e devoluções
        </Link>
        <Link href="/rastrear" className="btn-glass">
          Rastrear pedido
        </Link>
      </div>
    </div>
  );
}
