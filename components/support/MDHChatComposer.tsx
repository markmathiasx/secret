"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Hash, MessageCircle, FileText, UserPlus, Trash2 } from "lucide-react";

interface MDHChatComposerProps {
  onSend: (content: string) => void;
  onClear: () => void;
  onHandoff: () => void;
  disabled?: boolean;
}

export function MDHChatComposer({ onSend, onClear, onHandoff, disabled }: MDHChatComposerProps) {
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);

  function handleSubmit() {
    if (!input.trim() || disabled) return;
    onSend(input.trim());
    setInput("");
  }

  return (
    <div className="p-4 border-t border-white/10 bg-black/40 backdrop-blur-md">
      <div className="flex flex-wrap gap-2 mb-3">
        {[
          { label: "Ver catálogo", icon: Hash },
          { label: "Personalizado", icon: FileText },
          { label: "Falar com humano", icon: UserPlus, onClick: onHandoff },
        ].map((btn) => (
          <button
            key={btn.label}
            onClick={btn.onClick || (() => setInput(btn.label))}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border border-white/10 bg-white/5 text-[10px] font-bold text-white/60 hover:bg-white/10 hover:text-white transition-colors"
          >
            <btn.icon className="w-3 h-3" />
            {btn.label}
          </button>
        ))}
      </div>

      <div className="relative group">
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit(); } }}
          placeholder="Digite sua dúvida aqui..."
          rows={1}
          className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-4 pr-12 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all resize-none max-h-32"
        />
        <button
          onClick={handleSubmit}
          disabled={!input.trim() || disabled}
          className="absolute right-2 bottom-2 p-2 rounded-xl bg-cyan-500 text-slate-950 disabled:opacity-30 disabled:bg-white/10 disabled:text-white/30 transition-all hover:bg-cyan-400"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <p className="text-[10px] text-white/30 leading-tight">
          Ao enviar, você aceita o uso desses dados para seu atendimento.
        </p>
        <button
          onClick={onClear}
          className="p-1.5 rounded-lg text-white/20 hover:text-rose-400 hover:bg-rose-400/10 transition-all"
          title="Limpar conversa"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
