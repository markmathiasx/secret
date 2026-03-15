"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Bot, MessageCircleMore, Send, UserRound, X, Sparkles } from "lucide-react";
import { ProductMediaImage } from "@/components/product-media-image";
import { trackWhatsAppClick } from "@/lib/analytics-client";
import { getProductUrl, type Product } from "@/lib/catalog";
import { formatCurrency } from "@/lib/utils";
import { socialLinks, whatsappMessage, whatsappNumber } from "@/lib/constants";

type ChatMessage = {
  id: string;
  role: "bot" | "user";
  text: string;
  suggestions?: Product[];
  human?: boolean;
};

const quickPrompts = [
  "quero anime",
  "quero geek",
  "quero presente",
  "quero decoracao",
  "quero suporte",
  "quero personalizado",
  "quero entrega",
  "quero pagar no Pix",
  "quero falar com atendimento"
];

function normalize(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim();
}

async function fetchSuggestedProducts(query: string) {
  const response = await fetch(`/api/catalog/search?q=${encodeURIComponent(query)}&limit=3`, {
    cache: "no-store"
  });
  const data = await response.json().catch(() => ({}));
  return Array.isArray(data?.items) ? (data.items as Product[]) : [];
}

function greetingFor(text: string) {
  const lower = normalize(text);
  if (lower.includes("boa noite")) return "Boa noite. Fico a disposicao para te ajudar com presente, frete e escolha da peça.";
  if (lower.includes("bom dia")) return "Bom dia. Posso te mostrar peças, faixas de preco e entrega local no Rio.";
  if (lower.includes("boa tarde")) return "Boa tarde. Me diga o que voce procura e eu separo opcoes parecidas.";
  if (lower in {"oi":1, "ola":1, "olá":1, "e ai":1, "eai":1}) return "Ola. Seja bem-vindo a MDH 3D. O que voce quer encontrar hoje?";
  return null;
}

function thanksFor(text: string) {
  const lower = normalize(text);
  if (["obrigado", "obrigada", "valeu", "tmj"].some((term) => lower.includes(term))) {
    return "Eu que agradeco. Se quiser, continuo com catalogo, frete ou encaminho voce para atendimento humano.";
  }
  return null;
}

async function botReply(input: string): Promise<Omit<ChatMessage, "id">> {
  const clean = input.trim();
  const lower = normalize(clean);

  if (!clean) {
    return {
      role: "bot",
      text: "Me diga o que voce procura. Ex.: hello kitty, vaso, suporte de controle, presente geek ou organizador."
    };
  }

  const greeting = greetingFor(clean);
  if (greeting) return { role: "bot", text: greeting };

  const thanks = thanksFor(clean);
  if (thanks) return { role: "bot", text: thanks };

  if (["humano", "atendente", "pessoa", "falar com humano", "suporte"].some((term) => lower.includes(term))) {
    return {
      role: "bot",
      text: "Certo. Posso te passar agora para atendimento humano no WhatsApp da MDH 3D.",
      human: true
    };
  }

  if (lower.includes("instagram") || lower.includes("insta")) {
    return {
      role: "bot",
      text: "O Instagram oficial da loja e @mdh_impressao3d. Se quiser, tambem posso te mostrar produtos aqui no site.",
    };
  }

  if (lower.includes("frete") || lower.includes("cep") || lower.includes("entrega")) {
    return {
      role: "bot",
      text: "A MDH 3D atende com entrega local no RJ e tambem organiza retirada ou combinacao. Voce pode usar a pagina de Frete e depois fechar os detalhes no checkout ou no WhatsApp."
    };
  }

  if (lower.includes("pix") || lower.includes("cartao") || lower.includes("cartão") || lower.includes("parcel")) {
    return {
      role: "bot",
      text: "No site voce pode fechar com Pix ou cartao quando ele estiver habilitado. Pix costuma ter o melhor preco e no cartao eu ja mostro o parcelamento estimado."
    };
  }

  if (lower.includes("material") || lower.includes("acabamento") || lower.includes("cor") || lower.includes("personaliz")) {
    return {
      role: "bot",
      text: "A MDH 3D trabalha principalmente com PLA premium, alem de variacoes sob consulta. Posso te mostrar itens com foco em presente, setup, decoracao ou personalizados."
    };
  }

  if (lower.includes("preco") || lower.includes("valor") || lower.includes("orcamento") || lower.includes("orçamento")) {
    return {
      role: "bot",
      text: "Posso te mostrar opcoes parecidas com o que voce quer e os precos base via Pix. Se a peça for personalizada, depois eu te direciono para um humano."
    };
  }

  const matches = await fetchSuggestedProducts(lower);

  if (!matches.length) {
    return {
      role: "bot",
      text: "Ainda nao achei um item muito proximo. Tente descrever com palavras como anime, hello kitty, suporte, vaso, presente ou decoracao. Se preferir, eu passo para atendimento humano.",
      human: true
    };
  }

  const lead = matches[0];
  return {
    role: "bot",
    text: `Encontrei ${matches.length} opcao(oes) parecidas com "${clean}". A melhor correspondencia agora e ${lead.name}, a partir de ${formatCurrency(lead.pricePix)} via Pix.`,
    suggestions: matches
  };
}

function makeId() {
  return Math.random().toString(36).slice(2, 10);
}

function ProductSuggestion({ product }: { product: Product }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/25 p-3">
      <div className="flex gap-3">
        <ProductMediaImage product={product} className="h-16 w-16 rounded-2xl object-cover" />
        <div className="min-w-0 flex-1">
          <p className="text-[11px] uppercase tracking-[0.18em] text-cyan-200/80">{product.category}</p>
          <p className="mt-1 text-sm font-semibold text-white">{product.name}</p>
          <p className="mt-1 text-xs text-white/55">{product.productionWindow} • {product.grams} g</p>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between gap-3">
        <span className="text-sm font-bold text-cyan-100">{formatCurrency(product.pricePix)}</span>
        <Link href={getProductUrl(product)} className="rounded-full border border-cyan-400/25 bg-cyan-400/10 px-3 py-1.5 text-xs font-semibold text-cyan-100">
          Abrir item
        </Link>
      </div>
    </div>
  );
}

export function SiteAssistant() {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [pending, setPending] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: makeId(),
      role: "bot",
      text: "Ola. Sou o assistente da MDH 3D. Posso te mostrar produtos parecidos, ideias de presente, faixas de preco, frete e tambem te direcionar para atendimento humano quando voce quiser."
    }
  ]);

  const waHref = useMemo(() => {
    return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;
  }, []);

  async function sendMessage(prefill?: string) {
    const raw = (prefill ?? value).trim();
    if (!raw || pending) return;

    const userMessage: ChatMessage = { id: makeId(), role: "user", text: raw };
    setMessages((current) => [...current, userMessage]);
    setValue("");
    setOpen(true);

    setPending(true);
    try {
      const reply: ChatMessage = { id: makeId(), ...(await botReply(raw)) };
      setMessages((current) => [...current, reply]);
    } catch {
      setMessages((current) => [
        ...current,
        {
          id: makeId(),
          role: "bot",
          text: "Tive uma falha rapida ao consultar a loja. Voce pode tentar novamente ou falar comigo no WhatsApp.",
          human: true
        }
      ]);
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      {open ? (
        <div
          role="dialog"
          aria-modal="false"
          aria-label="Assistente da MDH 3D"
          className="fixed bottom-24 left-4 z-50 w-[380px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-[28px] border border-white/10 bg-slate-950/94 shadow-2xl backdrop-blur-xl"
        >
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <div className="flex items-center gap-3">
              <span className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-2 text-cyan-100">
                <Bot className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-semibold text-white">Assistente MDH 3D</p>
                <p className="text-xs text-white/50">Descoberta de produtos + frete + atendimento rapido</p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="rounded-full border border-white/10 p-2 text-white/70 hover:text-white">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="max-h-[60vh] space-y-4 overflow-y-auto px-4 py-4" aria-live="polite">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[92%] rounded-3xl px-4 py-3 ${message.role === "user" ? "bg-cyan-400 text-slate-950" : "border border-white/10 bg-white/5 text-white"}`}>
                  <div className="mb-2 flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] opacity-70">
                    {message.role === "user" ? <UserRound className="h-3.5 w-3.5" /> : <Sparkles className="h-3.5 w-3.5" />}
                    <span>{message.role === "user" ? "Voce" : "MDH"}</span>
                  </div>
                  <p className="text-sm leading-6">{message.text}</p>

                  {message.suggestions?.length ? (
                    <div className="mt-3 space-y-3">
                      {message.suggestions.map((product) => (
                        <ProductSuggestion key={product.id} product={product} />
                      ))}
                    </div>
                  ) : null}

                  {message.human ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      <a
                        href={waHref}
                        onClick={() => trackWhatsAppClick({ placement: "site_assistant" })}
                        className="inline-flex rounded-full border border-emerald-400/25 bg-emerald-400/10 px-4 py-2 text-xs font-semibold text-emerald-100"
                      >
                        Falar com humano no WhatsApp
                      </a>
                      <a href={socialLinks.instagram} target="_blank" rel="noreferrer" className="inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-white/80">
                        Abrir Instagram oficial
                      </a>
                    </div>
                  ) : null}
                </div>
              </div>
            ))}
            {pending ? (
              <div className="flex justify-start">
                <div className="max-w-[92%] rounded-3xl border border-white/10 bg-white/5 px-4 py-3 text-white">
                  <div className="mb-2 flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] opacity-70">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>MDH</span>
                  </div>
                  <p className="text-sm leading-6">Buscando opcoes parecidas na loja...</p>
                </div>
              </div>
            ) : null}
          </div>

          <div className="border-t border-white/10 px-4 py-3">
            <div className="mb-3 flex flex-wrap gap-2">
              {quickPrompts.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => sendMessage(prompt)}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/70"
                >
                  {prompt}
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") void sendMessage();
                }}
                placeholder="Ex.: quero um hello kitty preto"
                className="flex-1 rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none"
                disabled={pending}
              />
              <button onClick={() => void sendMessage()} disabled={pending} className="rounded-2xl bg-cyan-400 px-4 text-slate-950 disabled:opacity-60">
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <button
        onClick={() => setOpen((current) => !current)}
        className="fixed bottom-24 left-4 z-50 inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/15 px-5 py-3 text-sm font-semibold text-cyan-100 shadow-glow backdrop-blur hover:bg-cyan-400/20"
      >
        <MessageCircleMore className="h-5 w-5" />
        Assistente MDH
      </button>
    </>
  );
}
