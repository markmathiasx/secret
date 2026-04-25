import Link from "next/link";
import type { Metadata } from "next";
import { CatalogExplorer } from "@/components/catalog-explorer";
import { CommerceFaq } from "@/components/commerce-faq";
import { CatalogRealCases } from "@/components/catalog-real-cases";
import { CatalogBuyingIntents } from "@/components/catalog-buying-intents";
import { getCatalogSnapshot } from "@/lib/catalog-repository";
import { A1_MINI_COLLECTION, isA1MiniCatalogProduct } from "@/lib/a1-mini-catalog";
import { summarizeProductVisuals } from "@/lib/product-visuals";
import { getSiteUrl } from "@/lib/env";

export const metadata: Metadata = {
  title: "Catálogo",
  description:
    "Catálogo MDH 3D com foco em foto real e leitura clara para comparar, escolher e comprar com mais confiança.",
  alternates: {
    canonical: "/catalogo",
  },
};

export const revalidate = 300;
export const dynamic = "force-static";

export default async function CatalogPage() {
  const catalog = await getCatalogSnapshot();
  const siteUrl = getSiteUrl();
  const minPrice = Math.min(...catalog.map((product) => product.pricePix));
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Início", item: siteUrl },
      { "@type": "ListItem", position: 2, name: "Catálogo", item: `${siteUrl}/catalogo` },
    ],
  };
  const visualSummary = summarizeProductVisuals(catalog);
  const a1MiniCount = catalog.filter(isA1MiniCatalogProduct).length;
  const catalogFaq = [
    {
      question: "Como usar o catalogo sem se perder em opcoes demais?",
      answer:
        "A melhor forma e entrar por objetivo de compra: pronta entrega, presente, setup, visual validado ou personalizacao. O catalogo foi reorganizado para vender por intencao, nao por excesso de SKU.",
    },
    {
      question: "O catalogo mostra so produtos prontos?",
      answer:
        "Nao. Ele mistura itens com preco mais fechado e rotas claras para briefing, para que a pessoa nao precise sair da loja quando percebe que quer algo adaptado.",
    },
    {
      question: "Qual e a faixa inicial para comecar a comprar na MDH 3D?",
      answer:
        `Hoje a vitrine publica abre a partir de ${new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(minPrice)} no Pix para itens compactos, com variacao conforme categoria, acabamento e personalizacao.`,
    },
  ];
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: catalogFaq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <section className="catalog-page-shell mx-auto w-full max-w-7xl px-3 pb-14 pt-24 sm:px-4 md:px-6 md:py-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <div className="catalog-hero-shell overflow-hidden rounded-[28px] border border-white/12 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.10),transparent_26%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.08),transparent_24%),linear-gradient(135deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-4 shadow-[0_24px_60px_rgba(2,8,23,0.24)] sm:p-6 md:rounded-[40px] md:p-8">
        <div className="grid gap-6 md:gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <div className="max-w-3xl">
            <p className="text-xs uppercase tracking-[0.22em] text-cyan-200">Catálogo MDH 3D</p>
            <h1 className="catalog-hero-title mt-3 break-words text-3xl font-black leading-[1.06] text-white sm:text-4xl md:text-5xl">
              Foto real, render fiel e filtros para decidir rápido.
            </h1>
            <p className="mt-4 text-base leading-7 text-white/72 md:text-lg md:leading-8">
              Comece por pronta entrega, presente, setup, foto real ou personalização sem perder tempo em uma vitrine confusa.
            </p>

            <div className="catalog-active-lens mt-5 inline-flex max-w-full rounded-full border border-cyan-300/25 bg-cyan-300/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-cyan-100 md:text-xs md:tracking-[0.18em]">
              Compra por objetivo, não por excesso de informação
            </div>

            <div className="mt-6 flex flex-wrap gap-2.5 md:gap-3">
              <Link
                href={`/catalogo?collection=${encodeURIComponent(A1_MINI_COLLECTION)}&mode=all`}
                className="rounded-full border border-emerald-300/25 bg-emerald-300/10 px-4 py-2.5 text-xs font-semibold text-emerald-100 transition hover:border-emerald-300/40 hover:bg-emerald-300/15 md:px-5 md:py-3 md:text-sm"
              >
                100 A1 Mini
              </Link>
              <Link
                href="/catalogo?mode=real"
                className="rounded-full border border-cyan-300/25 bg-cyan-300/10 px-4 py-2.5 text-xs font-semibold text-cyan-100 transition hover:border-cyan-300/40 hover:bg-cyan-300/15 md:px-5 md:py-3 md:text-sm"
              >
                Só foto real
              </Link>
              <Link
                href="/catalogo?mode=verified"
                className="rounded-full border border-violet-300/20 bg-violet-300/10 px-4 py-2.5 text-xs font-semibold text-violet-100 transition hover:border-violet-300/40 hover:bg-violet-300/15 md:px-5 md:py-3 md:text-sm"
              >
                Foto real + render fiel
              </Link>
              <Link
                href="/catalogo"
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-semibold text-white/80 transition hover:border-white/20 hover:text-white md:px-5 md:py-3 md:text-sm"
              >
                Ver tudo
              </Link>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { label: "Produtos ativos", value: String(catalog.length).padStart(4, "0") },
              { label: "A1 Mini", value: String(a1MiniCount).padStart(3, "0") },
              { label: "Fotos reais", value: String(visualSummary.fotoReal).padStart(2, "0") },
            ].map((item) => (
              <div key={item.label} className="min-w-0 rounded-[22px] border border-white/12 bg-black/20 p-4 md:rounded-[28px] md:p-5">
                <p className="text-[10px] uppercase tracking-[0.14em] text-white/55 md:text-xs md:tracking-[0.18em]">
                  {item.label}
                </p>
                <p className="mt-2 break-words text-2xl font-black text-white md:mt-3 md:text-3xl">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="glass-panel mt-8 rounded-[28px] border border-emerald-300/15 bg-emerald-300/8 p-5 text-sm leading-7 text-emerald-50/90">
        <p className="text-xs uppercase tracking-[0.18em] text-emerald-100/80">Leitura comercial</p>
        <p className="mt-2">
          Use os filtros para separar compra rápida, foto real, pronta entrega e personalizados. Os selos seguem deixando claro quando a referência é foto real ou render fiel.
        </p>
      </div>

      <div className="mt-4 rounded-[28px] border border-white/10 bg-white/5 p-5 text-sm leading-7 text-white/70">
        <p className="text-xs uppercase tracking-[0.18em] text-cyan-100/80">Faixa inicial</p>
        <p className="mt-2">
          O catálogo público abre hoje a partir de {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(minPrice)} no Pix para itens compactos, e sobe conforme categoria, acabamento e nível de personalização.
        </p>
      </div>

      <CatalogBuyingIntents products={catalog} />

      <div id="catalogo-real" className="mt-12">
        <CatalogRealCases />
      </div>

      <div id="catalogo-vitrine" className="catalog-video-shell relative isolate mt-8 overflow-hidden rounded-[28px] border border-white/14 shadow-[0_28px_72px_rgba(2,8,23,0.16)] md:mt-10 md:rounded-[36px]">
        <video
          className="absolute inset-0 h-full w-full object-cover opacity-[0.24]"
          src="/assets/videos/hero-bg.mp4"
          poster="/assets/videos/hero-poster.jpg"
          autoPlay
          muted
          loop
          playsInline
          preload="none"
          aria-hidden
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_14%_20%,rgba(34,211,238,0.06),transparent_34%),radial-gradient(circle_at_86%_16%,rgba(16,185,129,0.05),transparent_34%),linear-gradient(180deg,rgba(2,6,23,0.30),rgba(2,6,23,0.58)_40%,rgba(2,6,23,0.74)_100%)]" />
        <div className="pointer-events-none absolute inset-0 rounded-[28px] ring-1 ring-inset ring-white/40 md:rounded-[36px]" />

        <div className="catalog-video-content relative p-2.5 md:p-4 lg:p-5">
          <div className="catalog-video-inner rounded-[24px] border border-white/16 bg-slate-950/72 p-1.5 backdrop-blur-md md:rounded-[30px] md:p-3">
            <CatalogExplorer
              products={catalog}
            />
          </div>
        </div>
      </div>

      <div className="mt-14">
        <CommerceFaq
          eyebrow="FAQ do catalogo"
          title="As duvidas comerciais que mais aparecem antes do clique no produto."
          description="O catalogo agora segura contexto de compra e faixa inicial na propria pagina, sem empurrar tudo para atendimento humano."
          items={catalogFaq}
        />
      </div>
    </section>
  );
}
