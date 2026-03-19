"use client";

import { useState } from "react";
import { MessageCircleMore } from "lucide-react";
import { whatsappMessage, whatsappNumber } from "@/lib/constants";

export function WhatsAppFloat() {
  const href = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="fixed bottom-6 right-6 z-[1000] flex h-[62px] w-[62px] items-center justify-center rounded-full border border-green-400/35 bg-green-400/15 shadow-glow transition-all duration-300 hover:scale-110 hover:bg-green-400/25 focus:outline-none md:bottom-8 md:right-8 md:h-[70px] md:w-[70px]"
      aria-label="Fale conosco no WhatsApp"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      onFocus={() => setShowTooltip(true)}
      onBlur={() => setShowTooltip(false)}
    >
      <MessageCircleMore className="h-7 w-7 text-green-400" />
      {showTooltip ? (
        <span className="absolute right-[80px] bottom-2 rounded-lg bg-black/85 px-3 py-1 text-xs text-white shadow-lg">
          Atendimento humano
        </span>
      ) : null}
    </a>
  );
}
