"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from "react";
import Link from "next/link";
import {
  Bot,
  ClipboardList,
  CreditCard,
  Headphones,
  LoaderCircle,
  MessageCircleMore,
  PackageSearch,
  RefreshCcw,
  Search,
  SendHorizonal,
  ShieldCheck,
  Sparkles,
  Truck,
} from "lucide-react";
import { SupportProductSuggestions } from "@/components/support/SupportProductSuggestions";
import { SupportHumanHandoff } from "@/components/support/SupportHumanHandoff";
import { SupportQuickActions } from "@/components/support/SupportQuickActions";
import { trackCommerceEvent } from "@/lib/analytics/events";
import type { SupportPriceRange, SupportProduct } from "@/lib/support/support-types";

type ChatRole = "assistant" | "user";

type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  products?: SupportProduct[];
  whatsappUrl?: string;
};

type SupportApiResponse = {
  ok: boolean;
  reply?: string;
  products?: SupportProduct[];
  suggestions?: string[];
  handoff?: boolean;
  whatsappUrl?: string;
  error?: string;
};

type ProductSearchResponse = {
  ok: boolean;
  products?: SupportProduct[];
  priceRange?: SupportPriceRange;
  error?: string;
};

const tabs = [
  { id: "chat", label: "Chat ao vivo", icon: Headphones },
  { id: "produtos", label: "Produtos", icon: Search },
  { id: "pedido", label: "Pedido/Rastreio", icon: PackageSearch },
  { id: "trocas", label: "Trocas", icon: RefreshCcw },
  { id: "orcamento", label: "Orçamento", icon: ClipboardList },
  { id: "faq", label: "FAQ", icon: ShieldCheck },
] as const;

type SupportTab = (typeof tabs)[number]["id"];

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function createSessionId() {
  const random = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
  return `support-${random.replace(/[^a-z0-9]+/gi, "").slice(0, 32)}`;
}

export function MDHSupportChat({
  initialProducts,
  whatsappNumber,
  supportEmail,
  productCount,
}: {
  initialProducts: SupportProduct[];
  whatsappNumber: string;
  supportEmail: string;
  productCount: number;
}) {
  const [activeTab, setActiveTab] = useState<SupportTab>("chat");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: `Sou o assistente da MDH 3D com acesso ao catálogo atual (${productCount} produtos). Posso indicar produtos reais, preço Pix/cartão, prazo, material, orçamento, rastreio, trocas e atendimento humano.`,
      products: initialProducts.slice(0, 4),
    },
  ]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [sessionId, setSessionId] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchProducts, setSearchProducts] = useState<SupportProduct[]>(initialProducts);
  const [searchRange, setSearchRange] = useState<SupportPriceRange | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState("");
  const endRef = useRef<HTMLDivElement | null>(null);

  const lastProducts = useMemo(() => {
    return [...messages].reverse().find((message) => message.products?.length)?.products || initialProducts;
  }, [initialProducts, messages]);

  useEffect(() => {
    const key = "mdh_support_session_id";
    const existing = window.localStorage.getItem(key);
    if (existing) {
      setSessionId(existing);
      return;
    }
    const next = createSessionId();
    window.localStorage.setItem(key, next);
    setSessionId(next);
    trackCommerceEvent("support_chat_started", { source: "atendimento" });
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, isSending]);

  async function sendMessage(message: string) {
    const trimmed = message.trim();
    if (!trimmed || isSending) return;

    setActiveTab("chat");
    setError("");
    setInput("");
    setMessages((current) => [...current, { id: `user-${Date.now()}`, role: "user", content: trimmed }]);
    setIsSending(true);
    trackCommerceEvent("support_message_sent", {
      source: "atendimento",
      length: trimmed.length,
      custom_quote: /or[cç]amento|personalizado|sob medida/i.test(trimmed),
    });
    if (/or[cç]amento|personalizado|sob medida/i.test(trimmed)) {
      trackCommerceEvent("custom_quote_started", { source: "support_chat" });
    }

    try {
      const response = await fetch("/api/support/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({
          message: trimmed,
          sessionId,
          sourcePage: typeof window !== "undefined" ? window.location.pathname : "/atendimento",
        }),
      });
      const data = (await response.json().catch(() => ({}))) as SupportApiResponse;
      if (!response.ok || !data.ok || !data.reply) {
        throw new Error(data.error || "Falha no atendimento.");
      }

      setMessages((current) => [
        ...current,
        {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: data.reply || "Posso continuar ajudando.",
          products: data.products || [],
          whatsappUrl: data.whatsappUrl,
        },
      ]);
      if (data.products?.length) {
        setSearchProducts(data.products);
        trackCommerceEvent("support_product_suggested", {
          source: "atendimento",
          count: data.products.length,
        });
      }
    } catch {
      setError("Não consegui responder agora. Use o WhatsApp ou tente novamente.");
      setMessages((current) => [
        ...current,
        {
          id: `assistant-fallback-${Date.now()}`,
          role: "assistant",
          content: `Não consegui consultar o atendimento agora. Você pode chamar a equipe pelo WhatsApp: https://wa.me/${whatsappNumber}`,
        },
      ]);
    } finally {
      setIsSending(false);
    }
  }

  async function searchCatalog(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;

    setSearchLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/support/search-products?query=${encodeURIComponent(query)}&limit=8`, {
        cache: "no-store",
      });
      const data = (await response.json().catch(() => ({}))) as ProductSearchResponse;
      if (!response.ok || !data.ok) {
        throw new Error(data.error || "Falha na busca.");
      }
      setSearchProducts(data.products || []);
      setSearchRange(data.priceRange || null);
    } catch {
      setError("Busca indisponível agora. Tente pelo chat ou WhatsApp.");
    } finally {
      setSearchLoading(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void sendMessage(input);
  }

  return (
    <section className="overflow-hidden rounded-[8px] border border-white/10 bg-white/[0.045] shadow-[0_28px_90px_rgba(0,0,0,0.28)]">
      <div className="border-b border-white/10 p-3">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex min-h-10 shrink-0 items-center gap-2 rounded-[8px] border px-3 text-sm font-semibold transition ${
                  activeTab === tab.id
                    ? "border-cyan-300/35 bg-cyan-300/12 text-cyan-50"
                    : "border-white/10 bg-black/20 text-white/65 hover:border-white/20 hover:text-white"
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {activeTab === "chat" ? (
        <div className="grid min-h-[720px] lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="flex min-h-0 flex-col border-b border-white/10 lg:border-b-0 lg:border-r">
            <div className="border-b border-white/10 p-4">
              <div className="flex items-center gap-3">
                <span className="rounded-[8px] border border-cyan-300/25 bg-cyan-300/10 p-3 text-cyan-100">
                  <Bot className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="text-lg font-bold text-white">Assistente de catálogo e atendimento</h2>
                  <p className="text-sm text-white/55">Produtos reais, Pix, cartão, prazo, orçamento, rastreio e humano.</p>
                </div>
              </div>
            </div>

            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[92%] rounded-[8px] border px-4 py-3 text-sm leading-7 ${
                    message.role === "user"
                      ? "border-cyan-300/25 bg-cyan-300/12 text-cyan-50"
                      : "border-white/10 bg-black/25 text-white/78"
                  }`}>
                    <p className="whitespace-pre-wrap">{message.content}</p>
                    {message.whatsappUrl ? (
                      <div className="mt-3">
                        <SupportHumanHandoff whatsappUrl={message.whatsappUrl} label="Abrir WhatsApp" />
                      </div>
                    ) : null}
                    <div className="mt-3">
                      <SupportProductSuggestions products={message.products || []} whatsappNumber={whatsappNumber} />
                    </div>
                  </div>
                </div>
              ))}

              {isSending ? (
                <div className="inline-flex items-center gap-2 rounded-[8px] border border-white/10 bg-white/[0.06] px-4 py-3 text-sm text-white/65">
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                  Consultando catálogo e regras da loja...
                </div>
              ) : null}
              <div ref={endRef} />
            </div>

            <div className="border-t border-white/10 bg-black/20 p-4">
              <div className="mb-3">
                <SupportQuickActions onSelect={(message) => void sendMessage(message)} disabled={isSending} />
              </div>
              <form onSubmit={handleSubmit} className="flex gap-2">
                <input
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  placeholder="Digite: chaveiro, presente barato, setup, cartão, rastreio..."
                  className="min-h-12 flex-1 rounded-[8px] border border-white/10 bg-white/[0.06] px-4 text-sm text-white outline-none placeholder:text-white/35 focus:border-cyan-300/35"
                  maxLength={1000}
                />
                <button type="submit" disabled={isSending || !input.trim()} className="inline-flex min-h-12 items-center justify-center rounded-[8px] border border-cyan-300/25 bg-cyan-300/12 px-4 text-cyan-50 transition hover:bg-cyan-300/18 disabled:cursor-not-allowed disabled:opacity-50">
                  <SendHorizonal className="h-4 w-4" />
                </button>
              </form>
              {error ? <p className="mt-2 text-xs text-amber-200">{error}</p> : null}
            </div>
          </div>

          <aside className="space-y-4 bg-black/18 p-4">
            <div className="rounded-[8px] border border-white/10 bg-white/[0.045] p-4">
              <div className="flex items-center gap-2 text-emerald-100">
                <CreditCard className="h-4 w-4" />
                <p className="text-sm font-bold">Regra de pagamento</p>
              </div>
              <p className="mt-2 text-sm leading-6 text-white/68">Pix é o valor principal. Cartão é sempre Pix + R$ 1,00 por item.</p>
            </div>
            <div className="rounded-[8px] border border-white/10 bg-white/[0.045] p-4">
              <div className="flex items-center gap-2 text-cyan-100">
                <Sparkles className="h-4 w-4" />
                <p className="text-sm font-bold">Últimas sugestões</p>
              </div>
              <div className="mt-3">
                <SupportProductSuggestions products={lastProducts.slice(0, 4)} whatsappNumber={whatsappNumber} />
              </div>
            </div>
            <a
              href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent("Oi! Quero atendimento humano na MDH 3D.")}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex w-full items-center justify-center gap-2 rounded-[8px] border border-emerald-300/25 bg-emerald-300/12 px-4 py-3 text-sm font-bold text-emerald-50 transition hover:bg-emerald-300/18"
            >
              <MessageCircleMore className="h-4 w-4" />
              Falar com humano
            </a>
          </aside>
        </div>
      ) : null}

      {activeTab === "produtos" ? (
        <div className="grid gap-5 p-5 lg:grid-cols-[360px_minmax(0,1fr)]">
          <div className="rounded-[8px] border border-white/10 bg-black/20 p-4">
            <h2 className="text-lg font-bold text-white">Busca no catálogo</h2>
            <p className="mt-2 text-sm leading-6 text-white/60">Pesquise por uso, categoria, material, faixa de preço ou intenção de compra.</p>
            <form onSubmit={searchCatalog} className="mt-4 flex gap-2">
              <input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Ex.: chaveiro, geek, setup"
                className="min-h-11 flex-1 rounded-[8px] border border-white/10 bg-white/[0.06] px-3 text-sm text-white outline-none placeholder:text-white/35"
              />
              <button type="submit" className="inline-flex min-h-11 items-center justify-center rounded-[8px] border border-cyan-300/25 bg-cyan-300/12 px-3 text-cyan-50">
                {searchLoading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              </button>
            </form>
            {searchRange ? (
              <p className="mt-3 text-sm text-white/65">Faixa encontrada: {formatCurrency(searchRange.min)} a {formatCurrency(searchRange.max)} no Pix.</p>
            ) : null}
          </div>
          <SupportProductSuggestions products={searchProducts} whatsappNumber={whatsappNumber} />
        </div>
      ) : null}

      {activeTab === "pedido" ? (
        <SupportInfoPanel
          icon={<Truck className="h-5 w-5" />}
          title="Pedido e rastreio"
          text="Informe número do pedido, e-mail usado na compra ou código de rastreio. A equipe confere produção, pagamento, envio e próxima etapa sem pedir dados sensíveis no chat."
          cta={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent("Quero consultar status ou rastreio do meu pedido MDH 3D.")}`}
        />
      ) : null}

      {activeTab === "trocas" ? (
        <SupportInfoPanel
          icon={<RefreshCcw className="h-5 w-5" />}
          title="Trocas e devoluções"
          text="Para abrir análise, envie número do pedido, produto, motivo e fotos quando houver avaria. Produtos personalizados passam por validação humana antes da solução."
          cta={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent("Quero suporte para troca ou devolução na MDH 3D.")}`}
        />
      ) : null}

      {activeTab === "orcamento" ? (
        <SupportInfoPanel
          icon={<ClipboardList className="h-5 w-5" />}
          title="Orçamento personalizado"
          text="Envie medidas, uso da peça, cor, material desejado, prazo, quantidade e referência/foto/STL/OBJ/3MF. O assistente pode montar a mensagem inicial para a equipe."
          cta={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent("Quero orçamento personalizado. Uso da peça: Medidas: Cor/material: Prazo: Quantidade: Tenho referência/foto/STL para enviar.")}`}
        />
      ) : null}

      {activeTab === "faq" ? (
        <div className="grid gap-4 p-5 md:grid-cols-2">
          {[
            ["Como funciona o pagamento?", "Pix é o valor principal do catálogo; cartão fica Pix + R$ 1,00 por item."],
            ["Quais materiais vocês usam?", "PLA Premium, PLA Silk, PETG e resina, conforme uso, resistência e acabamento."],
            ["Vocês fazem sob medida?", "Sim. Envie medidas, uso, quantidade, prazo e referência/foto/STL."],
            ["Como falo com humano?", `Use o WhatsApp oficial +${whatsappNumber} ou o e-mail ${supportEmail}.`],
          ].map(([question, answer]) => (
            <article key={question} className="rounded-[8px] border border-white/10 bg-black/20 p-4">
              <h3 className="text-base font-bold text-white">{question}</h3>
              <p className="mt-2 text-sm leading-6 text-white/65">{answer}</p>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
}

function SupportInfoPanel({
  icon,
  title,
  text,
  cta,
}: {
  icon: ReactNode;
  title: string;
  text: string;
  cta: string;
}) {
  return (
    <div className="grid gap-5 p-5 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="rounded-[8px] border border-white/10 bg-black/20 p-6">
        <div className="flex items-center gap-3 text-cyan-100">
          <span className="rounded-[8px] border border-cyan-300/25 bg-cyan-300/10 p-3">{icon}</span>
          <h2 className="text-xl font-bold text-white">{title}</h2>
        </div>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-white/68">{text}</p>
      </div>
      <div className="rounded-[8px] border border-emerald-300/20 bg-emerald-300/10 p-5">
        <p className="text-sm font-bold text-emerald-50">Atendimento humano</p>
        <p className="mt-2 text-sm leading-6 text-white/65">Continue com a equipe pelo WhatsApp oficial.</p>
        <a href={cta} target="_blank" rel="noreferrer" className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-[8px] border border-emerald-300/25 bg-emerald-300/12 px-4 py-3 text-sm font-bold text-emerald-50">
          <MessageCircleMore className="h-4 w-4" />
          Abrir WhatsApp
        </a>
        <Link href="/catalogo" className="mt-3 inline-flex w-full items-center justify-center rounded-[8px] border border-white/10 bg-white/[0.06] px-4 py-3 text-sm font-bold text-white/75">
          Ver catálogo
        </Link>
      </div>
    </div>
  );
}
