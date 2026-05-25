"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, X, Minus, Maximize2, ExternalLink } from "lucide-react";
import { MDHChatMessageList } from "./MDHChatMessageList";
import { MDHChatComposer } from "./MDHChatComposer";
import { processChatbotResponse, type ChatMessage } from "@/lib/chatbot/mdh-chatbot-engine";
import { cn } from "@/lib/utils";

export function MDHChatBotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if there's a stored session
    const saved = localStorage.getItem("mdh:chat:history");
    if (saved) {
      try {
        setMessages(JSON.parse(saved));
      } catch {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("mdh:chat:history", JSON.stringify(messages));
  }, [messages]);

  async function handleSend(content: string) {
    const newMessages: ChatMessage[] = [...messages, { role: "visitor", content }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const response = await processChatbotResponse(newMessages);
      setTimeout(() => {
        setMessages(prev => [...prev, { role: "bot", content: response.content }]);
        setLoading(false);
      }, 600);
    } catch {
      setLoading(false);
    }
  }

  function handleClear() {
    setMessages([]);
    localStorage.removeItem("mdh:chat:history");
  }

  function handleHandoff() {
    setMessages(prev => [...prev, { role: "bot", content: "Estou conectando você a um de nossos especialistas. Só um momento!" }]);
  }

  return (
    <>
      {/* Launcher Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-[9999] w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-emerald-500 text-white shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-transform"
          >
            <div className="relative">
              <MessageSquare className="w-7 h-7" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 border-2 border-slate-950 rounded-full animate-pulse" />
            </div>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ y: 20, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 20, opacity: 0, scale: 0.95 }}
            className={cn(
              "fixed bottom-6 right-6 z-[9999] w-[400px] max-w-[calc(100vw-48px)] flex flex-col overflow-hidden rounded-[24px] border border-white/10 bg-slate-950/90 backdrop-blur-xl shadow-[0_32px_120px_rgba(0,0,0,0.5)] transition-all",
              isMinimized ? "h-[64px]" : "h-[600px] max-h-[calc(100vh-100px)]"
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-500 to-emerald-500 flex items-center justify-center font-black text-[10px] text-white">
                  3D
                </div>
                <div>
                  <h3 className="text-sm font-black text-white leading-none">MDH3D CHAT BOT</h3>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                    <span className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Online agora</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-2 rounded-lg text-white/30 hover:text-white hover:bg-white/10 transition-colors"
                >
                  {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minus className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-lg text-white/30 hover:text-rose-400 hover:bg-rose-400/10 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {!isMinimized && (
              <>
                <MDHChatMessageList messages={messages} loading={loading} />
                <MDHChatComposer onSend={handleSend} onClear={handleClear} onHandoff={handleHandoff} disabled={loading} />
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
