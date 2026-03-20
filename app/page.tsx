import Link from "next/link";
import { Hero } from "@/components/hero-professional";
import { ProductTabs } from "@/components/product-tabs";
import { STLUploader } from "@/components/stl-uploader";
import { CatalogGrid } from "@/components/catalog-grid";
import { HomeConversionLanes } from "@/components/home-conversion-lanes";
import { TrustSignals } from "@/components/trust-signals";
import { homepageCategories, materialsShowcase } from "@/lib/constants";
import { verifiedCatalog } from "@/lib/verified-catalog";
import { summarizeProductVisuals } from "@/lib/product-visuals";

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
  const realShowcase = verifiedCatalog.slice(0, 4);
  const visualSummary = summarizeProductVisuals(verifiedCatalog);

  return (
    <main>
      <Hero />

      <section className="mx-auto max-w-7xl px-6 py-16">
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
      </section>

      <HomeConversionLanes />

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

      <section className="bg-gradient-to-b from-black via-slate-950/30 to-black py-4">
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

      <section className="bg-gradient-to-b from-black to-slate-950/20 py-4">
        <STLUploader />
      </section>

      <TrustSignals />

      <section className="mx-auto max-w-6xl px-6 py-16">
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
