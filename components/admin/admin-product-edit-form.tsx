"use client";

import type { ChangeEvent, FormEvent } from "react";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Calculator, Sparkles } from "lucide-react";
import type { AdminCatalogProduct } from "@/lib/server/admin-catalog-store";

type EstimateResponse = {
  ok?: boolean;
  source?: string;
  provider?: string;
  note?: string;
  estimate?: {
    estimatedGrams: number;
    estimatedHours: number;
    complexity: number;
    confidence: "low" | "medium" | "high";
    rationale: string;
  };
  error?: string;
};

const CARD_FIXED_SURCHARGE = 3;
const MIN_SITE_PRICE_PIX = 39.9;

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number.isFinite(value) ? value : 0);
}

function numberText(value: number | null | undefined, fallback = "") {
  return value === null || value === undefined || !Number.isFinite(value) ? fallback : String(value);
}

function parseNumber(value: string, fallback = 0) {
  const parsed = Number(value.replace(",", "."));
  return Number.isFinite(parsed) ? parsed : fallback;
}

function roundCurrency(value: number) {
  return Number(value.toFixed(2));
}

function calculateCardPrice(pricePix: number) {
  return roundCurrency(Math.max(0, pricePix) + CARD_FIXED_SURCHARGE);
}

function calculateRecommendation(form: Record<string, string | boolean>, profitMode: "margin" | "markup") {
  const grams = Math.max(0, parseNumber(String(form.estimatedGrams)));
  const hours = Math.max(0, parseNumber(String(form.estimatedHours)));
  const spoolPricePerKg = Math.max(0, parseNumber(String(form.spoolPricePerKg), 150));
  const machineHourlyRate = Math.max(0, parseNumber(String(form.machineHourlyRate), 6.9));
  const postProcessMinutes = Math.max(0, parseNumber(String(form.postProcessMinutes), 15));
  const laborHourlyRate = Math.max(0, parseNumber(String(form.laborHourlyRate), 18));
  const packagingCost = Math.max(0, parseNumber(String(form.packagingCost), 2.5));
  const overheadPercent = Math.min(300, Math.max(0, parseNumber(String(form.overheadPercent), 12)));
  const target = Math.max(0, parseNumber(String(form.profitTargetPercent), 50));
  const costFilament = roundCurrency(grams * (spoolPricePerKg / 1000));
  const costMachine = roundCurrency(hours * machineHourlyRate);
  const costLabor = roundCurrency((postProcessMinutes / 60) * laborHourlyRate);
  const costPackaging = roundCurrency(packagingCost);
  const subtotal = costFilament + costMachine + costLabor + costPackaging;
  const costOverhead = roundCurrency(subtotal * (overheadPercent / 100));
  const totalCost = roundCurrency(subtotal + costOverhead);
  const rawPix =
    profitMode === "margin"
      ? totalCost / (1 - Math.min(target, 95) / 100)
      : totalCost * (1 + Math.min(target, 500) / 100);
  const recommendedPricePix = roundCurrency(Math.max(MIN_SITE_PRICE_PIX, rawPix));
  const recommendedPriceCard = calculateCardPrice(recommendedPricePix);
  const profitAmount = roundCurrency(recommendedPricePix - totalCost);
  const profitPercent = recommendedPricePix > 0 ? roundCurrency((profitAmount / recommendedPricePix) * 100) : 0;

  return {
    costFilament,
    costMachine,
    costLabor,
    costPackaging,
    costOverhead,
    totalCost,
    recommendedPricePix,
    recommendedPriceCard,
    profitAmount,
    profitPercent,
  };
}

async function parseSaveResponse(response: Response) {
  const text = await response.text();
  if (!text.trim()) return {};

  try {
    return JSON.parse(text) as Record<string, unknown>;
  } catch {
    return {
      error: response.ok
        ? "O servidor salvou, mas retornou uma resposta não-JSON."
        : `Resposta inesperada do servidor: ${text.slice(0, 240)}`,
    };
  }
}

export function AdminProductEditForm({ product }: { product: AdminCatalogProduct }) {
  const router = useRouter();
  const [form, setForm] = useState<Record<string, string | boolean>>({
    title: product.title,
    description: product.description,
    category: product.category,
    collection: product.collection,
    material: product.material,
    finish: product.finish,
    pricePix: String(product.pricePix),
    priceCard: String(product.priceCard),
    stock: String(product.stock),
    status: product.status,
    readyToShip: product.readyToShip,
    customizable: product.customizable,
    featured: product.featured,
    estimatedGrams: numberText(product.estimatedGrams, String(product.costBase ? Math.max(1, Math.round(product.costBase / 0.15)) : 0)),
    estimatedHours: numberText(product.estimatedHours, "1"),
    complexity: numberText(product.complexity, "1"),
    spoolPricePerKg: numberText(product.spoolPricePerKg, "150"),
    machineHourlyRate: numberText(product.machineHourlyRate, "6.9"),
    postProcessMinutes: numberText(product.postProcessMinutes, "15"),
    laborHourlyRate: numberText(product.laborHourlyRate, "18"),
    packagingCost: numberText(product.packagingCost, "2.5"),
    overheadPercent: numberText(product.overheadPercent, "12"),
    profitMode: product.profitMode,
    profitTargetPercent: numberText(product.profitTargetPercent, "50"),
  });
  const [loading, setLoading] = useState(false);
  const [estimating, setEstimating] = useState(false);
  const [estimate, setEstimate] = useState<EstimateResponse | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const marginRecommendation = useMemo(() => calculateRecommendation(form, "margin"), [form]);
  const markupRecommendation = useMemo(() => calculateRecommendation(form, "markup"), [form]);
  const currentPix = parseNumber(String(form.pricePix));
  const currentProfitAmount = roundCurrency(currentPix - marginRecommendation.totalCost);
  const currentProfitPercent = currentPix > 0 ? roundCurrency((currentProfitAmount / currentPix) * 100) : 0;

  function handleChange(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const target = e.target;
    const value = target.type === "checkbox" ? (target as HTMLInputElement).checked : target.value;
    setForm((prev) => {
      const next = { ...prev, [target.name]: value };
      if (target.name === "pricePix") {
        next.priceCard = String(calculateCardPrice(parseNumber(String(value))));
      }
      return next;
    });
  }

  function applyPrices(source: ReturnType<typeof calculateRecommendation>) {
    setForm((prev) => ({
      ...prev,
      pricePix: String(source.recommendedPricePix),
      priceCard: String(source.recommendedPriceCard),
      profitMode: source === marginRecommendation ? "margin" : "markup",
    }));
  }

  async function estimateCosting() {
    setEstimating(true);
    setError("");
    setEstimate(null);

    try {
      const response = await fetch(`/api/admin/products/${product.id}/cost-estimate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          category: form.category,
          collection: form.collection,
          material: form.material,
        }),
      });
      const data = (await response.json().catch(() => ({}))) as EstimateResponse;
      if (!response.ok || !data?.estimate) throw new Error(data?.error || "Não foi possível estimar custo.");
      setEstimate(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao estimar custo.");
    } finally {
      setEstimating(false);
    }
  }

  function applyEstimate() {
    if (!estimate?.estimate) return;
    const confirmed = window.confirm("Aplicar esta ESTIMATIVA no formulário? Revise com o slicer antes de salvar como valor final.");
    if (!confirmed) return;
    setForm((prev) => ({
      ...prev,
      estimatedGrams: String(estimate.estimate?.estimatedGrams ?? prev.estimatedGrams),
      estimatedHours: String(estimate.estimate?.estimatedHours ?? prev.estimatedHours),
      complexity: String(estimate.estimate?.complexity ?? prev.complexity),
    }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          pricePix: parseNumber(String(form.pricePix)),
          priceCard: calculateCardPrice(parseNumber(String(form.pricePix))),
          stock: parseNumber(String(form.stock)),
          estimatedGrams: parseNumber(String(form.estimatedGrams)),
          estimatedHours: parseNumber(String(form.estimatedHours)),
          complexity: parseNumber(String(form.complexity), 1),
          spoolPricePerKg: parseNumber(String(form.spoolPricePerKg), 150),
          machineHourlyRate: parseNumber(String(form.machineHourlyRate), 6.9),
          postProcessMinutes: parseNumber(String(form.postProcessMinutes), 15),
          laborHourlyRate: parseNumber(String(form.laborHourlyRate), 18),
          packagingCost: parseNumber(String(form.packagingCost), 2.5),
          overheadPercent: parseNumber(String(form.overheadPercent), 12),
          profitMode: form.profitMode,
          profitTargetPercent: parseNumber(String(form.profitTargetPercent), 50),
          estimatedProfitAmount: currentProfitAmount,
          estimatedProfitPercent: currentProfitPercent,
          costingUpdatedAt: new Date().toISOString(),
        }),
      });
      const data = await parseSaveResponse(res);
      if (!res.ok) {
        throw new Error(String(data?.error || `Erro ao salvar. Status HTTP ${res.status}.`));
      }
      setSuccess(String(data?.error || "Produto atualizado com sucesso!"));
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar produto.");
    } finally {
      setLoading(false);
    }
  }

  const numberFields = [
    ["estimatedGrams", "Gramas estimadas", "g", "0.1"],
    ["estimatedHours", "Horas de máquina", "h", "0.1"],
    ["spoolPricePerKg", "Preço do rolo/kg", "R$", "0.01"],
    ["machineHourlyRate", "Máquina/hora", "R$", "0.01"],
    ["postProcessMinutes", "Pós-processo", "min", "1"],
    ["laborHourlyRate", "Mão de obra/hora", "R$", "0.01"],
    ["packagingCost", "Embalagem", "R$", "0.01"],
    ["overheadPercent", "Overhead", "%", "0.1"],
  ] as const;

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
      <form onSubmit={handleSubmit} className="glass-card space-y-4">
        {error && <p className="rounded-[16px] border border-rose-300/20 bg-rose-300/10 p-3 text-sm text-rose-200">{error}</p>}
        {success && <p className="rounded-[16px] border border-emerald-300/20 bg-emerald-300/10 p-3 text-sm text-emerald-200">{success}</p>}

        <label className="block">
          <span className="mb-1 block text-sm text-white/70">Título</span>
          <input name="title" value={String(form.title)} onChange={handleChange} className="field-base" />
        </label>

        <label className="block">
          <span className="mb-1 block text-sm text-white/70">Descrição</span>
          <textarea name="description" value={String(form.description)} onChange={handleChange} rows={3} className="field-base resize-y" />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-sm text-white/70">Categoria</span>
            <input name="category" value={String(form.category)} onChange={handleChange} className="field-base" />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm text-white/70">Coleção</span>
            <input name="collection" value={String(form.collection)} onChange={handleChange} className="field-base" />
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-sm text-white/70">Material</span>
            <input name="material" value={String(form.material)} onChange={handleChange} className="field-base" />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm text-white/70">Acabamento</span>
            <input name="finish" value={String(form.finish)} onChange={handleChange} className="field-base" />
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <label className="block">
            <span className="mb-1 block text-sm text-white/70">Preço Pix (R$)</span>
            <input name="pricePix" type="number" step={0.01} min={0} value={String(form.pricePix)} onChange={handleChange} className="field-base" />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm text-white/70">Preço Cartão (Pix + R$ 3)</span>
            <input name="priceCard" type="number" step={0.01} min={0} value={String(form.priceCard)} readOnly className="field-base" />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm text-white/70">Estoque</span>
            <input name="stock" type="number" min={0} value={String(form.stock)} onChange={handleChange} className="field-base" />
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-[1fr_0.65fr]">
          <label className="block">
            <span className="mb-1 block text-sm text-white/70">Status</span>
            <select name="status" value={String(form.status)} onChange={handleChange} className="field-base">
              <option value="Pronta entrega">Pronta entrega</option>
              <option value="Sob encomenda">Sob encomenda</option>
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-sm text-white/70">Lucro alvo (%)</span>
            <input name="profitTargetPercent" type="number" step={0.1} min={0} value={String(form.profitTargetPercent)} onChange={handleChange} className="field-base" />
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {numberFields.map(([name, label, suffix, step]) => (
            <label key={name} className="block">
              <span className="mb-1 block text-sm text-white/70">{label} ({suffix})</span>
              <input name={name} type="number" step={step} min={0} value={String(form[name])} onChange={handleChange} className="field-base" />
            </label>
          ))}
        </div>

        <div className="flex flex-wrap gap-4 text-sm text-white/70">
          <label className="flex items-center gap-2">
            <input type="checkbox" name="readyToShip" checked={Boolean(form.readyToShip)} onChange={handleChange} />
            Pronta entrega
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" name="customizable" checked={Boolean(form.customizable)} onChange={handleChange} />
            Personalizável
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" name="featured" checked={Boolean(form.featured)} onChange={handleChange} />
            Destaque
          </label>
        </div>

        <div className="flex flex-wrap gap-3 pt-2">
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? "Salvando..." : "Salvar alterações"}
          </button>
          <button type="button" onClick={() => router.push("/admin/products")} className="btn-secondary">
            Voltar
          </button>
        </div>
      </form>

      <aside className="xl:sticky xl:top-24 xl:self-start">
        <div className="mdh-instrument-panel space-y-5 p-5">
          <div className="flex items-center gap-3">
            <span className="rounded-[8px] border border-cyan-300/20 bg-cyan-300/10 p-3 text-cyan-100">
              <Calculator className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-100/70">Calculadora</p>
              <h3 className="text-xl font-black text-white">Custo e margem</h3>
            </div>
          </div>

          <div className="rounded-[8px] border border-white/10 bg-black/25 p-4 font-mono text-xs leading-6 text-white/68">
            filament_cost = grams * (spoolPricePerKg / 1000)
            <br />
            {marginRecommendation.costFilament.toFixed(2)} = {parseNumber(String(form.estimatedGrams)).toFixed(1)} * ({parseNumber(String(form.spoolPricePerKg), 150).toFixed(2)} / 1000)
          </div>

          <div className="grid gap-2 text-sm">
            {[
              ["Filamento", marginRecommendation.costFilament],
              ["Máquina", marginRecommendation.costMachine],
              ["Mão de obra", marginRecommendation.costLabor],
              ["Embalagem", marginRecommendation.costPackaging],
              ["Overhead", marginRecommendation.costOverhead],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between border-b border-white/8 pb-2 text-white/68">
                <span>{label}</span>
                <span className="font-semibold text-white">{formatCurrency(Number(value))}</span>
              </div>
            ))}
            <div className="flex items-center justify-between pt-1 text-white">
              <span className="font-semibold">Custo total</span>
              <span className="text-lg font-black text-cyan-100">{formatCurrency(marginRecommendation.totalCost)}</span>
            </div>
          </div>

          <div className="grid gap-3">
            {[
              ["Margem", marginRecommendation],
              ["Markup", markupRecommendation],
            ].map(([label, recommendation]) => {
              const item = recommendation as typeof marginRecommendation;
              return (
                <div key={String(label)} className="rounded-[8px] border border-white/10 bg-white/[0.04] p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/45">{String(label)}</p>
                  <p className="mt-2 text-2xl font-black text-white">{formatCurrency(item.recommendedPricePix)}</p>
                  <p className="mt-1 text-sm text-white/55">Cartão + R$ 3: {formatCurrency(item.recommendedPriceCard)}</p>
                  <p className="mt-2 text-xs text-emerald-100">Lucro estimado: {formatCurrency(item.profitAmount)} ({item.profitPercent.toFixed(1)}%)</p>
                  <button type="button" onClick={() => applyPrices(item)} className="btn-secondary mt-3 w-full justify-center text-sm">
                    Aplicar Pix/Card
                  </button>
                </div>
              );
            })}
          </div>

          <div className="rounded-[8px] border border-amber-300/20 bg-amber-300/10 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-100/80">Preço atual</p>
            <p className="mt-2 text-xl font-black text-white">{formatCurrency(currentPix)}</p>
            <p className={`mt-1 text-sm ${currentProfitAmount >= 0 ? "text-emerald-100" : "text-rose-200"}`}>
              Delta lucro: {formatCurrency(currentProfitAmount)} ({currentProfitPercent.toFixed(1)}%)
            </p>
          </div>

          <div className="rounded-[8px] border border-cyan-300/20 bg-cyan-300/10 p-4">
            <div className="flex items-center gap-2 text-cyan-100">
              <Sparkles className="h-4 w-4" />
              <p className="text-xs font-semibold uppercase tracking-[0.16em]">Estimativa assistida</p>
            </div>
            <p className="mt-2 text-sm leading-6 text-white/68">
              Usa Ollama/Groq quando configurado ou heurística local. O resultado é sempre ESTIMATE; confirme no slicer antes de salvar.
            </p>
            <button type="button" onClick={estimateCosting} disabled={estimating} className="btn-glass mt-3 w-full justify-center text-sm">
              {estimating ? "Estimando..." : "Estimate hours and grams from description"}
            </button>
            {estimate?.estimate ? (
              <div className="mt-3 rounded-[8px] border border-white/10 bg-black/20 p-3 text-sm text-white/70">
                <p className="font-semibold text-cyan-100">ESTIMATE - {estimate.provider || estimate.source}</p>
                <p className="mt-2">{estimate.estimate.estimatedGrams}g / {estimate.estimate.estimatedHours}h / complexidade {estimate.estimate.complexity}</p>
                <p className="mt-2 text-xs leading-5 text-white/50">{estimate.estimate.rationale}</p>
                <button type="button" onClick={applyEstimate} className="btn-secondary mt-3 w-full justify-center text-sm">
                  Aplicar estimativa no formulário
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </aside>
    </div>
  );
}
