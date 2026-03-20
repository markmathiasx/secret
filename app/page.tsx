import Link from 'next/link';
import { featuredCatalog, getProductUrl } from '@/lib/catalog';
import { formatCurrency } from '@/lib/utils';

export default function HomePage() {
  const highlights = featuredCatalog.slice(0, 6);

  return (
    <main className="mx-auto max-w-[1400px] px-4 py-8 md:px-6 lg:py-10">
      <section className="rounded-[36px] border border-[#ead8c1] bg-[#fff8ef] p-7 shadow-[0_30px_80px_rgba(15,23,42,0.08)] md:p-10">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">MDH 3D Marketplace</p>
        <h1 className="mt-3 text-4xl font-black leading-tight text-slate-900 md:text-5xl">
          E-commerce com fotos reais, filtros tecnicos e comparacao para compra sem erro.
        </h1>
        <p className="mt-4 max-w-4xl text-base leading-8 text-slate-600">
          Catalogo com curadoria estilo marketplace, foco em compatibilidade A1 Mini, busca por SKU/PN/sintoma e paginas de suporte/compliance prontas.
        </p>

        <div className="mt-7 flex flex-wrap gap-3">
          <Link href="/catalogo" className="rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800">
            Explorar catalogo
          </Link>
          <Link href="/compatibilidade" className="rounded-full border border-[#d9c7b1] bg-white px-5 py-3 text-sm font-semibold text-slate-800 hover:bg-[#fff3e2]">
            Matriz de compatibilidade
          </Link>
          <Link href="/configurador/nozzle-hotend" className="rounded-full border border-[#d9c7b1] bg-white px-5 py-3 text-sm font-semibold text-slate-800 hover:bg-[#fff3e2]">
            Assistente de escolha
          </Link>
        </div>
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {highlights.map((item) => (
          <article key={item.id} className="rounded-[26px] border border-[#ead8c1] bg-white p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{item.sku}</p>
            <h2 className="mt-2 text-xl font-black text-slate-900">{item.name}</h2>
            <p className="mt-2 text-sm text-slate-600">{item.description}</p>
            <div className="mt-4 flex items-end justify-between gap-3">
              <div>
                <p className="text-xs text-slate-500">No Pix</p>
                <p className="text-2xl font-black text-slate-900">{formatCurrency(item.pricePix)}</p>
              </div>
              <Link href={getProductUrl(item)} className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">
                Ver produto
              </Link>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
