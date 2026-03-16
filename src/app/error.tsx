"use client";

import Link from "next/link";

export default function Error({ error }: { error: Error }) {
  return (
    <section className="mx-auto max-w-4xl px-6 py-20">
      <p className="text-xs uppercase tracking-[0.2em] text-rose-200">Erro</p>
      <h1 className="mt-3 text-4xl font-black text-white">Algo inesperado aconteceu</h1>
      <p className="mt-4 text-white/70">{error.message || "Não foi possível concluir esta ação agora."}</p>
      <Link href="/" className="mt-6 inline-flex rounded-full bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950">
        Voltar para o início
      </Link>
    </section>
  );
}
