"use client";

import Link from "next/link";
import { MessageCircleMore, Scale } from "lucide-react";
import { useCompare } from "@/components/compare-context";

export function ProductActions({
  productId,
  checkoutHref,
  whatsappHref,
}: {
  productId: string;
  checkoutHref: string;
  whatsappHref: string;
}) {
  const { isInCompare, toggleCompare } = useCompare();

  return (
    <div className="mt-8 flex flex-wrap gap-3">
      <Link href={checkoutHref} className="inline-flex items-center justify-center rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800">
        Ir para checkout
      </Link>
      <button
        type="button"
        onClick={() => toggleCompare(productId)}
        className={`inline-flex items-center justify-center gap-2 rounded-full border px-6 py-3 text-sm font-semibold ${
          isInCompare(productId) ? "border-orange-300 bg-orange-100 text-orange-800" : "border-[#d6c3ab] bg-white text-slate-800"
        }`}
      >
        <Scale className="h-4 w-4" />
        {isInCompare(productId) ? "No comparador" : "Adicionar ao comparador"}
      </button>
      <a
        href={whatsappHref}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-2 rounded-full border border-[#d7e8da] bg-white px-6 py-3 text-sm font-semibold text-emerald-700 hover:bg-[#eef7ec]"
      >
        <MessageCircleMore className="h-4 w-4" />
        Falar no WhatsApp
      </a>
    </div>
  );
}

