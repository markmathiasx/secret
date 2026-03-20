import Link from 'next/link';
import { CatalogExplorer } from '@/components/catalog-explorer';
import { CatalogBuyingIntents } from '@/components/catalog-buying-intents';
import { CatalogRealCases } from '@/components/catalog-real-cases';
import { ComboBuilder } from '@/components/combo-builder';
import { catalog, categories, collections } from '@/lib/catalog';
import { summarizeProductVisuals } from '@/lib/product-visuals';

type CatalogPageSearchParams = {
  q?: string;
  category?: string;
  collection?: string;
  mode?: string;
  status?: string;
};

export default async function CatalogPage({ searchParams }: { searchParams?: Promise<CatalogPageSearchParams> }) {
  const params = searchParams ? await searchParams : undefined;
  const initialQuery = params?.q?.trim() || '';
  const initialCategory = params?.category && categories.includes(params.category) ? params.category : 'Todas';
  const initialCollection = params?.collection && collections.includes(params.collection) ? params.collection : 'Todas';
  const initialVerifiedOnly = params?.mode === 'verified';
  const initialAvailability = params?.status === 'Pronta entrega' || params?.status === 'Sob encomenda' ? params.status : 'Todos';
  const visualSummary = summarizeProductVisuals(catalog);
  const auditedPricingCount = catalog.filter((product) => product.pricingMode === 'faixa-auditada').length;
  const activeLens = [initialCategory !== 'Todas' ? initialCategory : null, initialCollection !== 'Todas' ? initialCollection : null, initialQuery ? `Busca: ${initialQuery}` : null, initialAvailability !== 'Todos' ? initialAvailability : null]
    .filter(Boolean)
    .join(' • ');
  const heroTitle = activeLens
    ? 'Catálogo filtrado para chegar mais rápido no tipo de peça certa.'
    : 'Peças reais, projetos sob medida e preços claros para comprar com segurança.';
  const heroDescription = activeLens
    ? 'Os filtros da URL agora entram ativos na vitrine para você compartilhar uma seleção pronta de presentes, utilidades, colecionáveis ou peças sob medida.'
    : 'A vitrine abre destacando peças com foto real e visuais já validados. Quando um item ainda está em fase de projeto, o catálogo assume isso com transparência e mostra uma estimativa inicial para encomenda.';

  return (
    <section className="mx-auto max-w-7xl px-6 py-16">
      <div className="overflow-hidden rounded-[40px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.18),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.16),transparent_28%),linear-gradient(135deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] p-8 shadow-[0_24px_80px_rgba(2,8,23,0.32)]">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <div className="max-w-3xl">
            <p className="text-xs uppercase tracking-[0.22em] text-cyan-200">Catálogo MDH 3D</p>
            <h1 className="mt-3 text-4xl font-black text-white sm:text-5xl">{heroTitle}</h1>
            <p className="mt-4 text-lg leading-8 text-white/68">{heroDescription}</p>
            {activeLens ? (
              <div className="mt-5 inline-flex rounded-full border border-cyan-300/25 bg-cyan-300/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-100">
                {activeLens}
              </div>
            ) : null}
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="#catalogo-real"
                className="rounded-full border border-cyan-300/25 bg-cyan-300/10 px-5 py-3 text-sm font-semibold text-cyan-100 transition hover:border-cyan-300/40 hover:bg-cyan-300/15"
              >
                Ver peças com foto real
              </Link>
              <Link
                href="/imagem-para-impressao-3d"
                className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white/80 transition hover:border-white/20 hover:text-white"
              >
                Pedir projeto personalizado
              </Link>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { label: 'Produtos ativos', value: String(catalog.length).padStart(4, '0') },
              { label: 'Fotos reais', value: String(visualSummary.fotoReal).padStart(2, '0') },
              { label: 'Preços confirmados', value: String(auditedPricingCount).padStart(2, '0') }
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
        <p className="text-xs uppercase tracking-[0.18em] text-amber-100/80">Como ler a vitrine</p>
        <p className="mt-2">
          Foto real indica peça já produzida. Render do produto mostra a geometria real do modelo. Prévia do modelo aponta a direção visual da encomenda e é acompanhada de estimativa inicial para tamanho, acabamento e personalização.
        </p>
      </div>

      <CatalogBuyingIntents products={catalog} />

      <CatalogRealCases />

      <div className="relative isolate mt-10 overflow-hidden rounded-[36px] border border-cyan-200/35 shadow-[0_30px_90px_rgba(2,8,23,0.22)]">
        <video
          className="absolute inset-0 h-full w-full object-cover opacity-95"
          src="/assets/videos/hero-bg.mp4"
          poster="/assets/images/placeholders/hero-fallback.jpg"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_14%_20%,rgba(34,211,238,0.12),transparent_34%),radial-gradient(circle_at_86%_16%,rgba(16,185,129,0.10),transparent_34%),linear-gradient(180deg,rgba(2,6,23,0.16),rgba(2,6,23,0.28)_42%,rgba(2,6,23,0.4)_100%)]" />
        <div className="pointer-events-none absolute inset-0 rounded-[36px] ring-1 ring-inset ring-white/35" />

        <div className="relative p-3 md:p-4 lg:p-5">
          <div className="rounded-[30px] border border-white/20 bg-white/[0.02] p-2 backdrop-blur-[3px] md:p-3">
            <CatalogExplorer
              products={catalog}
              initialQuery={initialQuery}
              initialCategory={initialCategory}
              initialCollection={initialCollection}
              initialVerifiedOnly={initialVerifiedOnly}
              initialAvailability={initialAvailability}
            />
          </div>
        </div>
      </div>

      <div className="mt-16">
        <ComboBuilder />
      </div>
    </section>
  );
}
