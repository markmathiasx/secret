import Link from 'next/link';
import { CatalogExplorer } from '@/components/catalog-explorer';
import { CatalogRealCases } from '@/components/catalog-real-cases';
import { ComboBuilder } from '@/components/combo-builder';
import { catalog } from '@/lib/catalog';
import { summarizeProductVisuals } from '@/lib/product-visuals';

export default async function CatalogPage({ searchParams }: { searchParams?: Promise<{ q?: string }> }) {
  const params = searchParams ? await searchParams : undefined;
  const initialQuery = params?.q?.trim() || '';
  const visualSummary = summarizeProductVisuals(catalog);

  return (
    <section className="mx-auto max-w-7xl px-6 py-16">
      <div className="overflow-hidden rounded-[40px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.18),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.16),transparent_28%),linear-gradient(135deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] p-8 shadow-[0_24px_80px_rgba(2,8,23,0.32)]">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <div className="max-w-3xl">
            <p className="text-xs uppercase tracking-[0.22em] text-cyan-200">Storefront do catálogo</p>
            <h1 className="mt-3 text-4xl font-black text-white sm:text-5xl">Explore a loja MDH 3D como vitrine real, não só como lista.</h1>
            <p className="mt-4 text-lg leading-8 text-white/68">
              Catalogo com busca, filtros, preco no Pix, parcelamento, transparencia sobre a origem das imagens e abertura priorizando apenas itens com visual validado.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/api/catalog/visual-manifest"
                className="rounded-full border border-cyan-300/25 bg-cyan-300/10 px-5 py-3 text-sm font-semibold text-cyan-100 transition hover:border-cyan-300/40 hover:bg-cyan-300/15"
              >
                Baixar manifesto CSV
              </Link>
              <Link
                href="/api/catalog/visual-manifest?format=json"
                className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white/80 transition hover:border-white/20 hover:text-white"
              >
                Abrir manifesto JSON
              </Link>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { label: 'Produtos ativos', value: String(catalog.length).padStart(4, '0') },
              { label: 'Fotos reais', value: String(visualSummary.fotoReal).padStart(2, '0') },
              { label: 'Feed pronto', value: String(visualSummary.merchantReady).padStart(2, '0') }
            ].map((item) => (
              <div key={item.label} className="rounded-[28px] border border-white/10 bg-black/20 p-5">
                <p className="text-xs uppercase tracking-[0.18em] text-white/45">{item.label}</p>
                <p className="mt-3 text-3xl font-black text-white">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8 rounded-[28px] border border-amber-300/15 bg-amber-300/8 p-5 text-sm leading-7 text-amber-50/90">
        <p className="text-xs uppercase tracking-[0.18em] text-amber-100/80">Curadoria comercial</p>
        <p className="mt-2">
          A pesquisa e a curadoria seguiram boas práticas do Google para catálogo: títulos e descrições mais específicos, transparência sobre a origem da imagem e distinção entre peça real e referência visual.
        </p>
      </div>

      <CatalogRealCases />

      <div className="mt-10">
        <CatalogExplorer products={catalog} initialQuery={initialQuery} />
      </div>

      <div className="mt-16">
        <ComboBuilder />
      </div>
    </section>
  );
}
