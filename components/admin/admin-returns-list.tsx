"use client";

import { useCallback, useEffect, useState } from "react";
import { RefreshCw, RotateCcw } from "lucide-react";
import { RETURN_STATUSES, type ReturnWorkflowStatus } from "@/lib/return-workflow";

type ReturnRow = {
  id: string;
  protocol: string;
  status: ReturnWorkflowStatus;
  type: string;
  customerName: string;
  customerEmail: string;
  reason: string;
  requestedAt: string;
  order: { orderNumber: string; status: string; grandTotal: string | number };
};

export function AdminReturnsList() {
  const [rows, setRows] = useState<ReturnRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set("search", search.trim());
      const response = await fetch(`/api/admin/returns?${params}`, { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || "Falha ao carregar devoluções.");
      setRows(data.requests || []);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Falha ao carregar devoluções.");
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => { void load(); }, [load]);

  async function changeStatus(id: string, status: ReturnWorkflowStatus) {
    setError("");
    const response = await fetch("/api/admin/returns", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    const data = await response.json();
    if (!response.ok) {
      setError(data?.error || "Falha ao atualizar a solicitação.");
      return;
    }
    setRows((current) => current.map((row) => row.id === id ? { ...row, status: data.request.status } : row));
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="section-kicker">Operação pós-venda</p>
          <h1 className="section-title">Trocas, devoluções e garantias</h1>
          <p className="section-copy">Protocolos persistidos, vinculados ao pedido e com histórico de transições.</p>
        </div>
        <button onClick={() => void load()} className="btn-secondary gap-2"><RefreshCw className="h-4 w-4" />Atualizar</button>
      </div>

      <div className="glass-card flex gap-3">
        <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Protocolo, pedido ou e-mail" className="field-base" />
        <button onClick={() => void load()} className="btn-primary">Buscar</button>
      </div>
      {error ? <p className="rounded-2xl border border-rose-300/20 bg-rose-300/10 p-4 text-rose-100">{error}</p> : null}
      {loading ? <p className="text-white/60">Carregando solicitações…</p> : null}

      <div className="grid gap-4">
        {rows.map((row) => (
          <article key={row.id} className="glass-card grid gap-4 lg:grid-cols-[1fr_auto]">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <RotateCcw className="h-4 w-4 text-cyan-200" />
                <strong className="text-white">{row.protocol}</strong>
                <span className="rounded-full bg-white/8 px-3 py-1 text-xs text-white/60">{row.type}</span>
              </div>
              <p className="mt-3 text-sm text-white/70">Pedido {row.order.orderNumber} · {row.customerName} · {row.customerEmail}</p>
              <p className="mt-2 text-sm text-white/55">{row.reason}</p>
              <p className="mt-2 text-xs text-white/35">Aberto em {new Date(row.requestedAt).toLocaleString("pt-BR")}</p>
            </div>
            <label className="min-w-56 text-xs uppercase tracking-[0.14em] text-white/45">
              Status
              <select value={row.status} onChange={(event) => void changeStatus(row.id, event.target.value as ReturnWorkflowStatus)} className="field-base mt-2">
                {RETURN_STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}
              </select>
            </label>
          </article>
        ))}
        {!loading && rows.length === 0 ? <p className="glass-card text-white/55">Nenhuma solicitação encontrada.</p> : null}
      </div>
    </div>
  );
}
