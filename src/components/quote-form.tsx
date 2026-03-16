"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import type { Product } from "@/lib/catalog";
import { estimateDeliveryFeeKm } from "@/lib/delivery";
import { getMemberKey, saveQuote } from "@/lib/member-store";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { formatCurrency } from "@/lib/utils";

export function QuoteForm({ initialProduct }: { initialProduct: Product }) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [distanceKm, setDistanceKm] = useState<number>(0);
  const [defaults, setDefaults] = useState({ customerName: "", customerEmail: "" });

  const deliveryFee = useMemo(() => {
    if (!distanceKm || distanceKm <= 0) return 0;
    return estimateDeliveryFeeKm(distanceKm);
  }, [distanceKm]);

  useEffect(() => {
    let active = true;

    async function load() {
      if (!supabaseBrowser) return;

      const { data } = await supabaseBrowser.auth.getUser();
      if (!active || !data.user) return;

      const fullName = typeof data.user.user_metadata?.full_name === "string" ? data.user.user_metadata.full_name : "";
      setDefaults({
        customerName: fullName,
        customerEmail: data.user.email || ""
      });
    }

    void load();

    return () => {
      active = false;
    };
  }, []);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setMessage("");

    const formData = new FormData(event.currentTarget);
    const payload = Object.fromEntries(formData.entries());

    try {
      const response = await fetch("/api/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        setStatus("error");
        setMessage(data.message || "Nao foi possivel enviar o orcamento.");
        return;
      }

      setStatus("success");
      setMessage(`Orçamento registrado com sucesso. Código: ${data.quoteId}`);

      const user = supabaseBrowser ? (await supabaseBrowser.auth.getUser()).data.user : null;
      const memberKey = getMemberKey({ id: user?.id, email: user?.email, phone: user?.phone });

      saveQuote(memberKey, {
        quoteId: String(data.quoteId),
        productId: initialProduct.id,
        productName: initialProduct.name,
        pricePix: initialProduct.pricePix,
        estimatedDeliveryFee: deliveryFee,
        totalPix: Number((initialProduct.pricePix + deliveryFee).toFixed(2)),
        paymentMethod: String(payload.paymentMethod || "pix"),
        createdAt: new Date().toISOString()
      });
    } catch {
      setStatus("error");
      setMessage("Erro de rede ao enviar o orçamento.");
    }
  }

  return (
    <form onSubmit={onSubmit} className="rounded-[32px] border border-white/10 bg-white/5 p-6">
      <div className="mb-5">
        <p className="text-xs uppercase tracking-[0.2em] text-violet-200">Orçamento rápido</p>
        <h3 className="mt-2 text-2xl font-bold text-white">Solicite {initialProduct.name}</h3>
        <p className="mt-3 text-sm leading-7 text-white/62">
          Envie os dados principais e retornamos com confirmação de cor, prazo e frete local.
        </p>
      </div>

      <div className="mb-5 rounded-[24px] border border-cyan-300/20 bg-cyan-300/10 p-4">
        <p className="text-sm text-cyan-50/80">Preco de referencia</p>
        <p className="mt-1 text-2xl font-black text-white">{formatCurrency(initialProduct.pricePix)}</p>
        <p className="mt-2 text-sm text-cyan-100/75">{initialProduct.material} • {initialProduct.productionWindow}</p>
      </div>

      <input type="hidden" name="productId" value={initialProduct.id} />

      <div className="grid gap-4 md:grid-cols-2">
        <input
          name="customerName"
          placeholder="Seu nome"
          defaultValue={defaults.customerName}
          className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
          required
        />
        <input name="phone" placeholder="WhatsApp" className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none" required />
        <input
          name="customerEmail"
          type="email"
          placeholder="E-mail para confirmação"
          defaultValue={defaults.customerEmail}
          className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
        />
        <input name="cep" placeholder="CEP" className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none" />
        <input name="neighborhood" placeholder="Bairro de entrega" className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none" required />
        <input
          name="distanceKm"
          type="number"
          step="0.1"
          onChange={(event) => setDistanceKm(Number(event.target.value))}
          placeholder="Distância aproximada em km (opcional)"
          className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
        />
        <input
          name="colorPreference"
          placeholder="Cor desejada"
          defaultValue={initialProduct.colors[0]}
          className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
          required
        />
        <select name="paymentMethod" defaultValue="pix" className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none md:col-span-2">
          <option value="pix">Pix</option>
          <option value="cartao">Cartão</option>
          <option value="boleto">Boleto</option>
        </select>
        <textarea
          name="notes"
          placeholder="Detalhes de tamanho, personalização, urgência ou observações do pedido."
          rows={4}
          className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none md:col-span-2"
        />
      </div>

      {deliveryFee > 0 ? (
        <p className="mt-4 text-sm text-cyan-200">Frete estimado por km: {formatCurrency(deliveryFee)} adicionais.</p>
      ) : (
        <p className="mt-4 text-xs text-white/45">Se preferir, você também pode calcular frete por CEP na página de entregas.</p>
      )}

      <button type="submit" className="mt-5 rounded-full bg-cyan-300 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:scale-[1.01] disabled:opacity-70">
        {status === "loading" ? "Enviando..." : "Enviar orçamento"}
      </button>

      {message ? <p className={`mt-4 text-sm ${status === "success" ? "text-emerald-300" : "text-rose-300"}`}>{message}</p> : null}
    </form>
  );
}
