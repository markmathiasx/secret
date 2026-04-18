"use client";
import Link from "next/link";
import { Wallet } from "lucide-react";
import { useEffect, useState } from "react";
import { formatCurrency } from "@/lib/utils";

export function StickyPdpCta({
  productName,
  pricePix,
  quantity = 1,
  checkoutHref,
}: {
  productId: string;
  productName: string;
  pricePix: number;
  quantity?: number;
  checkoutHref: string;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const hero = document.getElementById("pdp-purchase-tools");
    if (!hero) return;
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting),
      { threshold: 0.1 }
    );
    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[120] border-t border-white/10 bg-[rgba(9,17,25,0.97)] px-4 py-3 backdrop-blur-xl lg:hidden">
      <div className="mx-auto flex max-w-lg items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-white">{productName}</p>
          <p className="text-xs font-black text-emerald-100">{formatCurrency(pricePix * quantity)} no Pix</p>
        </div>
        <Link href={checkoutHref} className="btn-primary flex-shrink-0 gap-2 py-2.5">
          <Wallet className="h-4 w-4" />
          Comprar agora
        </Link>
      </div>
    </div>
  );
}
