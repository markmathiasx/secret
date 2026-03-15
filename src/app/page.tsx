import type { Metadata } from "next";
import Link from "next/link";
import { AnalyticsPageEvent } from "@/components/analytics-page-event";
import { Hero } from "@/components/hero";
import { CatalogGrid } from "@/components/catalog-grid";
import { MediaStrip } from "@/components/media-strip";
import { DeliveryCalculator } from "@/components/delivery-calculator";
import { categories } from "@/lib/catalog";
import { brand, homepageCollections, socialLinks, whatsappNumber } from "@/lib/constants";
import { getAbsoluteUrl, getSiteUrl } from "@/lib/seo";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import { getCatalogStats, listFeaturedProducts } from "@/lib/catalog-server";

export const metadata: Metadata = {
  title: "Loja premium de impressões 3D no Rio de Janeiro",
  description:
    "Compre pecas 3D da MDH 3D com curadoria geek, decoracao, setup, personalizados, Pix e atendimento rapido pelo WhatsApp.",
  alternates: {
    canonical: `${getSiteUrl()}/`
  },
  openGraph: {
    title: "MDH 3D | Loja premium de impressões 3D",
    description:
      "Curadoria de pecas 3D para presentes, setup, decoracao e personalizados com Pix e atendimento rapido.",
    url: getSiteUrl(),
    images: [{ url: getAbsoluteUrl("/logo-mdh.jpg"), alt: "MDH 3D" }]
  },
  twitter: {
    card: "summary_large_image",
    title: "MDH 3D | Loja premium de impressões 3D",
    description: "Curadoria de pecas 3D, Pix com melhor valor e atendimento rapido no WhatsApp.",
    images: [getAbsoluteUrl("/logo-mdh.jpg")]
  }
};

export default async function HomePage() {
  const [featuredProducts, stats] = await Promise.all([listFeaturedProducts(), getCatalogStats()]);
  const whatsappUrl = buildWhatsAppLink(whatsappNumber, "Oi! Vim pela home da MDH 3D e quero atendimento para comprar.");
  const highlightCategories = [
    {
      title: "Geek, anime e presentes criativos",
      description: "Selecao para quem quer presentear melhor ou levar uma peça com mais personalidade para o quarto e a estante.",
      href: "/catalogo?q=anime",
      accent: "from-cyan-400/20 to-violet-400/20"
    },
    {
      title: "Setup organizado e utilidades",
      description: "Suportes, docks e organizadores com visual premium para mesa gamer, home office e bancada criativa.",
      href: "/catalogo?q=suporte",
      accent: "from-emerald-400/18 to-cyan-400/16"
    },
    {
      title: "Casa, decoracao e sob encomenda",
      description: "Pecas para ambiente, nomes 3D, placas e itens personalizados que aumentam valor percebido sem parecer genericos.",
      href: "/catalogo?q=personalizado",
      accent: "from-amber-300/18 to-rose-300/12"
    }
  ];

  return (
    <div>
      <AnalyticsPageEvent eventName="view_home" payload={{ featuredCount: featuredProducts.length }} />
      <Hero />

      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="section-shell rounded-[40px] p-8">
          <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-cyan-200">Assinatura da marca</p>
              <h2 className="mt-2 max-w-3xl text-3xl font-black text-white sm:text-4xl">
                Uma loja que parece marca de verdade: curadoria, gosto visual e argumentos de compra mais claros.
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-white/60">
                A home agora trabalha com selecao enxuta, categorias fortes, prova de valor e CTAs mais comerciais para levar o cliente ate o carrinho ou ao WhatsApp sem parecer um catalogo gerado em massa.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/catalogo" className="rounded-full border border-cyan-400/25 bg-cyan-400/12 px-5 py-3 text-sm font-semibold text-cyan-100">
                Explorar catálogo
              </Link>
              <Link href="/carrinho" className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white">
                Revisar carrinho
              </Link>
              <a href={whatsappUrl} target="_blank" rel="noreferrer" className="rounded-full border border-emerald-400/25 bg-emerald-400/12 px-5 py-3 text-sm font-semibold text-emerald-100">
                Comprar por WhatsApp
              </a>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            {[
              { value: String(stats.totalProducts).padStart(2, "0"), label: "Produtos na curadoria" },
              { value: String(stats.totalCategories).padStart(2, "0"), label: "Frentes comerciais" },
              { value: "Sob demanda", label: "personalizacao quando fizer sentido" },
              { value: "Pix forte", label: "melhor preco para decidir rapido" }
            ].map((card) => (
              <div key={card.label} className="glass-surface rounded-[28px] p-5">
                <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">{card.label}</p>
                <h3 className="mt-3 text-3xl font-black text-white">{card.value}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-16">
        <div className="grid gap-4 lg:grid-cols-3">
          {highlightCategories.map((item) => (
            <Link
              key={item.title}
              href={item.href}
              className={`section-shell rounded-[32px] bg-gradient-to-br ${item.accent} p-6 transition hover:-translate-y-1`}
            >
              <p className="text-xs uppercase tracking-[0.2em] text-white/55">Selecao em destaque</p>
              <h3 className="mt-3 text-2xl font-black text-white">{item.title}</h3>
              <p className="mt-3 text-sm leading-7 text-white/68">{item.description}</p>
              <span className="mt-6 inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/84">
                Ver colecao
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Best sellers da casa</p>
            <h2 className="mt-2 text-3xl font-bold text-white">Os produtos que melhor representam a MDH 3D na primeira visita</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-white/60">
              Esta selecao mistura presente criativo, organizacao de setup, decor geek e personalizados com mais valor percebido para vender com menos ruido.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/catalogo" className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white">
              Ver todos os produtos
            </Link>
            <a href={socialLinks.instagram} target="_blank" rel="noreferrer" className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white/82">
              Instagram oficial
            </a>
          </div>
        </div>
        <CatalogGrid products={featuredProducts} />
      </section>

      <MediaStrip />

      <section className="mx-auto grid max-w-7xl gap-8 px-6 py-16 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="section-shell rounded-[32px] p-6">
          <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Por que comprar aqui</p>
          <h2 className="mt-3 text-3xl font-black text-white">Curadoria forte, compra clara e atendimento humano quando voce quiser validar</h2>
          <p className="mt-4 text-sm leading-7 text-white/62">
            A loja foi organizada para ajudar voce a decidir rapido: preco visivel, prazo claro, Pix com melhor valor e um caminho simples para seguir no WhatsApp sem perder o contexto da compra.
          </p>

          <div className="mt-6 grid gap-3">
            {[
              "Selecao mais enxuta e menos repetitiva na loja",
              "Preco Pix, parcelamento e prazo visiveis sem exigir clique demais",
              "Carrinho e checkout guest para compra rapida ou atendimento assistido",
              "Personalizacao sob demanda para presentes, setup e negocios locais"
            ].map((item) => (
              <div key={item} className="rounded-[24px] border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/72">
                {item}
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/carrinho" className="rounded-full border border-cyan-400/25 bg-cyan-400/12 px-5 py-3 text-sm font-semibold text-cyan-100">
              Abrir carrinho
            </Link>
            <a href={whatsappUrl} target="_blank" rel="noreferrer" className="rounded-full border border-emerald-400/25 bg-emerald-400/12 px-5 py-3 text-sm font-semibold text-emerald-100">
              Falar no WhatsApp
            </a>
            <a href={socialLinks.instagram} target="_blank" rel="noreferrer" className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white/78">
              Instagram oficial
            </a>
          </div>
        </div>
        <DeliveryCalculator />
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-5 lg:grid-cols-3">
          {[
            {
              title: "Personalizacao que parece produto pronto",
              text: "Nome 3D, placas, presentes e itens para setup com acabamento limpo e leitura mais comercial, sem cara de improviso."
            },
            {
              title: "Prazo e entrega sem enrolacao",
              text: "Prazo visivel nos produtos, referencia clara de entrega no Rio e comunicacao mais objetiva desde a escolha ate o envio."
            },
            {
              title: "Atendimento rapido quando a compra pede ajuda",
              text: "A loja resolve o que e simples sozinha e encaixa o WhatsApp de forma natural quando a compra precisa de orientacao, cor ou ajuste."
            }
          ].map((card) => (
            <div key={card.title} className="section-shell rounded-[32px] p-6">
              <h3 className="text-xl font-bold text-white">{card.title}</h3>
              <p className="mt-3 text-sm leading-7 text-white/60">{card.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-16">
        <div className="flex flex-wrap items-center gap-2">
          {homepageCollections.slice(0, 4).map((collection) => (
            <span key={collection} className="rounded-full border border-cyan-400/18 bg-cyan-400/10 px-4 py-2 text-sm font-medium text-cyan-100/82">
              {collection}
            </span>
          ))}
          {categories.map((category) => (
            <Link key={category} href={`/catalogo?category=${encodeURIComponent(category)}`} className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70 transition hover:text-white">
              {category}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
