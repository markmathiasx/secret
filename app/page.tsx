import { Hero } from "@/components/hero-professional";
import { ProductTabs } from "@/components/product-tabs";
import { STLUploader } from "@/components/stl-uploader";
import { CatalogGrid } from "@/components/catalog-grid";
import { TrustSignals } from "@/components/trust-signals";
import { featuredCatalog } from "@/lib/catalog";
import Link from "next/link";

const faqItems = [
  {
    question: "Vocês fazem peças sob encomenda?",
    answer:
      "Sim. Você pode enviar referência, STL, imagem ou briefing para receber análise de viabilidade, material e prazo. O retorno acontece o mais rápido possível em horário comercial.",
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
              { num: "RJ", label: "Produção Local" },
              { num: "PIX", label: "Fechamento Rápido" },
              { num: "CARD", label: "Checkout Seguro" },
              { num: "HUMANO", label: "Atendimento Direto" },
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

      {/* Trust & Transparency Section */}
      <section className="mx-auto max-w-5xl px-6 py-16">
        <div className="text-center">
          <span className="section-kicker">✅ Confiança</span>
          <h2 className="section-title">Compra segura com processo transparente</h2>
          <p className="section-copy">
            O checkout agora registra o pedido antes do pagamento, exibe Pix direto com QR Code e envia o cartão para o ambiente seguro do Mercado Pago. Produzimos localmente no Rio com comunicação direta sobre prazo e material.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          <div className="glass-panel p-8">
            <h3 className="text-xl font-bold text-white">Pedido registrado</h3>
            <p className="mt-3 text-sm text-white/70">
              Cada compra nasce com código próprio antes do pagamento para facilitar confirmação, suporte e acompanhamento interno.
            </p>
          </div>
          <div className="glass-panel p-8">
            <h3 className="text-xl font-bold text-white">Pagamento confiável</h3>
            <p className="mt-3 text-sm text-white/70">
              Pix com chave direta e cartão com checkout hospedado reduzem atrito e evitam exposição de dados sensíveis no site.
            </p>
          </div>
          <div className="glass-panel p-8">
            <h3 className="text-xl font-bold text-white">Suporte comercial</h3>
            <p className="mt-3 text-sm text-white/70">
              Atendimento humano via WhatsApp para esclarecer detalhes de impressão, acabamento, prazo, personalização e pós-venda.
            </p>
          </div>
        </div>

        <div className="mt-10 text-center">
          <Link href="/catalogo" className="btn-primary px-8 py-4">
            Acessar Catálogo Completo
          </Link>
        </div>
      </section>

      {/* Trust Signals - Provas Sociais + Selos de Segurança */}
      <TrustSignals />

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
            Envie seu arquivo STL, descreva seu projeto ou fale com o time no WhatsApp para orçamento, personalização e fechamento do pedido.
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
