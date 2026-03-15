"use client";

import Link from "next/link";

export default function AuthCallback() {
  return (
    <section className="mx-auto max-w-3xl px-6 py-20">
      <div className="rounded-[32px] border border-white/10 bg-white/5 p-8">
        <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Login social opcional</p>
        <h1 className="mt-3 text-3xl font-black text-white">A conta principal da loja agora usa e-mail e senha próprios.</h1>
        <p className="mt-4 text-sm leading-7 text-white/62">
          O callback social antigo foi mantido apenas como camada de compatibilidade. Para a sessao persistente oficial da
          plataforma, use o login principal da MDH 3D.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/login"
            className="inline-flex rounded-full border border-cyan-400/25 bg-cyan-400/12 px-5 py-3 text-sm font-semibold text-cyan-100"
          >
            Ir para login principal
          </Link>
          <Link
            href="/catalogo"
            className="inline-flex rounded-full border border-white/10 bg-black/20 px-5 py-3 text-sm font-semibold text-white/78"
          >
            Voltar para o catálogo
          </Link>
        </div>
      </div>
    </section>
  );
}
