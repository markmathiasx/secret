import type { Metadata } from "next";
import Link from "next/link";
import { BadgeCheck, Clock3, MessageCircleMore, PackageCheck, ShieldCheck, Truck } from "lucide-react";
import { PurchaseProtectionBanner } from "@/components/purchase-protection-banner";
import { PostPurchaseHub } from "@/components/post-purchase-hub";
import { whatsappNumber } from "@/lib/constants";
import { isCardCheckoutConfigured } from "@/lib/env";

export const metadata: Metadata = {
  title: "Compra protegida",
  description: "Como a MDH 3D organiza pagamento, produção, rastreio, trocas e suporte para reduzir risco na compra.",
  alternates: {
    canonical: "/compra-protegida",
  },
};

function getSteps(cardCheckoutReady: boolean) {
  return [
  {
    icon: PackageCheck,
    title: "Pedido claro",
    body: "Você escolhe o produto, confirma contato e recebe um código para acompanhar a compra.",
  },
  {
    icon: Clock3,
    title: "Prazo visível",
    body: "A loja mostra produção, envio e rota de frete antes da confirmação final.",
  },
  {
    icon: ShieldCheck,
    title: "Pagamento seguro",
    body: cardCheckoutReady
      ? "Pix e cartão aparecem com comunicação objetiva dentro do checkout online."
      : "Pix aparece como rota direta, e cartão segue com orientação humana quando necessário.",
  },
  {
    icon: Truck,
    title: "Pós-venda resolutivo",
    body: "Rastreio, troca e devolução têm caminhos diretos para você não ficar preso no WhatsApp.",
  },
  ];
}

const expectations = [
  "Quando o pedido entra, ele recebe código e fica pronto para acompanhamento.",
  "A produção local define a janela de preparo antes da postagem.",
  "O envio é calculado no checkout para evitar surpresa de frete.",
  "Se houver problema, a equipe avalia troca, reimpressão ou reembolso conforme o caso.",
];

export default function CompraProtegidaPage() {
  const steps = getSteps(isCardCheckoutConfigured());

  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <div className="glass-panel p-8 md:p-10">
        <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Compra protegida MDH</p>
        <h1 className="mt-3 text-4xl font-black text-white">Como a compra funciona do pedido ao suporte.</h1>
        <p className="mt-4 max-w-3xl text-base leading-8 text-white/68">
          A experiência foi desenhada para reduzir dúvida em cada etapa: pedido, produção, pagamento, envio, rastreio e solução de problema.
        </p>
      </div>

      <div className="mt-8">
        <PurchaseProtectionBanner compact />
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {steps.map((item) => {
          const Icon = item.icon;
          return (
            <article key={item.title} className="glass-panel p-6">
              <Icon className="h-6 w-6 text-cyan-100" />
              <h2 className="mt-4 text-xl font-bold text-white">{item.title}</h2>
              <p className="mt-3 text-sm leading-7 text-white/68">{item.body}</p>
            </article>
          );
        })}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.02fr_0.98fr]">
        <div className="glass-panel p-6 md:p-8">
          <p className="text-xs uppercase tracking-[0.18em] text-emerald-100/80">O que você pode esperar</p>
          <div className="mt-5 grid gap-3">
            {expectations.map((item) => (
              <div key={item} className="rounded-[20px] border border-white/10 bg-black/20 p-4 text-sm leading-7 text-white/72">
                <BadgeCheck className="mr-2 inline-block h-4 w-4 align-[-2px] text-emerald-200" />
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="glass-panel p-6 md:p-8">
          <p className="text-xs uppercase tracking-[0.18em] text-cyan-100/80">Se algo sair do esperado</p>
          <h2 className="mt-3 text-2xl font-black text-white">A leitura é simples: problema real entra em análise, não em enrolação.</h2>
          <div className="mt-5 grid gap-3 text-sm leading-7 text-white/68">
            <p>Defeito de produção, avaria no transporte ou divergência do que foi aprovado viram uma tratativa objetiva.</p>
            <p>Personalizados têm regra própria porque dependem do briefing aprovado antes da fabricação.</p>
            <p>Troca, devolução e reembolso aparecem com passos claros para o comprador não ficar sem resposta.</p>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/trocas-e-devolucoes" className="btn-secondary">
              Ver trocas e devoluções
            </Link>
            <Link href="/rastrear" className="btn-glass">
              Rastrear pedido
            </Link>
              <Link href="/carrinho" className="btn-primary">
              Ir para o checkout
            </Link>
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <Link href="/faq" className="glass-panel p-6 text-sm leading-7 text-white/68 transition hover:border-cyan-300/25">
          <p className="font-semibold text-white">FAQ e ajuda rápida</p>
          <p className="mt-2">Tire dúvidas sobre prazo, material, pagamento, personalização e pedidos em lote.</p>
        </Link>
        <a
          href={`https://wa.me/${whatsappNumber}`}
          target="_blank"
          rel="noreferrer"
          className="glass-panel p-6 text-sm leading-7 text-white/68 transition hover:border-emerald-300/25"
        >
          <div className="flex items-center gap-2 text-emerald-100">
            <MessageCircleMore className="h-4 w-4" />
            <p className="font-semibold text-white">Falar com a equipe</p>
          </div>
          <p className="mt-2">Quando a dúvida for específica, você resolve direto com atendimento humano.</p>
        </a>
      </div>

      <div className="mt-8">
        <PostPurchaseHub compact />
      </div>
    </section>
  );
}
