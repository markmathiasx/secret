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
  material?: string;
  intent?: string;
  sort?: string;
  custom?: string;
  min?: string;
  max?: string;
};

export default async function CatalogPage({ searchParams }: { searchParams?: Promise<CatalogPageSearchParams> }) {
  const params = searchParams ? await searchParams : undefined;
  const initialQuery = params?.q?.trim() || '';
  const initialCategory = params?.category && categories.includes(params.category) ? params.category : 'Todas';
  const initialCollection = params?.collection && collections.includes(params.collection) ? params.collection : 'Todas';
  const initialVerifiedOnly = params?.mode === 'verified';
  const initialAvailability = params?.status === 'Pronta entrega' || params?.status === 'Sob encomenda' ? params.status : 'Todos';
  const initialMaterial = params?.material?.trim() || 'Todos';
  const initialIntent = params?.intent?.trim() || 'Geral';
  const initialOrder = params?.sort?.trim() || 'Mais Recentes';
  const initialCustomizableOnly = params?.custom === '1';
  const initialMin = params?.min ? Number(params.min) : undefined;
  const initialMax = params?.max ? Number(params.max) : undefined;
  const visualSummary = summarizeProductVisuals(catalog);
  const auditedPricingCount = catalog.filter((product) => product.pricingMode === 'faixa-auditada').length;
  const activeLens = [
    initialCategory !== 'Todas' ? initialCategory : null,
    initialCollection !== 'Todas' ? initialCollection : null,
    initialQuery ? `Busca: ${initialQuery}` : null,
    initialAvailability !== 'Todos' ? initialAvailability : null,
    initialMaterial !== 'Todos' ? initialMaterial : null,
    initialIntent !== 'Geral' ? initialIntent : null,
    initialCustomizableOnly ? 'Personalizáveis' : null,
  ]
    .filter(Boolean)
    .join(' • ');
  const heroTitle = activeLens
    ? 'Catálogo filtrado para chegar mais rápido no tipo de peça certa.'
    : 'Peças reais, projetos sob medida e preços claros para comprar com segurança.';
  const heroDescription = activeLens
    ? 'Os filtros da URL agora entram ativos na vitrine para você compartilhar uma seleção pronta de presentes, utilidades, colecionáveis ou peças sob medida.'
    : 'A vitrine abre destacando peças com foto real e visuais já validados. Quando um item ainda está em fase de projeto, o catálogo assume isso com transparência e mostra uma estimativa inicial para encomenda.';

  return (
    <section className="catalog-page-shell mx-auto w-full max-w-7xl px-3 pb-14 pt-24 sm:px-4 md:px-6 md:py-16">
      <div className="catalog-hero-shell overflow-hidden rounded-[28px] border border-white/12 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.18),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.16),transparent_28%),linear-gradient(135deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] p-4 shadow-[0_24px_80px_rgba(2,8,23,0.32)] sm:p-6 md:rounded-[40px] md:p-8">
        <div className="grid gap-6 md:gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <div className="max-w-3xl">
            <p className="text-xs uppercase tracking-[0.22em] text-cyan-200">Catálogo MDH 3D</p>
            <h1 className="catalog-hero-title mt-3 break-words text-3xl font-black leading-[1.06] text-white sm:text-4xl md:text-5xl">{heroTitle}</h1>
            <p className="mt-4 text-base leading-7 text-white/72 md:text-lg md:leading-8">{heroDescription}</p>
            {activeLens ? (
              <div className="catalog-active-lens mt-5 inline-flex max-w-full rounded-full border border-cyan-300/25 bg-cyan-300/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-cyan-100 md:text-xs md:tracking-[0.18em]">
                {activeLens}
              </div>
            ) : null}
            <div className="mt-6 flex flex-wrap gap-2.5 md:gap-3">
              <Link
                href="#catalogo-real"
                className="rounded-full border border-cyan-300/25 bg-cyan-300/10 px-4 py-2.5 text-xs font-semibold text-cyan-100 transition hover:border-cyan-300/40 hover:bg-cyan-300/15 md:px-5 md:py-3 md:text-sm"
              >
                Ver peças com foto real
              </Link>
              <Link
                href="#catalogo-vitrine"
                className="rounded-full border border-violet-300/20 bg-violet-300/10 px-4 py-2.5 text-xs font-semibold text-violet-100 transition hover:border-violet-300/40 hover:bg-violet-300/15 md:px-5 md:py-3 md:text-sm"
              >
                Ir para vitrine
              </Link>
              <Link
                href="#combo-builder"
                className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-4 py-2.5 text-xs font-semibold text-emerald-100 transition hover:border-emerald-300/40 hover:bg-emerald-300/15 md:px-5 md:py-3 md:text-sm"
              >
                Montar combo
              </Link>
              <Link
                href="/imagem-para-impressao-3d"
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-semibold text-white/80 transition hover:border-white/20 hover:text-white md:px-5 md:py-3 md:text-sm"
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
              <div key={item.label} className="min-w-0 rounded-[22px] border border-white/12 bg-black/20 p-4 md:rounded-[28px] md:p-5">
                <p className="text-[10px] uppercase tracking-[0.14em] text-white/55 md:text-xs md:tracking-[0.18em]">{item.label}</p>
                <p className="mt-2 break-words text-2xl font-black text-white md:mt-3 md:text-3xl">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-3">
        {[
          { label: 'Autenticidade', value: 'Foto real, render fiel e prévia separados com clareza' },
          { label: 'Compartilhamento', value: 'Filtros podem virar uma vitrine pronta para enviar ao cliente' },
          { label: 'Fechamento', value: 'Catálogo, WhatsApp e checkout conectados na mesma jornada' }
        ].map((item) => (
          <div key={item.label} className="surface-stat rounded-[24px] px-4 py-4">
            <p className="text-[11px] uppercase tracking-[0.18em] text-white/50">{item.label}</p>
            <p className="mt-3 text-sm leading-6 text-white/80">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="glass-panel mt-8 rounded-[28px] border border-amber-300/15 bg-amber-300/8 p-5 text-sm leading-7 text-amber-50/90">
        <p className="text-xs uppercase tracking-[0.18em] text-amber-100/80">Como ler a vitrine</p>
        <p className="mt-2">
          Foto real indica peça já produzida. Render do produto mostra a geometria real do modelo. Prévia do modelo aponta a direção visual da encomenda e é acompanhada de estimativa inicial para tamanho, acabamento e personalização.
        </p>
      </div>

      <CatalogBuyingIntents products={catalog} />

      <CatalogRealCases />

      <div id="catalogo-vitrine" className="catalog-video-shell relative isolate mt-8 overflow-hidden rounded-[28px] border border-cyan-200/45 shadow-[0_28px_84px_rgba(2,8,23,0.18)] md:mt-10 md:rounded-[36px]">
        <video
          className="absolute inset-0 h-full w-full object-cover opacity-[0.98]"
          src="/assets/videos/hero-bg.mp4"
          poster="/assets/videos/hero-poster.jpg"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_14%_20%,rgba(34,211,238,0.10),transparent_36%),radial-gradient(circle_at_86%_16%,rgba(16,185,129,0.08),transparent_36%),linear-gradient(180deg,rgba(2,6,23,0.06),rgba(2,6,23,0.12)_45%,rgba(2,6,23,0.18)_100%)]" />
        <div className="pointer-events-none absolute inset-0 rounded-[28px] ring-1 ring-inset ring-white/40 md:rounded-[36px]" />

        <div className="catalog-video-content relative p-2.5 md:p-4 lg:p-5">
          <div className="catalog-video-inner rounded-[24px] border border-white/20 bg-white/[0.02] p-1.5 backdrop-blur-[2px] md:rounded-[30px] md:p-3">
            <CatalogExplorer
              products={catalog}
              initialQuery={initialQuery}
              initialCategory={initialCategory}
              initialCollection={initialCollection}
              initialVerifiedOnly={initialVerifiedOnly}
              initialAvailability={initialAvailability}
              initialMaterial={initialMaterial}
              initialIntent={initialIntent}
              initialOrder={initialOrder}
              initialCustomizableOnly={initialCustomizableOnly}
              initialPriceMin={initialMin}
              initialPriceMax={initialMax}
            />
          </div>
        </div>
      </div>

      <div id="combo-builder" className="mt-16">
        <ComboBuilder />
      </div>
    </section>
  );
}
