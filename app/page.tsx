import Link from "next/link";
import { Hero } from "@/components/hero-professional";
import { CatalogGrid } from "@/components/catalog-grid";
import { STLUploader } from "@/components/stl-uploader";
import { TrustSignals } from "@/components/trust-signals";
import { ProductionProcess } from "@/components/production-process";
import { getCatalogSnapshot } from "@/lib/catalog-repository";
import { PurchaseProtectionBanner } from "@/components/purchase-protection-banner";
import { isProductRealPhoto, summarizeProductVisuals } from "@/lib/product-visuals";
import { brand, socialLinks, supportEmail, whatsappNumber, whatsappMessage } from "@/lib/constants";
import { getStoreReputationSummary } from "@/lib/marketplace-signals";
import { HomeAnimatedStats } from "@/components/home-animated-stats";
import { HomeTestimonials } from "@/components/home-testimonials";
import { HomeCategoriesShowcase } from "@/components/home-categories-showcase";
import { getSiteUrl } from "@/lib/env";

export const revalidate = 300;

export default async function HomePage() {
  const catalog = await getCatalogSnapshot();
  const siteUrl = getSiteUrl();
  const catalogCount = catalog.length;
  const visualSummary = summarizeProductVisuals(catalog);
  const realShowcase = catalog.filter((product) => isProductRealPhoto(product)).slice(0, 4);
  const readyRealCount = catalog.filter((product) => product.readyToShip && isProductRealPhoto(product)).length;
  const customizableRealCount = catalog.filter((product) => product.customizable && isProductRealPhoto(product)).length;
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

  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }} />
      <Hero
        catalogCount={catalogCount}
        realPhotoCount={visualSummary.fotoReal}
        readyRealCount={readyRealCount}
        ratingLabel={ratingLabel}
        reviewCount={storeSummary?.reviewCount}
      />

      <section className="mx-auto max-w-7xl px-6 py-6">
        <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="glass-panel p-6 md:p-7">
            <p className="section-kicker">Sinais de confiança</p>
            <h2 className="section-title">A primeira rolagem já explica por que a MDH 3D não parece loja genérica.</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {[
                {
                  title: "Mídia pública governada",
                  body: "A vitrine pública não fica misturando placeholder, item bloqueado e mídia sem contexto. A leitura visual já nasce mais honesta.",
                },
                {
                  title: "Compra com status claro",
                  body: "Checkout, retorno de pagamento e rastreio usam estados explícitos para sucesso, falha e pendência sem esconder o que aconteceu.",
                },
                {
                  title: "Atendimento integrado",
                  body: "Chat, WhatsApp e inbox entram como continuidade comercial da jornada, não como ferramenta solta brigando com o resto da loja.",
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

      <HomeAnimatedStats
        catalogCount={catalogCount}
        ratingLabel={ratingLabel}
        reviewCount={storeSummary?.reviewCount}
      />

      <section id="home-featured" className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-8">
          <p className="section-kicker">Catálogo com foto real</p>
          <h2 className="section-title">{catalogCount.toLocaleString("pt-BR")} peças públicas com leitura forte para decidir mais rápido.</h2>
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

        <CatalogGrid products={realShowcase} />

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href="/catalogo" className="btn-primary px-8 py-3">
            Ver catálogo completo
          </Link>
          <Link href="/imagem-para-impressao-3d" className="btn-secondary px-8 py-3">
            Enviar referência para orçamento
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="glass-panel p-8 md:p-10">
          <p className="section-kicker">Por que MDH 3D?</p>
          <h2 className="section-title">O que os grandes marketplaces não oferecem.</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              {
                icon: "🏭",
                title: "Produção própria, não revendedor",
                body: "Cada pedido sai de impressoras Bambu Lab no RJ. Você fala com quem faz, não com um intermediário.",
              },
              {
                icon: "⚡",
                title: "Pix com QR e cópia-e-cola imediato",
                body: "Sem redirecionar para gateway externo. QR Code gerado na hora, confirmação em minutos.",
              },
              {
                icon: "💬",
                title: "Atendimento no WhatsApp com resposta real",
                body: "Não é chatbot. É a equipe de produção respondendo dúvidas de cor, prazo e acabamento.",
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

      <section id="home-paths" className="mx-auto max-w-7xl px-6 py-16">
        <div className="glass-panel p-8 md:p-10">
          <p className="section-kicker">Como começar</p>
          <h2 className="section-title">Três caminhos para encontrar exatamente o que você precisa.</h2>

          <div className="mt-8 grid gap-5 md:grid-cols-3">
            <article className="rounded-[24px] border border-white/10 bg-black/20 p-6">
              <p className="text-3xl font-black text-cyan-300">1</p>
              <h3 className="mt-3 text-lg font-bold text-white">Browsar o catálogo</h3>
              <p className="mt-2 text-sm leading-6 text-white/68">
                {catalogCount.toLocaleString("pt-BR")} peças prontas. Filtre por material, preço, disponibilidade ou categoria. Pronto para comprar hoje.
              </p>
              <Link href="/catalogo" className="btn-glass mt-4 inline-block px-4 py-2 text-sm">
                Abrir catálogo
              </Link>
            </article>

            <article className="rounded-[24px] border border-white/10 bg-black/20 p-6">
              <p className="text-3xl font-black text-emerald-300">2</p>
              <h3 className="mt-3 text-lg font-bold text-white">Orçar um projeto</h3>
              <p className="mt-2 text-sm leading-6 text-white/68">
                Envie uma imagem, STL ou briefing. Receba análise de viabilidade, material e prazo direto no WhatsApp.
              </p>
              <Link href="/imagem-para-impressao-3d" className="btn-glass mt-4 inline-block px-4 py-2 text-sm">
                Abrir orçador
              </Link>
            </article>

            <article className="rounded-[24px] border border-white/10 bg-black/20 p-6">
              <p className="text-3xl font-black text-rose-300">3</p>
              <h3 className="mt-3 text-lg font-bold text-white">Falar com atendimento</h3>
              <p className="mt-2 text-sm leading-6 text-white/68">
                Dúvidas sobre material, prazo ou customização? Tire dúvidas direto pelo WhatsApp. Resposta em até 2h.
              </p>
              <a href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`} className="btn-glass mt-4 inline-block px-4 py-2 text-sm">
                WhatsApp
              </a>
            </article>
          </div>
        </div>
      </section>

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
            <Link href="/catalogo" className="btn-primary px-8 py-3">
              Navegar catálogo
            </Link>
            <Link href="/imagem-para-impressao-3d" className="btn-secondary px-8 py-3">
              Enviar projeto
            </Link>
            <a href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`} className="btn-glass px-8 py-3">
              Falar por WhatsApp
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
