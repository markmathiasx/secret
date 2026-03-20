import { CatalogExplorer } from "@/components/catalog-explorer";
import { catalog, categories, collections } from "@/lib/catalog";

export default function CatalogPage() {
  const visualSummary = catalog.reduce(
    (acc, item) => {
      acc[item.visualType] += 1;
      if (item.fulfillment === "Pronta entrega") acc.ready += 1;
      return acc;
    },
    { "foto-real": 0, "render-fiel": 0, conceitual: 0, ready: 0 }
  );

  return (
    <section className="mx-auto max-w-7xl px-6 py-16">
      <div className="max-w-4xl">
        <p className="text-xs uppercase tracking-[0.22em] text-cyan-200">Catálogo MDH 3D</p>
        <h1 className="mt-3 text-4xl font-black text-white sm:text-5xl">
          Peças para vender, presentear e personalizar com cara de marca pronta.
        </h1>
        <p className="mt-4 text-lg leading-8 text-white/68">
          Explore a curadoria por categoria, coleção e preço. Cada card mostra material, prazo, faixa de preço, tipo de mídia e canal direto para fechamento.
        </p>
      </div>

      <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-[22px] border border-white/10 bg-white/5 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-white/50">Total catalogado</p>
          <p className="mt-2 text-2xl font-black text-white">{catalog.length}</p>
        </div>
        <div className="rounded-[22px] border border-emerald-300/20 bg-emerald-300/10 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-emerald-100/80">Fotos reais</p>
          <p className="mt-2 text-2xl font-black text-emerald-50">{visualSummary["foto-real"]}</p>
        </div>
        <div className="rounded-[22px] border border-cyan-300/20 bg-cyan-300/10 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-cyan-100/80">Render fiel</p>
          <p className="mt-2 text-2xl font-black text-cyan-50">{visualSummary["render-fiel"]}</p>
        </div>
        <div className="rounded-[22px] border border-violet-300/20 bg-violet-300/10 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-violet-100/80">Pronta entrega</p>
          <p className="mt-2 text-2xl font-black text-violet-50">{visualSummary.ready}</p>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap gap-2">
        {categories.map((category) => (
          <span key={category} className="rounded-full border border-white/10 px-3 py-1 text-sm text-white/70">
            {category}
          </span>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {collections.map((collection) => (
          <span key={collection} className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-sm text-cyan-50/88">
            {collection}
          </span>
        ))}
      </div>

      <div className="mt-10">
        <CatalogExplorer products={catalog} />
      </div>
    </section>
  );
}
