import Link from "next/link";

export default function NotFound() {
  return (
    <section className="mx-auto max-w-4xl px-6 py-24">
      <div className="rounded-[32px] border border-[#ead8c1] bg-white p-8 text-center shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">404</p>
        <h1 className="mt-3 text-4xl font-black text-slate-900">Página não encontrada</h1>
        <p className="mt-4 text-slate-600">Esse link pode ter sido movido, expirado ou não existe mais na vitrine atual.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/" className="inline-flex rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white">
            Voltar para a loja
          </Link>
          <Link href="/catalogo" className="inline-flex rounded-full border border-[#ead8c1] bg-[#fff8ef] px-6 py-3 text-sm font-semibold text-slate-700">
            Abrir catálogo
          </Link>
          <Link href="/favoritos" className="inline-flex rounded-full border border-[#ead8c1] bg-[#fff8ef] px-6 py-3 text-sm font-semibold text-slate-700">
            Meus favoritos
          </Link>
        </div>
      </div>
    </section>
  );
}
