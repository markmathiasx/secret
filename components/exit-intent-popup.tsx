"use client";

import { useEffect, useRef, useState } from "react";
import { X, Tag } from "lucide-react";

interface ExitIntentPopupProps {
  discount?: number; // percent
  couponCode?: string;
  onClose?: () => void;
}

/**
 * Shows a discount popup when the user's mouse leaves the viewport upward.
 * Fires once per session (stored in sessionStorage).
 */
export function ExitIntentPopup({
  discount = 5,
  couponCode = "VOLTE5",
  onClose,
}: ExitIntentPopupProps) {
  const [visible, setVisible] = useState(false);
  const fired = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem("exit_popup_shown")) return;

    function handleMouseLeave(e: MouseEvent) {
      if (fired.current) return;
      if (e.clientY <= 0) {
        fired.current = true;
        sessionStorage.setItem("exit_popup_shown", "1");
        setVisible(true);

        if (typeof window !== "undefined" && (window as Window & { gtag?: Function }).gtag) {
          (window as Window & { gtag?: Function }).gtag!("event", "exit_intent_shown");
        }
      }
    }

    document.addEventListener("mouseleave", handleMouseLeave);
    return () => document.removeEventListener("mouseleave", handleMouseLeave);
  }, []);

  if (!visible) return null;

  function close() {
    setVisible(false);
    onClose?.();
  }

  function applyCoupon() {
    if (typeof navigator !== "undefined") {
      navigator.clipboard.writeText(couponCode).catch(() => {});
    }
    if (typeof window !== "undefined" && (window as Window & { gtag?: Function }).gtag) {
      (window as Window & { gtag?: Function }).gtag!("event", "exit_intent_coupon_copy", {
        coupon: couponCode,
      });
    }
    close();
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="exit-popup-title"
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && close()}
    >
      <div className="relative w-full max-w-md rounded-[28px] border border-white/10 bg-[#0d1117] p-8 text-center shadow-2xl">
        <button
          onClick={close}
          aria-label="Fechar"
          className="absolute right-4 top-4 rounded-full p-1 text-white/40 hover:text-white/80 transition"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mb-4 flex justify-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-cyan-400/10 text-cyan-400">
            <Tag className="h-7 w-7" />
          </span>
        </div>

        <h2 id="exit-popup-title" className="text-2xl font-bold text-white mb-2">
          Espera! Ganhe {discount}% de desconto
        </h2>
        <p className="text-white/60 text-sm mb-6">
          Use o cupom abaixo na próxima compra e aproveite {discount}% de desconto em toda a loja.
        </p>

        <div className="mb-6 flex items-center justify-between rounded-xl border border-cyan-400/30 bg-cyan-400/5 px-4 py-3">
          <span className="font-mono text-lg font-semibold text-cyan-300">{couponCode}</span>
          <button
            onClick={applyCoupon}
            className="rounded-lg bg-cyan-400/20 px-3 py-1.5 text-xs font-medium text-cyan-300 hover:bg-cyan-400/30 transition"
          >
            Copiar
          </button>
        </div>

        <button
          onClick={applyCoupon}
          className="btn-primary w-full rounded-2xl py-3 font-semibold"
        >
          Copiar cupom e continuar comprando
        </button>

        <button onClick={close} className="mt-3 text-xs text-white/30 hover:text-white/50 transition">
          Não, obrigado
        </button>
      </div>
    </div>
  );
}
