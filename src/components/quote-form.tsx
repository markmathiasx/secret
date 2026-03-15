"use client";

import { useMemo, useState } from "react";
import { MessageCircleMore, SendHorizontal } from "lucide-react";
import type { Product } from "@/lib/catalog";
import { catalog, featuredCatalog, findProduct } from "@/lib/catalog";
import { formatCurrency } from "@/lib/utils";
<<<<<<< ours
<<<<<<< ours
import { whatsappMessage, whatsappNumber } from "@/lib/constants";
=======
import { supabaseBrowser } from "@/lib/supabase/browser";
>>>>>>> theirs
=======
import { supabaseBrowser } from "@/lib/supabase/browser";
>>>>>>> theirs

type Props = {
  initialProduct?: Product;
  product?: Product;
  products?: Product[];
  title?: string;
  description?: string;
};

type SubmitState =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "success"; message: string }
  | { kind: "error"; message: string };

export function QuoteForm({
  initialProduct,
  product,
  products,
  title = "Solicite um orcamento com briefing claro",
  description = "Receba retorno com validacao de material, prazo, frete e acabamento sem bloquear a navegacao publica."
}: Props) {
  const availableProducts = useMemo(() => {
    if (products?.length) return products;
    if (initialProduct) return [initialProduct];
    if (product) return [product];
    return featuredCatalog.slice(0, 18);
  }, [initialProduct, product, products]);

  const [selectedProductId, setSelectedProductId] = useState(
    initialProduct?.id || product?.id || availableProducts[0]?.id || catalog[0]?.id || ""
  );
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [cep, setCep] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [distanceKm, setDistanceKm] = useState("");
  const [colorPreference, setColorPreference] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"pix" | "cartao" | "boleto">("pix");
  const [notes, setNotes] = useState("");
  const [submitState, setSubmitState] = useState<SubmitState>({ kind: "idle" });

  const selectedProduct = useMemo(
    () => initialProduct || product || findProduct(selectedProductId) || availableProducts[0] || null,
    [availableProducts, initialProduct, product, selectedProductId]
  );

  const whatsappHref = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedProduct) {
      setSubmitState({ kind: "error", message: "Selecione um produto antes de enviar o pedido." });
      return;
    }

    setSubmitState({ kind: "loading" });

    const response = await fetch("/api/quote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId: selectedProduct.id,
        customerName,
        phone,
        cep,
        neighborhood,
        distanceKm: distanceKm ? Number(distanceKm) : 0,
        colorPreference,
        paymentMethod,
        notes
      })
    });

    const data = await response.json().catch(() => ({}));

<<<<<<< ours
    if (!response.ok) {
      setSubmitState({
        kind: "error",
        message: data?.message || "Nao foi possivel enviar o orcamento agora."
      });
      return;
=======
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
<<<<<<< ours
>>>>>>> theirs
=======
>>>>>>> theirs
    }

    const message =
      data?.storage === "supabase"
        ? `Orcamento ${data.quoteId} registrado com sucesso.`
        : `Orcamento ${data.quoteId} recebido em modo vitrine. Finalize o fechamento pelo WhatsApp.`;

    setSubmitState({ kind: "success", message });
    setCustomerName("");
    setPhone("");
    setCep("");
    setNeighborhood("");
    setDistanceKm("");
    setColorPreference("");
    setPaymentMethod("pix");
    setNotes("");
  }

  if (!selectedProduct) return null;

  return (
    <section className="rounded-[32px] border border-white/10 bg-card p-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-cyan-100/75">Orcamento</p>
          <h2 className="mt-2 text-3xl font-black text-white">{title}</h2>
          <p className="mt-2 max-w-2xl text-white/65">{description}</p>
        </div>
        <a
          href={whatsappHref}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-full border border-emerald-300/30 bg-emerald-300/10 px-5 py-3 text-sm font-semibold text-emerald-100"
        >
          <MessageCircleMore className="h-4 w-4" />
          Falar no WhatsApp
        </a>
      </div>

<<<<<<< ours
      <div className="mt-6 rounded-[24px] border border-white/10 bg-black/20 p-5">
        <p className="text-xs uppercase tracking-[0.18em] text-white/45">Produto em destaque</p>
        <div className="mt-3 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h3 className="text-xl font-bold text-white">{selectedProduct.name}</h3>
            <p className="mt-1 text-sm text-white/60">
              {selectedProduct.category} • {selectedProduct.collection}
            </p>
          </div>
          <div className="text-left md:text-right">
            <p className="text-xs uppercase tracking-[0.18em] text-white/45">Preco base no Pix</p>
            <p className="mt-1 text-2xl font-black text-cyan-100">{formatCurrency(selectedProduct.pricePix)}</p>
          </div>
        </div>
      </div>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        {!initialProduct && !product ? (
          <label className="block">
            <span className="mb-2 block text-sm text-white/70">Produto</span>
            <select
              value={selectedProductId}
              onChange={(event) => setSelectedProductId(event.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
            >
              {availableProducts.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
        ) : null}

        <div className="grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-sm text-white/70">Seu nome</span>
            <input
              value={customerName}
              onChange={(event) => setCustomerName(event.target.value)}
              required
              className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm text-white/70">WhatsApp</span>
            <input
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              required
              className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm text-white/70">CEP</span>
            <input
              value={cep}
              onChange={(event) => setCep(event.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
              placeholder="Opcional"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm text-white/70">Bairro</span>
            <input
              value={neighborhood}
              onChange={(event) => setNeighborhood(event.target.value)}
              required
              className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm text-white/70">Cor desejada</span>
            <input
              value={colorPreference}
              onChange={(event) => setColorPreference(event.target.value)}
              required
              className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm text-white/70">Distancia aproximada (km)</span>
            <input
              value={distanceKm}
              onChange={(event) => setDistanceKm(event.target.value)}
              type="number"
              step="0.1"
              min="0"
              className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
              placeholder="Opcional"
            />
          </label>
        </div>

        <label className="block">
          <span className="mb-2 block text-sm text-white/70">Forma de pagamento</span>
          <select
            value={paymentMethod}
            onChange={(event) => setPaymentMethod(event.target.value as typeof paymentMethod)}
            className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
          >
            <option value="pix">Pix</option>
            <option value="cartao">Cartao</option>
            <option value="boleto">Boleto</option>
          </select>
        </label>

        <label className="block">
          <span className="mb-2 block text-sm text-white/70">Detalhes do pedido</span>
          <textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            className="h-32 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
            placeholder="Conte tamanho, referencia, urgencia ou observacoes importantes."
          />
        </label>

        {submitState.kind === "error" ? (
          <p className="text-sm text-rose-200">{submitState.message}</p>
        ) : null}

        {submitState.kind === "success" ? (
          <p className="text-sm text-emerald-200">{submitState.message}</p>
        ) : null}
=======
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
=======
        <p className="mt-4 text-xs text-white/45">Se quiser frete por km, informe uma estimativa de distância. Se preferir, calcule por CEP na página de frete.</p>
>>>>>>> theirs
=======
        <p className="mt-4 text-xs text-white/50">Informe a distância para estimativa imediata de frete ou confirme na etapa de atendimento.</p>
>>>>>>> theirs
      )}

      <button type="submit" className="mt-5 rounded-full bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:scale-[1.01] disabled:opacity-70">
        {status === "loading" ? "Enviando orçamento..." : "Pedir orçamento"}
      </button>
>>>>>>> theirs

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={submitState.kind === "loading"}
            className="inline-flex items-center gap-2 rounded-full bg-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 disabled:opacity-70"
          >
            <SendHorizontal className="h-4 w-4" />
            {submitState.kind === "loading" ? "Enviando..." : "Enviar orcamento"}
          </button>
          <a
            href={whatsappHref}
            target="_blank"
            rel="noreferrer"
            className="rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-white"
          >
            Fallback pelo WhatsApp
          </a>
        </div>
      </form>
    </section>
  );
}
