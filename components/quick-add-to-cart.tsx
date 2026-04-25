"use client";

import { useState } from "react";
import { ShoppingCart, Check } from "lucide-react";
import { addLocalCartItem } from "@/lib/cart-store";
import { useToast } from "@/components/toast";
import { trackAddToCart } from "@/lib/analytics";

export function QuickAddToCart({
  productId,
  productName,
  pricePix = 0,
  priceCard = 0,
  image,
  className = "",
}: {
  productId: string;
  productName: string;
  pricePix?: number;
  priceCard?: number;
  image?: string;
  className?: string;
}) {
  const [added, setAdded] = useState(false);
  const { addToast } = useToast();

  function handleAdd(e: React.MouseEvent) {
    e.stopPropagation();
    e.preventDefault();
    addLocalCartItem({
      productId,
      quantity: 1,
      title: productName,
      pricePix,
      priceCard,
      image,
    });
    trackAddToCart({ id: productId, name: productName, pricePix, priceCard }, 1);
    setAdded(true);
    addToast(`${productName} adicionado ao carrinho`, "success");
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <button
      type="button"
      onClick={handleAdd}
      data-card-interactive="true"
      className={`inline-flex items-center justify-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold transition-all duration-300 ${
        added
          ? "border-emerald-400/30 bg-emerald-400/15 text-emerald-200"
          : "border-white/10 bg-white/5 text-white/70 hover:border-cyan-300/30 hover:bg-cyan-300/10 hover:text-cyan-100"
      } ${className}`}
      aria-label={`Adicionar ${productName} ao carrinho`}
    >
      {added ? (
        <>
          <Check className="h-3.5 w-3.5" />
          Adicionado
        </>
      ) : (
        <>
          <ShoppingCart className="h-3.5 w-3.5" />
          Comprar
        </>
      )}
    </button>
  );
}
