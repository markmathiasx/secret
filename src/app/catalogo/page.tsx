import { CatalogExplorer } from "@/components/catalog-explorer";
import { catalog, categories, collections } from "@/lib/catalog";

export default function CatalogPage() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-16">
      <div className="max-w-4xl">
        <p className="text-xs uppercase tracking-[0.22em] text-cyan-200">Catálogo MDH 3D</p>
        <h1 className="mt-3 text-4xl font-black text-white sm:text-5xl">
          Peças para vender, presentear e personalizar com cara de marca pronta.
        </h1>
        <p className="mt-4 text-lg leading-8 text-white/68">
          Explore a curadoria por categoria, coleção e preço. Cada card já mostra material, prazo, acabamento e status comercial para acelerar a decisão.
        </p>
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
