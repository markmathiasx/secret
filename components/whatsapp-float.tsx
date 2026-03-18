"use client";

import { useEffect, useState } from "react";
import { MessageCircleMore } from "lucide-react";
import { whatsappMessage, whatsappNumber } from "@/lib/constants";

export function WhatsAppFloat() {
  const href = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;
  const [showTooltip, setShowTooltip] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <>
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className={`fixed bottom-8 right-8 z-[1000] flex items-center justify-center rounded-full border border-green-400/30 bg-green-400/15 w-[60px] h-[60px] md:w-[70px] md:h-[70px] shadow-glow transition-all duration-500 hover:scale-110 hover:bg-green-400/25 focus:outline-none animate-bounce ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        aria-label="Fale conosco no WhatsApp"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onFocus={() => setShowTooltip(true)}
        onBlur={() => setShowTooltip(false)}
      >
        <MessageCircleMore className="w-7 h-7 text-green-400 animate-pulse" />
        {showTooltip && (
          <span className="absolute right-[80px] bottom-1 bg-black/80 text-white text-xs rounded-lg px-3 py-1 shadow-lg animate-fadeInUp" style={{zIndex:1100}}>Fale conosco</span>
        )}
      </a>
      {/* Footer shortcut buttons */}
      <div className={`fixed bottom-0 left-0 w-full flex flex-wrap justify-center gap-3 z-[1000] pb-4 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <a href="https://wa.me/5521920137249?text=Quero%20algo%20geek%20para%20presente" className="button-primary rounded-full px-4 py-2 text-sm font-bold shadow-cyan hover:scale-105 transition-all duration-300 animate-bounce" style={{ animationDelay: '0.1s' }} target="_blank" rel="noopener noreferrer">Quero algo geek para presente</a>
        <a href="https://wa.me/5521920137249?text=Quero%20um%20suporte%20para%20setup" className="button-primary rounded-full px-4 py-2 text-sm font-bold shadow-cyan hover:scale-105 transition-all duration-300 animate-bounce" style={{ animationDelay: '0.2s' }} target="_blank" rel="noopener noreferrer">Quero um suporte para setup</a>
        <a href="https://wa.me/5521920137249?text=Quero%20um%20nome%203D%20personalizado" className="button-primary rounded-full px-4 py-2 text-sm font-bold shadow-cyan hover:scale-105 transition-all duration-300 animate-bounce" style={{ animationDelay: '0.3s' }} target="_blank" rel="noopener noreferrer">Quero um nome 3D personalizado</a>
        <a href="https://wa.me/5521920137249?text=Quero%20calcular%20entrega%20no%20RJ" className="button-primary rounded-full px-4 py-2 text-sm font-bold shadow-cyan hover:scale-105 transition-all duration-300 animate-bounce" style={{ animationDelay: '0.4s' }} target="_blank" rel="noopener noreferrer">Quero calcular entrega no RJ</a>
      </div>
    </>
  );
}
