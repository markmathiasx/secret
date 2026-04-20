import Link from "next/link";
import type { Metadata } from "next";
import { CatalogExplorer } from "@/components/catalog-explorer";
import { CatalogRealCases } from "@/components/catalog-real-cases";
import { getCatalogSnapshot } from "@/lib/catalog-repository";
import { A1_MINI_COLLECTION, isA1MiniCatalogProduct } from "@/lib/a1-mini-catalog";
import { summarizeProductVisuals } from "@/lib/product-visuals";
import { getSiteUrl } from "@/lib/env";

export const metadata: Metadata = {
  title: "Catálogo",
  description:
    "Catalogo MDH 3D com foco em foto real e leitura clara para comparar, escolher e comprar com mais confianca.",
  alternates: {
    canonical: "/catalogo",
  },
};

export const revalidate = 300;
export const dynamic = "force-static";

export default async function CatalogPage() {
  const catalog = await getCatalogSnapshot();
  const siteUrl = getSiteUrl();
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

  return (
    <section className="catalog-page-shell mx-auto w-full max-w-7xl px-3 pb-14 pt-24 sm:px-4 md:px-6 md:py-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <div className="catalog-hero-shell overflow-hidden rounded-[28px] border border-white/12 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.18),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.16),transparent_28%),linear-gradient(135deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] p-4 shadow-[0_24px_80px_rgba(2,8,23,0.32)] sm:p-6 md:rounded-[40px] md:p-8">
        <div className="grid gap-6 md:gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <div className="max-w-3xl">
            <p className="text-xs uppercase tracking-[0.22em] text-cyan-200">Catálogo MDH 3D</p>
            <h1 className="catalog-hero-title mt-3 break-words text-3xl font-black leading-[1.06] text-white sm:text-4xl md:text-5xl">
              Todos os produtos publicados aparecem na vitrine.
            </h1>
            <p className="mt-4 text-base leading-7 text-white/72 md:text-lg md:leading-8">
              Cada item ativo tem uma imagem principal propria no card e na pagina do produto. Os filtros continuam disponiveis para quem quiser ver apenas fotos reais ou renders fieis.
            </p>

            <div className="catalog-active-lens mt-5 inline-flex max-w-full rounded-full border border-cyan-300/25 bg-cyan-300/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-cyan-100 md:text-xs md:tracking-[0.18em]">
              Catálogo completo
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
          A vitrine publica mostra o catalogo completo, sem esconder produto por tipo de midia. Quando a imagem nao e foto real,
          o selo visual deixa claro o tipo de referencia antes da compra.
        </p>
      </div>

      <div id="catalogo-real" className="mt-12">
        <CatalogRealCases />
      </div>

      <div id="catalogo-vitrine" className="catalog-video-shell relative isolate mt-8 overflow-hidden rounded-[28px] border border-cyan-200/45 shadow-[0_28px_84px_rgba(2,8,23,0.18)] md:mt-10 md:rounded-[36px]">
        <video
          className="absolute inset-0 h-full w-full object-cover opacity-[0.98]"
          src="/assets/videos/hero-bg.mp4"
          poster="/assets/videos/hero-poster.jpg"
          autoPlay
          muted
          loop
          playsInline
          preload="none"
          aria-hidden
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_14%_20%,rgba(34,211,238,0.10),transparent_36%),radial-gradient(circle_at_86%_16%,rgba(16,185,129,0.08),transparent_36%),linear-gradient(180deg,rgba(2,6,23,0.06),rgba(2,6,23,0.12)_45%,rgba(2,6,23,0.18)_100%)]" />
        <div className="pointer-events-none absolute inset-0 rounded-[28px] ring-1 ring-inset ring-white/40 md:rounded-[36px]" />

        <div className="catalog-video-content relative p-2.5 md:p-4 lg:p-5">
          <div className="catalog-video-inner rounded-[24px] border border-white/20 bg-white/[0.02] p-1.5 backdrop-blur-[2px] md:rounded-[30px] md:p-3">
            <CatalogExplorer
              products={catalog}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
