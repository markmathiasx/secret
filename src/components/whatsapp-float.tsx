"use client";

import { MessageCircleMore } from "lucide-react";
import { trackWhatsAppClick } from "@/lib/analytics-client";
import { whatsappMessage, whatsappNumber } from "@/lib/constants";

export function WhatsAppFloat() {
  const href = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      onClick={() => trackWhatsAppClick({ placement: "floating_button" })}
      className="fixed bottom-5 right-5 z-50 inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/15 px-5 py-3 text-sm font-semibold text-emerald-100 shadow-glow backdrop-blur hover:bg-emerald-400/20"
    >
      <MessageCircleMore className="h-4 w-4" /> WhatsApp
    </a>
  );
}
