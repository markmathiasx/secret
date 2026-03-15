import Link from "next/link";
import { Suspense } from "react";
import { SiteHeaderClient } from "@/components/site-header-client";

function SiteHeaderFallback() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
      <div className="border-b border-white/10 bg-[linear-gradient(90deg,rgba(16,185,129,0.16),rgba(34,211,238,0.16),rgba(251,191,36,0.16))]">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-2 text-[11px] uppercase tracking-[0.22em] text-white/70 sm:px-6">
          <span>Loja oficial MDH 3D</span>
          <span className="hidden md:inline">Pix com melhor preço</span>
          <span className="hidden lg:inline">Entrega local no Rio + personalizado sob encomenda</span>
          <span className="text-cyan-100">Carregando loja</span>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid gap-4 py-4 lg:grid-cols-[auto_minmax(0,1fr)_auto] lg:items-center">
          <Link href="/" className="flex min-w-0 items-center gap-3">
            <div className="h-[50px] w-[50px] rounded-2xl border border-white/10 bg-white/10" />
            <div className="min-w-0">
              <p className="truncate text-lg font-semibold tracking-[0.18em] text-white">MDH 3D STORE</p>
              <p className="truncate text-xs text-white/55">utilidades, geek, anime, decoracao e impressos personalizados</p>
            </div>
          </Link>

          <div className="h-[52px] rounded-full border border-white/12 bg-white/5" />

          <div className="flex items-center justify-end gap-2 sm:gap-3">
            <div className="h-[48px] w-[92px] rounded-full border border-white/10 bg-white/5" />
            <div className="h-[48px] w-[110px] rounded-full border border-white/10 bg-white/5" />
            <div className="h-[48px] w-[126px] rounded-full border border-emerald-400/25 bg-emerald-400/14" />
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 border-t border-white/10 py-3">
          <div className="flex gap-2 overflow-x-auto pb-1">
            <div className="h-[40px] w-[120px] rounded-full border border-cyan-400/18 bg-cyan-400/10" />
            <div className="h-[40px] w-[84px] rounded-full border border-white/10 bg-white/5" />
            <div className="h-[40px] w-[96px] rounded-full border border-white/10 bg-white/5" />
            <div className="h-[40px] w-[74px] rounded-full border border-white/10 bg-white/5" />
          </div>

          <div className="hidden items-center gap-2 lg:flex">
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs uppercase tracking-[0.18em] text-white/50">
              Catalogo vivo
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}

export function SiteHeader() {
  return (
    <Suspense fallback={<SiteHeaderFallback />}>
      <SiteHeaderClient />
    </Suspense>
  );
}
