"use client";

import { MessageSquareText } from "lucide-react";

export const SUPPORT_QUICK_ACTIONS = [
  "Quero ver chaveiros",
  "Quero presente barato",
  "Quero produto geek",
  "Quero organizador para setup",
  "Quero orçamento personalizado",
  "Quero brinde/lote",
  "Como funciona o pagamento?",
  "Qual prazo de produção?",
  "Quero falar com humano",
] as const;

export function SupportQuickActions({
  onSelect,
  disabled = false,
}: {
  onSelect: (message: string) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {SUPPORT_QUICK_ACTIONS.map((action) => (
        <button
          key={action}
          type="button"
          onClick={() => onSelect(action)}
          disabled={disabled}
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-2 text-xs font-semibold text-white/78 transition hover:border-cyan-300/30 hover:bg-cyan-300/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-55"
        >
          <MessageSquareText className="h-3.5 w-3.5 text-cyan-100" />
          {action}
        </button>
      ))}
    </div>
  );
}
