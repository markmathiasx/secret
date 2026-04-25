"use client";

import { useEffect } from "react";
import { ShoppingCart, Zap, MessageSquare } from "lucide-react";

interface AbCtaProps {
  variant: "buy_now" | "add_to_cart" | "get_quote" | string;
  testId: string;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
}

const ctaConfig = {
  buy_now: {
    label: "Comprar agora",
    icon: Zap,
    className: "btn-primary",
  },
  add_to_cart: {
    label: "Adicionar ao carrinho",
    icon: ShoppingCart,
    className: "btn-primary",
  },
  get_quote: {
    label: "Solicitar orçamento",
    icon: MessageSquare,
    className: "btn-secondary",
  },
} as const;

/**
 * A/B-tested primary CTA button.
 * Fires a GA4 event on mount to record impression, and on click to record interaction.
 */
export function AbCta({ variant, testId, onClick, disabled, className }: AbCtaProps) {
  const config = ctaConfig[variant as keyof typeof ctaConfig] ?? ctaConfig.buy_now;
  const Icon = config.icon;

  useEffect(() => {
    if (typeof window !== "undefined" && (window as Window & { gtag?: Function }).gtag) {
      (window as Window & { gtag?: Function }).gtag!("event", "ab_impression", {
        test_id: testId,
        variant,
      });
    }
  }, [testId, variant]);

  function handleClick() {
    if (typeof window !== "undefined" && (window as Window & { gtag?: Function }).gtag) {
      (window as Window & { gtag?: Function }).gtag!("event", "ab_click", {
        test_id: testId,
        variant,
      });
    }
    onClick();
  }

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={handleClick}
      className={`${config.className} flex w-full items-center justify-center gap-2 ${className ?? ""}`}
      data-ab-test={testId}
      data-ab-variant={variant}
    >
      <Icon className="h-5 w-5 shrink-0" />
      {config.label}
    </button>
  );
}
