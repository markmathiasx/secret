"use client";

import { useState } from "react";
import { Tag, X } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

type CouponResult = {
  id: string;
  code: string;
  title: string;
  type: string;
  freeShipping: boolean;
};

type Props = {
  total: number;
  onCouponApplied: (discount: number, freeShipping: boolean, coupon: CouponResult | null) => void;
};

export function CouponInput({ total, onCouponApplied }: Props) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [applied, setApplied] = useState<CouponResult | null>(null);
  const [discount, setDiscount] = useState(0);

  async function handleApply() {
    if (!code.trim()) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch(
        `/api/coupons/validate?code=${encodeURIComponent(code.trim())}&total=${total}`
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Cupom inválido.");
      setApplied(data.coupon);
      setDiscount(data.discount);
      onCouponApplied(data.discount, data.freeShipping, data.coupon);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Cupom inválido.");
      setApplied(null);
      setDiscount(0);
      onCouponApplied(0, false, null);
    } finally {
      setLoading(false);
    }
  }

  function handleRemove() {
    setCode("");
    setApplied(null);
    setDiscount(0);
    setError("");
    onCouponApplied(0, false, null);
  }

  if (applied) {
    return (
      <div className="flex items-center justify-between rounded-[16px] border border-emerald-300/25 bg-emerald-300/10 px-3 py-2">
        <div className="flex items-center gap-2 text-sm">
          <Tag className="h-3.5 w-3.5 text-emerald-200" />
          <span className="font-semibold text-emerald-100">{applied.code}</span>
          {discount > 0 && (
            <span className="text-emerald-200/80">− {formatCurrency(discount)}</span>
          )}
          {applied.freeShipping && (
            <span className="text-emerald-200/80">+ Frete grátis</span>
          )}
        </div>
        <button onClick={handleRemove} className="text-white/40 hover:text-white">
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Tag className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/30" />
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === "Enter" && handleApply()}
            placeholder="Cupom de desconto"
            className="field-base pl-8 text-sm uppercase tracking-wider"
          />
        </div>
        <button
          type="button"
          onClick={handleApply}
          disabled={loading || !code.trim()}
          className="btn-secondary whitespace-nowrap text-sm"
        >
          {loading ? "…" : "Aplicar"}
        </button>
      </div>
      {error && <p className="mt-1 text-xs text-rose-300">{error}</p>}
    </div>
  );
}
