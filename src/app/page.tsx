import { Hero } from "@/components/hero-professional";
import { ProductTabs } from "@/components/product-tabs";
import { STLUploader } from "@/components/stl-uploader";
import { CatalogGrid } from "@/components/catalog-grid";
import { featuredCatalog } from "@/lib/catalog";
import Link from "next/link";

const faqItems = [
  {
    question: "Vocês fazem peças sob encomenda?",
    answer:
      "Sim! Você pode enviar referência, STL, imagem ou briefing para receber análise de viabilidade, material e prazo. Respondemos em até 2 horas.",
  },
  {
    question: "Qual é o prazo médio? ",
    answer:
      "Itens prontos costumam sair em 24 a 48 horas. Peças personalizadas ou com acabamento especial podem levar de 3 a 7 dias dependendo da complexidade.",
  },
  {
    question: "Quais materiais vocês usam?",
    answer:
      "Trabalhamos com PLA Premium, PLA Silk, PETG, Resina Fotopolímero, ABS e Nylon. Escolhemos o melhor material conforme uso, estética e resistência.",
  },
  {
    question: "Entregam no Rio de Janeiro?",
    answer:
      "Sim. Temos operação local no RJ e também organizamos envio para todo Brasil com confirmação de prazo e janela de produção.",
  },
  {
    question: "Qual é a política de reembolso?",
    answer:
      "Garantia de qualidade em todas as peças. Se houver defeito de fabricação, refazemos sem custo adicional ou devolvemos o valor.",
  },
  {
    question: "Como faço para pagar?",
    answer:
      "Aceitamos Pix (com desconto), cartão de crédito via Mercado Pago, boleto e orçamento personalizado via WhatsApp.",
  },
];

export default function HomePage() {
  // Get first 8 featured products
  const featuredProducts = featuredCatalog.slice(0, 8);

  return (
    <main>
      {/* Hero Section */}
      <Hero />

      {/* Product Tabs Section */}
      <section className="bg-gradient-to-b from-black via-slate-950/30 to-black py-4">
        <ProductTabs />
      </section>

      {/* About / Trust Signals */}
      <section className="mx-auto max-w-5xl px-6 py-16">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Left - Description */}
          <div className="glass-panel p-8">
            <span className="section-kicker">✓ Sobre MDH 3D</span>
            <h2 className="section-title">
              Impressão 3D Profissional com Qualidade e Agilidade
            </h2>
            <p className="section-copy mt-6">
              Somos um estúdio especializado em impressão 3D localizado no Rio de Janeiro. Trabalhamos com as melhores impressoras FDM e resina para entregar peças com precisão, qualidade de acabamento e prazo garantido.
            </p>
            <div className="mt-6 space-y-3">
              <div className="flex items-start gap-3">
                <span className="text-cyan-glow text-xl">✓</span>
                <div>
                  <h4 className="font-bold text-white">Atendimento Direto</h4>
                  <p className="text-sm text-white/60">
                    Fale conosco no WhatsApp para orçamento e personalização
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-cyan-glow text-xl">✓</span>
                <div>
                  <h4 className="font-bold text-white">Pix com Desconto</h4>
                  <p className="text-sm text-white/60">
                    Pagamento instantâneo com melhor preço
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-cyan-glow text-xl">✓</span>
                <div>
                  <h4 className="font-bold text-white">Produção Local</h4>
                  <p className="text-sm text-white/60">
                    Impressoras de qualidade no Rio de Janeiro
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right - Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { num: "500+", label: "Projetos Entregues" },
              { num: "99%", label: "Satisfação Clientes" },
              { num: "24h", label: "Resposta WhatsApp" },
              { num: "7+", label: "Anos Experiência" },
            ].map((stat, i) => (
              <div
                key={i}
                className="glass-card p-6 flex flex-col items-center justify-center text-center"
              >
                <div className="text-3xl font-black text-cyan-glow mb-2">
                  {stat.num}
                </div>
                <div className="text-sm text-white/70">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STL Upload Section */}
      <section className="bg-gradient-to-b from-black to-slate-950/20 py-4">
        <STLUploader />
      </section>

      {/* Featured Products / Catalog */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-10">
          <span className="section-kicker">⭐ Catálogo</span>
          <h2 className="section-title">Produtos em Estoque</h2>
          <p className="section-copy">
            Confira nossa seleção de produtos prontos para entrega
          </p>
        </div>

        <CatalogGrid products={featuredProducts} />

        <div className="mt-8 text-center">
          <Link href="/catalogo" className="btn-primary px-8 py-4">
            Ver Catálogo Completo
          </Link>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="mx-auto max-w-5xl px-6 py-16">
        <div className="mb-10 text-center">
          <span className="section-kicker">❓ Dúvidas</span>
          <h2 className="section-title">Perguntas Frequentes</h2>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {faqItems.map((item, i) => (
            <div key={i} className="glass-card p-6">
              <h3 className="text-lg font-bold text-white mb-3">
                {item.question}
              </h3>
              <p className="text-sm text-white/70 leading-relaxed">
                {item.answer}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="mx-auto max-w-5xl px-6 py-16">
        <div className="glass-panel p-8 md:p-12 text-center">
          <h2 className="text-3xl font-black text-white mb-4">
            Pronto para Começar?
          </h2>
          <p className="text-lg text-white/70 mb-8 max-w-2xl mx-auto">
            Envie seu arquivo STL, describe seu projeto ou fale com nosso time no WhatsApp para um orçamento personalizado.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/imagem-para-impressao-3d"
              className="btn-primary px-8 py-4 font-bold uppercase tracking-wider"
            >
              📤 Enviar Arquivo
            </Link>

            <a
              href="https://wa.me/5521920137249?text=Oi%20MDH%203D!%20Quero%20saber%20mais%20sobre%20seus%20serviços."
              target="_blank"
              rel="noreferrer"
              className="btn-whatsapp px-8 py-4 font-bold uppercase tracking-wider"
            >
              💬 Falar no WhatsApp
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
