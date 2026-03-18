import { CatalogExplorer } from '@/components/catalog-explorer';
import { ComboBuilder } from '@/components/combo-builder';
import { catalog } from '@/lib/catalog';
import { homepageCollections } from '@/lib/constants';

export default function CatalogPage() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-16">
      <div className="overflow-hidden rounded-[40px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.18),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.16),transparent_28%),linear-gradient(135deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] p-8 shadow-[0_24px_80px_rgba(2,8,23,0.32)]">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <div className="max-w-3xl">
            <p className="text-xs uppercase tracking-[0.22em] text-cyan-200">Storefront do catálogo</p>
            <h1 className="mt-3 text-4xl font-black text-white sm:text-5xl">Explore a loja MDH 3D como vitrine real, não só como lista.</h1>
            <p className="mt-4 text-lg leading-8 text-white/68">
              Catálogo com busca, filtros, preço no Pix, parcelamento e páginas de produto mais completas para acelerar decisão de compra.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { label: 'Produtos ativos', value: String(catalog.length).padStart(4, '0') },
              { label: 'Linhas', value: String(homepageCollections.length).padStart(2, '0') },
              { label: 'Curadoria', value: 'RJ' }
            ].map((item) => (
              <div key={item.label} className="rounded-[28px] border border-white/10 bg-black/20 p-5">
                <p className="text-xs uppercase tracking-[0.18em] text-white/45">{item.label}</p>
                <p className="mt-3 text-3xl font-black text-white">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-10">
        <CatalogExplorer products={catalog} />
      </div>

      <div className="mt-16">
        <ComboBuilder />
      </div>
    </section>
  );
}
