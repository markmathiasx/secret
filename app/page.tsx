import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import { ConversionHero } from "@/components/hero/ConversionHero";
import { CommerceFaq } from "@/components/commerce-faq";
import { TrustSignals } from "@/components/trust-signals";
import { ProductionProcess } from "@/components/production-process";
import { getCatalogSnapshot } from "@/lib/catalog-repository";
import { PurchaseProtectionBanner } from "@/components/purchase-protection-banner";
import { isProductRealPhoto, summarizeProductVisuals } from "@/lib/product-visuals";
import { brand, socialLinks, supportEmail, whatsappNumber, whatsappMessage } from "@/lib/constants";
import { getStoreReputationSummary } from "@/lib/marketplace-signals";
import { HomeConversionLanes } from "@/components/home-conversion-lanes";
import { HomeTestimonials } from "@/components/home-testimonials";
import { HomeCategoriesShowcase } from "@/components/home-categories-showcase";
import { DeferredHomeResumePanel } from "@/components/deferred-home-resume-panel";
import { CatalogBuyingIntents } from "@/components/catalog-buying-intents";
import { getSiteUrl } from "@/lib/env";
import { StorefrontSalesShelves } from "@/components/storefront-sales-shelves";
import type { Product } from "@/lib/catalog";
import { getProductUrl } from "@/lib/catalog";
import { buildProductImageAlt } from "@/lib/catalog-media";
import { formatCurrency } from "@/lib/utils";

export const revalidate = 300;

const STLUploader = dynamic(() => import("@/components/stl-uploader").then((module) => module.STLUploader), {
  loading: () => (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <div className="h-96 animate-pulse rounded-[8px] border border-white/10 bg-white/5" />
    </div>
  ),
});

function FeaturedProductCards({ products }: { products: Product[] }) {
  return (
    <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4" role="list">
      {products.map((product, index) => {
        const image = product.image || product.images[0] || "/catalog-assets/product-placeholder.webp";
        return (
          <li key={product.id}>
            <Link
              prefetch={false}
              href={getProductUrl(product)}
              className="group block rounded-[8px] border border-white/10 bg-card p-4 transition hover:-translate-y-1 hover:border-cyan-300/30"
            >
              <div className="relative aspect-square overflow-hidden rounded-[8px] border border-white/10 bg-black/30">
                <Image
                  src={image}
                  alt={product.imageAlt || buildProductImageAlt(product.name)}
                  fill
                  className="object-cover transition duration-500 group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  priority={index === 0}
                />
              </div>
              <div className="mt-4">
                <p className="text-xs uppercase tracking-[0.16em] text-cyan-100/75">{product.category}</p>
                <h3 className="mt-2 line-clamp-2 text-base font-bold text-white">{product.name}</h3>
                <p className="mt-2 line-clamp-2 text-sm leading-6 text-white/65">{product.description}</p>
                <div className="mt-4 flex items-end justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.16em] text-white/50">Pix</p>
                    <p className="text-xl font-black text-emerald-100">{formatCurrency(product.pricePix)}</p>
                  </div>
                  <span className="btn-primary px-4 py-2 text-sm">Ver peça</span>
                </div>
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export default async function HomePage() {
  const catalog = await getCatalogSnapshot();
  const siteUrl = getSiteUrl();
  const catalogCount = catalog.length;
  const visualSummary = summarizeProductVisuals(catalog);
  const realShowcase = catalog.filter((product) => isProductRealPhoto(product)).slice(0, 4);
  const readyRealCount = catalog.filter((product) => product.readyToShip && isProductRealPhoto(product)).length;
  const customizableRealCount = catalog.filter((product) => product.customizable && isProductRealPhoto(product)).length;
  const homeFaq = [
    {
      question: "Qual e o melhor caminho se eu quero comprar hoje?",
      answer:
        "Se o objetivo e decidir rapido, a melhor entrada e o catalogo com preco visivel, prova visual e filtros de pronta entrega, presente, utilidade e foto real.",
    },
    {
      question: "E se eu quiser algo personalizado ou sob medida?",
      answer:
        "A home agora leva direto para a rota de projeto sob medida. Voce pode enviar STL, imagem, medida ou briefing sem sair do fluxo comercial da loja.",
    },
    {
      question: "A MDH 3D atende lote e brindes para empresa ou evento?",
      answer:
        "Sim. Existe uma rota propria para lote, brindes e pedidos repetiveis, com conversa comercial focada em quantidade, prazo, logo e faixa inicial.",
    },
  ];
  const storeSummary = await getStoreReputationSummary();
  const ratingLabel =
    storeSummary?.averageRating !== null && typeof storeSummary?.averageRating === "number"
      ? `${storeSummary.averageRating.toFixed(1)}★`
      : "avaliações reais";
  const localBusinessJsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${siteUrl}#local-business`,
    name: brand.legalName,
    alternateName: brand.name,
    url: siteUrl,
    image: `${siteUrl}/backgrounds/hero-printer-fallback.jpg`,
    telephone: `+${whatsappNumber.replace(/\D/g, "")}`,
    email: supportEmail,
    priceRange: "R$",
    address: {
      "@type": "PostalAddress",
      addressLocality: brand.city,
      addressRegion: brand.state,
      addressCountry: "BR",
    },
    areaServed: {
      "@type": "AdministrativeArea",
      name: "Rio de Janeiro",
    },
    sameAs: [socialLinks.instagram].filter(Boolean),
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        opens: "09:00",
        closes: "20:00",
      },
    ],
  };
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: homeFaq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <ConversionHero
        catalogCount={catalogCount}
        realPhotoCount={visualSummary.fotoReal}
        readyRealCount={readyRealCount}
        ratingLabel={ratingLabel}
        reviewCount={storeSummary?.reviewCount}
      />

      <HomeConversionLanes />

      <StorefrontSalesShelves />

      <section className="mx-auto max-w-7xl px-6 py-6">
        <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="glass-panel p-6 md:p-7">
            <p className="section-kicker">Sinais de confiança</p>
            <h2 className="section-title">Escolha com menos dúvida e avance sem ruído.</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {[
                {
                  title: "Leitura visual honesta",
                  body: "A vitrine separa foto real, render fiel e mídia conceitual para evitar surpresa depois da compra.",
                },
                {
                  title: "Pagamento com status claro",
                  body: "Checkout, retorno de pagamento e rastreio deixam claro o que já foi aprovado, o que está pendente e o que precisa de ação.",
                },
                {
                  title: "Atendimento no mesmo eixo",
                  body: "Consultor, WhatsApp e checkout entram como continuidade da mesma compra, não como ferramentas soltas brigando entre si.",
                },
              ].map((item) => (
                <article key={item.title} className="rounded-[24px] border border-white/10 bg-black/20 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-cyan-300/25">
                  <h3 className="text-base font-bold text-white">{item.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-white/65">{item.body}</p>
                </article>
              ))}
            </div>
          </div>

          <div className="glass-panel p-4 md:p-5">
            <PurchaseProtectionBanner summary={storeSummary} compact />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-10">
        <CatalogBuyingIntents products={catalog} />
      </section>

      <section id="home-featured" className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-8">
          <p className="section-kicker">Catálogo com foto real</p>
          <h2 className="section-title">{catalogCount.toLocaleString("pt-BR")} peças públicas organizadas para decidir mais rápido.</h2>
          <p className="section-copy mt-4 max-w-3xl">
            Comece pelos itens com prova visual mais forte, pronta entrega real ou espaço claro para personalização.
          </p>
        </div>

        <div className="grid gap-4 mb-8 sm:grid-cols-3">
          {[
            { label: "Foto real", value: String(visualSummary.fotoReal).padStart(2, "0") },
            { label: "Pronta entrega", value: String(readyRealCount).padStart(2, "0") },
            { label: "Customizável", value: String(customizableRealCount).padStart(2, "0") },
          ].map((item) => (
            <div key={item.label} className="glass-card p-4 text-center">
              <p className="text-xs uppercase tracking-[0.18em] text-white/45">{item.label}</p>
              <p className="mt-2 text-2xl font-black text-white">{item.value}</p>
            </div>
          ))}
        </div>

        <FeaturedProductCards products={realShowcase} />

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href="/catalogo" prefetch={false} className="btn-primary px-8 py-3">
            Ver catálogo completo
          </Link>
          <Link href="/imagem-para-impressao-3d" prefetch={false} className="btn-secondary px-8 py-3">
            Enviar referência para orçamento
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="glass-panel p-8 md:p-10">
          <p className="section-kicker">Fechamento direto</p>
          <h2 className="section-title">Comprar aqui é mais claro do que procurar em marketplace genérico.</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              {
                icon: "🏭",
                title: "Produção própria, não revenda",
                body: "Cada pedido sai da operação da MDH 3D no RJ. Você fala com quem produz, não com um intermediário distante.",
              },
              {
                icon: "⚡",
                title: "Pagamento visível e objetivo",
                body: "Pix entra de forma direta e o cartão aparece quando o parceiro online está pronto, sem prometer mais do que a operação entrega.",
              },
              {
                icon: "💬",
                title: "Atendimento que ajuda a fechar",
                body: "Consultor, WhatsApp e pós-venda entram para reduzir dúvida de cor, prazo, acabamento e personalização.",
              },
            ].map((item) => (
              <article key={item.title} className="feature-card">
                <p className="feature-icon text-3xl inline-block">{item.icon}</p>
                <h3 className="mt-3 text-base font-bold text-white">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-white/65">{item.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <HomeCategoriesShowcase catalogCount={catalogCount} />

      <HomeTestimonials />

      <DeferredHomeResumePanel />

      <section id="home-upload" className="bg-gradient-to-b from-black to-slate-950/20 py-6">
        <STLUploader />
      </section>

      <TrustSignals />

      <ProductionProcess />

      <section id="home-cta-final" className="mx-auto max-w-7xl px-6 py-16">
        <div className="glass-panel p-8 md:p-10 text-center">
          <p className="section-kicker">Pronto para começar?</p>
          <h2 className="section-title">Escolha seu caminho: catálogo, orçamento ou conversa direta.</h2>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/catalogo" prefetch={false} className="btn-primary px-8 py-3">
              Navegar catálogo
            </Link>
            <Link href="/imagem-para-impressao-3d" prefetch={false} className="btn-secondary px-8 py-3">
              Enviar projeto
            </Link>
            <a href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`} className="btn-glass px-8 py-3">
              Falar por WhatsApp
            </a>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-16">
        <CommerceFaq
          eyebrow="FAQ da home"
          title="As tres perguntas que mais travam uma compra web-first na MDH 3D."
          description="A home agora responde a rota de compra, a rota de briefing e a rota de lote sem esconder essas decisoes em paginas secundarias."
          items={homeFaq}
        />
      </section>
    </main>
  );
}
