import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import { ArrowRight, BadgeCheck, CreditCard, Factory, MessageCircleMore, PackageCheck, Sparkles, UploadCloud } from "lucide-react";
import { PremiumHero } from "@/components/hero/PremiumHero";
import { CommerceFaq } from "@/components/commerce-faq";
import { ProductionProcess } from "@/components/production-process";
import { PurchaseProtectionBanner } from "@/components/purchase-protection-banner";
import { SafeBackgroundVideo } from "@/components/SafeBackgroundVideo";
import { getCatalogSnapshot } from "@/lib/catalog-repository";
import type { Product } from "@/lib/catalog";
import { getProductUrl } from "@/lib/catalog";
import { resolveProductImage } from "@/lib/product-images";
import { isProductRealPhoto, isProductVisualVerified, summarizeProductVisuals } from "@/lib/product-visuals";
import { brand, socialLinks, supportEmail, whatsappMessage, whatsappNumber } from "@/lib/constants";
import { getStoreReputationSummary } from "@/lib/marketplace-signals";
import { getSiteUrl } from "@/lib/env";
import { formatCurrency } from "@/lib/utils";
import { getLicensedVideoAsset } from "@/lib/video-assets";

export const revalidate = 300;

const STLUploader = dynamic(() => import("@/components/stl-uploader").then((module) => module.STLUploader), {
  loading: () => (
    <div className="mx-auto max-w-7xl px-6 py-16">
      <div className="h-96 animate-pulse rounded-[8px] border border-white/10 bg-white/5" />
    </div>
  ),
});

const bentoBlocks = [
  {
    title: "Presentes personalizados",
    body: "Peças com leitura afetiva, nome, cor e escala pensadas para entregar algo físico sem cara de brinde genérico.",
    href: "/catalogo?intent=Presente&mode=verified",
    cta: "Comprar presente",
    accent: "from-cyan-300/18",
  },
  {
    title: "Geek e colecionáveis",
    body: "Miniaturas, cultura pop e objetos de setup com mídia classificada para separar foto real, render fiel e referência.",
    href: "/catalogo?collection=Anime%20%26%20Geek&mode=verified",
    cta: "Ver colecionáveis",
    accent: "from-violet-300/18",
  },
  {
    title: "Setup gamer e home office",
    body: "Suportes, organizadores e peças funcionais para bancada, cabos, controles, fones e objetos de uso diário.",
    href: "/catalogo?category=Setup%20%26%20Organiza%C3%A7%C3%A3o",
    cta: "Organizar setup",
    accent: "from-lime-300/16",
  },
  {
    title: "Casa e organização",
    body: "Utilidades compactas para banheiro, cozinha, mesa e prateleira com produção sob demanda no RJ.",
    href: "/catalogo?category=Utilidades%20Reais",
    cta: "Ver utilidades",
    accent: "from-emerald-300/16",
  },
  {
    title: "Peças sob medida",
    body: "Envie foto, STL, medida ou ideia. A equipe valida viabilidade, material, acabamento e prazo antes do fechamento.",
    href: "/imagem-para-impressao-3d",
    cta: "Enviar briefing",
    accent: "from-amber-300/18",
  },
  {
    title: "Lotes e brindes corporativos",
    body: "Produção repetível para eventos, kits, lembranças e ações comerciais com conversa direta sobre quantidade.",
    href: "/brindes-personalizados-3d",
    cta: "Orçar lote",
    accent: "from-fuchsia-300/14",
  },
] as const;

function TrustStrip({ catalogCount, realPhotoCount }: { catalogCount: number; realPhotoCount: number }) {
  const items = [
    { icon: Factory, label: "Produção local RJ", value: "ateliê próprio" },
    { icon: MessageCircleMore, label: "Atendimento humano", value: "WhatsApp direto" },
    { icon: CreditCard, label: "Pix e cartão", value: "fechamento claro" },
    { icon: PackageCheck, label: "Prazo visível", value: "sem surpresa" },
    { icon: BadgeCheck, label: "Catálogo validado", value: `${catalogCount.toLocaleString("pt-BR")} itens` },
    { icon: Sparkles, label: "Prova visual", value: `${realPhotoCount.toLocaleString("pt-BR")} fotos reais` },
  ];

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mdh-trust-rail grid gap-3 md:grid-cols-3 xl:grid-cols-6">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="mdh-instrument-panel p-4">
              <Icon className="h-5 w-5 text-cyan-100" />
              <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/42">{item.label}</p>
              <p className="mt-1 text-sm font-bold text-white">{item.value}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function CommercialBento() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:py-16">
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h2 className="mdh-section-title max-w-4xl">Compre por uso, não por uma grade infinita.</h2>
          <p className="mt-4 max-w-2xl text-base leading-8 text-white/66">
            Cada entrada leva a uma vitrine real, com intenção comercial clara e menos ruído para decidir.
          </p>
        </div>
        <Link href="/catalogo" className="btn-secondary w-fit gap-2">
          Ver todas as rotas
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      <div className="grid gap-4 lg:grid-cols-6">
        {bentoBlocks.map((block, index) => (
          <Link
            key={block.title}
            href={block.href}
            className={`mdh-bento-card min-h-[260px] ${index === 0 || index === 4 ? "lg:col-span-3" : "lg:col-span-2"}`}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${block.accent} via-transparent to-transparent opacity-100`} />
            <div className="mdh-cad-grid absolute inset-0 opacity-35" />
            <div className="relative flex h-full flex-col justify-between">
              <span className="inline-flex w-fit rounded-full border border-white/12 bg-white/[0.07] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/60">
                Rota {String(index + 1).padStart(2, "0")}
              </span>
              <div>
                <h3 className="text-2xl font-black leading-tight text-white md:text-3xl">{block.title}</h3>
                <p className="mt-4 text-sm leading-7 text-white/65">{block.body}</p>
                <span className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-cyan-100">
                  {block.cta}
                  <ArrowRight className="h-4 w-4" />
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function ProductShowcase({ products }: { products: Product[] }) {
  const showcase = products
    .filter((product) => isProductRealPhoto(product) || isProductVisualVerified(product))
    .slice(0, 6);

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:py-16">
      <div className="mb-8 grid gap-5 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
        <div>
          <h2 className="mdh-section-title">Showcase editorial de peças que vendem no detalhe.</h2>
        </div>
        <p className="max-w-3xl text-base leading-8 text-white/66">
          A vitrine principal puxa produtos com prova visual mais forte e compõe cards maiores, com preço, mídia honesta e CTA sem parecer lista repetida.
        </p>
      </div>
      <div className="grid gap-4 lg:grid-cols-12">
        {showcase.map((product, index) => {
          const image = resolveProductImage(product);
          return (
            <Link
              key={product.id}
              href={getProductUrl(product)}
              className={`mdh-editorial-product ${index === 0 ? "lg:col-span-7 lg:row-span-2" : index === 1 ? "lg:col-span-5" : "lg:col-span-4"}`}
            >
              <div className="relative min-h-[300px] overflow-hidden rounded-[8px] bg-slate-950">
                <Image
                  src={image}
                  alt={product.imageAlt || product.name}
                  fill
                  className="object-cover transition duration-700 group-hover:scale-105"
                  sizes={index === 0 ? "(min-width: 1024px) 58vw, 100vw" : "(min-width: 1024px) 34vw, 100vw"}
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,6,23,0.05),rgba(2,6,23,0.84))]" />
                <div className="absolute inset-x-0 bottom-0 p-5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-100/75">{product.category}</p>
                  <h3 className="mt-2 line-clamp-2 text-2xl font-black text-white">{product.name}</h3>
                  <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.16em] text-white/45">Pix</p>
                      <p className="text-3xl font-black text-emerald-200">{formatCurrency(product.pricePix)}</p>
                    </div>
                    <span className="rounded-full border border-white/14 bg-white/10 px-4 py-2 text-sm font-bold text-white backdrop-blur">
                      Ver peça
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

function MadeToOrderSection() {
  const whatsappHref = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent("Oi! Não achei no catálogo e quero orçamento para uma peça 3D sob medida.")}`;

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:py-16">
      <div className="relative isolate overflow-hidden rounded-[8px] border border-cyan-300/18 bg-[#03070d] p-6 shadow-[0_40px_120px_rgba(0,0,0,0.34)] md:p-10">
        <div className="mdh-cad-grid absolute inset-0 opacity-55" />
        <div className="absolute inset-y-0 right-0 w-1/2 bg-[linear-gradient(90deg,transparent,rgba(34,211,238,0.12),rgba(245,158,11,0.07))]" />
        <div className="relative grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <h2 className="mdh-section-title max-w-3xl">Não achou no catálogo? Transforme referência em peça produzível.</h2>
            <p className="mt-5 max-w-2xl text-base leading-8 text-white/68">
              Envie STL, imagem, medida ou briefing. A MDH valida viabilidade, material, prazo e acabamento antes de prometer produção.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <a href={whatsappHref} className="btn-whatsapp gap-2">
                <MessageCircleMore className="h-4 w-4" />
                Pedir sob medida
              </a>
              <Link href="/imagem-para-impressao-3d" className="btn-secondary gap-2">
                <UploadCloud className="h-4 w-4" />
                Enviar arquivo 3D
              </Link>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              ["Briefing", "foto, ideia, STL ou medidas"],
              ["Validação", "escala, material e acabamento"],
              ["Produção", "fila real do ateliê no RJ"],
              ["Entrega", "embalagem e status claro"],
            ].map(([title, body]) => (
              <div key={title} className="mdh-instrument-panel p-5">
                <p className="text-sm font-black text-white">{title}</p>
                <p className="mt-2 text-sm leading-6 text-white/58">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function FinalCta({ videoSrc, posterSrc }: { videoSrc: string | null; posterSrc: string | null }) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:pb-20">
      <div className="relative isolate min-h-[420px] overflow-hidden rounded-[8px] border border-white/14 bg-black shadow-[0_36px_120px_rgba(0,0,0,0.42)]">
        <SafeBackgroundVideo
          src={videoSrc}
          poster={posterSrc}
          videoClassName="opacity-55"
          overlayClassName="bg-[linear-gradient(90deg,rgba(2,5,10,0.92),rgba(2,5,10,0.64)_52%,rgba(2,5,10,0.88)),linear-gradient(180deg,rgba(2,5,10,0.18),rgba(2,5,10,0.92))]"
        />
        <div className="mdh-cad-grid absolute inset-0 opacity-45" />
        <div className="relative z-10 flex min-h-[420px] flex-col justify-end p-6 md:p-10">
          <h2 className="max-w-4xl text-balance text-4xl font-black leading-[0.95] text-white md:text-6xl">
            Escolha uma peça pronta ou envie a ideia. A produção começa com clareza.
          </h2>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link href="/catalogo" className="btn-primary gap-2">
              Explorar catálogo
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/imagem-para-impressao-3d" className="btn-secondary gap-2">
              Enviar projeto
              <UploadCloud className="h-4 w-4" />
            </Link>
            <a href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`} className="btn-whatsapp gap-2">
              WhatsApp
              <MessageCircleMore className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export default async function HomePage() {
  const catalog = await getCatalogSnapshot();
  const siteUrl = getSiteUrl();
  const catalogCount = catalog.length;
  const visualSummary = summarizeProductVisuals(catalog);
  const readyRealCount = catalog.filter((product) => product.readyToShip && isProductRealPhoto(product)).length;
  const heroVideo = getLicensedVideoAsset("hero-printer-loop");
  const processVideo = getLicensedVideoAsset("process-printer-loop");
  const storeSummary = await getStoreReputationSummary();
  const ratingLabel =
    storeSummary?.averageRating !== null && typeof storeSummary?.averageRating === "number"
      ? `${storeSummary.averageRating.toFixed(1)} de 5`
      : "avaliações reais";
  const homeFaq = [
    {
      question: "Qual é o melhor caminho se eu quero comprar hoje?",
      answer:
        "Use o catálogo por intenção: presente, organização, foto real, pronta entrega ou sob medida. A vitrine mostra preço Pix, prazo e prova visual antes do clique.",
    },
    {
      question: "E se eu quiser algo personalizado ou sob medida?",
      answer:
        "Envie STL, foto, medida ou briefing. A equipe valida viabilidade, material, escala, acabamento e prazo antes do fechamento.",
    },
    {
      question: "A MDH 3D atende lote e brindes para empresa ou evento?",
      answer:
        "Sim. A rota de lotes e brindes direciona a conversa para quantidade, prazo, aplicação, acabamento e faixa inicial.",
    },
  ];
  const localBusinessJsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${siteUrl}#local-business`,
    name: brand.legalName,
    alternateName: brand.name,
    url: siteUrl,
    image: `${siteUrl}/media/posters/hero-printer-poster.webp`,
    telephone: `+${whatsappNumber.replace(/\D/g, "")}`,
    email: supportEmail,
    priceRange: "R$",
    address: {
      "@type": "PostalAddress",
      addressLocality: brand.city,
      addressRegion: brand.state,
      addressCountry: "BR",
    },
    areaServed: { "@type": "AdministrativeArea", name: "Rio de Janeiro" },
    sameAs: [socialLinks.instagram].filter(Boolean),
  };
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: homeFaq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <PremiumHero
        catalogCount={catalogCount}
        realPhotoCount={visualSummary.fotoReal}
        readyRealCount={readyRealCount}
        ratingLabel={ratingLabel}
        reviewCount={storeSummary?.reviewCount}
        backgroundVideoSrc={heroVideo.src}
        backgroundPosterSrc={heroVideo.poster}
      />
      <TrustStrip catalogCount={catalogCount} realPhotoCount={visualSummary.fotoReal} />
      <CommercialBento />
      <ProductShowcase products={catalog} />
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <PurchaseProtectionBanner summary={storeSummary} />
      </section>
      <ProductionProcess />
      <MadeToOrderSection />
      <section id="home-upload" className="py-6">
        <STLUploader />
      </section>
      <FinalCta videoSrc={processVideo.src} posterSrc={processVideo.poster} />
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
        <CommerceFaq
          eyebrow="FAQ comercial"
          title="As perguntas que destravam catálogo, orçamento e lote."
          description="Respostas objetivas para decidir se você compra agora, pede ajuste ou envia um projeto sob medida."
          items={homeFaq}
        />
      </section>
    </>
  );
}
