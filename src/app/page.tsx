import Link from "next/link";
import { Hero } from "@/components/hero";
import { CatalogGrid } from "@/components/catalog-grid";
import { MediaStrip } from "@/components/media-strip";
import { QuoteForm } from "@/components/quote-form";
import { DeliveryCalculator } from "@/components/delivery-calculator";
import { featuredCatalog } from "@/lib/catalog";
import { homepageCollections } from "@/lib/constants";

export default function HomePage() {
  const formProduct = featuredCatalog[0];

  return (
    <div>
      <Hero />

      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Coleções</p>
            <h2 className="mt-2 text-3xl font-bold text-white">Visual premium inspirado em marketplaces, com identidade própria MDH</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-white/60">
              A homepage agora combina descoberta visual, seções com brilho/vidro, mídia curta e cards com imagens locais para facilitar clique e conversão.
            </p>
          </div>
          <Link href="/catalogo" className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white">
            Abrir os 1000 exemplos
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          {homepageCollections.map((item, index) => (
            <div key={item} className="rounded-[28px] border border-white/10 bg-white/5 p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">0{index + 1}</p>
              <h3 className="mt-3 text-xl font-semibold text-white">{item}</h3>
              <p className="mt-2 text-sm leading-6 text-white/60">Curadoria visual pensada para facilitar descoberta, clique e pedido por WhatsApp.</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Catálogo destaque</p>
            <h2 className="mt-2 text-3xl font-bold text-white">Produtos campeões para começar vendendo</h2>
          </div>
        </div>
        <CatalogGrid products={featuredCatalog} />
      </section>

      <MediaStrip />

      <section className="mx-auto grid max-w-7xl gap-8 px-6 py-16 lg:grid-cols-[0.95fr_1.05fr]">
        <QuoteForm initialProduct={formProduct} />
        <DeliveryCalculator />
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-5 lg:grid-cols-3">
          {[
            {
              title: "SEO e tráfego orgânico",
              text: "URLs de produto, sitemap, páginas de categoria, FAQ e conteúdo pronto para Instagram, Facebook e links de Bio."
            },
            {
              title: "Atendimento híbrido",
              text: "Bot filtra intenção, manda preço e link; se o cliente pedir humano, a conversa já é direcionada para você."
            },
            {
              title: "Segurança prática",
              text: "Headers rígidos, área admin escondida, cookie HttpOnly, sem segredos no frontend e rota pública /admin bloqueada."
            }
          ].map((card) => (
            <div key={card.title} className="rounded-[32px] border border-white/10 bg-white/5 p-6">
              <h3 className="text-xl font-bold text-white">{card.title}</h3>
              <p className="mt-3 text-sm leading-7 text-white/60">{card.text}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
