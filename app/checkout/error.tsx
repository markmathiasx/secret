"use client";

import Link from "next/link";
import { useEffect } from "react";
import { AlertTriangle, ArrowLeft, MessageCircleMore, RefreshCw } from "lucide-react";
import { whatsappNumber } from "@/lib/constants";

const WA_FALLBACK = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent("Oi! Tentei finalizar meu pedido no site mas encontrei um erro. Pode me ajudar?")}`;

export default function CheckoutError({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error("[checkout] error boundary:", error.message);
  }, [error.message]);

  return (
    <section className="mx-auto max-w-2xl px-6 py-20 text-center">
      <div className="glass-panel p-8 md:p-12">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-amber-400/20 bg-amber-400/10 text-amber-300">
          <AlertTriangle className="h-8 w-8" />
        </div>
        <p className="mt-6 text-xs uppercase tracking-[0.2em] text-amber-200">Erro no checkout</p>
        <h1 className="mt-3 text-3xl font-black text-white">Problema ao processar o pedido</h1>
        <p className="mt-4 text-sm text-white/60 max-w-sm mx-auto">
          Não se preocupe — seu cartão não foi cobrado. Tente novamente ou finalize pelo WhatsApp.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button type="button" onClick={reset} className="btn-primary gap-2">
            <RefreshCw className="h-4 w-4" />
            Tentar novamente
          </button>
          <a href={WA_FALLBACK} target="_blank" rel="noreferrer" className="btn-zap gap-2">
            <MessageCircleMore className="h-4 w-4" />
            Finalizar pelo WhatsApp
          </a>
          <Link href="/" className="btn-secondary gap-2">
            <ArrowLeft className="h-4 w-4" />
            Início
          </Link>
        </div>
      </div>
    </section>
  );
}
