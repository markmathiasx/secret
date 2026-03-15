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
        setMessage(data.message || "Nao foi possivel enviar o orcamento.");
        return;
      }

      const client = supabaseBrowser;
      if (client) {
        const {
          data: { user }
        } = await client.auth.getUser();

        if (user?.id) {
          await client.from("quote_requests").insert({
            user_id: user.id,
            product_id: String(payload.productId || initialProduct.id),
            status: "recebido",
            details: payload
          });
        }
      }

      setStatus("success");
      setMessage(`Orcamento enviado com sucesso. Codigo: ${data.quoteId}`);
      event.currentTarget.reset();
      setDistanceKm(0);
    } catch {
      setStatus("error");
      setMessage("Erro de conexao ao enviar o orcamento. Tente novamente.");
    }
  }

  return (
    <form onSubmit={onSubmit} className="rounded-[32px] border border-white/10 bg-white/5 p-6">
      <div className="mb-5">
        <p className="text-xs uppercase tracking-[0.2em] text-violet-200">Orcamento rapido</p>
        <h3 className="mt-2 text-2xl font-bold text-white">Solicite {initialProduct.name}</h3>
        <p className="mt-3 text-sm leading-7 text-white/65">
          Envie os detalhes da sua peca e receba retorno com validacao de material, prazo e entrega local.
        </p>
      </div>

      <input type="hidden" name="productId" value={initialProduct.id} />

      <div className="grid gap-4 md:grid-cols-2">
        <input
          name="customerName"
          placeholder="Nome completo"
          className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
          required
        />
        <input
          name="phone"
          placeholder="WhatsApp com DDD"
          className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
          required
        />
        <input
          name="cep"
          placeholder="CEP de entrega"
          className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
        />
        <input
          name="neighborhood"
          placeholder="Bairro ou regiao"
          className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
          required
        />
        <input
          name="distanceKm"
          type="number"
          step="0.1"
          min="0"
          onChange={(event) => setDistanceKm(Number(event.target.value))}
          placeholder="Distancia estimada em km"
          className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
        />
        <input
          name="colorPreference"
          placeholder="Cor desejada"
          defaultValue={initialProduct.colors[0]}
          className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
          required
        />
        <select
          name="paymentMethod"
          defaultValue="pix"
          className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none md:col-span-2"
        >
          <option value="pix">Pix</option>
          <option value="cartao">Cartao</option>
          <option value="boleto">Boleto</option>
        </select>
        <textarea
          name="notes"
          placeholder="Descreva tamanho, acabamento, referencia visual, prazo e detalhes de personalizacao."
          rows={4}
          className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none md:col-span-2"
        />
      </div>

      {deliveryFee > 0 ? (
        <p className="mt-4 text-sm text-cyan-200">Frete estimado por distancia: {formatCurrency(deliveryFee)}.</p>
      ) : (
        <p className="mt-4 text-xs text-white/55">
          Se preferir, deixe a distancia em branco e confirme o frete pelo CEP na pagina de entregas.
        </p>
      )}

      <button
        type="submit"
        disabled={status === "loading"}
        className="mt-5 rounded-full bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:scale-[1.01] disabled:opacity-70"
      >
        {status === "loading" ? "Enviando orcamento..." : "Pedir orcamento"}
      </button>

      {message ? (
        <p className={`mt-4 text-sm ${status === "success" ? "text-emerald-300" : "text-rose-300"}`}>{message}</p>
      ) : null}
    </form>
  );
}
