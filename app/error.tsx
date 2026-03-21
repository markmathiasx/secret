"use client";

import Link from "next/link";

export default function Error({ error }: { error: Error }) {
  const message =
    process.env.NODE_ENV === "development"
      ? error.message || "Não foi possível concluir esta ação agora."
      : "Não foi possível concluir esta ação agora. Tente novamente ou retorne ao catálogo.";

  return (
    <section className="mx-auto max-w-4xl px-6 py-20">
      <div className="rounded-[32px] border border-[#ead8c1] bg-white p-8 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Erro</p>
        <h1 className="mt-3 text-4xl font-black text-slate-900">Algo inesperado aconteceu</h1>
        <p className="mt-4 text-slate-600">{message}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/" className="inline-flex rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white">
            Voltar para o início
          </Link>
          <Link href="/catalogo" className="inline-flex rounded-full border border-[#ead8c1] bg-[#fff8ef] px-5 py-3 text-sm font-semibold text-slate-700">
            Ir para o catálogo
          </Link>
          <Link href="/suporte" className="inline-flex rounded-full border border-[#ead8c1] bg-[#fff8ef] px-5 py-3 text-sm font-semibold text-slate-700">
            Abrir suporte
          </Link>
        </div>
      </div>
    </section>
  );
}
