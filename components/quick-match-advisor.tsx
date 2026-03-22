"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { ArrowRight, SlidersHorizontal, Sparkles } from "lucide-react";
import { SafeProductImage } from "@/components/safe-product-image";
import { ProductVisualBadge } from "@/components/product-visual-authenticity";
import { catalog, getProductUrl, type Product } from "@/lib/catalog";
import { formatCurrency } from "@/lib/utils";

function shouldIgnoreCardActivation(target: EventTarget | null) {
  return target instanceof Element && Boolean(target.closest("a, button, input, select, textarea, [role='button'], [data-card-interactive='true']"));
}

type Goal = "presente" | "setup" | "geek" | "lote" | "sob-medida";
type Speed = "rapido" | "equilibrado" | "sem-pressa";
type Budget = "ate-40" | "ate-80" | "premium";

const goals: { id: Goal; label: string }[] = [
  { id: "presente", label: "Presente" },
  { id: "setup", label: "Setup" },
  { id: "geek", label: "Geek" },
  { id: "lote", label: "Lote" },
  { id: "sob-medida", label: "Sob medida" },
];

const speeds: { id: Speed; label: string }[] = [
  { id: "rapido", label: "Mais rápido" },
  { id: "equilibrado", label: "Equilibrado" },
  { id: "sem-pressa", label: "Sem pressa" },
];

const budgets: { id: Budget; label: string }[] = [
  { id: "ate-40", label: "Até R$ 40" },
  { id: "ate-80", label: "Até R$ 80" },
  { id: "premium", label: "Premium" },
];

function scoreProduct(product: Product, goal: Goal, speed: Speed, budget: Budget, needCustom: boolean) {
  let score = 0;
  const reasons: string[] = [];
  const category = product.category.toLowerCase();
  const tags = product.tags.join(" ").toLowerCase();

  if (goal === "presente" && (tags.includes("presente") || category.includes("presente"))) {
    score += 4;
    reasons.push("tem fit forte para presente");
  }
  if (goal === "setup" && (category.includes("setup") || category.includes("utilidade") || category.includes("organiza"))) {
    score += 4;
    reasons.push("resolve uso prático de setup");
  }
  if (goal === "geek" && (category.includes("geek") || product.theme.toLowerCase().includes("anime"))) {
    score += 4;
    reasons.push("tem apelo de fandom e coleção");
  }
  if (goal === "lote" && (product.customizable || category.includes("utilidade") || category.includes("setup"))) {
    score += 4;
    reasons.push("conversa melhor com repetição e personalização");
  }
  if (goal === "sob-medida" && product.customizable) {
    score += 5;
    reasons.push("aceita adaptação de briefing");
  }

  if (speed === "rapido" && (product.readyToShip || product.productionWindow.includes("24h") || product.productionWindow.includes("48h"))) {
    score += 3;
    reasons.push("tem janela de saída mais curta");
  }
  if (speed === "equilibrado" && !product.readyToShip) {
    score += 1;
  }
  if (speed === "sem-pressa") {
    score += 1;
  }

  if (budget === "ate-40" && product.pricePix <= 40) {
    score += 3;
    reasons.push("cabe em ticket mais leve");
  }
  if (budget === "ate-80" && product.pricePix <= 80) {
    score += 2;
  }
  if (budget === "premium" && product.pricePix >= 60) {
    score += 2;
    reasons.push("tem ticket mais robusto");
  }

  if (needCustom && product.customizable) {
    score += 3;
    reasons.push("abre espaço para personalizar");
  }

  if (product.featured) score += 1;

  return { score, reason: reasons[0] || "combina com a combinação escolhida" };
}

function buildAdvisorHref(goal: Goal, speed: Speed, budget: Budget, needCustom: boolean) {
  if (goal === "sob-medida") return "/imagem-para-impressao-3d";
  const params = new URLSearchParams();
  if (goal === "presente") params.set("intent", "Presente");
  if (goal === "lote") params.set("intent", "Atacado");
  if (speed === "rapido") params.set("status", "Pronta entrega");
  if (needCustom) params.set("custom", "1");
  if (budget === "ate-40") params.set("max", "40");
  if (budget === "ate-80") params.set("max", "80");
  if (goal === "setup") params.set("category", "Setup & Organização");
  return `/catalogo?${params.toString()}`;
}

export function QuickMatchAdvisor() {
  const router = useRouter();
  const [goal, setGoal] = useState<Goal>("presente");
  const [speed, setSpeed] = useState<Speed>("rapido");
  const [budget, setBudget] = useState<Budget>("ate-80");
  const [needCustom, setNeedCustom] = useState(false);

  const advisorHref = useMemo(() => buildAdvisorHref(goal, speed, budget, needCustom), [budget, goal, needCustom, speed]);

  const recommendations = useMemo(() => {
    return catalog
      .map((product) => {
        const scored = scoreProduct(product, goal, speed, budget, needCustom);
        return { product, score: scored.score, reason: scored.reason };
      })
      .sort((a, b) => b.score - a.score || a.product.pricePix - b.product.pricePix)
      .slice(0, 3);
  }, [budget, goal, needCustom, speed]);

  function openProduct(product: Product) {
    router.push(getProductUrl(product));
  }

  return (
    <section className="mx-auto max-w-7xl px-6 py-8">
      <div className="glass-panel p-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-3xl">
            <p className="section-kicker">Guia de escolha</p>
            <h2 className="section-title">Monte um recorte de compra sem entrar em todos os filtros do catálogo.</h2>
            <p className="section-copy mt-4">
              Esse guia combina objetivo, velocidade, faixa de preço e necessidade de personalização para apontar a melhor entrada da loja.
            </p>
          </div>
          <Link href={advisorHref} className="btn-primary gap-2">
            Abrir recorte sugerido
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-[0.86fr_1.14fr]">
          <div className="glass-card p-6">
            <div className="flex items-center gap-2 text-cyan-100">
              <SlidersHorizontal className="h-4 w-4" />
              <p className="text-sm font-semibold">Configurar busca guiada</p>
            </div>

            <div className="mt-5">
              <p className="text-xs uppercase tracking-[0.18em] text-white/45">Objetivo</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {goals.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setGoal(item.id)}
                    className={`rounded-full border px-3 py-2 text-sm font-semibold transition ${
                      goal === item.id
                        ? "border-cyan-300/35 bg-cyan-300/12 text-cyan-50"
                        : "border-white/10 bg-white/5 text-white/75"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-5">
              <p className="text-xs uppercase tracking-[0.18em] text-white/45">Velocidade</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {speeds.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSpeed(item.id)}
                    className={`rounded-full border px-3 py-2 text-sm font-semibold transition ${
                      speed === item.id
                        ? "border-cyan-300/35 bg-cyan-300/12 text-cyan-50"
                        : "border-white/10 bg-white/5 text-white/75"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-5">
              <p className="text-xs uppercase tracking-[0.18em] text-white/45">Faixa de preço</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {budgets.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setBudget(item.id)}
                    className={`rounded-full border px-3 py-2 text-sm font-semibold transition ${
                      budget === item.id
                        ? "border-cyan-300/35 bg-cyan-300/12 text-cyan-50"
                        : "border-white/10 bg-white/5 text-white/75"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-5 rounded-[20px] border border-white/10 bg-black/20 p-4">
              <label className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-white">Precisa de personalização?</p>
                  <p className="mt-1 text-sm leading-6 text-white/62">
                    Ative quando a compra pedir ajuste de cor, escala ou briefing.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setNeedCustom((current) => !current)}
                  className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                    needCustom
                      ? "border-emerald-300/35 bg-emerald-300/12 text-emerald-100"
                      : "border-white/10 bg-white/5 text-white/75"
                  }`}
                >
                  {needCustom ? "Sim" : "Não"}
                </button>
              </label>
            </div>
          </div>

          <div className="grid gap-4">
            <div className="rounded-[24px] border border-cyan-300/20 bg-cyan-300/10 p-5">
              <div className="flex items-center gap-2 text-cyan-100">
                <Sparkles className="h-4 w-4" />
                <p className="text-sm font-semibold">Leitura rápida</p>
              </div>
              <p className="mt-3 text-sm leading-7 text-white/78">
                Para esse perfil de compra, a loja vai priorizar itens com melhor aderência a {goal.replace("-", " ")}, dentro de uma janela {speed.replace("-", " ")} e na faixa {budget.replace("-", " ")}.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {recommendations.map(({ product, reason }) => (
                <article
                  key={product.id}
                  className="catalog-product-card cursor-pointer rounded-[24px] border border-white/10 bg-card p-4"
                  role="link"
                  tabIndex={0}
                  aria-label={`Abrir ${product.name}`}
                  onClick={(event) => {
                    if (shouldIgnoreCardActivation(event.target)) return;
                    openProduct(product);
                  }}
                  onKeyDown={(event) => {
                    if (shouldIgnoreCardActivation(event.target)) return;
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      openProduct(product);
                    }
                  }}
                >
                  <div className="overflow-hidden rounded-[18px] border border-white/10 bg-white/5">
                    <SafeProductImage product={product} alt={product.name} className="aspect-square w-full object-cover" />
                  </div>
                  <div className="mt-3 flex items-start justify-between gap-3">
                    <div>
                      <h3 className="line-clamp-2 text-base font-semibold text-white">{product.name}</h3>
                      <p className="mt-1 text-xs text-white/55">{product.productionWindow}</p>
                    </div>
                    <ProductVisualBadge product={product} />
                  </div>
                  <p className="mt-3 text-sm leading-6 text-white/66">{reason}</p>
                  <div className="mt-4 flex items-end justify-between gap-3">
                    <p className="text-xl font-black text-white">{formatCurrency(product.pricePix)}</p>
                    <Link href={getProductUrl(product)} className="btn-secondary px-4 py-2 text-sm">
                      Ver item
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
