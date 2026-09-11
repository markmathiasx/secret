"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Loader2, Pencil, X } from "lucide-react";
import { formatAdminBrl, formatAdminMoneyInput, parseAdminMoney } from "@/lib/admin-money";

type SaveResult = { pricePix: number; warning?: string | null };

export function AdminPriceEditor({
  productId,
  value,
  onSaved,
}: {
  productId: string;
  value: number;
  onSaved: (result: SaveResult) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(() => formatAdminMoneyInput(value));
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!editing) setDraft(formatAdminMoneyInput(value));
  }, [editing, value]);

  useEffect(() => {
    if (editing) inputRef.current?.select();
  }, [editing]);

  function cancel() {
    setDraft(formatAdminMoneyInput(value));
    setMessage(null);
    setEditing(false);
  }

  async function save() {
    const pricePix = parseAdminMoney(draft);
    if (pricePix === null || pricePix <= 0 || pricePix > 100000) {
      setMessage("Informe um preço entre R$ 0,01 e R$ 100.000,00.");
      return;
    }

    setSaving(true);
    setMessage(null);
    try {
      const response = await fetch(`/api/admin/products/${encodeURIComponent(productId)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pricePix }),
      });
      const payload = await response.json().catch(() => null) as {
        persisted?: boolean;
        error?: string;
        warning?: string | null;
        product?: { pricePix?: number | string };
      } | null;
      if (!response.ok || payload?.persisted !== true) {
        throw new Error(payload?.error || "O banco não confirmou o novo preço.");
      }

      const verifyResponse = await fetch("/api/admin/catalog", { cache: "no-store" });
      const verifyPayload = await verifyResponse.json().catch(() => null) as {
        products?: Array<{ id: string; pricePix: number | string }>;
      } | null;
      const persistedProduct = verifyPayload?.products?.find((product) => product.id === productId);
      const confirmed = Number(persistedProduct?.pricePix);
      if (!verifyResponse.ok || !Number.isFinite(confirmed) || Math.abs(confirmed - pricePix) > 0.001) {
        throw new Error("O banco informou que salvou, mas a leitura de confirmação não conferiu. Não salve novamente: atualize a página e verifique o valor.");
      }
      onSaved({ pricePix: confirmed, warning: payload.warning });
      setDraft(formatAdminMoneyInput(confirmed));
      setMessage(payload.warning || "Preço salvo e confirmado no banco.");
      setEditing(false);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Não foi possível salvar o preço.");
    } finally {
      setSaving(false);
    }
  }

  if (!editing) {
    return (
      <div className="flex flex-col items-end gap-1">
        <button
          type="button"
          onClick={() => { setMessage(null); setEditing(true); }}
          className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-amber-200/20 bg-amber-200/[0.06] px-3 font-semibold text-amber-100 transition hover:border-amber-200/50 hover:bg-amber-200/10"
          aria-label={`Editar preço ${formatAdminBrl(value)}`}
        >
          {formatAdminBrl(value)} <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
        {message && <p className="max-w-64 text-right text-[11px] leading-4 text-amber-100/75" role="status">{message}</p>}
      </div>
    );
  }

  return (
    <div className="flex min-w-52 flex-col items-end gap-1.5">
      <div className="flex items-center gap-1.5">
        <label className="sr-only" htmlFor={`price-${productId}`}>Preço Pix em reais</label>
        <span className="text-xs text-white/55">R$</span>
        <input
          ref={inputRef}
          id={`price-${productId}`}
          inputMode="decimal"
          autoComplete="off"
          value={draft}
          disabled={saving}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") { event.preventDefault(); void save(); }
            if (event.key === "Escape") { event.preventDefault(); cancel(); }
          }}
          className="h-11 w-28 rounded-xl border border-amber-200/35 bg-black/40 px-3 text-right font-semibold text-white outline-none focus:border-amber-200 focus:ring-2 focus:ring-amber-200/20"
          aria-describedby={message ? `price-message-${productId}` : undefined}
        />
        <button type="button" onClick={() => void save()} disabled={saving} className="grid h-11 w-11 place-items-center rounded-xl bg-amber-200 text-black disabled:opacity-50" aria-label="Salvar preço">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
        </button>
        <button type="button" onClick={cancel} disabled={saving} className="grid h-11 w-11 place-items-center rounded-xl border border-white/15 text-white/70 disabled:opacity-50" aria-label="Cancelar edição">
          <X className="h-4 w-4" />
        </button>
      </div>
      {message && <p id={`price-message-${productId}`} className="max-w-72 text-right text-[11px] leading-4 text-rose-200" role="alert">{message}</p>}
    </div>
  );
}
