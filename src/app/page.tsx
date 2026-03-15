import Link from "next/link";
import { Hero } from "@/components/hero";
import { CatalogGrid } from "@/components/catalog-grid";
import { MediaStrip } from "@/components/media-strip";
import { QuoteForm } from "@/components/quote-form";
import { DeliveryCalculator } from "@/components/delivery-calculator";
import { catalog, featuredCatalog } from "@/lib/catalog";
import { homepageCollections, whatsappMessage, whatsappNumber } from "@/lib/constants";
import { HomeEntryGate } from "@/components/home-entry-gate";
import { HomePersonalized } from "@/components/home-personalized";

const curatedCategories = ["Anime", "Geek", "Utilidades", "Personalizados", "Escritorio", "Casa"] as const;

export default function HomePage() {
  const formProduct = featuredCatalog[0];
  const bestSellers = featuredCatalog.slice(0, 8);
  const whatsappHref = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <div>
      <HomeEntryGate />
      <Hero />
      <HomePersonalized />

      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Curadoria MDH 3D</p>
            <h2 className="mt-2 text-3xl font-bold text-white">Mais vendidos e coleções com maior conversão</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-white/65">
              Seleção comercial para venda diária com foco em itens de alta procura, personalização e recompra.
            </p>
          </div>
          <Link href="/catalogo" className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white">
            Ver catálogo
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
          {homepageCollections.map((item, index) => (
            <div key={item} className="rounded-[22px] border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">0{index + 1}</p>
              <h3 className="mt-2 text-lg font-semibold text-white">{item}</h3>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-8">
          <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Mais vendidos</p>
          <h2 className="mt-2 text-3xl font-bold text-white">Produtos campeões em orçamento e fechamento</h2>
        </div>
        <CatalogGrid products={bestSellers} />
      </section>

      {curatedCategories.map((category) => {
        const items = catalog.filter((item) => item.category === category).slice(0, 4);
        if (!items.length) return null;
        return (
          <section key={category} className="mx-auto max-w-7xl px-6 py-12">
            <div className="mb-6 flex items-end justify-between gap-4">
              <h3 className="text-2xl font-bold text-white">{category}</h3>
              <Link href="/catalogo" className="text-sm font-semibold text-cyan-200 hover:text-cyan-100">Ver mais</Link>
            </div>
            <CatalogGrid products={items} />
          </section>
        );
      })}

      <MediaStrip />

      <section className="mx-auto grid max-w-7xl gap-8 px-6 py-16 lg:grid-cols-[0.95fr_1.05fr]">
        <QuoteForm initialProduct={formProduct} />
        <DeliveryCalculator />
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-5 lg:grid-cols-3">
          {[
            {
              title: "Entrega local no Rio de Janeiro",
              text: "Cobertura por região com prazo claro e suporte rápido para pedidos sob encomenda."
            },
            {
              title: "Pagamento flexível",
              text: "Pix, cartão e boleto com jornada simples para converter orçamento em pedido."
            },
            {
              title: "Atendimento comercial",
              text: "WhatsApp ativo para negociação, personalização e acompanhamento de produção."
            }
          ].map((card) => (
            <div key={card.title} className="rounded-[32px] border border-white/10 bg-white/5 p-6">
              <h3 className="text-xl font-bold text-white">{card.title}</h3>
              <p className="mt-3 text-sm leading-7 text-white/65">{card.text}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-[28px] border border-emerald-300/25 bg-emerald-400/10 px-6 py-5">
          <div>
            <p className="text-sm font-semibold text-emerald-100">Pronto para fechar seu pedido?</p>
            <p className="text-xs text-emerald-100/80">Atendimento direto para orçamento, personalização e prazo.</p>
          </div>
          <a href={whatsappHref} className="rounded-full border border-emerald-200/40 bg-emerald-300/25 px-5 py-2.5 text-sm font-semibold text-emerald-50">
            Pedir orçamento no WhatsApp
          </a>
        </div>
      </section>
    </div>
  );
}
