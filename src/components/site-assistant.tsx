"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { Bot, MessageCircleMore, Minimize2, Send, UserRound, X, Sparkles } from "lucide-react";
import { ProductImage } from "@/components/product-image";
import { catalog, getProductUrl, type Product } from "@/lib/catalog";
import { getPrimaryProductImage } from "@/lib/product-media";
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
  "boa noite",
  "quero um hello kitty",
  "quero suporte de controle",
  "quero pagar no pix",
  "quero pagar no cartao",
  "calcular frete",
  "falar com humano"
];

function normalize(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim();
}

function scoreProduct(product: Product, query: string) {
  const q = normalize(query);
  const haystack = normalize([product.name, product.theme, product.category, product.description, product.collection, ...product.tags].join(" "));

  let score = 0;
  if (normalize(product.name).includes(q)) score += 9;
  if (normalize(product.theme).includes(q)) score += 7;
  if (normalize(product.category).includes(q)) score += 4;
  q.split(/\s+/).forEach((token) => {
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

function greetingFor(text: string) {
  const lower = normalize(text);
  if (lower.includes("boa noite")) return "Boa noite. Fico à disposição para te ajudar com orçamento, frete e escolha do modelo.";
  if (lower.includes("bom dia")) return "Bom dia. Posso te mostrar peças, preços e frete local no Rio.";
  if (lower.includes("boa tarde")) return "Boa tarde. Me diga o que você quer imprimir e eu separo opções parecidas.";
  if (lower in {"oi":1, "ola":1, "olá":1, "e ai":1, "eai":1}) return "Olá. Seja bem-vindo à MDH 3D. O que você quer imprimir hoje?";
  return null;
}

function thanksFor(text: string) {
  const lower = normalize(text);
  if (["obrigado", "obrigada", "valeu", "tmj"].some((term) => lower.includes(term))) {
    return "Eu que agradeço. Se quiser, continuo com catálogo, frete ou encaminho você para atendimento humano.";
  }
  return null;
}

function botReply(input: string): Omit<ChatMessage, "id"> {
  const clean = input.trim();
  const lower = normalize(clean);

  if (!clean) {
    return {
      role: "bot",
      text: "Me diga o que você quer imprimir. Ex.: hello kitty, vaso, suporte de controle, chaveiro ou organizador."
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
      text: "O Instagram oficial da loja é @mdh___021. Se quiser, também posso te mostrar produtos aqui no site.",
    };
  }

  if (lower.includes("frete") || lower.includes("cep") || lower.includes("entrega")) {
    return {
      role: "bot",
      text: "Para frete no RJ, use a página de Frete com seu CEP. Se preferir, me mande a distância em km que eu te passo uma estimativa rápida."
    };
  }

  if (lower.includes("preco") || lower.includes("valor") || lower.includes("orcamento") || lower.includes("orçamento")) {
    return {
      role: "bot",
      text: "Posso te mostrar opções parecidas com o que você quer e os valores iniciais via Pix. Se a peça for personalizada, depois eu te direciono para um humano."
    };
  }

  if (lower.includes("pix")) {
    return {
      role: "bot",
      text: "Perfeito. No produto voce encontra Pix com QR Code e copia e cola para fechar rapido. Se preferir, eu te passo para um humano validar agora."
    };
  }

  if (lower.includes("cartao") || lower.includes("credito") || lower.includes("crédito")) {
    return {
      role: "bot",
      text: "Voce pode tentar cartao no checkout do produto. Se o provedor estiver indisponivel, o atendimento humano fecha sem perder seu pedido.",
      human: true
    };
  }

  const matches = pickProducts(lower);

  if (!matches.length) {
    return {
      role: "bot",
      text: "Ainda não achei um item muito próximo. Tente descrever com palavras como anime, hello kitty, suporte, vaso, presente, organizador, escritório ou personalizados. Se preferir, eu passo para atendimento humano.",
      human: true
    };
  }

  const lead = matches[0];
  return {
    role: "bot",
    text: `Encontrei ${matches.length} opção(ões) parecidas com "${clean}". A melhor correspondência agora é ${lead.name}, a partir de ${formatCurrency(lead.pricePix)} via Pix.`,
    suggestions: matches
  };
}

function makeId() {
  return Math.random().toString(36).slice(2, 10);
}

function ProductSuggestion({ product }: { product: Product }) {
  const image = getPrimaryProductImage(product);

  return (
    <div className="rounded-2xl border border-white/10 bg-black/25 p-3">
      <div className="flex gap-3">
        <ProductImage
          src={image.src}
          fallbackSrcs={image.fallbackSrcs}
          alt={image.alt}
          sizes="64px"
          containerClassName="h-16 w-16 rounded-2xl"
        />
        <div className="min-w-0 flex-1">
          <p className="text-[11px] uppercase tracking-[0.18em] text-cyan-200/80">{product.category}</p>
          <p className="mt-1 text-sm font-semibold text-white">{product.name}</p>
          <p className="mt-1 text-xs text-white/55">{product.productionWindow} • {product.material}</p>
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
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [value, setValue] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: makeId(),
      role: "bot",
      text: "Olá. Sou o assistente da MDH 3D. Posso te mostrar produtos parecidos, valores iniciais, frete e também te direcionar para atendimento humano quando você quiser."
    }
  ]);
  const lastInteractionRef = useRef(Date.now());
  const lastScrollYRef = useRef(0);
  const compactRoute = pathname ? ["/checkout", "/login", "/conta", "/painel-mdh-85"].some((route) => pathname.startsWith(route)) : false;
  const unreadCount = Math.max(messages.length - 1, 0);

  const waHref = useMemo(() => {
    return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;
  }, []);

  function markInteraction(expand = true) {
    lastInteractionRef.current = Date.now();
    if (expand) {
      setCollapsed(false);
    }
  }

  useEffect(() => {
    if (!open) return;
    if (compactRoute) {
      setCollapsed(true);
    }
  }, [compactRoute, open]);

  useEffect(() => {
    if (!open) return;

    const idleTimer = window.setInterval(() => {
      if (Date.now() - lastInteractionRef.current > 16_000) {
        setCollapsed(true);
      }
    }, 2_000);

    return () => {
      window.clearInterval(idleTimer);
    };
  }, [open]);

  useEffect(() => {
    const onScroll = () => {
      const currentY = window.scrollY;
      const delta = currentY - lastScrollYRef.current;

      if (currentY > 220 && delta > 20) {
        setCollapsed(true);
      }

      if (delta < -28) {
        setCollapsed(false);
      }

      lastScrollYRef.current = currentY;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onBlur = () => setCollapsed(true);
    window.addEventListener("blur", onBlur);
    return () => window.removeEventListener("blur", onBlur);
  }, []);

  function sendMessage(prefill?: string) {
    const raw = (prefill ?? value).trim();
    if (!raw) return;

    markInteraction();
    const userMessage: ChatMessage = { id: makeId(), role: "user", text: raw };
    const reply: ChatMessage = { id: makeId(), ...botReply(raw) };

    setMessages((current) => [...current, userMessage, reply]);
    setValue("");
    setOpen(true);
    setCollapsed(false);
  }

  return (
    <>
      {open && !collapsed ? (
        <div
          className="fixed bottom-24 left-4 z-50 w-[380px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-[28px] border border-white/10 bg-slate-950/94 shadow-2xl backdrop-blur-xl"
          onMouseMove={() => markInteraction(false)}
        >
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <div className="flex items-center gap-3">
              <span className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-2 text-cyan-100">
                <Bot className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-semibold text-white">Assistente MDH 3D</p>
                <p className="text-xs text-white/50">Catálogo + frete + humano sob demanda</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setCollapsed(true)} className="rounded-full border border-white/10 p-2 text-white/70 hover:text-white" aria-label="Recolher assistente">
                <Minimize2 className="h-4 w-4" />
              </button>
              <button onClick={() => setOpen(false)} className="rounded-full border border-white/10 p-2 text-white/70 hover:text-white" aria-label="Fechar assistente">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="max-h-[60vh] space-y-4 overflow-y-auto px-4 py-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[92%] rounded-3xl px-4 py-3 ${message.role === "user" ? "bg-cyan-400 text-slate-950" : "border border-white/10 bg-white/5 text-white"}`}>
                  <div className="mb-2 flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] opacity-70">
                    {message.role === "user" ? <UserRound className="h-3.5 w-3.5" /> : <Sparkles className="h-3.5 w-3.5" />}
                    <span>{message.role === "user" ? "Você" : "MDH"}</span>
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
                      <a href={waHref} className="inline-flex rounded-full border border-emerald-400/25 bg-emerald-400/10 px-4 py-2 text-xs font-semibold text-emerald-100">
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
                onFocus={() => markInteraction(false)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") sendMessage();
                }}
                placeholder="Ex.: quero um hello kitty preto"
                className="flex-1 rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none"
              />
              <button onClick={() => sendMessage()} className="rounded-2xl bg-cyan-400 px-4 text-slate-950">
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {open && collapsed ? (
        <button
          onClick={() => {
            setCollapsed(false);
            markInteraction(false);
          }}
          className="fixed bottom-24 left-4 z-50 inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/15 px-4 py-3 text-sm font-semibold text-cyan-100 shadow-glow backdrop-blur hover:bg-cyan-400/20"
        >
          <MessageCircleMore className="h-4 w-4" />
          Reabrir assistente
          {unreadCount ? <span className="rounded-full bg-cyan-300 px-2 py-0.5 text-[11px] font-bold text-slate-950">{unreadCount}</span> : null}
        </button>
      ) : null}

      <button
        onClick={() => {
          setOpen((current) => {
            const next = !current;
            if (next) {
              setCollapsed(compactRoute);
              markInteraction(false);
            }
            return next;
          });
        }}
        className="fixed bottom-24 left-4 z-50 inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/15 px-5 py-3 text-sm font-semibold text-cyan-100 shadow-glow backdrop-blur hover:bg-cyan-400/20"
        style={{ display: open ? "none" : undefined }}
      >
        <MessageCircleMore className="h-5 w-5" />
        {compactRoute ? "Assistente" : "Assistente MDH"}
      </button>
    </>
  );
}
