"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import { getMercadoPagoPublicKey } from "@/lib/env";
import { logStructured } from "@/lib/logger";

type MercadoPagoWindow = Window & {
  MercadoPago?: new (publicKey: string, options?: { locale?: string }) => {
    bricks: () => {
      create: (
        type: "payment" | "statusScreen",
        containerId: string,
        settings: Record<string, unknown>
      ) => Promise<{ unmount?: () => void } | void>;
    };
  };
};

function loadMercadoPagoSdk() {
  return new Promise<void>((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new Error("Mercado Pago SDK só pode ser carregado no navegador."));
      return;
    }

    const existing = document.querySelector<HTMLScriptElement>('script[data-mp-sdk="true"]');
    if (existing && (window as MercadoPagoWindow).MercadoPago) {
      resolve();
      return;
    }

    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("Falha ao carregar o SDK do Mercado Pago.")), {
        once: true,
      });
      return;
    }

    const script = document.createElement("script");
    script.src = "https://sdk.mercadopago.com/js/v2";
    script.async = true;
    script.defer = true;
    script.dataset.mpSdk = "true";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Falha ao carregar o SDK do Mercado Pago."));
    document.head.appendChild(script);
  });
}

export function MercadoPagoStatusBrick({
  paymentId,
  amount,
  orderCode,
}: {
  paymentId: string | null;
  amount?: number | null;
  orderCode?: string | null;
}) {
  const containerId = useMemo(() => `mp-status-brick-${Math.random().toString(36).slice(2)}`, []);
  const controller = useRef<{ unmount?: () => void } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const publicKey = getMercadoPagoPublicKey();

  useEffect(() => {
    let cancelled = false;

    async function mountStatusScreen() {
      try {
        if (!publicKey) {
          setError("O Status Screen Brick precisa de NEXT_PUBLIC_MP_PUBLIC_KEY.");
          setLoading(false);
          return;
        }

        if (!paymentId) {
          setError("Pagamento não encontrado para exibir o status.");
          setLoading(false);
          return;
        }

        await loadMercadoPagoSdk();
        if (cancelled) return;

        const win = window as MercadoPagoWindow;
        if (!win.MercadoPago) {
          throw new Error("SDK do Mercado Pago indisponível.");
        }

        controller.current?.unmount?.();

        const mp = new win.MercadoPago(publicKey, { locale: "pt-BR" });
        const bricksBuilder = mp.bricks();
        const brick = await bricksBuilder.create("statusScreen", containerId, {
          initialization: {
            paymentId,
            amount: amount || undefined,
            order: orderCode || undefined,
          },
        });

        controller.current = brick || null;
        setLoading(false);
      } catch (brickError) {
        const message = brickError instanceof Error ? brickError.message : "Falha ao inicializar o status.";
        setError(message);
        setLoading(false);
        logStructured("error", "mercadopago_status_brick_failed", {
          paymentId,
          orderCode,
          message,
        });
      }
    }

    void mountStatusScreen();

    return () => {
      cancelled = true;
      controller.current?.unmount?.();
      controller.current = null;
    };
  }, [amount, containerId, orderCode, paymentId, publicKey]);

  return (
    <div className="rounded-[24px] border border-white/10 bg-black/20 p-4">
      <div className="mb-3 flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-white/50">
        <Loader2 className={`h-4 w-4 ${loading ? "animate-spin text-cyan-100" : "text-emerald-200"}`} />
        <span>Status Screen Brick</span>
      </div>
      {error ? (
        <div className="mb-4 flex items-start gap-3 rounded-[20px] border border-rose-300/20 bg-rose-300/10 p-4 text-sm leading-7 text-rose-50">
          <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-rose-100" />
          <p>{error}</p>
        </div>
      ) : null}
      <div id={containerId} className="min-h-[280px]" />
      {loading ? <p className="mt-4 text-sm text-white/55">Carregando status do pagamento...</p> : null}
    </div>
  );
}
