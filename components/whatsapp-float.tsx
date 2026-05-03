"use client";

import { useState } from "react";
import { MessageCircleMore, Sparkles, X } from "lucide-react";
import { whatsappMessage, whatsappNumber } from "@/lib/constants";
import { trackWhatsAppClick } from "@/lib/analytics";

export function WhatsAppFloat() {
  const href = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;
  const [expanded, setExpanded] = useState(false);
  const quickLinks = [
    "Quero fechar um item do catálogo hoje",
    "Quero pagar no Pix ou fechar com atendimento",
    "Quero enviar uma referência para orçamento",
  ];

  return (
    <div
      className="fixed bottom-6 right-6 z-[125] md:bottom-8 md:right-8"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0)', paddingRight: 'env(safe-area-inset-right, 0)' }}
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
    >
      {expanded ? (
        <div className="mb-3 w-[260px] rounded-[24px] border border-white/10 bg-slate-950/92 p-4 shadow-[0_22px_48px_rgba(2,8,23,0.34)] backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-100">
              <Sparkles className="h-4 w-4" />
              <p className="text-sm font-semibold">Atendimento humano</p>
            </div>
            <button
              type="button"
              onClick={() => setExpanded(false)}
              className="rounded-full border border-white/10 bg-white/5 p-1 text-white/60 transition hover:text-white md:hidden"
              aria-label="Fechar"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
          <p className="mt-2 text-xs leading-6 text-white/62">
            Entre já com a mensagem certa para ganhar tempo no fechamento.
          </p>
          <div className="mt-3 grid gap-2">
            {quickLinks.map((item) => (
              <a
                key={item}
                href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`Oi! ${item}`)}`}
                target="_blank"
                rel="noreferrer"
                onClick={() => { trackWhatsAppClick("float_quick_link"); setExpanded(false); }}
                className="rounded-[18px] border border-white/10 bg-white/5 px-3 py-3 text-sm text-white/78 transition hover:border-emerald-300/30 hover:text-white"
              >
                {item}
              </a>
            ))}
          </div>
        </div>
      ) : null}

      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        onClick={(e) => {
          if (!expanded) {
            e.preventDefault();
            setExpanded(true);
          } else {
            trackWhatsAppClick("float_main");
          }
        }}
        className="flex h-[62px] w-[62px] items-center justify-center rounded-full border border-green-400/35 bg-green-400/15 shadow-glow transition-all duration-300 hover:scale-110 hover:bg-green-400/25 focus:outline-none md:h-[70px] md:w-[70px]"
        style={{ boxShadow: "0 18px 44px rgba(37,211,102,0.28), 0 0 34px rgba(37,211,102,0.18)" }}
        aria-label="Fale conosco no WhatsApp"
        onFocus={() => setExpanded(true)}
        onBlur={() => setExpanded(false)}
      >
        <span className="absolute inset-0 animate-pulse rounded-full border border-green-300/30" />
        <MessageCircleMore className="relative h-7 w-7 text-green-400" />
      </a>
    </div>
  );
}
