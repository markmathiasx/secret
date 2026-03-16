"use client";

import { useMemo, useState } from "react";
import { CreditCard, LoaderCircle, ShieldCheck } from "lucide-react";
import type { Product } from "@/lib/catalog";
import { whatsappMessage, whatsappNumber } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";

export function CheckoutCard({ product }: { product: Product }) {
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [message, setMessage] = useState("");
  const whatsappHref = useMemo(() => {
    const text = `${whatsappMessage} Quero fechar ${product.name}.`;
    return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(text)}`;
  }, [product.name]);

  async function startCheckout() {
    setStatus("loading");
    setMessage("");

    try {
      const response = await fetch("/api/checkout/mercadopago", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id })
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data?.ok) {
        setStatus("error");
        setMessage(data?.fallbackMessage || data?.message || "Nao foi possivel iniciar o checkout agora.");
        return;
      }

      const redirectTo = data.initPoint || data.sandboxInitPoint;
      if (!redirectTo) {
        setStatus("error");
        setMessage("O checkout respondeu sem um link valido. Tente novamente em instantes.");
        return;
      }

      window.location.href = redirectTo;
    } catch {
      setStatus("error");
      setMessage("Falha de rede ao tentar abrir o checkout.");
    }
  }

  return (
    <div className="rounded-[30px] border border-cyan-300/20 bg-cyan-300/10 p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-cyan-100/80">Checkout digital</p>
          <h3 className="mt-2 text-2xl font-black text-white">Cartao e boleto com retorno seguro</h3>
          <p className="mt-3 text-sm leading-7 text-cyan-50/75">
            Se o Mercado Pago estiver configurado, abrimos o checkout com retorno para a propria loja. Se ainda faltar credencial,
            o card continua estavel e voce pode fechar no atendimento.
          </p>
        </div>
        <span className="rounded-2xl border border-white/10 bg-black/20 p-3 text-cyan-50">
          <CreditCard className="h-6 w-6" />
        </span>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-[24px] border border-white/10 bg-black/25 p-5">
          <p className="text-sm text-white/55">Valor estimado no checkout</p>
          <p className="mt-2 text-3xl font-black text-white">{formatCurrency(product.priceCard)}</p>
          <p className="mt-2 text-sm text-white/62">Produto: {product.name}</p>
          <p className="mt-4 text-xs leading-6 text-white/52">
            O valor final pode variar se houver cor especial, personalizacao ou ajuste de frete.
          </p>
        </div>

        <div className="space-y-4">
          <button
            type="button"
            onClick={startCheckout}
            disabled={status === "loading"}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-cyan-300 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:scale-[1.01] disabled:opacity-70"
          >
            {status === "loading" ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
            {status === "loading" ? "Abrindo checkout..." : "Pagar com Mercado Pago"}
          </button>

          <a
            href={whatsappHref}
            className="inline-flex w-full items-center justify-center rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white"
          >
            Fechar pelo WhatsApp
          </a>

          {message ? (
            <div className="rounded-[22px] border border-amber-300/20 bg-amber-300/10 p-4 text-sm leading-6 text-amber-50/90">
              {message}
            </div>
          ) : null}

          <div className="flex items-start gap-3 rounded-[24px] border border-white/10 bg-black/20 p-4 text-sm text-white/68">
            <ShieldCheck className="mt-0.5 h-5 w-5 text-cyan-100" />
            <p>Credenciais de servidor continuam fora do frontend. Quando o provedor nao estiver pronto, o produto segue vendendo sem tela quebrada.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
