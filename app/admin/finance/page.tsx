"use client";

import { useEffect, useMemo, useState } from "react";
import { formatCurrency } from "@/lib/utils";

type EntryKind = "receita" | "custo" | "despesa";

type Entry = {
  id: string;
  date: string; // YYYY-MM-DD
  kind: EntryKind;
  category: string;
  description: string;
  amount: number;
};

const STORAGE_KEY = "mdh_finance_entries_v1";

function todayISO() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function loadEntries(): Entry[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
  } catch {
    // ignore
  }
  return [];
}

function saveEntries(entries: Entry[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

function weekKey(dateISO: string) {
  const d = new Date(dateISO + "T00:00:00");
  // ISO week (simplified)
  const day = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - day + 3);
  const firstThursday = new Date(d.getFullYear(), 0, 4);
  const diff = d.getTime() - firstThursday.getTime();
  const week = 1 + Math.round(diff / (7 * 24 * 60 * 60 * 1000));
  return `${d.getFullYear()}-W${String(week).padStart(2, "0")}`;
}

function monthKey(dateISO: string) {
  return dateISO.slice(0, 7);
}

function yearKey(dateISO: string) {
  return dateISO.slice(0, 4);
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function BarChart({ data }: { data: { label: string; value: number }[] }) {
  const max = Math.max(1, ...data.map((d) => Math.abs(d.value)));
  return (
    <div className="rounded-[24px] border border-white/10 bg-black/20 p-4">
      <div className="flex items-end gap-2 overflow-x-auto pb-2">
        {data.map((d) => {
          const height = clamp((Math.abs(d.value) / max) * 120, 2, 120);
          const positive = d.value >= 0;
          return (
            <div key={d.label} className="flex w-14 flex-none flex-col items-center gap-2">
              <div
                className={`w-full rounded-xl ${positive ? "bg-cyan-400/80" : "bg-rose-400/80"}`}
                style={{ height }}
                title={`${d.label}: ${formatCurrency(d.value)}`}
              />
              <div className="text-[11px] text-white/55">{d.label}</div>
            </div>
          );
        })}
      </div>
      <p className="mt-2 text-xs text-white/45">
        Barras azuis = lucro (receita - custos/despesas). Barras vermelhas = negativo.
      </p>
    </div>
  );
}

export default function FinancePage() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [kind, setKind] = useState<EntryKind>("receita");
  const [date, setDate] = useState(todayISO());
  const [category, setCategory] = useState("Vendas");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState<number>(0);
  const [group, setGroup] = useState<"dia" | "semana" | "mes" | "ano">("dia");

  useEffect(() => {
    setEntries(loadEntries());
  }, []);

  const totals = useMemo(() => {
    const receita = entries.filter((e) => e.kind === "receita").reduce((acc, e) => acc + e.amount, 0);
    const custos = entries.filter((e) => e.kind !== "receita").reduce((acc, e) => acc + e.amount, 0);
    return { receita, custos, lucro: receita - custos };
  }, [entries]);

  const grouped = useMemo(() => {
    const keyFn = group === "dia" ? (d: string) => d : group === "semana" ? weekKey : group === "mes" ? monthKey : yearKey;
    const map = new Map<string, number>();
    for (const e of entries) {
      const k = keyFn(e.date);
      const delta = e.kind === "receita" ? e.amount : -e.amount;
      map.set(k, (map.get(k) || 0) + delta);
    }
    return Array.from(map.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-14)
      .map(([label, value]) => ({ label, value: Number(value.toFixed(2)) }));
  }, [entries, group]);

  function addEntry() {
    const cleanAmount = Number(amount);
    if (!Number.isFinite(cleanAmount) || cleanAmount <= 0) return;
    const next: Entry = {
      id: crypto.randomUUID(),
      date,
      kind,
      category: category.trim() || "Geral",
      description: description.trim(),
      amount: Number(cleanAmount.toFixed(2))
    };
    const updated = [next, ...entries];
    setEntries(updated);
    saveEntries(updated);
    setDescription("");
    setAmount(0);
  }

  function removeEntry(id: string) {
    const updated = entries.filter((e) => e.id !== id);
    setEntries(updated);
    saveEntries(updated);
  }

  function exportCsv() {
    const lines = [
      ["date", "kind", "category", "description", "amount"].join(","),
      ...entries.map((e) =>
        [
          e.date,
          e.kind,
          e.category,
          (e.description || "").replaceAll('"', '""'),
          String(e.amount)
        ]
          .map((v) => `"${v}"`)
          .join(",")
      )
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mdh-finance-${todayISO()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <section className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-[32px] border border-white/10 bg-white/5 p-6">
          <p className="text-sm text-white/55">Receita</p>
          <p className="mt-2 text-3xl font-black text-white">{formatCurrency(totals.receita)}</p>
        </div>
        <div className="rounded-[32px] border border-white/10 bg-white/5 p-6">
          <p className="text-sm text-white/55">Custos + despesas</p>
          <p className="mt-2 text-3xl font-black text-white">{formatCurrency(totals.custos)}</p>
        </div>
        <div className="rounded-[32px] border border-cyan-400/20 bg-cyan-400/10 p-6">
          <p className="text-sm text-cyan-100/70">Lucro</p>
          <p className="mt-2 text-3xl font-black text-cyan-100">{formatCurrency(totals.lucro)}</p>
        </div>
      </div>

      <div className="rounded-[32px] border border-white/10 bg-white/5 p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Gráficos</p>
            <h2 className="mt-2 text-2xl font-bold text-white">Lucro por {group}</h2>
            <p className="mt-1 text-sm text-white/55">Mostrando os últimos 14 pontos</p>
          </div>
          <div className="flex gap-2">
            {(["dia", "semana", "mes", "ano"] as const).map((g) => (
              <button
                key={g}
                onClick={() => setGroup(g)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  group === g ? "bg-cyan-400 text-slate-950" : "border border-white/10 bg-black/20 text-white/70"
                }`}
              >
                {g}
              </button>
            ))}
            <button onClick={exportCsv} className="rounded-full border border-white/10 bg-black/20 px-4 py-2 text-sm font-semibold text-white">
              Exportar CSV
            </button>
          </div>
        </div>

        <div className="mt-6">
          <BarChart data={grouped} />
        </div>
      </div>

      <div className="rounded-[32px] border border-white/10 bg-white/5 p-6">
        <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Nova entrada</p>
        <div className="mt-4 grid gap-4 md:grid-cols-6">
          <label className="md:col-span-1 text-sm text-white/70">
            <span className="mb-2 block">Data</span>
            <input value={date} onChange={(e) => setDate(e.target.value)} type="date" className="w-full rounded-2xl border border-white/10 bg-black/20 px-3 py-3 text-white outline-none" />
          </label>
          <label className="md:col-span-1 text-sm text-white/70">
            <span className="mb-2 block">Tipo</span>
            <select value={kind} onChange={(e) => setKind(e.target.value as EntryKind)} className="w-full rounded-2xl border border-white/10 bg-black/20 px-3 py-3 text-white outline-none">
              <option value="receita">Receita</option>
              <option value="custo">Custo</option>
              <option value="despesa">Despesa</option>
            </select>
          </label>
          <label className="md:col-span-1 text-sm text-white/70">
            <span className="mb-2 block">Categoria</span>
            <input value={category} onChange={(e) => setCategory(e.target.value)} className="w-full rounded-2xl border border-white/10 bg-black/20 px-3 py-3 text-white outline-none" />
          </label>
          <label className="md:col-span-2 text-sm text-white/70">
            <span className="mb-2 block">Descrição</span>
            <input value={description} onChange={(e) => setDescription(e.target.value)} className="w-full rounded-2xl border border-white/10 bg-black/20 px-3 py-3 text-white outline-none" placeholder="Ex: filamento, gasolina, venda peça X..." />
          </label>
          <label className="md:col-span-1 text-sm text-white/70">
            <span className="mb-2 block">Valor (R$)</span>
            <input value={amount} onChange={(e) => setAmount(Number(e.target.value))} type="number" step="0.01" className="w-full rounded-2xl border border-white/10 bg-black/20 px-3 py-3 text-white outline-none" />
          </label>
        </div>
        <button onClick={addEntry} className="mt-4 rounded-full bg-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950">
          Adicionar
        </button>
      </div>

      <div className="rounded-[32px] border border-white/10 bg-white/5 p-6">
        <h2 className="text-xl font-bold text-white">Entradas</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-white/55">
              <tr>
                <th className="py-2">Data</th>
                <th className="py-2">Tipo</th>
                <th className="py-2">Categoria</th>
                <th className="py-2">Descrição</th>
                <th className="py-2">Valor</th>
                <th className="py-2">Ações</th>
              </tr>
            </thead>
            <tbody>
              {entries.slice(0, 200).map((e) => (
                <tr key={e.id} className="border-t border-white/10 text-white/80">
                  <td className="py-2 whitespace-nowrap">{e.date}</td>
                  <td className="py-2">{e.kind}</td>
                  <td className="py-2">{e.category}</td>
                  <td className="py-2">{e.description}</td>
                  <td className={`py-2 font-semibold ${e.kind === "receita" ? "text-cyan-200" : "text-rose-200"}`}>{formatCurrency(e.amount)}</td>
                  <td className="py-2">
                    <button onClick={() => removeEntry(e.id)} className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs text-white/70">
                      Remover
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-white/45">Mostrando até 200 itens na tabela (o histórico completo fica salvo no seu navegador).</p>
      </div>
    </section>
  );
}
