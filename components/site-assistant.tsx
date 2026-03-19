'use client';

import { CreditCard, MessageCircleMore, QrCode, Sparkles } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { pix, whatsappNumber } from '@/lib/constants';

const quickQuestions = [
  'Quero um presente personalizado',
  'Preciso de uma peça funcional para setup',
  'Quero fechar meu pedido no Pix'
];

export function SiteAssistant({
  cardCheckoutReady,
  aiAssistantReady,
  aiAssistantModel,
  aiAssistantProvider,
}: {
  cardCheckoutReady: boolean;
  aiAssistantReady: boolean;
  aiAssistantModel: string;
  aiAssistantProvider: "openai" | "groq" | "ollama" | "fallback";
}) {
  const pathname = usePathname();
  const href = `https://wa.me/${whatsappNumber}`;
  const hiddenOnPath =
    pathname?.startsWith('/catalogo') ||
    pathname?.startsWith('/checkout') ||
    pathname?.startsWith('/conta') ||
    pathname?.startsWith('/login');

  if (hiddenOnPath) {
    return null;
  }

  return (
    <aside className="pointer-events-none fixed bottom-24 right-4 z-40 hidden w-72 rounded-[28px] border border-white/10 bg-slate-950/88 p-5 shadow-2xl backdrop-blur-xl 2xl:block">
      <div className="pointer-events-auto">
        <div className="flex items-center gap-3">
          <span className="rounded-2xl border border-emerald-300/20 bg-emerald-400/15 p-3 text-emerald-100">
            <MessageCircleMore className="h-4 w-4" />
          </span>
          <div>
            <p className="text-sm font-semibold text-white">Atendimento rápido</p>
            <p className="text-xs text-white/50">
              Respostas no site e fechamento com equipe humana no WhatsApp
            </p>
          </div>
        </div>
        <div className="mt-4 grid gap-2 rounded-[22px] border border-white/10 bg-white/5 p-4 text-xs text-white/68">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-cyan-100" />
            <span>{aiAssistantReady ? 'Consultor automático ativo para catálogo, orçamento e personalização' : 'Consultor guiado ativo para catálogo, orçamento e personalização'}</span>
          </div>
          <div className="flex items-center gap-2">
            <QrCode className="h-4 w-4 text-emerald-200" />
            <span>Pix direto na chave {pix.key}</span>
          </div>
          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-cyan-100" />
            <span>{cardCheckoutReady ? 'Cartão online em ambiente seguro do Mercado Pago' : 'Cartão com orientação da equipe durante o atendimento'}</span>
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
