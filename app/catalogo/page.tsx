import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, BadgeCheck, MessageCircleMore, Search, SlidersHorizontal, UploadCloud } from "lucide-react";
import { CatalogExplorer } from "@/components/catalog-explorer";
import { CommerceFaq } from "@/components/commerce-faq";
import { CatalogRealCases } from "@/components/catalog-real-cases";
import { CatalogBuyingIntents } from "@/components/catalog-buying-intents";
import { SafeBackgroundVideo } from "@/components/safe-background-video";
import { getCatalogSnapshot } from "@/lib/catalog-repository";
import { summarizeProductVisuals } from "@/lib/product-visuals";
import { getSiteUrl } from "@/lib/env";
import { whatsappNumber } from "@/lib/constants";
import { getLicensedVideoAsset } from "@/lib/video-assets";

export const metadata: Metadata = {
  title: "Catálogo",
  description:
    "Catálogo MDH 3D com produtos reais, filtros por intenção, preço Pix, prazo e prova visual para comprar ou pedir sob medida.",
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
  const visualSummary = summarizeProductVisuals(catalog);
  const catalogVideo = getLicensedVideoAsset("process-printer-loop");
  const heroVideo = getLicensedVideoAsset("timelapse-print-loop");
  const whatsappHref = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent("Oi! Quero ajuda para escolher no catálogo da MDH 3D.")}`;
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Início", item: siteUrl },
      { "@type": "ListItem", position: 2, name: "Catálogo", item: `${siteUrl}/catalogo` },
    ],
  };
  const catalogFaq = [
    {
      question: "Como usar o catálogo sem se perder em opções demais?",
      answer:
        "Comece por intenção de compra: presentear, organizar, decorar, colecionar, comprar em lote ou personalizar. Depois refine por foto real, disponibilidade, material e preço.",
    },
    {
      question: "O catálogo mostra só produtos prontos?",
      answer:
        "Não. O catálogo mistura itens com compra direta, pronta entrega, sob encomenda e referências para orçamento. Os selos indicam a leitura visual e o caminho comercial correto.",
    },
    {
      question: "Qual é a faixa inicial para comprar na MDH 3D?",
      answer:
        `A vitrine pública abre a partir de ${new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(minPrice)} no Pix para itens compactos, variando conforme material, acabamento e personalização.`,
    },
  ];
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: catalogFaq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };

  return (
    <section className="catalog-page-shell w-full pb-16 pt-0">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      <div className="relative isolate overflow-hidden border-b border-white/10 bg-black px-4 pb-12 pt-24 sm:px-6 lg:pt-28">
        <SafeBackgroundVideo
          src={heroVideo.src}
          poster={heroVideo.poster}
          videoClassName="opacity-55 saturate-[1.12]"
          overlayClassName="bg-[linear-gradient(90deg,rgba(1,5,10,0.94),rgba(1,5,10,0.58)_48%,rgba(1,5,10,0.88)),linear-gradient(180deg,rgba(1,5,10,0.16),rgba(1,5,10,0.90))]"
        />
        <div className="mdh-cad-grid absolute inset-0 opacity-65" />
        <div className="relative mx-auto grid max-w-7xl gap-10 lg:grid-cols-[minmax(0,0.98fr)_minmax(340px,0.72fr)] lg:items-end">
          <div>
            <h1 className="max-w-5xl text-balance text-[clamp(3rem,7.4vw,6.7rem)] font-black leading-[0.88] text-white">
              Catálogo por intenção, prova visual e fechamento rápido.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/72">
              Busque por produto, filtre por objetivo e avance para compra, WhatsApp ou sob medida sem cair em uma grade repetitiva.
            </p>
            <form action="/catalogo" className="mt-8 flex max-w-3xl flex-col gap-3 rounded-[8px] border border-white/14 bg-white/[0.08] p-2 backdrop-blur-md sm:flex-row">
              <label htmlFor="catalog-hero-search" className="sr-only">
                Buscar no catálogo
              </label>
              <div className="flex min-h-[58px] flex-1 items-center gap-3 rounded-[8px] bg-black/40 px-4">
                <Search className="h-5 w-5 text-cyan-100" />
                <input
                  id="catalog-hero-search"
                  type="search"
                  name="q"
                  placeholder="Busque por presente, suporte, miniatura, organizador..."
                  className="w-full bg-transparent text-base text-white outline-none placeholder:text-white/38"
                />
              </div>
              <button type="submit" className="btn-primary min-h-[58px] gap-2 px-6">
                Buscar
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
            <div className="mt-5 flex flex-wrap gap-2">
              <Link href="/catalogo?mode=real" className="btn-glass gap-2 px-4 py-2 text-sm">
                <BadgeCheck className="h-4 w-4" />
                Peças com foto real
              </Link>
              <Link href="/catalogo?custom=1" className="btn-glass gap-2 px-4 py-2 text-sm">
                <SlidersHorizontal className="h-4 w-4" />
                Personalizáveis
              </Link>
              <Link href="/imagem-para-impressao-3d" className="btn-glass gap-2 px-4 py-2 text-sm">
                <UploadCloud className="h-4 w-4" />
                Pedir sob medida
              </Link>
              <a href={whatsappHref} className="btn-whatsapp gap-2 px-4 py-2 text-sm">
                <MessageCircleMore className="h-4 w-4" />
                Ajuda no WhatsApp
              </a>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            {[
              { label: "Produtos ativos", value: catalog.length.toLocaleString("pt-BR"), body: "itens públicos seguros" },
              { label: "Fotos reais", value: visualSummary.fotoReal.toLocaleString("pt-BR"), body: "mídia honesta sinalizada" },
              {
                label: "Faixa inicial",
                value: new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(minPrice),
                body: "preço Pix de entrada",
              },
            ].map((item) => (
              <div key={item.label} className="mdh-instrument-panel p-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/45">{item.label}</p>
                <p className="mt-2 text-3xl font-black text-white">{item.value}</p>
                <p className="mt-2 text-sm text-white/58">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <CatalogBuyingIntents products={catalog} />

        <div id="catalogo-real" className="mt-12">
          <CatalogRealCases />
        </div>

        <div id="catalogo-vitrine" className="relative isolate mt-12 overflow-hidden rounded-[8px] border border-white/14 bg-[#03070d] shadow-[0_36px_110px_rgba(0,0,0,0.32)]">
          <SafeBackgroundVideo
            src={catalogVideo.src}
            poster={catalogVideo.poster}
            videoClassName="opacity-[0.26]"
            overlayClassName="bg-[linear-gradient(180deg,rgba(2,6,23,0.50),rgba(2,6,23,0.86)),linear-gradient(90deg,rgba(34,211,238,0.07),transparent_44%,rgba(132,204,22,0.06))]"
          />
          <div className="mdh-cad-grid absolute inset-0 opacity-45" />
          <div className="relative p-3 md:p-5 lg:p-6">
            <CatalogExplorer products={catalog} />
          </div>
        </div>

        <div className="mt-14">
          <CommerceFaq
            eyebrow="FAQ do catálogo"
            title="Dúvidas que aparecem antes de clicar no produto."
            description="O catálogo mantém contexto de compra, prova visual e faixa inicial na própria página."
            items={catalogFaq}
          />
        </div>
      </div>
    </section>
  );
}
