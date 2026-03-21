'use client';

import { BadgeCheck, CreditCard, MessageCircleMore, PackageCheck, QrCode, ShieldCheck, Truck } from 'lucide-react';
import { pix } from '@/lib/constants';

const pillars = [
  {
    icon: QrCode,
    title: 'Pix direto e visível',
    description: `A chave ${pix.key} aparece no checkout com QR Code e código copia e cola para facilitar o pagamento.`
  },
  {
    icon: CreditCard,
    title: 'Cartão com parceiro seguro',
    description: 'Quando o cartão está disponível online, o pagamento segue para o ambiente seguro do parceiro de cobrança.'
  },
  {
    icon: PackageCheck,
    title: 'Pedido com código de acompanhamento',
    description: 'Cada compra recebe um código para facilitar confirmação, suporte e andamento da produção.'
  },
  {
    icon: MessageCircleMore,
    title: 'Atendimento humano no WhatsApp',
    description: 'Você fala com a equipe para orçamento, personalização, aprovação e pós-venda sem conversa genérica.'
  }
];

const commitments = [
  'Produção local no Rio de Janeiro com comunicação direta sobre material, prazo e acabamento.',
  'Portfólio com separação clara entre foto real, render fiel e imagem conceitual.',
  'Fluxo de pagamento simples: Pix para rapidez e cartão via parceiro seguro quando disponível.',
  'Conta do cliente protegida para voltar ao site, acompanhar pedidos e organizar favoritos.'
];

export function TrustSignals() {
  return (
    <>
      <section className="border-y border-emerald-500/15 bg-gradient-to-r from-emerald-950/30 via-slate-950 to-cyan-950/30 py-10">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-emerald-100/75">Confiança operacional</p>
            <h3 className="mt-3 text-3xl font-black text-white">Compra com clareza do primeiro clique ao pós-venda.</h3>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/70">
              A MDH 3D foi organizada para transmitir o que realmente importa para quem compra: prova visual confiável, pedido claro, atendimento direto e pagamento sem ruído.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {pillars.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="surface-stat rounded-[28px] p-5">
                  <div className="flex items-center gap-3">
                    <span className="rounded-2xl border border-white/10 bg-white/5 p-3 text-cyan-100">
                      <Icon className="h-5 w-5" />
                    </span>
                    <p className="text-base font-bold text-white">{item.title}</p>
                  </div>
                  <p className="mt-4 text-sm leading-7 text-white/68">{item.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-14">
        <div className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
          <div className="glass-panel p-8">
            <p className="text-xs uppercase tracking-[0.22em] text-cyan-100/75">Padrão de operação</p>
            <h3 className="mt-3 text-3xl font-black text-white">Menos atrito para comprar, mais segurança para confiar.</h3>
            <div className="mt-6 grid gap-4">
              {commitments.map((item) => (
                <div key={item} className="surface-stat flex items-start gap-3 rounded-[22px] p-4 text-sm leading-7 text-white/70">
                  <BadgeCheck className="mt-1 h-5 w-5 flex-shrink-0 text-emerald-200" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="glass-panel p-6">
              <ShieldCheck className="h-6 w-6 text-emerald-200" />
              <h4 className="mt-4 text-xl font-bold text-white">Conta do cliente protegida</h4>
              <p className="mt-3 text-sm leading-7 text-white/68">A conta serve para voltar ao site, rever produtos, acompanhar pedidos e manter a jornada mais organizada.</p>
            </div>
            <div className="glass-panel p-6">
              <Truck className="h-6 w-6 text-cyan-100" />
              <h4 className="mt-4 text-xl font-bold text-white">Pedido pronto para suporte</h4>
              <p className="mt-3 text-sm leading-7 text-white/68">O código do pedido nasce no checkout e pode ser usado no WhatsApp para acelerar confirmação, entrega e atendimento.</p>
            </div>
            <div className="glass-panel p-6 md:col-span-2">
              <p className="text-xs uppercase tracking-[0.18em] text-cyan-100/75">Pagamento</p>
              <h4 className="mt-3 text-2xl font-black text-white">Pix para rapidez. Cartão para conveniência.</h4>
              <p className="mt-4 text-sm leading-7 text-white/68">
                A operação foi desenhada para facilitar o fechamento do pedido com clareza: Pix para aprovação rápida e cartão em ambiente seguro quando o checkout online estiver disponível.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
