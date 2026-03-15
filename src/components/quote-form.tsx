"use client";

import { useMemo, useState, type FormEvent } from "react";
import type { Product } from "@/lib/catalog";
import { estimateDeliveryFeeKm } from "@/lib/delivery";
import { formatCurrency } from "@/lib/utils";
import { supabaseBrowser } from "@/lib/supabase/browser";

export function QuoteForm({ initialProduct }: { initialProduct: Product }) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [distanceKm, setDistanceKm] = useState<number>(0);

  const deliveryFee = useMemo(() => {
    if (!distanceKm || distanceKm <= 0) return 0;
    return estimateDeliveryFeeKm(distanceKm);
  }, [distanceKm]);

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
        setMessage(data.message || "Não foi possível enviar o orçamento.");
        return;
      }

      const client = supabaseBrowser;
      if (client) {
        const { data: auth } = await client.auth.getUser();
        const userId = auth.user?.id;
        if (userId) {
          await client.from("quote_requests").insert({
            user_id: userId,
            product_id: String(payload.productId || initialProduct.id),
            status: "recebido",
            details: payload
          });
        }

        await client.from("social_lead_events").insert({
          user_id: userId || null,
          channel: "site",
          event_name: "quote_submitted",
          payload: { product_id: payload.productId }
        });
      }

      setStatus("success");
      setMessage(`Orçamento enviado com sucesso. Código: ${data.quoteId}`);
    } catch {
      setStatus("error");
      setMessage("Erro de conexão ao enviar orçamento. Tente novamente.");
    }
  }

  return (
    <form onSubmit={onSubmit} className="rounded-[32px] border border-white/10 bg-white/5 p-6">
      <div className="mb-5">
        <p className="text-xs uppercase tracking-[0.2em] text-violet-200">Orçamento rápido</p>
        <h3 className="mt-2 text-2xl font-bold text-white">Encomende {initialProduct.name}</h3>
      </div>

      <input type="hidden" name="productId" value={initialProduct.id} />

      <div className="grid gap-4 md:grid-cols-2">
        <input name="customerName" placeholder="Nome completo" className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none" required />
        <input name="phone" placeholder="WhatsApp com DDD" className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none" required />
        <input name="cep" placeholder="CEP de entrega" className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none" />
        <input name="neighborhood" placeholder="Bairro" className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none" required />
        <input
          name="distanceKm"
          type="number"
          step="0.1"
          onChange={(e) => setDistanceKm(Number(e.target.value))}
          placeholder="Distância em km"
          className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
        />
        <input name="colorPreference" placeholder="Cor desejada" defaultValue={initialProduct.colors[0]} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none" required />
        <select name="paymentMethod" defaultValue="pix" className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none md:col-span-2">
          <option value="pix">Pix</option>
          <option value="cartao">Cartão</option>
          <option value="boleto">Boleto</option>
        </select>
        <textarea name="notes" placeholder="Descreva tamanho, acabamento, prazo e detalhes de personalização." rows={4} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none md:col-span-2" />
      </div>

      {deliveryFee > 0 ? (
        <p className="mt-4 text-sm text-cyan-200">Frete estimado por distância: {formatCurrency(deliveryFee)} (adicional)</p>
      ) : (
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
        <p className="mt-4 text-xs text-white/50">Informe a distância para estimativa imediata de frete ou confirme na etapa de atendimento.</p>
=======
        <p className="mt-4 text-xs text-white/45">Se quiser frete por km, informe uma estimativa de distância. Se preferir, calcule por CEP na página de frete.</p>
>>>>>>> theirs
=======
        <p className="mt-4 text-xs text-white/45">Se quiser frete por km, informe uma estimativa de distância. Se preferir, calcule por CEP na página de frete.</p>
>>>>>>> theirs
=======
        <p className="mt-4 text-xs text-white/45">Se quiser frete por km, informe uma estimativa de distância. Se preferir, calcule por CEP na página de frete.</p>
>>>>>>> theirs
      )}

      <button type="submit" className="mt-5 rounded-full bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:scale-[1.01] disabled:opacity-70">
        {status === "loading" ? "Enviando orçamento..." : "Pedir orçamento"}
      </button>

      {message ? <p className={`mt-4 text-sm ${status === "success" ? "text-emerald-300" : "text-rose-300"}`}>{message}</p> : null}
    </form>
  );
}
