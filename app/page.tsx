import Link from "next/link";
import { Hero } from "@/components/hero-professional";
import { CatalogGrid } from "@/components/catalog-grid";
import { STLUploader } from "@/components/stl-uploader";
import { TrustSignals } from "@/components/trust-signals";
import { SafeProductImage } from "@/components/safe-product-image";
import { ProductVisualBadge } from "@/components/product-visual-authenticity";
import { catalog, getProductUrl, type Product } from "@/lib/catalog";
import { isProductRealPhoto, summarizeProductVisuals } from "@/lib/product-visuals";
import { formatCurrency } from "@/lib/utils";

const faqItems = [
  {
    question: "Vocês fazem peças sob encomenda?",
    answer:
      "Sim. Você pode enviar STL, imagem, briefing ou referência para receber análise de viabilidade, material e prazo antes do fechamento.",
  },
  {
    question: "Como vocês tratam as imagens da loja?",
    answer:
      "A vitrine principal prioriza itens com foto real do objeto fisico. Produtos personalizados ou em fase de curadoria continuam disponiveis, sempre com classificacao visual clara.",
  },
  {
    question: "Qual é o prazo médio?",
    answer:
      "Itens mais simples costumam sair em 24 a 48 horas. Peças maiores, pintadas ou personalizadas podem levar de 3 a 10 dias úteis, conforme complexidade.",
  },
  {
    question: "Como funciona o pagamento?",
    answer:
      "O site destaca Pix de forma direta e mantém o atendimento por WhatsApp para validação final de cor, escala, prazo e acabamento.",
  },
];

const homeSteps = [
  {
    title: "Escolha uma peça com foto real",
    description:
      "A vitrine destaca itens ja fotografados fisicamente para reduzir duvida logo no primeiro contato.",
  },
  {
    title: "Confirme material, prazo e acabamento",
    description:
      "Antes do fechamento, a equipe valida os detalhes de produção para evitar promessa visual errada ou expectativa fora do real.",
  },
  {
    title: "Feche no Pix ou pelo canal combinado",
    description:
      "Com o item certo e a referência correta, o cliente entra mais rápido em checkout ou atendimento.",
  },
];

type ShowcaseCard = {
  id: string;
  label: string;
  description: string;
  href: string;
  product: Product | null;
};

export default function HomePage() {
  const visualSummary = summarizeProductVisuals(catalog);
  const realShowcase = catalog.filter((product) => isProductRealPhoto(product)).slice(0, 4);
  const readyRealCount = catalog.filter((product) => product.readyToShip && isProductRealPhoto(product)).length;
  const customizableRealCount = catalog.filter((product) => product.customizable && isProductRealPhoto(product)).length;

  const usedProductIds = new Set<string>();
  const selectProduct = (predicate: (product: Product) => boolean) => {
    const item = catalog.find((product) => !usedProductIds.has(product.id) && predicate(product));
    if (item) usedProductIds.add(item.id);
    return item ?? null;
  };

  const smartShowcase: ShowcaseCard[] = [
    {
      id: "ready",
      label: "Pronta para vender",
      description: "Item com foto real e leitura comercial rápida para anúncio, vitrine e atendimento.",
      href: "/catalogo?mode=real&status=Pronta%20entrega",
      product: selectProduct((product) => Boolean(product.readyToShip) && isProductRealPhoto(product)),
    },
    {
      id: "gift",
      label: "Boa para presente",
      description: "Peça com apelo visual forte e pouca fricção para quem quer comprar sem briefing longo.",
      href: "/catalogo?mode=real&intent=Presente",
      product: selectProduct(
        (product) =>
          isProductRealPhoto(product) &&
          (product.category === "Presentes Criativos" ||
            product.tags.some((tag) => tag.toLowerCase().includes("presente")))
      ),
    },
    {
      id: "utility",
      label: "Boa para utilidade",
      description: "Peça com foto real e apelo funcional para setup, organização ou uso recorrente.",
      href: "/catalogo?mode=real&category=Setup%20%26%20Organiza%C3%A7%C3%A3o",
      product: selectProduct(
        (product) =>
          isProductRealPhoto(product) &&
          (product.category.includes("Setup") || product.category.includes("Utilidade"))
      ),
    },
    {
      id: "custom",
      label: "Boa para personalizar",
      description: "Referência segura para puxar conversa de cor, escala, nome ou adaptação sob medida.",
      href: "/catalogo?mode=real&custom=1",
      product: selectProduct((product) => isProductRealPhoto(product) && product.customizable),
    },
  ];

  return (
    <main>
      <Hero />

      <section id="home-portfolio" className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-3xl">
            <p className="section-kicker">Portfólio com foto real</p>
            <h2 className="section-title">A vitrine principal prioriza pecas fotografadas de verdade.</h2>
            <p className="section-copy mt-4">
              Aqui entram primeiro as pecas com prova visual mais forte. Isso deixa a navegacao mais confiavel para descobrir, comparar e fechar pedido.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { label: "Itens com foto real", value: String(visualSummary.fotoReal).padStart(2, "0") },
              { label: "Pronta entrega com foto real", value: String(readyRealCount).padStart(2, "0") },
              { label: "Personalizáveis com foto real", value: String(customizableRealCount).padStart(2, "0") },
            ].map((item) => (
              <div key={item.label} className="glass-card min-w-[160px] p-5 text-center">
                <p className="text-xs uppercase tracking-[0.18em] text-white/45">{item.label}</p>
                <p className="mt-3 text-3xl font-black text-white">{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        <CatalogGrid products={realShowcase} />

        <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link href="/catalogo?mode=real" className="btn-primary px-8 py-4">
            Ver catálogo com foto real
          </Link>
          <Link href="/imagem-para-impressao-3d" className="btn-secondary px-8 py-4">
            Enviar referência personalizada
          </Link>
        </div>
      </section>

      <section id="home-smart-picks" className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-3xl">
            <p className="section-kicker">Escolhas rápidas</p>
            <h2 className="section-title">Pecas reais para abrir a loja com mais seguranca na primeira visita.</h2>
            <p className="section-copy mt-4">
              Esta secao corta ruido visual e mostra pecas que sustentam catalogo, anuncio e conversa comercial com mais confianca.
            </p>
          </div>
          <Link href="/catalogo?mode=real" className="btn-glass">
            Abrir vitrine real
          </Link>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {smartShowcase
            .filter((item) => item.product)
            .map((item) =>
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
                    <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/60">
                      {item.product.material}
                    </span>
                    <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/60">
                      {item.product.productionWindow}
                    </span>
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
                        Abrir recorte
                      </Link>
                    </div>
                  </div>
                </article>
              ) : null
            )}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="glass-panel p-8">
            <p className="section-kicker">Como comprar</p>
            <h2 className="section-title">Fluxo simples para escolher, confirmar e fechar com seguranca.</h2>
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

          <div className="glass-panel p-8">
            <p className="section-kicker">Por que confiar</p>
            <h2 className="section-title">Menos ambiguidade visual, mais confianca para comprar hoje.</h2>
            <div className="mt-6 grid gap-4">
              {[
                "A home prioriza pecas com foto real.",
                "O catalogo abre em modo foto real por padrao.",
                "Imagens conceituais aparecem de forma sinalizada, sem confundir a primeira impressao.",
                "Novas galerias locais entram no catalogo sem duplicar imagem antiga.",
              ].map((item) => (
                <div key={item} className="rounded-[24px] border border-white/10 bg-black/20 p-4 text-sm leading-7 text-white/70">
                  {item}
                </div>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/catalogo?mode=real" className="btn-primary">
                Abrir catálogo real
              </Link>
              <Link href="/checkout" className="btn-secondary">
                Ir para checkout
              </Link>
              <Link href="/imagem-para-impressao-3d" className="btn-glass">
                Pedir sob medida
              </Link>
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
              <h2 className="section-title">Respostas curtas para o cliente avancar sem ruido.</h2>
              <p className="section-copy mt-4">
                O foco aqui e reduzir atrito visual e comercial para deixar a compra mais clara do primeiro clique ao checkout.
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
    </main>
  );
}
