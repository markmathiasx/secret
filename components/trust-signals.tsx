'use client';

import { BadgeCheck, CreditCard, MessageCircleMore, PackageCheck, QrCode, ShieldCheck, Truck } from 'lucide-react';
import { pix } from '@/lib/constants';

const pillars = [
  {
    icon: QrCode,
    title: 'Pix direto e visível',
    description: `A chave ${pix.key} aparece no checkout com QR Code e copia e cola para reduzir atrito na decisão de compra.`
  },
  {
    icon: CreditCard,
    title: 'Cartão com provedor externo',
    description: 'Quando o cliente escolhe cartão, o pagamento segue para o checkout hospedado do Mercado Pago.'
  },
  {
    icon: PackageCheck,
    title: 'Pedido com código antes do pagamento',
    description: 'Cada compra é registrada antes da cobrança para facilitar suporte, confirmação e rastreio interno.'
  },
  {
    icon: MessageCircleMore,
    title: 'Atendimento humano no WhatsApp',
    description: 'O canal comercial continua ativo para personalização, orçamento, aprovação e pós-venda.'
  }
];

const commitments = [
  'Produção local no Rio de Janeiro com comunicação direta sobre material, prazo e acabamento.',
  'Fluxo de pagamento claro: Pix para fechamento rápido e cartão para parcelamento em ambiente seguro.',
  'Cadastro de cliente com senha protegida por hash e sessão assinada em vez de login exposto no navegador.',
  'Checkout orientado para conversão, com menos etapas e menos promessas frágeis.'
];

export function TrustSignals() {
  return (
    <>
      <section className="border-y border-emerald-500/15 bg-gradient-to-r from-emerald-950/30 via-slate-950 to-cyan-950/30 py-10">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-emerald-100/75">Confiança operacional</p>
            <h3 className="mt-3 text-3xl font-black text-white">Processo comercial mais forte, sem improviso no pagamento.</h3>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/70">
              A vitrine agora comunica melhor o que realmente existe: produção local, atendimento humano, pedido registrado e checkout com Pix ou cartão sem exposição desnecessária de dados.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {pillars.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="rounded-[28px] border border-white/10 bg-white/5 p-5">
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
            <h3 className="mt-3 text-3xl font-black text-white">Menos fricção para comprar e menos risco para a marca.</h3>
            <div className="mt-6 grid gap-4">
              {commitments.map((item) => (
                <div key={item} className="flex items-start gap-3 rounded-[22px] border border-white/10 bg-black/20 p-4 text-sm leading-7 text-white/70">
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
              <p className="mt-3 text-sm leading-7 text-white/68">O acesso passou a usar hash de senha no servidor e sessão assinada, sem o modelo inseguro que existia antes.</p>
            </div>
            <div className="glass-panel p-6">
              <Truck className="h-6 w-6 text-cyan-100" />
              <h4 className="mt-4 text-xl font-bold text-white">Pedido pronto para suporte</h4>
              <p className="mt-3 text-sm leading-7 text-white/68">O código do pedido nasce no checkout e pode ser usado no WhatsApp para acelerar confirmação, entrega e atendimento.</p>
            </div>
            <div className="glass-panel p-6 md:col-span-2">
              <p className="text-xs uppercase tracking-[0.18em] text-cyan-100/75">Pagamento</p>
              <h4 className="mt-3 text-2xl font-black text-white">Pix para velocidade. Cartão para conveniência.</h4>
              <p className="mt-4 text-sm leading-7 text-white/68">
                Essa combinação é a melhor relação entre conversão e segurança para a fase atual do projeto: Pix direto para custo baixo e cartão de crédito terceirizado para não assumir carga de PCI no próprio site.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
