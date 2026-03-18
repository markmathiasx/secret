import { CreditCard, MessageCircleMore, QrCode, Sparkles } from 'lucide-react';
import { pix, whatsappNumber } from '@/lib/constants';

const quickQuestions = [
  'Quero fechar no Pix agora',
  'Quero pagar no cartão de crédito',
  'Quero enviar referência para impressão 3D',
  'Quero ajuda para escolher um presente'
];

export function SiteAssistant({ cardCheckoutReady }: { cardCheckoutReady: boolean }) {
  const href = `https://wa.me/${whatsappNumber}`;

  return (
    <aside className="pointer-events-none fixed bottom-24 right-4 z-40 hidden w-80 rounded-[28px] border border-white/10 bg-slate-950/88 p-5 shadow-2xl backdrop-blur-xl lg:block">
      <div className="pointer-events-auto">
        <div className="flex items-center gap-3">
          <span className="rounded-2xl border border-emerald-300/20 bg-emerald-400/15 p-3 text-emerald-100">
            <MessageCircleMore className="h-4 w-4" />
          </span>
          <div>
            <p className="text-sm font-semibold text-white">Consultor MDH</p>
            <p className="text-xs text-white/50">Venda rápida, checkout claro e atendimento humano</p>
          </div>
        </div>
        <div className="mt-4 grid gap-2 rounded-[22px] border border-white/10 bg-white/5 p-4 text-xs text-white/68">
          <div className="flex items-center gap-2">
            <QrCode className="h-4 w-4 text-emerald-200" />
            <span>Pix direto na chave {pix.key}</span>
          </div>
          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-cyan-100" />
            <span>{cardCheckoutReady ? 'Cartão com checkout seguro via Mercado Pago' : 'Cartão preparado, aguardando ativação final do provedor'}</span>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-cyan-100" />
            <span>Produção local no RJ para presentes, setup e sob encomenda</span>
          </div>
        </div>
        <div className="mt-4 grid gap-2">
          {quickQuestions.map((item) => (
            <a key={item} href={`${href}?text=${encodeURIComponent(`Oi! ${item}`)}`} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/75 transition hover:border-cyan-300/25 hover:text-white">
              {item}
            </a>
          ))}
        </div>
      </div>
    </aside>
  );
}
