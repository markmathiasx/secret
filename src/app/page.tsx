import Link from "next/link";
import { Hero } from "@/components/hero";
import { CatalogGrid } from "@/components/catalog-grid";
import { MediaStrip } from "@/components/media-strip";
import { QuoteForm } from "@/components/quote-form";
import { DeliveryCalculator } from "@/components/delivery-calculator";
import { featuredCatalog } from "@/lib/catalog";
import { socialLinks, whatsappMessage, whatsappNumber } from "@/lib/constants";

const homepageCategories = [
  {
    id: "anime-geek",
    label: "Anime & Geek",
    title: "Miniaturas, bustos e colecionáveis com mais saída",
    description:
      "Linha focada em presentes, coleções e peças com apelo geek, produzidas localmente com acabamento premium.",
    href: "/catalogo?category=Anime%20%26%20Geek",
    cta: "Ver linha geek",
  },
  {
    id: "setup-organizacao",
    label: "Setup & Organização",
    title: "Suportes e utilidades para mesa, celular e headset",
    description:
      "Produtos práticos para setup, home office e organização com produção rápida e ótima margem de recompra.",
    href: "/catalogo?category=Setup%20%26%20Organiza%C3%A7%C3%A3o",
    cta: "Ver organização",
  },
  {
    id: "casa-decoracao",
    label: "Casa & Decoração",
    title: "Vasos, placas e peças decorativas para ambiente",
    description:
      "Seleção pensada para decoração compacta, itens presenteáveis e peças que funcionam bem na A1 Mini.",
    href: "/catalogo?category=Casa%20%26%20Decora%C3%A7%C3%A3o",
    cta: "Ver decoração",
  },
];

const trustHighlights = [
  "Produção local no Rio de Janeiro",
  "Atendimento humano via WhatsApp",
  "Pix com preço mais agressivo",
  "Personalização sob encomenda",
];

const materialsShowcase = [
  "PLA Premium para peças decorativas e colecionáveis",
  "PLA Silk para brilho visual em presentes e bustos",
  "PETG para utilidades e peças de uso mais técnico",
  "Acabamento revisado antes da entrega",
];

const faqItems = [
  {
    question: "Vocês fazem peças sob encomenda?",
    answer:
      "Sim. Você pode enviar referência, STL, imagem ou briefing no WhatsApp para receber orientação de viabilidade, material e prazo.",
  },
  {
    question: "Qual é o prazo médio?",
    answer:
      "Itens prontos costumam sair em 24 a 48 horas. Peças personalizadas ou com acabamento especial podem levar de 3 a 7 dias.",
  },
  {
    question: "Quais materiais vocês usam?",
    answer:
      "Trabalhamos principalmente com PLA Premium, PLA Silk e PETG, escolhendo o melhor material conforme uso, estética e resistência.",
  },
  {
    question: "Entregam no Rio de Janeiro?",
    answer:
      "Sim. Temos operação local no RJ e também organizamos envio com confirmação de prazo e janela de produção.",
  },
];

export default function HomePage() {
  const formProduct = featuredCatalog[0];
  const bestSellers = featuredCatalog.slice(0, 8);
  const whatsappHref = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <main>
      <Hero />

      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[32px] border border-white/10 bg-white/5 p-6">
            <p className="text-xs uppercase tracking-[0.24em] text-cyan-200">Curadoria MDH 3D</p>
            <h2 className="mt-3 text-3xl font-black text-white sm:text-4xl">
              Loja focada em peças vendáveis, presentes criativos e utilidades com giro real.
            </h2>
            <p className="mt-4 max-w-3xl text-base leading-8 text-white/70">
              Seleção comercial para venda diária com foco em itens de alta procura, personalização
              e recompra. O objetivo é transformar catálogo em conversão, não só em vitrine.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/catalogo" className="btn-primary">
                Ver catálogo
              </Link>
              <a href={whatsappHref} className="btn-secondary">
                Pedir orçamento
              </a>
            </div>
          </div>

          <div className="rounded-[32px] border border-white/10 bg-white/5 p-6">
            <p className="text-xs uppercase tracking-[0.24em] text-cyan-200">Sinais de confiança</p>
            <div className="mt-4 grid gap-3">
              {trustHighlights.map((item) => (
                <div key={item} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/80">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-8">
        <div className="grid gap-4 md:grid-cols-3">
          {homepageCategories.map((item) => (
            <article key={item.id} className="rounded-[28px] border border-white/10 bg-white/5 p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">{item.label}</p>
              <h3 className="mt-3 text-xl font-bold text-white">{item.title}</h3>
              <p className="mt-3 text-sm leading-7 text-white/65">{item.description}</p>
              <Link href={item.href} className="mt-5 inline-flex text-sm font-semibold text-cyan-100 hover:text-white">
                {item.cta}
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-cyan-200">Mais vendidos</p>
            <h2 className="mt-3 text-3xl font-black text-white">Produtos campeões em orçamento e fechamento</h2>
          </div>
          <Link href="/catalogo" className="hidden text-sm font-semibold text-cyan-100 md:inline-flex">
            Ver catálogo completo
          </Link>
        </div>

        <div className="mt-6">
          <CatalogGrid products={bestSellers} />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-8">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-[28px] border border-white/10 bg-white/5 p-6">
            <p className="text-xs uppercase tracking-[0.24em] text-cyan-200">Materiais e acabamento</p>
            <h2 className="mt-3 text-3xl font-black text-white">Linha pensada para vender bem e entregar com consistência</h2>
            <div className="mt-5 grid gap-3">
              {materialsShowcase.map((item) => (
                <div key={item} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/80">
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-white/5 p-6">
            <p className="text-xs uppercase tracking-[0.24em] text-cyan-200">Atendimento direto</p>
            <h2 className="mt-3 text-3xl font-black text-white">Fale com a MDH 3D para fechar seu pedido</h2>
            <p className="mt-4 text-sm leading-7 text-white/70">
              Atendimento para orçamento, personalização, prazo e produção local. Você também pode acompanhar
              novidades nas redes.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href={whatsappHref} className="btn-primary">
                Falar no WhatsApp
              </a>
              <a href={socialLinks.instagram} target="_blank" rel="noreferrer" className="btn-ghost">
                Ver Instagram
              </a>
            </div>
          </div>
        </div>
      </section>

      <MediaStrip />

      {formProduct ? (
        <section className="mx-auto max-w-7xl px-6 py-8">
          <QuoteForm initialProduct={formProduct} />
        </section>
      ) : null}

      <section className="mx-auto max-w-7xl px-6 py-8">
        <DeliveryCalculator />
      </section>

      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="rounded-[32px] border border-white/10 bg-white/5 p-6">
          <p className="text-xs uppercase tracking-[0.24em] text-cyan-200">FAQ rápido</p>
          <h2 className="mt-3 text-3xl font-black text-white">Perguntas frequentes antes do pedido</h2>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {faqItems.map((item) => (
              <article key={item.question} className="rounded-[24px] border border-white/10 bg-black/20 p-5">
                <h3 className="text-lg font-semibold text-white">{item.question}</h3>
                <p className="mt-3 text-sm leading-7 text-white/65">{item.answer}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
