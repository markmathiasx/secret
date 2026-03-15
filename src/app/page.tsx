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
    "Compre impressões 3D da MDH 3D com catálogo curado, quick view, Pix forte, checkout guest e atendimento rápido pelo WhatsApp.",
  alternates: {
    canonical: `${getSiteUrl()}/`
  },
  openGraph: {
    title: "MDH 3D | Loja premium de impressões 3D",
    description:
      "Catálogo curado para anime, geek, utilidades e personalizados com pedido real, Pix e atendimento rápido.",
    url: getSiteUrl(),
    images: [{ url: getAbsoluteUrl("/logo-mdh.jpg"), alt: "MDH 3D" }]
  },
  twitter: {
    card: "summary_large_image",
    title: "MDH 3D | Loja premium de impressões 3D",
    description: "Catálogo curado, Pix, quick view, checkout guest e atendimento rápido no WhatsApp.",
    images: [getAbsoluteUrl("/logo-mdh.jpg")]
  }
};

export default async function HomePage() {
  const [featuredProducts, stats] = await Promise.all([listFeaturedProducts(), getCatalogStats()]);
  const whatsappUrl = buildWhatsAppLink(whatsappNumber, "Oi! Vim pela home da MDH 3D e quero atendimento para comprar.");
  const highlightCategories = [
    {
      title: "Anime, geek e presentes",
      description: "Peças com apelo visual forte para comprar por impulso, presentear e compartilhar no Instagram.",
      href: "/catalogo?q=anime",
      accent: "from-cyan-400/20 to-violet-400/20"
    },
    {
      title: "Setup, desk e organização",
      description: "Suportes, docks e utilidades com valor percebido alto e leitura rápida de benefício.",
      href: "/catalogo?q=suporte",
      accent: "from-emerald-400/18 to-cyan-400/16"
    },
    {
      title: "Decoração e personalizados",
      description: "Itens para ambiente, nome 3D, placas e peças sob encomenda com foco em margem e diferenciação.",
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
              <p className="text-xs uppercase tracking-[0.24em] text-cyan-200">Vitrine de alta intenção</p>
              <h2 className="mt-2 max-w-3xl text-3xl font-black text-white sm:text-4xl">
                Uma home que vende melhor porque explica rápido, prova valor e reduz atrito antes do checkout.
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-white/60">
                A jornada pública agora trabalha com prova visual, categorias mais fortes, benefícios claros, CTAs consistentes e suporte para compra rápida via catálogo, carrinho ou WhatsApp.
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
              { value: String(stats.totalProducts).padStart(2, "0"), label: "SKUs curados" },
              { value: String(stats.totalCategories).padStart(2, "0"), label: "Categorias fortes" },
              { value: "Pedido real", label: "cliente, itens e timeline" },
              { value: "Pix forte", label: "checkout pronto para vender" }
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
              <p className="text-xs uppercase tracking-[0.2em] text-white/55">Categoria em destaque</p>
              <h3 className="mt-3 text-2xl font-black text-white">{item.title}</h3>
              <p className="mt-3 text-sm leading-7 text-white/68">{item.description}</p>
              <span className="mt-6 inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/84">
                Ver seleção
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Curadoria premium</p>
            <h2 className="mt-2 text-3xl font-bold text-white">Produtos campeões para converter mais rápido e sustentar a marca</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-white/60">
              A seleção abaixo foi pensada para unir valor percebido, estética forte, boa leitura de preço e encaixe natural com atendimento por link e recompra.
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
          <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Conversão</p>
          <h2 className="mt-3 text-3xl font-black text-white">Atendimento, checkout e pedido real andando no mesmo trilho</h2>
          <p className="mt-4 text-sm leading-7 text-white/62">
            O cliente descobre, compara, adiciona ao carrinho, fecha por checkout guest e ainda pode seguir com contexto completo no WhatsApp, sem perder número do pedido, itens ou status.
          </p>

          <div className="mt-6 grid gap-3">
            {[
              "Vitrine com quick view, pricing claro e badges úteis",
              "Carrinho persistente para retomada rápida da compra",
              "Checkout guest com menos atrito e mais contexto",
              "Painel privado para produção, pagamento e entrega"
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
              title: "Personalização com leitura comercial forte",
              text: "Nome 3D, peças comerciais, presentes e itens de setup com acabamento premium e adaptação visual sem parecer improvisado."
            },
            {
              title: "Prazo e entrega sem ambiguidade",
              text: "Prazo visível no produto, cálculo local para o Rio e comunicação clara para o cliente desde pagamento até entrega."
            },
            {
              title: "Atendimento híbrido e rastreável",
              text: "Assistente local conduz descoberta e FAQ, enquanto pedido, pagamento e mudanças de status ficam registrados no painel."
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
