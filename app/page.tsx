import Link from "next/link";
import { Hero } from "@/components/hero-professional";
import { ProductTabs } from "@/components/product-tabs";
import { STLUploader } from "@/components/stl-uploader";
import { CatalogGrid } from "@/components/catalog-grid";
import { HomeConversionLanes } from "@/components/home-conversion-lanes";
import { HomeResumePanel } from "@/components/home-resume-panel";
import { QuickMatchAdvisor } from "@/components/quick-match-advisor";
import { TrustSignals } from "@/components/trust-signals";
import { SafeProductImage } from "@/components/safe-product-image";
import { ProductVisualBadge } from "@/components/product-visual-authenticity";
import {
  catalogShortcutLinks,
  customerSegments,
  deliveryZones,
  homepageCategories,
  materialsShowcase,
  orderPrepChecklist,
} from "@/lib/constants";
import { catalog, getProductUrl, type Product } from "@/lib/catalog";
import { isProductVisualVerified, summarizeProductVisuals } from "@/lib/product-visuals";
import { formatCurrency } from "@/lib/utils";

const faqItems = [
  {
    question: "Vocês fazem peças sob encomenda?",
    answer:
      "Sim. Você pode enviar referência, STL, imagem ou briefing para receber análise de viabilidade, material e prazo em atendimento humano.",
  },
  {
    question: "Qual é o prazo médio?",
    answer:
      "Itens mais simples costumam sair em 24 a 48 horas. Peças personalizadas, grandes ou pintadas podem levar de 3 a 10 dias úteis, conforme complexidade.",
  },
  {
    question: "Quais materiais vocês usam?",
    answer:
      "Trabalhamos principalmente com PLA Premium, PLA Silk, PETG e resina, escolhendo o material conforme acabamento, resistência e tipo de uso.",
  },
  {
    question: "Como funciona o pagamento?",
    answer:
      "O site destaca Pix com chave, QR Code e copia e cola. Quando o cartão está disponível online, o pagamento segue para um ambiente seguro do parceiro de cobrança.",
  },
];

const homeSteps = [
  {
    title: "Escolha um item ou envie uma referência",
    description: "Você pode comprar algo do catálogo ou mandar uma ideia, imagem ou STL para orçamento.",
  },
  {
    title: "Receba confirmação de valor, prazo e material",
    description: "A equipe valida acabamento, produção e melhor formato de pagamento antes de avançar.",
  },
  {
    title: "Feche no Pix ou siga para o parceiro de pagamento",
    description: "O checkout mostra Pix de forma clara e organiza o pedido com código para facilitar o suporte.",
  },
];

export default function HomePage() {
  const realShowcase = catalog.filter((product) => isProductVisualVerified(product)).slice(0, 4);
  const visualSummary = summarizeProductVisuals(catalog);
  const usedProductIds = new Set<string>();
  const selectProduct = (predicate: (product: Product) => boolean) => {
    const item = catalog.find((product) => !usedProductIds.has(product.id) && predicate(product));
    if (item) usedProductIds.add(item.id);
    return item ?? null;
  };
  const smartShowcase = [
    {
      id: "gift",
      label: "Entrada para presente",
      description: "Uma peça com bom impacto visual e fechamento rápido para quem quer impressionar sem briefing longo.",
      href: "/catalogo?intent=Presente&mode=verified",
      product: selectProduct((product) => product.tags.some((tag) => tag.toLowerCase().includes("presente")) || product.category === "Presentes Criativos"),
    },
    {
      id: "ready",
      label: "Entrada para urgência",
      description: "Uma referência pronta para quem quer escolher rápido e seguir direto para confirmação do pedido.",
      href: "/catalogo?status=Pronta%20entrega",
      product: selectProduct((product) => Boolean(product.readyToShip) && isProductVisualVerified(product)),
    },
    {
      id: "utility",
      label: "Entrada para utilidade",
      description: "Uma peça com apelo prático para setup, organização ou uso recorrente no dia a dia.",
      href: "/catalogo?category=Setup%20%26%20Organiza%C3%A7%C3%A3o",
      product: selectProduct((product) => product.category.includes("Setup") || product.category.includes("Utilidade")),
    },
    {
      id: "custom",
      label: "Entrada para personalização",
      description: "Um item que mostra como a loja consegue adaptar referência, escala, cor ou acabamento.",
      href: "/imagem-para-impressao-3d",
      product: selectProduct((product) => product.customizable && !product.readyToShip),
    },
  ].filter((item) => item.product);

  return (
    <main>
      <Hero />

      <section className="mx-auto max-w-7xl px-6 pb-4">
        <div className="glass-panel flex flex-wrap items-center justify-center gap-3 px-4 py-4">
          <Link href="#home-portfolio" className="chip-nav">Portfólio real</Link>
          <Link href="#home-paths" className="chip-nav">Entradas rápidas</Link>
          <Link href="#home-resume" className="chip-nav">Retomar</Link>
          <Link href="#home-advisor" className="chip-nav">Guia</Link>
          <Link href="#home-objectives" className="chip-nav">Objetivos</Link>
          <Link href="#home-smart-picks" className="chip-nav">Picks guiados</Link>
          <Link href="#home-services" className="chip-nav">Serviços</Link>
          <Link href="#home-upload" className="chip-nav">Enviar STL</Link>
          <Link href="#home-operation" className="chip-nav">Operação</Link>
          <Link href="#home-faq" className="chip-nav">FAQ</Link>
        </div>
      </section>

      <section id="home-portfolio" className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-3xl">
            <p className="section-kicker">Portfólio validado</p>
            <h2 className="section-title">Peças já produzidas para o cliente comprar com mais segurança.</h2>
            <p className="section-copy mt-4">
              A entrada da loja prioriza peças com foto real para ajudar o cliente a decidir mais rápido, comparar acabamento e confiar no resultado final antes de pagar.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { label: "Fotos reais", value: String(visualSummary.fotoReal).padStart(2, "0") },
              { label: "Projetos sob medida", value: "RJ" },
              { label: "Pagamento", value: "PIX" },
            ].map((item) => (
              <div key={item.label} className="glass-card min-w-[150px] p-5 text-center">
                <p className="text-xs uppercase tracking-[0.18em] text-white/45">{item.label}</p>
                <p className="mt-3 text-3xl font-black text-white">{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        <CatalogGrid products={realShowcase} />

        <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link href="/catalogo?mode=verified" className="btn-primary px-8 py-4">
            Ver peças com visual validado
          </Link>
          <Link href="/presentes-3d" className="btn-secondary px-8 py-4">
            Entrar por presentes
          </Link>
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-2">
          {catalogShortcutLinks.map((item) => (
            <Link key={item.href} href={item.href} className="chip-nav">
              {item.label}
            </Link>
          ))}
        </div>
      </section>

      <div id="home-paths">
        <HomeConversionLanes />
      </div>

      <div id="home-resume">
        <HomeResumePanel />
      </div>

      <div id="home-advisor">
        <QuickMatchAdvisor />
      </div>

      <section id="home-objectives" className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-8 max-w-3xl">
          <p className="section-kicker">Escolha por objetivo</p>
          <h2 className="section-title">A vitrine agora ajuda o cliente a entrar pelo motivo da compra, não só pela categoria.</h2>
          <p className="section-copy mt-4">
            Isso reduz dúvida logo no começo e cria caminhos mais curtos para presente, utilidade, fandom e projeto sob medida.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {customerSegments.map((item) => (
            <article key={item.id} className="glass-panel p-7">
              <p className="text-xs uppercase tracking-[0.2em] text-cyan-100/80">{item.label}</p>
              <h3 className="mt-3 text-2xl font-black text-white">{item.title}</h3>
              <p className="mt-4 text-sm leading-7 text-white/68">{item.description}</p>
              <div className="mt-5 rounded-[18px] border border-white/10 bg-black/20 px-4 py-3 text-[11px] uppercase tracking-[0.16em] text-white/60">
                {item.proof}
              </div>
              <Link href={item.href} className="btn-secondary mt-6">
                {item.cta}
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section id="home-smart-picks" className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-3xl">
            <p className="section-kicker">Picks guiados</p>
            <h2 className="section-title">Exemplos reais para o cliente se localizar mais rápido na loja.</h2>
            <p className="section-copy mt-4">
              Em vez de começar do zero, a home já sugere uma peça-âncora para cada tipo de intenção comercial.
            </p>
          </div>
          <Link href="/catalogo" className="btn-glass">
            Ver vitrine completa
          </Link>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {smartShowcase.map((item) =>
            item.product ? (
              <article key={item.id} className="catalog-product-card rounded-[28px] border border-white/10 bg-card p-5">
                <div className="overflow-hidden rounded-[20px] border border-white/10 bg-white/5">
                  <SafeProductImage
                    product={item.product}
                    alt={item.product.name}
                    className="aspect-square w-full object-cover"
                  />
                </div>
                <div className="mt-4 flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-cyan-200/80">{item.label}</p>
                    <h3 className="mt-2 line-clamp-2 text-lg font-semibold text-white">{item.product.name}</h3>
                  </div>
                  <ProductVisualBadge product={item.product} />
                </div>
                <p className="mt-3 text-sm leading-6 text-white/66">{item.description}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/60">{item.product.material}</span>
                  <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/60">{item.product.productionWindow}</span>
                </div>
                <div className="mt-5 flex items-end justify-between gap-3">
                  <div>
                    <p className="text-xs text-white/45">Preço Pix</p>
                    <p className="text-2xl font-black text-white">{formatCurrency(item.product.pricePix)}</p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Link href={getProductUrl(item.product)} className="btn-secondary px-4 py-2 text-sm">
                      Ver produto
                    </Link>
                    <Link href={item.href} className="btn-glass px-4 py-2 text-xs">
                      Abrir entrada
                    </Link>
                  </div>
                </div>
              </article>
            ) : null
          )}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-8">
        <div className="grid gap-5 lg:grid-cols-3">
          {homepageCategories.map((item) => (
            <article key={item.id} className="glass-panel p-8">
              <p className="text-xs uppercase tracking-[0.2em] text-cyan-100/75">{item.label}</p>
              <h2 className="mt-3 text-2xl font-black text-white">{item.title}</h2>
              <p className="mt-4 text-sm leading-7 text-white/68">{item.description}</p>
              <Link href={item.href} className="btn-secondary mt-6">
                {item.cta}
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section id="home-services" className="bg-gradient-to-b from-black via-slate-950/30 to-black py-4">
        <ProductTabs />
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="glass-panel p-8">
            <p className="section-kicker">Como comprar</p>
            <h2 className="section-title">Jornada de compra clara, mesmo para pedidos personalizados.</h2>
            <div className="mt-8 grid gap-4">
              {homeSteps.map((step, index) => (
                <div key={step.title} className="rounded-[24px] border border-white/10 bg-black/20 p-5">
                  <p className="text-xs uppercase tracking-[0.18em] text-cyan-100/70">Passo {index + 1}</p>
                  <h3 className="mt-2 text-xl font-bold text-white">{step.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-white/68">{step.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {materialsShowcase.map((item) => (
              <div key={item.badge} className="glass-card p-6">
                <span className="inline-flex rounded-full border border-cyan-300/25 bg-cyan-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-100">
                  {item.badge}
                </span>
                <h3 className="mt-4 text-xl font-bold text-white">{item.title}</h3>
                <p className="mt-3 text-sm leading-7 text-white/68">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="home-operation" className="mx-auto max-w-7xl px-6 py-10">
        <div className="grid gap-8 lg:grid-cols-[0.96fr_1.04fr]">
          <div className="glass-panel p-8">
            <p className="section-kicker">Operação e entrega</p>
            <h2 className="section-title">O cliente enxerga cedo como a MDH 3D trabalha, entrega e organiza o pedido.</h2>
            <div className="mt-6 grid gap-4">
              {deliveryZones.map((zone) => (
                <div key={zone.region} className="surface-stat rounded-[22px] px-4 py-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-white">{zone.region}</p>
                    <span className="rounded-full border border-emerald-300/25 bg-emerald-300/10 px-3 py-1 text-xs font-semibold text-emerald-100">
                      {zone.eta}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-white/62">Faixa de entrega a partir de R$ {zone.fee}, conforme região e janela logística.</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4">
            <div className="glass-panel p-8">
              <p className="text-xs uppercase tracking-[0.2em] text-cyan-100/80">Antes do orçamento</p>
              <h3 className="mt-3 text-3xl font-black text-white">Checklist que acelera atendimento e reduz retrabalho.</h3>
              <div className="mt-6 grid gap-4">
                {orderPrepChecklist.map((item, index) => (
                  <div key={item.title} className="rounded-[22px] border border-white/10 bg-black/20 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-cyan-200/75">Passo {index + 1}</p>
                    <h4 className="mt-2 text-lg font-bold text-white">{item.title}</h4>
                    <p className="mt-2 text-sm leading-7 text-white/66">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-panel p-8">
              <p className="text-xs uppercase tracking-[0.2em] text-cyan-100/80">Atalhos finais</p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Link href="/catalogo?status=Pronta%20entrega" className="btn-secondary">
                  Ver pronta entrega
                </Link>
                <Link href="/checkout" className="btn-primary">
                  Fechar pedido
                </Link>
                <Link href="/imagem-para-impressao-3d" className="btn-glass">
                  Enviar referência
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="home-upload" className="bg-gradient-to-b from-black to-slate-950/20 py-4">
        <STLUploader />
      </section>

      <TrustSignals />

      <section id="home-faq" className="mx-auto max-w-6xl px-6 py-16">
        <div className="glass-panel p-8 md:p-10">
          <div className="grid gap-8 lg:grid-cols-[0.92fr_1.08fr]">
            <div>
              <p className="section-kicker">Perguntas frequentes</p>
              <h2 className="section-title">Respostas rápidas para o cliente avançar sem travar.</h2>
              <p className="section-copy mt-4">
                Materiais, prazo, pagamento e personalização aparecem de forma direta para reduzir dúvida antes da compra.
              </p>
            </div>
            <div className="grid gap-4">
              {faqItems.map((item) => (
                <article key={item.question} className="rounded-[24px] border border-white/10 bg-black/20 p-5">
                  <h3 className="text-lg font-bold text-white">{item.question}</h3>
                  <p className="mt-3 text-sm leading-7 text-white/68">{item.answer}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-16">
        <div className="glass-panel p-8 text-center md:p-12">
          <h2 className="text-3xl font-black text-white md:text-4xl">Pronto para fechar seu pedido?</h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-white/70">
            Escolha um item do catálogo, envie seu arquivo STL ou fale com a equipe para transformar uma referência em peça impressa com acabamento profissional.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
            <Link href="/checkout" className="btn-primary px-8 py-4">
              Ir para o checkout
            </Link>
            <Link href="/brindes-personalizados-3d" className="btn-secondary px-8 py-4">
              Ver brindes e lotes
            </Link>
            <Link href="/imagem-para-impressao-3d" className="btn-secondary px-8 py-4">
              Enviar referência
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
