"use client";

import Link from "next/link";
import { useEffect } from "react";
import { AlertTriangle, ArrowLeft, RefreshCw } from "lucide-react";
import { trackRouteError } from "@/lib/analytics";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    trackRouteError(window.location.pathname, error.message || "unexpected_route_error");
  }, [error.message]);

  return (
    <section className="mx-auto max-w-4xl px-6 py-20">
      <div className="glass-panel p-8 md:p-12 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-rose-400/20 bg-rose-400/10 text-rose-300">
          <AlertTriangle className="h-8 w-8" />
        </div>
        <p className="mt-6 text-xs uppercase tracking-[0.2em] text-rose-200">Erro inesperado</p>
        <h1 className="mt-3 text-4xl font-black text-white">Algo deu errado</h1>
        <p className="mt-4 max-w-lg mx-auto text-white/60">{error.message || "Não foi possível concluir esta ação agora. Tente novamente ou volte para a página inicial."}</p>
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button type="button" onClick={reset} className="btn-primary gap-2">
            <RefreshCw className="h-4 w-4" />
            Tentar novamente
          </button>
          <Link href="/" className="btn-secondary gap-2">
            <ArrowLeft className="h-4 w-4" />
            Voltar ao início
          </Link>
        </div>
      </div>
    </section>
  );
}
