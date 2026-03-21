"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

export function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    try {
      const text = value.startsWith("/") && typeof window !== "undefined" ? `${window.location.origin}${value}` : value;
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <button
      type="button"
      onClick={onCopy}
      className="inline-flex items-center justify-center gap-2 rounded-full border border-[#eadcc8] bg-white px-4 py-2 text-sm font-semibold text-slate-700"
    >
      {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
      {copied ? "Copiado" : label}
      <span aria-live="polite" className="sr-only">
        {copied ? "Conteúdo copiado com sucesso" : "Botão para copiar conteúdo"}
      </span>
    </button>
  );
}
