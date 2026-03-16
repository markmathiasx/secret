"use client";

export default function GlobalError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto max-w-3xl px-6 py-20">
      <div className="rounded-[36px] border border-rose-300/20 bg-rose-300/10 p-8">
        <p className="text-xs uppercase tracking-[0.22em] text-rose-50/80">Erro de renderizacao</p>
        <h1 className="mt-3 text-4xl font-black text-white">A loja encontrou um problema inesperado</h1>
        <p className="mt-4 text-base leading-8 text-white/80">
          A interface continua protegida por um fallback global. Voce pode tentar novamente sem recarregar toda a sessao.
        </p>
        <p className="mt-4 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/65">
          {error.message || "Erro desconhecido"}
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-6 rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950"
        >
          Tentar novamente
        </button>
      </div>
    </div>
  );
}
