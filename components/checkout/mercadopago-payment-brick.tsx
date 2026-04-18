"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import { getMercadoPagoPublicKey } from "@/lib/env";
import { logStructured } from "@/lib/logger";

type BrickSubmitResult = {
  ok: boolean;
  orderCode?: string | null;
  paymentId?: string | null;
  paymentStatus?: string | null;
  paymentStatusDetail?: string | null;
  redirectUrl?: string | null;
  pixPayload?: string | null;
  pixQrCode?: string | null;
  boletoUrl?: string | null;
  message?: string | null;
};

type MercadoPagoBrickFormData = Record<string, unknown>;

type MercadoPagoWindow = Window & {
  MercadoPago?: new (publicKey: string, options?: { locale?: string }) => {
    bricks: () => {
      create: (
        type: "payment" | "cardPayment" | "statusScreen",
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

export function MercadoPagoPaymentBrick({
  amount,
  payerEmail,
  payerName,
  paymentMethod,
  checkoutPayload,
  onResult,
}: {
  amount: number;
  payerEmail: string;
  payerName: string;
  paymentMethod: "pix" | "cartao";
  checkoutPayload: Record<string, unknown>;
  onResult: (result: BrickSubmitResult) => void;
}) {
  const [retryCount, setRetryCount] = useState(0);
  const reactId = useId();
  const containerId = useMemo(() => `mp-card-payment-brick-${reactId.replace(/:/g, "")}-${retryCount}`, [reactId, retryCount]);
  const brickRef = useRef<{ unmount?: () => void } | null>(null);
  const checkoutPayloadRef = useRef(checkoutPayload);
  const onResultRef = useRef(onResult);
  const payerEmailRef = useRef(payerEmail);
  const payerNameRef = useRef(payerName);
  const [sdkReady, setSdkReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [publicKeyReady] = useState(Boolean(getMercadoPagoPublicKey()));
  const brickType = paymentMethod === "cartao" ? "cardPayment" : "payment";
  const customization = useMemo(
    () =>
      paymentMethod === "cartao"
        ? {
            paymentMethods: {
              creditCard: true,
            },
            visual: {
              defaultPaymentOption: {
                creditCardForm: true,
              },
            },
          }
        : {},
    [paymentMethod]
  );
  const initialization = useMemo(
    () => ({
      amount,
      payer: {
        email: payerEmailRef.current,
        entityType: "individual",
        first_name: payerNameRef.current.split(/\s+/)[0] || undefined,
        last_name: payerNameRef.current.split(/\s+/).slice(1).join(" ") || undefined,
      },
    }),
    [amount]
  );

  useEffect(() => {
    checkoutPayloadRef.current = checkoutPayload;
  }, [checkoutPayload]);

  useEffect(() => {
    payerEmailRef.current = payerEmail;
  }, [payerEmail]);

  useEffect(() => {
    payerNameRef.current = payerName;
  }, [payerName]);

  useEffect(() => {
    onResultRef.current = onResult;
  }, [onResult]);

  useEffect(() => {
    let cancelled = false;
    let readyTimeout: number | null = null;

    async function mountBrick() {
      try {
        setSdkReady(false);
        setLoading(true);
        setError(null);

        if (!getMercadoPagoPublicKey()) {
          setError(
            "O Bricks do Mercado Pago ainda não está configurado neste ambiente. Defina NEXT_PUBLIC_MP_PUBLIC_KEY junto com MERCADOPAGO_ACCESS_TOKEN."
          );
          setLoading(false);
          return;
        }

        await loadMercadoPagoSdk();
        if (cancelled) return;

        const win = window as MercadoPagoWindow;
        if (!win.MercadoPago) {
          throw new Error("SDK do Mercado Pago indisponível.");
        }

        brickRef.current?.unmount?.();

        const mp = new win.MercadoPago(getMercadoPagoPublicKey(), { locale: "pt-BR" });
        const bricksBuilder = mp.bricks();

        readyTimeout = window.setTimeout(() => {
          if (cancelled) return;
          const message = "O checkout do cartão demorou para montar. Recarregue a página ou use Pix enquanto ajustamos o provedor.";
          setError(message);
          setLoading(false);
          logStructured("warn", "mercadopago_card_brick_ready_timeout", {
            paymentMethod,
            amount,
            containerId,
          });
        }, 25000);

        logStructured("info", "mercadopago_brick_mount_start", {
          paymentMethod,
          amount,
          containerId,
        });

        const controller = await bricksBuilder.create(brickType, containerId, {
          initialization,
          customization,
          callbacks: {
            onReady: () => {
              if (readyTimeout) window.clearTimeout(readyTimeout);
              setSdkReady(true);
              setLoading(false);
            },
            onSubmit: async (formData: MercadoPagoBrickFormData) => {
              setLoading(true);
              setError(null);

              try {
                const response = await fetch("/api/orders", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    ...checkoutPayloadRef.current,
                    mpPaymentData: formData,
                    paymentMethod,
                  }),
                });

                const data = await response.json().catch(() => ({}));

                if (!response.ok) {
                  throw new Error(String(data?.message || "Falha ao criar pagamento."));
                }

                onResultRef.current({
                  ok: true,
                  orderCode: data?.orderCode || null,
                  paymentId: data?.paymentId || null,
                  paymentStatus: data?.paymentStatus || null,
                  paymentStatusDetail: data?.paymentStatusDetail || null,
                  redirectUrl: data?.redirectUrl || null,
                  pixPayload: data?.pixPayload || null,
                  pixQrCode: data?.pixQrCode || null,
                  boletoUrl: data?.boletoUrl || null,
                });
              } catch (submitError) {
                const message = submitError instanceof Error ? submitError.message : "Falha ao processar o pagamento.";
                setError(message);
                logStructured("warn", "mercadopago_brick_submit_failed", {
                  paymentMethod,
                  message,
                });
                onResultRef.current({
                  ok: false,
                  message,
                });
              } finally {
                setLoading(false);
              }
            },
            onError: (submitError: unknown) => {
              if (readyTimeout) window.clearTimeout(readyTimeout);
              const message = submitError instanceof Error ? submitError.message : "Falha no componente de pagamento.";
              setError(message);
              logStructured("warn", paymentMethod === "cartao" ? "mercadopago_card_brick_error" : "mercadopago_payment_brick_error", {
                paymentMethod,
                message,
              });
              setLoading(false);
            },
          },
        });

        brickRef.current = controller || null;
        logStructured("info", "mercadopago_brick_mount_ready", {
          paymentMethod,
          amount,
          containerId,
        });
      } catch (brickError) {
        if (readyTimeout) window.clearTimeout(readyTimeout);
        const message = brickError instanceof Error ? brickError.message : "Falha ao inicializar o pagamento.";
        setError(message);
        setLoading(false);
        logStructured("error", paymentMethod === "cartao" ? "mercadopago_card_brick_mount_failed" : "mercadopago_payment_brick_mount_failed", {
          paymentMethod,
          message,
          errorName: brickError instanceof Error ? brickError.name : typeof brickError,
          errorStack: brickError instanceof Error ? brickError.stack : undefined,
        });
      }
    }

    void mountBrick();

    return () => {
      cancelled = true;
      if (readyTimeout) window.clearTimeout(readyTimeout);
      setSdkReady(false);
      brickRef.current?.unmount?.();
      brickRef.current = null;
    };
  }, [amount, brickType, containerId, customization, initialization, paymentMethod, retryCount]);

  if (!publicKeyReady) {
    return (
      <div className="rounded-[24px] border border-amber-300/20 bg-amber-300/10 p-4 text-sm leading-7 text-amber-50">
        Mercado Pago Bricks precisa de <code className="rounded bg-black/20 px-1">NEXT_PUBLIC_MP_PUBLIC_KEY</code> para renderizar o checkout.
      </div>
    );
  }

  return (
    <div className="rounded-[24px] border border-white/10 bg-black/20 p-4">
      <div className="mb-3 flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-white/50">
        <Loader2 className={`h-4 w-4 ${loading ? "animate-spin text-cyan-100" : "text-emerald-200"}`} />
        <span>{paymentMethod === "cartao" ? "Card Payment Brick • Cartão" : "Payment Brick • Pix"}</span>
      </div>
      {error ? (
        <div className="mb-4 flex items-start gap-3 rounded-[20px] border border-rose-300/20 bg-rose-300/10 p-4 text-sm leading-7 text-rose-50">
          <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-rose-100" />
          <div className="space-y-3">
            <p>{error}</p>
            <button type="button" className="btn-secondary" onClick={() => setRetryCount((value) => value + 1)}>
              Tentar novamente
            </button>
          </div>
        </div>
      ) : null}
      <div id={containerId} className="min-h-[420px]" />
      {!sdkReady && loading ? (
        <p className="mt-4 text-sm leading-7 text-white/55">
          Montando o formulário seguro do cartão. Se demorar, use Pix ou tente novamente pelo botão abaixo.
        </p>
      ) : null}
    </div>
  );
}
