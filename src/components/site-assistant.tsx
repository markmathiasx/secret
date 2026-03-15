"use client";

import Link from "next/link";
import { useDeferredValue, useMemo, useState } from "react";
import { BotMessageSquare, Search, X } from "lucide-react";
import { catalog, featuredCatalog, getProductUrl } from "@/lib/catalog";
import { whatsappMessage, whatsappNumber } from "@/lib/constants";
import { SafeProductImage } from "@/components/safe-product-image";
import { formatCurrency } from "@/lib/utils";
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours

const assistantCatalog = catalog.slice(0, 160);
const quickFilters = ["anime", "geek", "setup", "decoracao", "personalizado", "utilidades"];
=======
=======
import { SafeProductImage } from "@/components/safe-product-image";
>>>>>>> theirs
=======
import { SafeProductImage } from "@/components/safe-product-image";
>>>>>>> theirs
=======
import { SafeProductImage } from "@/components/safe-product-image";
>>>>>>> theirs
=======
import { SafeProductImage } from "@/components/safe-product-image";
>>>>>>> theirs
import { socialLinks, whatsappMessage, whatsappNumber } from "@/lib/constants";
import { ProductImage } from "@/components/product-image";

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
      text: "Posso te mostrar opções parecidas com o que você quer e os preços base via Pix. Se a peça for personalizada, depois eu te direciono para um humano."
    };
  }

  const matches = pickProducts(lower);

  if (!matches.length) {
    return {
      role: "bot",
      text: "Ainda não achei um item muito próximo. Tente descrever com palavras como anime, hello kitty, suporte, vaso, chaveiro, organizador, oficina ou decoração. Se preferir, eu passo para atendimento humano.",
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
  return (
    <div className="rounded-2xl border border-white/10 bg-black/25 p-3">
      <div className="flex gap-3">
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
        <div className="relative h-16 w-16 overflow-hidden rounded-2xl"><ProductImage src={`/catalog-assets/${product.id}.webp`} alt={product.name} label={product.category} sizes="64px" /></div>
=======
        <SafeProductImage product={product} alt={product.name} className="h-16 w-16 rounded-2xl object-cover" />
>>>>>>> theirs
=======
        <SafeProductImage product={product} alt={product.name} className="h-16 w-16 rounded-2xl object-cover" />
>>>>>>> theirs
=======
        <SafeProductImage product={product} alt={product.name} className="h-16 w-16 rounded-2xl object-cover" />
>>>>>>> theirs
=======
        <SafeProductImage product={product} alt={product.name} className="h-16 w-16 rounded-2xl object-cover" />
>>>>>>> theirs
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
>>>>>>> theirs

export function SiteAssistant() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query.trim().toLowerCase());
  const whatsappHref = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

  const suggestions = useMemo(() => {
    if (!deferredQuery) return featuredCatalog.slice(0, 4);

    return assistantCatalog
      .filter((product) =>
        [product.name, product.category, product.theme, product.collection, ...product.tags]
          .join(" ")
          .toLowerCase()
          .includes(deferredQuery)
      )
      .slice(0, 4);
  }, [deferredQuery]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-24 left-5 z-50 inline-flex items-center gap-2 rounded-full border border-cyan-300/25 bg-[#07101f]/90 px-5 py-3 text-sm font-semibold text-cyan-100 shadow-glow backdrop-blur"
      >
        <BotMessageSquare className="h-4 w-4" />
        Assistente MDH
      </button>

      {open ? (
        <aside className="fixed inset-x-4 bottom-4 z-[60] mx-auto w-full max-w-[420px] rounded-[30px] border border-white/10 bg-[#040816]/95 p-5 shadow-2xl backdrop-blur">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-cyan-100/75">Concierge</p>
              <h2 className="mt-2 text-2xl font-black text-white">Encontre algo sem sair da pagina</h2>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-full border border-white/10 bg-white/5 p-2 text-white/70"
              aria-label="Fechar assistente"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <label className="relative mt-5 block">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Ex: hello kitty, suporte ps5, vaso"
              className="w-full rounded-2xl border border-white/10 bg-black/20 px-11 py-3 text-white outline-none placeholder:text-white/30"
            />
          </label>

          <div className="mt-4 flex flex-wrap gap-2">
            {quickFilters.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setQuery(item)}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-white/70"
              >
                {item}
              </button>
            ))}
          </div>

          <div className="mt-5 space-y-3">
            {suggestions.map((product) => (
              <Link
                key={product.id}
                href={getProductUrl(product)}
                onClick={() => setOpen(false)}
                className="flex gap-4 rounded-[24px] border border-white/10 bg-white/5 p-3 transition hover:border-cyan-300/30"
              >
                <div className="relative h-20 w-20 overflow-hidden rounded-[18px] bg-black/20">
                  <SafeProductImage
                    product={product}
                    alt={product.name}
                    className="h-full w-full object-cover"
                    sizes="80px"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs uppercase tracking-[0.18em] text-white/45">{product.category}</p>
                  <p className="mt-1 truncate text-base font-semibold text-white">{product.name}</p>
                  <p className="mt-1 text-sm text-white/60">{product.productionWindow}</p>
                  <p className="mt-2 text-sm font-semibold text-cyan-100">{formatCurrency(product.pricePix)}</p>
                </div>
              </Link>
            ))}
          </div>

          <a
            href={whatsappHref}
            target="_blank"
            rel="noreferrer"
            className="mt-5 inline-flex w-full items-center justify-center rounded-full border border-emerald-300/30 bg-emerald-300/10 px-5 py-3 text-sm font-semibold text-emerald-100"
          >
            Falar com atendimento humano
          </a>
        </aside>
      ) : null}
    </>
  );
}
