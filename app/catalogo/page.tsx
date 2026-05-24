import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, BadgeCheck, Layers3, MessageCircleMore, PackageCheck, Search, SlidersHorizontal, Timer, UploadCloud } from "lucide-react";
import { CatalogExplorer } from "@/components/catalog-explorer";
import { CommerceFaq } from "@/components/commerce-faq";
import { CatalogRealCases } from "@/components/catalog-real-cases";
import { CatalogBuyingIntents } from "@/components/catalog-buying-intents";
import { SafeBackgroundVideo } from "@/components/SafeBackgroundVideo";
import { SafeProductImage } from "@/components/safe-product-image";
import { ProductVisualBadge } from "@/components/product-visual-authenticity";
import { getProductUrl, type Product } from "@/lib/catalog";
import { getCatalogSnapshot } from "@/lib/catalog-repository";
import { getProductVisual, isProductRealPhoto, summarizeProductVisuals } from "@/lib/product-visuals";
import { getSiteUrl } from "@/lib/env";
import { whatsappNumber } from "@/lib/constants";
import { getLicensedVideoAsset } from "@/lib/video-assets";
import { formatCurrency } from "@/lib/utils";

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
  const editorialCollections = buildEditorialCollections(catalog);
  const compareProducts = buildQuickCompareProducts(catalog);
  const realPhotoProducts = catalog.filter((product) => isProductRealPhoto(product)).slice(0, 8);
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

        <CatalogPresentationModes
          editorialCollections={editorialCollections}
          compareProducts={compareProducts}
          realPhotoProducts={realPhotoProducts}
        />

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

function buildEditorialCollections(products: Product[]) {
  const sections = [
    {
      id: "presentes",
      intent: "gifts" as const,
      title: "Presentes personalizados sem aparência genérica.",
      copy: "Peças com nome, tema, cor e escala pensadas para entregar algo com presença física e acabamento de produto final.",
      href: "/catalogo?intent=Presente",
      accent: "from-emerald-300/14",
      products: pickProducts(products, (product) => product.customizable || /presente|chaveiro|familia|medalha|personal/i.test(productSearchText(product)), 3),
    },
    {
      id: "setup",
      intent: "setup" as const,
      title: "Setup, mesa e home office com utilidade clara.",
      copy: "Organizadores, suportes e peças para rotina que precisam caber no espaço real, não só ficar bonitas na vitrine.",
      href: "/catalogo?q=setup",
      accent: "from-cyan-300/14",
      products: pickProducts(products, (product) => /setup|gamer|mesa|home office|suporte|organizador|cabo/i.test(productSearchText(product)), 3),
    },
    {
      id: "lotes",
      intent: "batch" as const,
      title: "Lotes pequenos e brindes com custo controlado.",
      copy: "Itens repetíveis para evento, equipe e ação comercial, com leitura de prazo, material e preço antes da conversa no WhatsApp.",
      href: "/catalogo?intent=Atacado",
      accent: "from-amber-300/14",
      products: pickProducts(products, (product) => /lote|brinde|corporativo|atacado|chaveiro|tag|porta/i.test(productSearchText(product)), 3),
    },
  ];

  return sections.map((section) => ({
    ...section,
    products: section.products.length ? section.products : products.slice(0, 3),
  }));
}

function buildQuickCompareProducts(products: Product[]) {
  const ready = products.filter((product) => product.readyToShip || product.status === "Pronta entrega");
  const source = ready.length >= 5 ? ready : products;
  return [...source]
    .sort((a, b) => {
      const aReal = isProductRealPhoto(a) ? -1 : 0;
      const bReal = isProductRealPhoto(b) ? -1 : 0;
      return aReal - bReal || a.pricePix - b.pricePix;
    })
    .slice(0, 6);
}

function pickProducts(products: Product[], predicate: (product: Product) => boolean, count: number) {
  const selected = products.filter(predicate).slice(0, count);
  if (selected.length >= count) return selected;

  const used = new Set(selected.map((product) => product.id));
  for (const product of products) {
    if (used.has(product.id)) continue;
    selected.push(product);
    used.add(product.id);
    if (selected.length >= count) break;
  }
  return selected;
}

function productSearchText(product: Product) {
  return [
    product.name,
    product.category,
    product.subcategory,
    product.collection,
    product.theme,
    product.description,
    product.material,
    product.tags?.join(" "),
  ]
    .filter(Boolean)
    .join(" ");
}

function CatalogPresentationModes({
  editorialCollections,
  compareProducts,
  realPhotoProducts,
}: {
  editorialCollections: ReturnType<typeof buildEditorialCollections>;
  compareProducts: Product[];
  realPhotoProducts: Product[];
}) {
  return (
    <section className="mdh-catalog-mode-rail mt-14 space-y-10">
      <div className="grid gap-4 lg:grid-cols-3">
        {editorialCollections.map((collection) => {
          const lead = collection.products[0];
          return (
            <Link
              key={collection.id}
              href={collection.href}
              className={`mdh-editorial-product group min-h-[420px] bg-[linear-gradient(145deg,var(--tw-gradient-stops))] ${collection.accent} via-white/[0.055] to-black/40 p-4`}
              data-product-intent={collection.intent}
            >
              <div className="mdh-cad-grid pointer-events-none absolute inset-0 opacity-35" />
              {lead ? (
                <div className="relative aspect-[4/3] overflow-hidden rounded-[8px] border border-white/10 bg-black/30">
                  <SafeProductImage
                    product={lead}
                    alt={lead.name}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
                    sizes="(max-width: 1024px) 100vw, 33vw"
                  />
                  <div className="absolute left-3 top-3">
                    <ProductVisualBadge product={lead} />
                  </div>
                </div>
              ) : null}
              <div className="relative mt-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-100/62">Showcase editorial</p>
                <h2 className="mt-3 text-2xl font-black leading-tight text-white">{collection.title}</h2>
                <p className="mt-3 text-sm leading-7 text-white/66">{collection.copy}</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {collection.products.map((product) => (
                    <span key={product.id} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-white/68">
                      {product.name}
                    </span>
                  ))}
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="mdh-quick-compare rounded-[8px] border border-white/12 bg-white/[0.045] p-4">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-2xl">
            <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-100/66">
              <Layers3 className="h-4 w-4" />
              Comparação rápida
            </p>
            <h2 className="mt-3 text-3xl font-black leading-tight text-white">Menos rolagem, mais decisão.</h2>
            <p className="mt-3 text-sm leading-7 text-white/65">
              Uma leitura compacta de preço, prazo e prova visual antes de abrir o explorer completo.
            </p>
          </div>
          <Link href="#catalogo-vitrine" className="btn-secondary gap-2">
            Abrir filtros avançados
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-5 grid gap-2">
          {compareProducts.map((product) => {
            const visual = getProductVisual(product);
            return (
              <Link
                key={product.id}
                href={getProductUrl(product)}
                className="grid gap-3 rounded-[8px] border border-white/10 bg-black/24 p-3 transition hover:border-cyan-300/28 sm:grid-cols-[88px_minmax(0,1fr)_minmax(120px,0.26fr)_minmax(120px,0.22fr)] sm:items-center"
              >
                <SafeProductImage product={product} alt={product.name} className="aspect-square w-full rounded-[8px] object-cover" sizes="88px" />
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/38">{product.category}</p>
                  <h3 className="mt-1 line-clamp-1 text-base font-black text-white">{product.name}</h3>
                  <p className="mt-1 line-clamp-1 text-xs text-white/55">{product.material} / {product.finish}</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-white/70">
                  <PackageCheck className="h-4 w-4 text-emerald-200" />
                  <span>{visual.label}</span>
                </div>
                <div className="flex items-center justify-between gap-3 sm:block sm:text-right">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-100/58">Pix</p>
                  <p className="text-lg font-black text-white">{formatCurrency(product.pricePix)}</p>
                  <p className="mt-1 flex items-center gap-1 text-xs text-white/45 sm:justify-end">
                    <Timer className="h-3.5 w-3.5" />
                    {product.productionWindow}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {realPhotoProducts.length ? (
        <div className="mdh-real-photo-stream overflow-hidden rounded-[8px] border border-emerald-300/14 bg-[linear-gradient(120deg,rgba(16,185,129,0.10),rgba(3,7,13,0.78))] p-4">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-2xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-100/70">Stream de foto real</p>
              <h2 className="mt-3 text-3xl font-black leading-tight text-white">Prova visual antes do clique.</h2>
              <p className="mt-3 text-sm leading-7 text-white/65">
                Peças já fotografadas aparecem como trilha de confiança para diferenciar foto real, render fiel e ideia visual.
              </p>
            </div>
            <Link href="/catalogo?mode=real" className="btn-glass">
              Ver só fotos reais
            </Link>
          </div>
          <div className="mt-5 flex gap-3 overflow-x-auto pb-2">
            {realPhotoProducts.map((product) => (
              <Link key={product.id} href={getProductUrl(product)} className="min-w-[210px] overflow-hidden rounded-[8px] border border-white/10 bg-black/26">
                <SafeProductImage product={product} alt={product.name} className="aspect-[4/5] w-full object-cover" sizes="220px" />
                <div className="p-3">
                  <ProductVisualBadge product={product} />
                  <p className="mt-3 line-clamp-2 min-h-[2.5rem] text-sm font-bold leading-5 text-white">{product.name}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
