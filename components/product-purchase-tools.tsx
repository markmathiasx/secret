"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Check, Copy, Minus, Plus, Share2, Sparkles } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

const PURCHASE_MEMORY_PREFIX = "mdh:product-config:";
const GOAL_OPTIONS = ["Uso próprio", "Presente", "Lote", "Revenda"] as const;
type PurchaseGoal = (typeof GOAL_OPTIONS)[number];

export function ProductPurchaseTools({
  productId,
  productName,
  sku,
  pricePix,
  priceCard,
  customizable,
  whatsappHref,
  customizationHref,
}: {
  productId: string;
  productName: string;
  sku: string;
  pricePix: number;
  priceCard: number;
  customizable: boolean;
  whatsappHref: string;
  customizationHref: string;
}) {
  const [quantity, setQuantity] = useState(1);
  const [goal, setGoal] = useState<PurchaseGoal>("Uso próprio");
  const [copied, setCopied] = useState<"idle" | "sku" | "link">("idle");
  const [memoryReady, setMemoryReady] = useState(false);
  const totalPix = useMemo(() => pricePix * quantity, [pricePix, quantity]);
  const totalCard = useMemo(() => priceCard * quantity, [priceCard, quantity]);
  const quickQuantities = [1, 2, 5, 10];
  const checkoutHref = useMemo(
    () => `/checkout?product=${productId}&qty=${quantity}&purpose=${encodeURIComponent(goal)}`,
    [goal, productId, quantity]
  );
  const contextualWhatsappHref = useMemo(() => {
    try {
      const url = new URL(whatsappHref);
      const current = url.searchParams.get("text") || "";
      const nextMessage = `${current}\nQuantidade desejada: ${quantity}\nObjetivo: ${goal}.`.trim();
      url.searchParams.set("text", nextMessage);
      return url.toString();
    } catch {
      return whatsappHref;
    }
  }, [goal, quantity, whatsappHref]);
  const goalNote = useMemo(() => {
    if (goal === "Presente") return "Boa rota para quem quer validar acabamento, prazo e apresentação antes de fechar.";
    if (goal === "Lote") return "Vale subir quantidade e seguir no WhatsApp para condição comercial e repetição do pedido.";
    if (goal === "Revenda") return "Ajuda a olhar ticket, margem e constância do item antes de ampliar compra.";
    return "Fluxo enxuto para quem já quer sair do produto direto para o checkout.";
  }, [goal]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(`${PURCHASE_MEMORY_PREFIX}${productId}`);
      if (raw) {
        const parsed = JSON.parse(raw) as { quantity?: number; goal?: PurchaseGoal };
        if (Number.isFinite(parsed.quantity) && parsed.quantity && parsed.quantity >= 1 && parsed.quantity <= 20) {
          setQuantity(parsed.quantity);
        }
        if (parsed.goal && GOAL_OPTIONS.includes(parsed.goal)) {
          setGoal(parsed.goal);
        }
      }
    } catch {}
    setMemoryReady(true);
  }, [productId]);

  useEffect(() => {
    if (typeof window === "undefined" || !memoryReady) return;
    window.localStorage.setItem(
      `${PURCHASE_MEMORY_PREFIX}${productId}`,
      JSON.stringify({ quantity, goal })
    );
  }, [goal, memoryReady, productId, quantity]);

  async function copySku() {
    try {
      await navigator.clipboard.writeText(sku);
      setCopied("sku");
      window.setTimeout(() => setCopied("idle"), 1800);
    } catch {
      setCopied("idle");
    }
  }

  async function sharePage() {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: productName, text: `${productName} • ${sku}`, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied("link");
      window.setTimeout(() => setCopied("idle"), 1800);
    } catch {
      setCopied("idle");
    }
  }

  return (
    <div className="rounded-[24px] border border-cyan-300/20 bg-cyan-300/8 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-cyan-100/75">Ferramenta de compra</p>
          <h3 className="mt-2 text-xl font-black text-white">Simule a quantidade antes de fechar.</h3>
        </div>
        <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-white/65">
          SKU {sku}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {quickQuantities.map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setQuantity(value)}
            className={`rounded-full border px-3 py-2 text-sm font-semibold transition ${
              quantity === value
                ? "border-cyan-300/35 bg-cyan-300/12 text-cyan-50"
                : "border-white/10 bg-white/5 text-white/75"
            }`}
          >
            {value} un.
          </button>
        ))}
      </div>

      <div className="mt-4">
        <p className="text-xs uppercase tracking-[0.16em] text-white/45">Objetivo desta compra</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {GOAL_OPTIONS.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setGoal(item)}
              className={`rounded-full border px-3 py-2 text-sm font-semibold transition ${
                goal === item
                  ? "border-cyan-300/35 bg-cyan-300/12 text-cyan-50"
                  : "border-white/10 bg-white/5 text-white/75"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <button
          type="button"
          onClick={() => setQuantity((current) => Math.max(1, current - 1))}
          className="rounded-full border border-white/10 bg-white/5 p-3 text-white/75 transition hover:border-cyan-300/25 hover:text-cyan-100"
          aria-label="Diminuir quantidade"
        >
          <Minus className="h-4 w-4" />
        </button>
        <div className="min-w-[84px] rounded-[18px] border border-white/10 bg-black/20 px-4 py-3 text-center">
          <p className="text-[11px] uppercase tracking-[0.16em] text-white/45">Quantidade</p>
          <p className="mt-1 text-2xl font-black text-white">{quantity}</p>
        </div>
        <button
          type="button"
          onClick={() => setQuantity((current) => Math.min(20, current + 1))}
          className="rounded-full border border-white/10 bg-white/5 p-3 text-white/75 transition hover:border-cyan-300/25 hover:text-cyan-100"
          aria-label="Aumentar quantidade"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="rounded-[20px] border border-emerald-300/20 bg-emerald-300/10 p-4">
          <p className="text-xs uppercase tracking-[0.16em] text-emerald-100/70">Total no Pix</p>
          <p className="mt-2 text-2xl font-black text-white">{formatCurrency(totalPix)}</p>
        </div>
        <div className="rounded-[20px] border border-white/10 bg-white/5 p-4">
          <p className="text-xs uppercase tracking-[0.16em] text-white/50">Total no cartão</p>
          <p className="mt-2 text-2xl font-black text-white">{formatCurrency(totalCard)}</p>
        </div>
      </div>

      <div className="mt-5 rounded-[20px] border border-white/10 bg-black/20 p-4 text-sm leading-7 text-white/70">
        <div className="flex items-center gap-2 text-cyan-100">
          <Sparkles className="h-4 w-4" />
          <span className="text-xs uppercase tracking-[0.16em]">Rota sugerida</span>
        </div>
        <p className="mt-2">{goalNote}</p>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <Link href={checkoutHref} className="btn-primary justify-center">
          Comprar {quantity} un.
        </Link>
        <a href={contextualWhatsappHref} target="_blank" rel="noreferrer" className="btn-whatsapp justify-center">
          Tirar dúvida antes de pagar
        </a>
        {customizable ? (
          <a href={customizationHref} target="_blank" rel="noreferrer" className="btn-secondary justify-center">
            Personalizar este item
          </a>
        ) : (
          <button type="button" onClick={copySku} className="btn-secondary justify-center gap-2">
            {copied === "sku" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied === "sku" ? "SKU copiado" : "Copiar SKU"}
          </button>
        )}
        <button type="button" onClick={sharePage} className="btn-glass justify-center gap-2">
          {copied === "link" ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
          {copied === "link" ? "Link copiado" : "Compartilhar item"}
        </button>
      </div>
    </div>
  );
}
