import Link from "next/link";

export default function NotFound() {
  return (
    <section className="mx-auto max-w-3xl px-6 py-24 text-center">
      <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">404</p>
      <h1 className="mt-3 text-4xl font-black text-white">Página não encontrada</h1>
      <p className="mt-4 text-white/65">Esse link pode ter sido movido ou não existe.</p>
      <Link href="/" className="mt-8 inline-flex rounded-full bg-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950">
        Voltar para a loja
      </Link>
    </section>
  );
}
