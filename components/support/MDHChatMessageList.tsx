"use client";

import { useEffect, useRef } from "react";
import { User, Bot, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/lib/chatbot/mdh-chatbot-engine";

interface MDHChatMessageListProps {
  messages: ChatMessage[];
  loading?: boolean;
}

export function MDHChatMessageList({ messages, loading }: MDHChatMessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center">
          <Bot className="w-5 h-5 text-cyan-400" />
        </div>
        <div className="flex-1 max-w-[85%]">
          <div className="bg-white/5 border border-white/10 rounded-2xl rounded-tl-none p-3 text-sm text-white/90 leading-relaxed shadow-sm">
            Olá! Eu sou o MDH3D CHAT BOT. Posso te ajudar a escolher produtos, calcular ideias personalizadas ou tirar dúvidas de prazo, material e preços.
          </div>
          <span className="text-[10px] text-white/30 mt-1 block px-1">MDH3D Bot • Agora</span>
        </div>
      </div>

      {messages.map((msg, i) => (
        <div key={i} className={cn("flex items-start gap-3", msg.role === "visitor" ? "flex-row-reverse" : "")}>
          <div className={cn(
            "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center border",
            msg.role === "visitor"
              ? "bg-emerald-500/20 border-emerald-500/30"
              : "bg-cyan-500/20 border-cyan-500/30"
          )}>
            {msg.role === "visitor" ? <User className="w-4 h-4 text-emerald-400" /> : <Bot className="w-5 h-5 text-cyan-400" />}
          </div>
          <div className={cn("flex-1 max-w-[85%]", msg.role === "visitor" ? "text-right" : "")}>
            <div className={cn(
              "rounded-2xl p-3 text-sm leading-relaxed shadow-sm inline-block text-left",
              msg.role === "visitor"
                ? "bg-emerald-500/10 border border-emerald-500/20 rounded-tr-none text-emerald-50"
                : "bg-white/5 border border-white/10 rounded-tl-none text-white/90"
            )}>
              {msg.content}
            </div>
            <span className="text-[10px] text-white/30 mt-1 block px-1">
              {msg.role === "visitor" ? "Você" : "MDH3D Bot"} • Agora
            </span>
          </div>
        </div>
      ))}

      {loading && (
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center animate-pulse">
            <Bot className="w-5 h-5 text-cyan-400" />
          </div>
          <div className="flex space-x-1.5 p-3 rounded-2xl bg-white/5 border border-white/10 rounded-tl-none">
            <div className="w-1.5 h-1.5 bg-cyan-400/50 rounded-full animate-bounce" />
            <div className="w-1.5 h-1.5 bg-cyan-400/50 rounded-full animate-bounce [animation-delay:0.2s]" />
            <div className="w-1.5 h-1.5 bg-cyan-400/50 rounded-full animate-bounce [animation-delay:0.4s]" />
          </div>
        </div>
      )}
    </div>
  );
}
