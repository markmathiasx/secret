import { NextResponse } from "next/server";
import { getServerSessionUser, isAdminSession } from "@/lib/server-session";
import {
  getGroqApiKey,
  getGroqAssistantModel,
  getOllamaAssistantModel,
  getOllamaBaseUrl,
  isGroqConfigured,
} from "@/lib/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

type CostEstimateInput = {
  title?: unknown;
  description?: unknown;
  category?: unknown;
  collection?: unknown;
  material?: unknown;
};

type CostEstimate = {
  estimatedGrams: number;
  estimatedHours: number;
  complexity: number;
  confidence: "low" | "medium" | "high";
  rationale: string;
};

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function round(value: number, decimals = 1) {
  return Number(value.toFixed(decimals));
}

function buildBlob(input: CostEstimateInput) {
  return [
    text(input.title),
    text(input.description),
    text(input.category),
    text(input.collection),
    text(input.material),
  ]
    .join(" ")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}

function heuristicEstimate(input: CostEstimateInput): CostEstimate {
  const blob = buildBlob(input);
  let grams = 42;
  let hours = 2.2;
  let complexity = 1.25;
  const reasons: string[] = ["heurística local baseada em categoria, material e descrição"];

  if (/(chaveiro|pingente|medalha|marcador|lembrancinha)/.test(blob)) {
    grams = 18;
    hours = 0.9;
    complexity = 1.15;
    reasons.push("peça pequena ou brinde");
  }
  if (/(suporte|organizador|porta|gancho|case|controle|fone|headphone|celular|tablet|cabos)/.test(blob)) {
    grams = Math.max(grams, 72);
    hours = Math.max(hours, 3.2);
    complexity = Math.max(complexity, 1.32);
    reasons.push("peça funcional com estrutura");
  }
  if (/(vaso|cachepot|luminaria|decoracao|decorativo|quadro|prateleira|centro de mesa)/.test(blob)) {
    grams = Math.max(grams, 110);
    hours = Math.max(hours, 4.4);
    complexity = Math.max(complexity, 1.42);
    reasons.push("volume decorativo maior");
  }
  if (/(miniatura|colecionavel|chibi|boneco|figura|geek|anime|articulado)/.test(blob)) {
    grams = Math.max(grams, 58);
    hours = Math.max(hours, 3.1);
    complexity = Math.max(complexity, 1.5);
    reasons.push("detalhe visual de colecionável");
  }
  if (/(familia|sob medida|personaliz|relevo|nome 3d|trofeu|mascote|corporativo)/.test(blob)) {
    grams = Math.max(grams, 135);
    hours = Math.max(hours, 6.2);
    complexity = Math.max(complexity, 1.72);
    reasons.push("personalização ou geometria sob medida");
  }
  if (/(silk|metal|transparente|glitter|tpu|resina|pintado)/.test(blob)) {
    complexity += 0.12;
    hours *= 1.08;
    reasons.push("material/acabamento com maior cuidado");
  }
  if (text(input.description).length > 420) {
    grams *= 1.12;
    hours *= 1.12;
    reasons.push("descrição sugere escopo mais completo");
  }

  return {
    estimatedGrams: Math.round(clamp(grams, 5, 100000)),
    estimatedHours: round(clamp(hours, 0.2, 10000), 1),
    complexity: round(clamp(complexity, 0.8, 10), 2),
    confidence: "medium",
    rationale: `${reasons.join("; ")}. ESTIMATE: confirme gramas e horas no slicer antes de salvar como valor final.`,
  };
}

function normalizeEstimate(value: unknown, fallback: CostEstimate): CostEstimate {
  const record = value && typeof value === "object" ? (value as Record<string, unknown>) : {};
  const estimatedGrams = Number(record.estimatedGrams);
  const estimatedHours = Number(record.estimatedHours);
  const complexity = Number(record.complexity);

  return {
    estimatedGrams: Number.isFinite(estimatedGrams) ? Math.round(clamp(estimatedGrams, 5, 100000)) : fallback.estimatedGrams,
    estimatedHours: Number.isFinite(estimatedHours) ? round(clamp(estimatedHours, 0.2, 10000), 1) : fallback.estimatedHours,
    complexity: Number.isFinite(complexity) ? round(clamp(complexity, 0.8, 10), 2) : fallback.complexity,
    confidence: record.confidence === "high" || record.confidence === "medium" || record.confidence === "low" ? record.confidence : "low",
    rationale:
      typeof record.rationale === "string" && record.rationale.trim()
        ? `${record.rationale.trim()} ESTIMATE: confirme gramas e horas no slicer antes de salvar como valor final.`
        : fallback.rationale,
  };
}

function parseJsonObject(content: string) {
  const direct = content.trim();
  try {
    return JSON.parse(direct);
  } catch {
    const match = direct.match(/\{[\s\S]*\}/);
    if (!match) return null;
    try {
      return JSON.parse(match[0]);
    } catch {
      return null;
    }
  }
}

async function requestOpenAiCompatibleEstimate(input: CostEstimateInput, config: { baseUrl: string; apiKey: string; model: string }) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 3500);

  try {
    const response = await fetch(`${config.baseUrl.replace(/\/$/, "")}/chat/completions`, {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model: config.model,
        temperature: 0.1,
        max_tokens: 260,
        messages: [
          {
            role: "system",
            content:
              "Estimate FDM 3D print grams, machine hours, and complexity for an admin pricing calculator. Return only JSON with estimatedGrams, estimatedHours, complexity, confidence, rationale. Label it as estimate in rationale.",
          },
          {
            role: "user",
            content: JSON.stringify({
              title: text(input.title),
              description: text(input.description),
              category: text(input.category),
              collection: text(input.collection),
              material: text(input.material),
            }),
          },
        ],
      }),
    });

    if (!response.ok) throw new Error(`provider_${response.status}`);
    const payload = (await response.json().catch(() => null)) as { choices?: Array<{ message?: { content?: string } }> } | null;
    const content = payload?.choices?.[0]?.message?.content || "";
    return parseJsonObject(content);
  } finally {
    clearTimeout(timeout);
  }
}

async function estimateWithOllama(input: CostEstimateInput) {
  try {
    const result = await requestOpenAiCompatibleEstimate(input, {
      baseUrl: `${getOllamaBaseUrl()}/v1`,
      apiKey: "ollama",
      model: getOllamaAssistantModel(),
    });
    return result ? { provider: "ollama", result } : null;
  } catch {
    return null;
  }
}

async function estimateWithGroq(input: CostEstimateInput) {
  if (!isGroqConfigured()) return null;

  try {
    const result = await requestOpenAiCompatibleEstimate(input, {
      baseUrl: "https://api.groq.com/openai/v1",
      apiKey: getGroqApiKey(),
      model: getGroqAssistantModel(),
    });
    return result ? { provider: "groq", result } : null;
  } catch {
    return null;
  }
}

export async function POST(request: Request, _context: RouteContext) {
  const user = await getServerSessionUser();
  if (!isAdminSession(user)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const input = ((await request.json().catch(() => ({}))) || {}) as CostEstimateInput;
  const fallback = heuristicEstimate(input);
  const aiResult = (await estimateWithOllama(input)) || (await estimateWithGroq(input));

  if (aiResult) {
    return NextResponse.json({
      ok: true,
      source: "ai",
      provider: aiResult.provider,
      note: "ESTIMATE: use como ponto de partida. Valores finais devem vir do slicer.",
      estimate: normalizeEstimate(aiResult.result, fallback),
    });
  }

  return NextResponse.json({
    ok: true,
    source: "fallback",
    provider: "heuristic",
    note: "ESTIMATE: nenhum provedor AI local/remoto configurado respondeu. Heurística sem rede aplicada.",
    estimate: fallback,
  });
}
