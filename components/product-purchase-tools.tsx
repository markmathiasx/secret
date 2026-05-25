"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Check, Copy, MessageCircleMore, Minus, Plus, Share2, ShoppingCart, Sparkles, Wallet } from "lucide-react";
import { addLocalCartItem } from "@/lib/cart-store";
import { trackAddToCart, trackBeginCheckout, trackWhatsAppClick } from "@/lib/analytics";
import { calculateCardPrice } from "@/lib/payment-pricing";
import { formatCurrency } from "@/lib/utils";
import { PurchaseProtectionBanner } from "@/components/purchase-protection-banner";

const PURCHASE_MEMORY_PREFIX = "mdh:product-config:";
const GOAL_OPTIONS = ["Uso próprio", "Presente", "Lote", "Revenda"] as const;
type PurchaseGoal = (typeof GOAL_OPTIONS)[number];

export function ProductPurchaseTools({
  productId,
  productName,
  sku,
  pricePix,
  productionWindow,
  readyToShip,
  productImage,
  material,
  colors,
  customizable,
  whatsappHref,
  customizationHref,
}: {
  productId: string;
  productName: string;
  sku: string;
  pricePix: number;
  priceCard: number;
  productionWindow: string;
  readyToShip: boolean;
  productImage?: string;
  material?: string;
  colors?: string[];
  customizable: boolean;
  whatsappHref: string;
  customizationHref: string;
  cardCheckoutReady: boolean;
}) {
  const [quantity, setQuantity] = useState(1);
  const [goal, setGoal] = useState<PurchaseGoal>("Uso próprio");
  const [selectedMaterial, setSelectedMaterial] = useState(material || "PLA Premium");
  const [selectedColor, setSelectedColor] = useState(colors?.[0] || "Branco");
  const [selectedPrazo, setSelectedPrazo] = useState<"normal" | "prioritario" | "express">("normal");
  const [configuredPrice, setConfiguredPrice] = useState<{
    unitPix: number;
    unitCard: number;
    totalPix: number;
    totalCard: number;
    productionWindow: string;
  } | null>(null);
  const [copied, setCopied] = useState<"idle" | "sku" | "link">("idle");
  const [cartMessage, setCartMessage] = useState("");
  const [memoryReady, setMemoryReady] = useState(false);
  const unitPix = configuredPrice?.unitPix ?? pricePix;
  const unitCard = configuredPrice?.unitCard ?? calculateCardPrice(pricePix);
  const totalPix = useMemo(() => unitPix * quantity, [quantity, unitPix]);
  const totalCard = useMemo(() => unitCard * quantity, [quantity, unitCard]);
  const quickQuantities = [1, 2, 5, 10];
  const materialOptions = Array.from(new Set([material || "PLA Premium", "PLA Silk", "PETG", "ABS"].filter(Boolean)));
  const colorOptions = Array.from(new Set([...(colors?.length ? colors : ["Branco", "Preto", "Cinza"]), "Preto", "Branco"].filter(Boolean)));
  const checkoutHref = useMemo(
    () => "/checkout",
    []
  );
  const contextualWhatsappHref = useMemo(() => {
    try {
      const url = new URL(whatsappHref);
      const current = url.searchParams.get("text") || "";
      const nextMessage = `${current}\nQuantidade desejada: ${quantity}\nPix: ${formatCurrency(unitPix)}\nCartão + R$ 3: ${formatCurrency(unitCard)}\nObjetivo: ${goal}.`.trim();
      url.searchParams.set("text", nextMessage);
      return url.toString();
    } catch {
      return whatsappHref;
    }
  }, [goal, quantity, unitCard, unitPix, whatsappHref]);
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

  useEffect(() => {
    let active = true;
    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch(`/api/products/${encodeURIComponent(productId)}/price`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            material: selectedMaterial,
            color: selectedColor,
            prazo: selectedPrazo,
            quantity,
          }),
        });
        const data = await response.json().catch(() => null);
        if (!active || !response.ok || !data?.ok) return;
        setConfiguredPrice({
          unitPix: data.unitPix,
          unitCard: data.unitCard,
          totalPix: data.totalPix,
          totalCard: data.totalCard,
          productionWindow: data.productionWindow,
        });
      } catch {
        if (active) setConfiguredPrice(null);
      }
    }, 250);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [productId, quantity, selectedColor, selectedMaterial, selectedPrazo]);

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

  async function addToCart(redirectToCheckout = false) {
    const analyticsProduct = {
      id: productId,
      sku,
      name: productName,
      pricePix: unitPix,
      priceCard: unitCard,
    };
    trackAddToCart(analyticsProduct, quantity);

    addLocalCartItem({
      productId,
      quantity,
      title: productName,
      pricePix: unitPix,
      priceCard: unitCard,
      image: productImage,
      personalizationText: `Material: ${selectedMaterial}; Cor: ${selectedColor}; Prazo: ${selectedPrazo}`,
    });

    await fetch("/api/cart", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        productId,
        quantity,
      }),
    }).catch(() => null);

    setCartMessage(`${quantity} unidade(s) adicionadas ao carrinho.`);
    window.setTimeout(() => setCartMessage(""), 2000);

    if (redirectToCheckout) {
      trackBeginCheckout(analyticsProduct, quantity, totalPix);
      window.location.href = checkoutHref;
    }
  }

  return (
    <div id="pdp-purchase-tools" className="rounded-[24px] border border-cyan-300/20 bg-cyan-300/8 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-cyan-100/75">Compra direta</p>
          <h3 className="mt-2 text-xl font-black text-white">Escolha quantidade, prazo e forma de pagamento.</h3>
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
        <p className="text-xs uppercase tracking-[0.16em] text-white/45">Configuração</p>
        <div className="mt-2 grid gap-3 sm:grid-cols-3">
          <label className="grid gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/45">Material</span>
            <select
              value={selectedMaterial}
              onChange={(event) => setSelectedMaterial(event.target.value)}
              className="rounded-[16px] border border-white/10 bg-black/25 px-3 py-3 text-sm text-white outline-none"
            >
              {materialOptions.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </label>
          <label className="grid gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/45">Cor</span>
            <select
              value={selectedColor}
              onChange={(event) => setSelectedColor(event.target.value)}
              className="rounded-[16px] border border-white/10 bg-black/25 px-3 py-3 text-sm text-white outline-none"
            >
              {colorOptions.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </label>
          <label className="grid gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/45">Prazo</span>
            <select
              value={selectedPrazo}
              onChange={(event) => setSelectedPrazo(event.target.value as "normal" | "prioritario" | "express")}
              className="rounded-[16px] border border-white/10 bg-black/25 px-3 py-3 text-sm text-white outline-none"
            >
              <option value="normal">Normal</option>
              <option value="prioritario">Prioritário</option>
              <option value="express">Express</option>
            </select>
          </label>
        </div>
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
          <p className="mt-1 text-xs text-white/55">Cada produto fica R$ 3,00 acima do Pix.</p>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-[20px] border border-white/10 bg-black/20 p-4 text-sm text-white/72">
          <p className="text-xs uppercase tracking-[0.16em] text-white/45">Prazo de produção</p>
          <p className="mt-2 font-semibold text-white">{configuredPrice?.productionWindow || productionWindow}</p>
        </div>
        <div className="rounded-[20px] border border-white/10 bg-black/20 p-4 text-sm text-white/72">
          <p className="text-xs uppercase tracking-[0.16em] text-white/45">Entrega estimada</p>
          <p className="mt-2 font-semibold text-white">
            {readyToShip ? "Pronta entrega quando houver estoque" : "Frete e prazo final são calculados no checkout"}
          </p>
        </div>
      </div>

      <div className="mt-5">
        <PurchaseProtectionBanner compact />
      </div>

      <div className="mt-5 rounded-[20px] border border-white/10 bg-black/20 p-4 text-sm leading-7 text-white/70">
        <div className="flex items-center gap-2 text-cyan-100">
          <Sparkles className="h-4 w-4" />
          <span className="text-xs uppercase tracking-[0.16em]">Rota sugerida</span>
        </div>
        <p className="mt-2">{goalNote}</p>
      </div>

      {cartMessage ? (
        <div className="mt-4 rounded-[18px] border border-emerald-300/20 bg-emerald-300/10 px-4 py-3 text-sm text-emerald-50">
          {cartMessage}
        </div>
      ) : null}

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <button type="button" onClick={() => void addToCart(true)} className="btn-primary justify-center gap-2">
          <Wallet className="h-4 w-4" />
          Comprar agora
        </button>
        <button type="button" onClick={() => void addToCart(false)} className="btn-secondary justify-center gap-2">
          <ShoppingCart className="h-4 w-4" />
          Adicionar ao carrinho
        </button>
        <a href={contextualWhatsappHref} target="_blank" rel="noreferrer" onClick={() => trackWhatsAppClick("product_purchase_tools")} className="btn-whatsapp justify-center gap-2">
          <MessageCircleMore className="h-4 w-4" />
          Fechar no WhatsApp
        </a>
        {customizable ? (
          <a href={customizationHref} target="_blank" rel="noreferrer" onClick={() => trackWhatsAppClick("product_customization")} className="btn-secondary justify-center">
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
        <Link href={checkoutHref} onClick={() => trackBeginCheckout({ id: productId, sku, name: productName, pricePix: unitPix, priceCard: unitCard }, quantity, totalPix)} className="btn-glass justify-center">
          Ir para checkout
        </Link>
      </div>
    </div>
  );
}
