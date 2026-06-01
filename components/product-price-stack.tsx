"use client";

import type { Product } from "@/lib/catalog";
import { calculateCardPrice } from "@/lib/payment-pricing";
import { formatCurrency } from "@/lib/utils";

function getProductBadges(product: Product) {
  const badges: string[] = [];
  if (product.pricePix <= 29.9) badges.push("Oferta de entrada");
  if (product.customizable) badges.push("Personalizável");
  if (product.readyToShip) badges.push("Pronta entrega");
  if (product.pricePix >= 99.9) badges.push("Premium");
  if (!badges.length) badges.push(product.status === "Pronta entrega" ? "Pronta entrega" : "Sob encomenda");
  return badges.slice(0, 2);
}

export function ProductPriceStack({
  product,
  label = "Pix",
  compact = false,
}: {
  product: Product;
  label?: string;
  compact?: boolean;
  showInstallments?: boolean;
}) {
  const productionLeadTime = product.printTime || product.productionWindow || "sob consulta";
  const priceCard = calculateCardPrice(product.pricePix);
  const badges = getProductBadges(product);

  return (
    <div className="space-y-3">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-100/70">{label}</p>
        <p className={compact ? "mt-1 text-2xl font-black leading-none text-white" : "mt-1 text-4xl font-black leading-none text-white"}>
          {formatCurrency(product.pricePix)}
        </p>
        <p className="mt-1 text-sm font-semibold text-white/66">Cartão + R$ 1 {formatCurrency(priceCard)}</p>
      </div>

      <div className="grid gap-2 text-xs text-white/62 sm:grid-cols-2">
        <span className="rounded-[8px] border border-white/10 bg-white/[0.04] px-3 py-2">Prazo: {productionLeadTime}</span>
        <span className="rounded-[8px] border border-white/10 bg-white/[0.04] px-3 py-2">Material: {product.material}</span>
      </div>

      <div className="flex flex-wrap gap-2">
        {badges.map((badge) => (
          <span key={badge} className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-emerald-50">
            {badge}
          </span>
        ))}
      </div>
    </div>
  );
}
