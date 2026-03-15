"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Bot, MessageCircleMore, Send, UserRound, X } from "lucide-react";
import { catalog, getProductUrl, type Product } from "@/lib/catalog";
import { socialLinks, whatsappMessage, whatsappNumber } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";
import { SafeProductImage } from "@/components/safe-product-image";

type ChatMessage = {
  id: string;
  role: "bot" | "user";
  text: string;
  suggestions?: Product[];
  human?: boolean;
};

const quickPrompts = [
  "Quero um item geek",
  "Preciso de suporte de controle",
  "Quero um presente personalizado",
  "Calcular frete no RJ"
];

function normalize(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function scoreProduct(product: Product, query: string) {
  const normalizedQuery = normalize(query);
  const haystack = normalize(
    [product.name, product.category, product.theme, product.collection, product.description, ...product.tags].join(" ")
  );

  let score = 0;
  if (normalize(product.name).includes(normalizedQuery)) score += 8;
  if (normalize(product.theme).includes(normalizedQuery)) score += 6;
  if (normalize(product.category).includes(normalizedQuery)) score += 4;

  normalizedQuery.split(/\s+/).forEach((token) => {
    if (token && haystack.includes(token)) score += 1;
  });

  return score;
}

function pickProducts(query: string) {
  return catalog
    .map((product) => ({ product, score: scoreProduct(product, query) }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || a.product.pricePix - b.product.pricePix)
    .slice(0, 3)
    .map((item) => item.product);
}

function botReply(input: string): Omit<ChatMessage, "id"> {
  const clean = input.trim();
  const lower = normalize(clean);

  if (!clean) {
    return {
      role: "bot",
      text: "Descreva a peca que voce procura, como hello kitty, suporte de controle, vaso, organizador ou brinde personalizado."
    };
  }

  if (lower.includes("frete") || lower.includes("cep") || lower.includes("entrega")) {
    return {
      role: "bot",
      text: "Para frete no Rio de Janeiro, use a pagina de entregas com o seu CEP. Se quiser, eu tambem posso te mostrar pecas e encaminhar para o WhatsApp."
    };
  }

  if (lower.includes("humano") || lower.includes("atendente") || lower.includes("whatsapp")) {
    return {
      role: "bot",
      text: "Perfeito. Posso te direcionar agora para atendimento humano pelo WhatsApp da MDH 3D.",
      human: true
    };
  }

  if (lower.includes("instagram") || lower.includes("rede")) {
    return {
      role: "bot",
      text: socialLinks.instagram
        ? `O Instagram oficial da MDH 3D esta em ${socialLinks.instagram}.`
        : "As redes sociais podem ser ativadas depois. Enquanto isso, o site continua pronto para catalogo e orcamento."
    };
  }

  const matches = pickProducts(clean);

  if (!matches.length) {
    return {
      role: "bot",
      text: "Ainda nao encontrei uma correspondencia forte. Tente palavras como anime, geek, utilitarios, decoracao, escritorio ou personalizados.",
      human: true
    };
  }

  const lead = matches[0];

  return {
    role: "bot",
    text: `Encontrei ${matches.length} opcao(oes) parecidas com "${clean}". A melhor agora e ${lead.name}, a partir de ${formatCurrency(lead.pricePix)} via Pix.`,
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
        <div className="h-16 w-16 overflow-hidden rounded-2xl border border-white/10">
          <SafeProductImage product={product} alt={product.name} className="h-full w-full object-cover" sizes="64px" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] uppercase tracking-[0.18em] text-cyan-200/80">{product.category}</p>
          <p className="mt-1 text-sm font-semibold text-white">{product.name}</p>
          <p className="mt-1 text-xs text-white/55">{product.productionWindow}</p>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-3">
        <span className="text-sm font-bold text-cyan-100">{formatCurrency(product.pricePix)}</span>
        <Link
          href={getProductUrl(product)}
          className="rounded-full border border-cyan-400/25 bg-cyan-400/10 px-3 py-1.5 text-xs font-semibold text-cyan-100"
        >
          Abrir item
        </Link>
      </div>
    </div>
  );
}

export function SiteAssistant() {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: makeId(),
      role: "bot",
      text: "Sou o assistente da MDH 3D. Posso sugerir produtos, falar de frete no RJ e te levar para atendimento humano quando fizer sentido."
    }
  ]);

  const whatsappHref = useMemo(
    () => `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`,
    []
  );

  function sendMessage(prefill?: string) {
    const raw = (prefill ?? value).trim();
    if (!raw) return;

    const userMessage: ChatMessage = { id: makeId(), role: "user", text: raw };
    const reply: ChatMessage = { id: makeId(), ...botReply(raw) };

    setMessages((current) => [...current, userMessage, reply]);
    setValue("");
    setOpen(true);
  }

  return (
    <>
      {open ? (
        <div className="fixed bottom-24 left-4 z-50 w-[390px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-[28px] border border-white/10 bg-slate-950/96 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <div className="flex items-center gap-3">
              <span className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-2 text-cyan-100">
                <Bot className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-semibold text-white">Assistente MDH 3D</p>
                <p className="text-xs text-white/50">Catalogo, frete e apoio comercial</p>
              </div>
            </div>

            <button onClick={() => setOpen(false)} className="rounded-full border border-white/10 p-2 text-white/70">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="max-h-[60vh] space-y-4 overflow-y-auto px-4 py-4">
            {messages.map((message) => (
              <div key={message.id} className={`rounded-[22px] border p-3 ${message.role === "bot" ? "border-white/10 bg-white/5" : "border-cyan-400/20 bg-cyan-400/10"}`}>
                <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-white/45">
                  {message.role === "user" ? <UserRound className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
                  <span>{message.role === "user" ? "Voce" : "MDH"}</span>
                </div>
                <p className="text-sm leading-7 text-white/80">{message.text}</p>

                {message.suggestions?.length ? (
                  <div className="mt-3 space-y-3">
                    {message.suggestions.map((product) => (
                      <ProductSuggestion key={product.id} product={product} />
                    ))}
                  </div>
                ) : null}

                {message.human ? (
                  <a
                    href={whatsappHref}
                    className="mt-3 inline-flex rounded-full border border-emerald-300/30 bg-emerald-400/10 px-4 py-2 text-sm font-semibold text-emerald-100"
                  >
                    Falar com atendimento humano
                  </a>
                ) : null}
              </div>
            ))}
          </div>

          <div className="border-t border-white/10 p-4">
            <div className="mb-3 flex flex-wrap gap-2">
              {quickPrompts.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => sendMessage(prompt)}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/75"
                >
                  {prompt}
                </button>
              ))}
            </div>

            <div className="flex items-end gap-2">
              <textarea
                value={value}
                onChange={(event) => setValue(event.target.value)}
                placeholder="Ex.: quero um suporte geek preto"
                rows={2}
                className="min-h-[52px] flex-1 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none"
              />
              <button
                onClick={() => sendMessage()}
                className="inline-flex h-[52px] w-[52px] items-center justify-center rounded-2xl bg-cyan-400 text-slate-950"
                aria-label="Enviar mensagem"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-24 left-4 z-40 inline-flex items-center gap-3 rounded-full border border-white/10 bg-slate-950/90 px-4 py-3 text-sm font-semibold text-white shadow-xl backdrop-blur"
      >
        <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 p-2 text-cyan-100">
          <MessageCircleMore className="h-4 w-4" />
        </span>
        Assistente da loja
      </button>
    </>
  );
}
