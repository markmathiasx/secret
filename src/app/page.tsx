import Link from "next/link";
import { CatalogGrid } from "@/components/catalog-grid";
import { DeliveryCalculator } from "@/components/delivery-calculator";
import { Hero } from "@/components/hero";
import { HomePersonalized } from "@/components/home-personalized";
import { MediaStrip } from "@/components/media-strip";
import { QuoteForm } from "@/components/quote-form";
import { catalog, featuredCatalog } from "@/lib/catalog";
import { getProductionVideoMedia } from "@/lib/media";
import { homepageCollections, socialLinks, whatsappMessage, whatsappNumber } from "@/lib/constants";

const processSteps = [
  {
    title: "1. Briefing e validacao",
    text: "Voce envia referencia, uso, cor e prazo. A MDH define viabilidade, acabamento e valor antes de produzir."
  },
  {
    title: "2. Producao propria",
    text: "A impressao acontece em equipamento calibrado, com acompanhamento tecnico e escolha de material conforme o objetivo da peca."
  },
  {
    title: "3. Revisao e entrega",
    text: "Cada item passa por limpeza, conferencia visual e orientacao de envio para chegar com cara de produto final, nao de prototipo."
  }
];

const trustBlocks = [
  {
    title: "Por que comprar da MDH 3D",
    text: "Voce fala com quem produz, recebe prazo claro, opcoes de pagamento e uma vitrine que facilita a decisao de compra."
  },
  {
    title: "Pronta entrega e sob encomenda",
    text: "Separacao clara entre itens com saida rapida, projetos personalizaveis e pecas feitas sob briefing."
  },
  {
    title: "Conteudo pensado para redes",
    text: "A loja ja nasce pronta para alimentar Instagram, TikTok e portfolio visual com pecas que parecem compartilhaveis."
  }
];

export default function HomePage() {
  const bestSellers = featuredCatalog.slice(0, 8);
  const readyToShip = catalog.filter((item) => item.grams <= 120).slice(0, 4);
  const customProjects = catalog.filter((item) => item.category === "Personalizados" || item.category === "Oficina").slice(0, 4);
  const processMedia = getProductionVideoMedia();
  const whatsappHref = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <div className="pb-20">
      <Hero />
      <HomePersonalized />

      <section className="mx-auto max-w-7xl px-6 py-16 md:py-20">
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Curadoria MDH 3D</p>
            <h2 className="mt-2 text-3xl font-bold text-white md:text-4xl">Mais vendidos com apelo real de conversao</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-white/60">
              Selecao com foco em clique, pedido por WhatsApp, pronta entrega, presentes e pecas personalizaveis.
            </p>
          </div>
          <Link
            href="/catalogo"
            className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:border-cyan-300/40 hover:bg-white/10"
          >
            Ver catalogo completo
          </Link>
        </div>

        <CatalogGrid products={bestSellers} />
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-12">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {homepageCollections.map((item, index) => (
            <div key={item} className="rounded-[28px] border border-white/10 bg-white/5 p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">{String(index + 1).padStart(2, "0")}</p>
              <h3 className="mt-3 text-xl font-semibold text-white">{item}</h3>
              <p className="mt-2 text-sm leading-6 text-white/60">
                Categoria pensada para venda diaria, descoberta rapida e mensagem comercial mais clara.
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-12 md:py-16">
        <div className="grid gap-8 lg:grid-cols-2">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Pronta entrega</p>
            <h2 className="mt-2 text-3xl font-bold text-white">Itens leves, rapidos e com alta recompra</h2>
            <p className="mt-3 text-sm leading-7 text-white/60">
              Pecas para presente, setup, casa e utilidade com janela curta de producao e bom giro comercial.
            </p>
            <div className="mt-6">
              <CatalogGrid products={readyToShip} />
            </div>
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-violet-200">Sob encomenda e personalizaveis</p>
            <h2 className="mt-2 text-3xl font-bold text-white">Projetos que agregam valor de marca e ticket medio</h2>
            <p className="mt-3 text-sm leading-7 text-white/60">
              Nomes em 3D, brindes, logos, brindes corporativos e pecas de briefing fechado para presente ou negocio.
            </p>
            <div className="mt-6">
              <CatalogGrid products={customProjects} />
            </div>
          </div>
        </div>
      </section>

      <MediaStrip />

      <section className="mx-auto max-w-7xl px-6 py-16 md:py-20">
        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-[32px] border border-white/10 bg-white/5 p-6">
            <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Como produzimos as pecas</p>
            <h2 className="mt-2 text-3xl font-bold text-white">Processo premium em 3 etapas claras</h2>
            <p className="mt-3 text-sm leading-7 text-white/60">
              A secao explica o fluxo da MDH 3D com video real de acabamento, o que ajuda a construir confianca antes do pedido.
            </p>

            <div className="mt-6 overflow-hidden rounded-[28px] border border-white/10">
              {processMedia.hasVideo ? (
                <video
                  className="aspect-video w-full object-cover"
                  autoPlay
                  muted
                  loop
                  playsInline
                  poster={processMedia.posterSrc}
                >
                  {processMedia.sources.map((source) => (
                    <source key={source.src} src={source.src} type={source.type} />
                  ))}
                </video>
              ) : (
                <img src={processMedia.fallbackImageSrc} alt="Acabamento MDH 3D" className="aspect-video w-full object-cover" />
              )}
            </div>
          </div>

          <div className="space-y-4">
            {processSteps.map((item) => (
              <div key={item.title} className="rounded-[28px] border border-white/10 bg-white/5 p-6">
                <h3 className="text-xl font-semibold text-white">{item.title}</h3>
                <p className="mt-3 text-sm leading-7 text-white/65">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-6 py-16 lg:grid-cols-[0.95fr_1.05fr] md:py-20">
        <QuoteForm initialProduct={bestSellers[0]} />
        <DeliveryCalculator />
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16 md:py-20">
        <div className="grid gap-5 lg:grid-cols-3">
          {trustBlocks.map((card) => (
            <div key={card.title} className="rounded-[32px] border border-white/10 bg-white/5 p-6">
              <h3 className="text-xl font-bold text-white">{card.title}</h3>
              <p className="mt-3 text-sm leading-7 text-white/65">{card.text}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 grid gap-4 rounded-[30px] border border-emerald-300/25 bg-emerald-400/10 px-6 py-6 md:grid-cols-[1fr_auto_auto] md:items-center">
          <div>
            <p className="text-sm font-semibold text-emerald-100">Pronto para fechar seu pedido?</p>
            <p className="mt-1 text-sm text-emerald-100/80">
              Atendimento direto para orcamento, personalizacao, prazo e entrega local.
            </p>
          </div>
          <a
            href={whatsappHref}
            className="rounded-full border border-emerald-200/40 bg-emerald-300/25 px-5 py-3 text-sm font-semibold text-emerald-50"
          >
            Pedir orcamento no WhatsApp
          </a>
          <Link href="/catalogo" className="rounded-full border border-white/15 bg-white/10 px-5 py-3 text-sm font-semibold text-white">
            Abrir catalogo
          </Link>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          {socialLinks.instagram ? (
            <a
              href={socialLinks.instagram}
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80"
            >
              Instagram
            </a>
          ) : null}
          {socialLinks.tiktok ? (
            <a
              href={socialLinks.tiktok}
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80"
            >
              TikTok
            </a>
          ) : null}
          {socialLinks.facebook ? (
            <a
              href={socialLinks.facebook}
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80"
            >
              Facebook
            </a>
          ) : null}
        </div>
      </section>
    </div>
  );
}
