"use client";

import Link from "next/link";
import { useEffect } from "react";
import { AlertTriangle, ArrowLeft, RefreshCw, Search } from "lucide-react";

export default function CatalogoError({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error("[catalogo] error boundary:", error.message);
  }, [error.message]);

  return (
    <section className="mx-auto max-w-2xl px-6 py-20 text-center">
      <div className="glass-panel p-8 md:p-12">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-rose-400/20 bg-rose-400/10 text-rose-300">
          <AlertTriangle className="h-8 w-8" />
        </div>
        <p className="mt-6 text-xs uppercase tracking-[0.2em] text-rose-200">Erro no catálogo</p>
        <h1 className="mt-3 text-3xl font-black text-white">Não conseguimos carregar os produtos</h1>
        <p className="mt-4 text-sm text-white/60 max-w-sm mx-auto">
          Algo deu errado ao carregar o catálogo. Tente recarregar ou volte para a página inicial.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button type="button" onClick={reset} className="btn-primary gap-2">
            <RefreshCw className="h-4 w-4" />
            Recarregar catálogo
          </button>
          <Link href="/busca" className="btn-secondary gap-2">
            <Search className="h-4 w-4" />
            Buscar produto
          </Link>
          <Link href="/" className="btn-secondary gap-2">
            <ArrowLeft className="h-4 w-4" />
            Início
          </Link>
        </div>
      </div>
    </section>
  );
}
