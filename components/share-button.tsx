"use client";

import { useState } from "react";
import { Check, Share2 } from "lucide-react";

type ShareButtonProps = {
  url: string;
  title: string;
  text?: string;
  className?: string;
};

export function ShareButton({ url, title, text, className = "" }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const onClick = async () => {
    const targetUrl = url.startsWith("/") && typeof window !== "undefined" ? `${window.location.origin}${url}` : url;

    try {
      if (navigator.share) {
        await navigator.share({ title, text, url: targetUrl });
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(targetUrl);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1800);
      }
    } catch {
      // usuário pode cancelar o share nativo
    }
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-2 rounded-full border border-[#eadcc8] bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-[#fff8ef] ${className}`.trim()}
    >
      {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Share2 className="h-4 w-4" />}
      {copied ? "Link copiado" : "Compartilhar"}
      <span aria-live="polite" className="sr-only">
        {copied ? "Link copiado com sucesso" : "Botão de compartilhamento"}
      </span>
    </button>
  );
}
