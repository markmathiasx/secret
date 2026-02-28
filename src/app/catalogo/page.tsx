import { CatalogExplorer } from "@/components/catalog-explorer";
import { catalog, categories, collections } from "@/lib/catalog";

export default function CatalogPage() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-16">
      <div className="max-w-3xl">
        <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Catálogo base</p>
        <h1 className="mt-3 text-4xl font-black text-white">1000 exemplos para você transformar em produtos reais</h1>
        <p className="mt-4 text-lg leading-8 text-white/68">
          Agora o catálogo ficou navegável de verdade: busca, filtros, coleção, cards melhores e páginas individuais por produto.
        </p>
      </div>

      <div className="mt-8 flex flex-wrap gap-2">
        {categories.map((category) => (
          <span key={category} className="rounded-full border border-white/10 px-3 py-1 text-sm text-white/60">
            {category}
          </span>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {collections.map((collection) => (
          <span key={collection} className="rounded-full border border-cyan-400/15 bg-cyan-400/5 px-3 py-1 text-sm text-cyan-100/80">
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
