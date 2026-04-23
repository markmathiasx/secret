"use client";

import { useEffect } from "react";
import { Wallet, initMercadoPago } from "@mercadopago/sdk-react";

export function MercadoPagoWallet({
  publicKey,
  preferenceId,
  initPoint,
}: {
  publicKey: string;
  preferenceId: string;
  initPoint?: string | null;
}) {
  useEffect(() => {
    if (publicKey) {
      initMercadoPago(publicKey, { locale: "pt-BR" });
    }
  }, [publicKey]);

  if (!publicKey || !preferenceId) {
    return null;
  }

  return (
    <div className="grid gap-4">
      <div className="overflow-hidden rounded-[24px] border border-white/10 bg-white/5 p-4">
        <Wallet
          initialization={{
            preferenceId,
            redirectMode: "self",
          }}
          customization={{
            theme: "default",
          }}
        />
      </div>
      {initPoint ? (
        <a href={initPoint} className="btn-secondary justify-center" target="_self" rel="noreferrer">
          Abrir checkout Mercado Pago em tela cheia
        </a>
      ) : null}
    </div>
  );
}
