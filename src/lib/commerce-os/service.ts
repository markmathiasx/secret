import "server-only";
import { getConversionMetrics } from "@/lib/advanced-analytics";
import { catalog, findProduct, type Product } from "@/lib/catalog";
import { canConnectToDatabase, prisma } from "@/lib/prisma";
import { getAdminCatalogSnapshot } from "@/lib/server/admin-catalog-store";
import { getAdminDashboardSnapshot } from "@/lib/server-store";
import { getProductAvailabilityMode } from "@/lib/product-availability";
import { getProductVisual } from "@/lib/product-visuals";
import { getDeadLetterJobs } from "@/src/lib/platform/jobs/dead-letter";
import { listJobs } from "@/src/lib/platform/jobs/store";
import { deriveOperationalStateFromOrder, validateOperationalState } from "@/src/lib/commerce-os/state-machine";
import { readCommerceOsLedger } from "@/src/lib/commerce-os/store";
import type {
  CommerceAiObservation,
  CommerceOperationalIssue,
  CommerceOsLedger,
  CommerceOsOrderItemRecord,
  CommerceOsOrderRecord,
  CommerceOsPrinterConfig,
  CommerceOsPrinterId,
  CommerceProductionPriority,
} from "@/src/lib/commerce-os/types";

type OperationalProductMatch = {
  product: Product | null;
  quantity: number;
  grams: number;
  hours: number;
  estimatedMargin: number;
  material: string | null;
  color: string | null;
};

export type CommerceOsQueueItem = {
  orderId: string;
  orderNumber: string;
  customerName: string;
  itemSummary: string;
  printerId: CommerceOsPrinterId;
  priority: CommerceProductionPriority;
  blockedReason: string | null;
  materials: string[];
  colors: string[];
  grams: number;
  hours: number;
  estimatedMargin: number;
  slaAt: string | null;
  predictedCompletionAt: string | null;
  delayHours: number | null;
  validationIssues: CommerceOperationalIssue[];
};

export type CommerceOsSupplySnapshot = {
  id: string;
  label: string;
  kind: string;
  unit: "g" | "unit";
  onHand: number | null;
  reserved: number;
  available: number | null;
  reorderLevel: number | null;
  estimatedCost: number | null;
  actualCost: number | null;
  status: "ok" | "critical" | "unconfigured";
};

export type CommerceOsDashboardSnapshot = {
  generatedAt: string;
  notes: string[];
  executive: {
    revenue: number;
    estimatedMargin: number;
    averageTicket: number;
    conversionRate: number | null;
    profitPerMachineHour: number | null;
    queueHours: number;
    delayedOrders: number;
    failureCount30d: number;
    criticalStockCount: number;
  };
  lifecycle: {
    activeOrders: number;
    awaitingPayment: number;
    personalizationBlocked: number;
    printing: number;
    qualityPending: number;
    packingPending: number;
    inTransit: number;
    returnsOpen: number;
    refundsOpen: number;
  };
  queue: {
    printers: Array<{
      id: CommerceOsPrinterId;
      label: string;
      configuredHoursPerDay: number | null;
      backlogHours: number;
      utilization: number | null;
      items: CommerceOsQueueItem[];
    }>;
    delayedItems: CommerceOsQueueItem[];
    blockedItems: CommerceOsQueueItem[];
  };
  inventory: {
    consumables: CommerceOsSupplySnapshot[];
    lowStockProducts: Array<{ id: string; title: string; stock: number }>;
  };
  defects: {
    count30d: number;
    reprints30d: number;
    estimatedMarginImpact30d: number;
    recent: CommerceOsLedger["defects"];
  };
  quality: {
    pendingOrders: Array<{ orderId: string; orderNumber: string; customerName: string }>;
    packagingReady: Array<{ orderId: string; orderNumber: string; customerName: string }>;
    secureEvidenceCount: number;
  };
  ai: {
    assistantGrounded: boolean;
    recommendationEngine: "hybrid_deterministic";
    avgLatencyMs: number | null;
    errorRate: number | null;
    handoffRate: number | null;
    estimatedCostUsd30d: number;
    anomalies: string[];
  };
  growth: {
    verifiedReviewEligible: number;
    rebuyEligible: number;
    referralEligible: number;
    antiAbuseRules: string[];
    actions: string[];
  };
  jobs: {
    queued: number;
    running: number;
    failed: number;
    deadLetter: number;
    duplicateProtection: string[];
  };
  copilot: Array<{
    id: string;
    title: string;
    rationale: string;
    domain: "production" | "inventory" | "growth" | "ai" | "orders";
    requiresApproval: boolean;
  }>;
};

function nowIso() {
  return new Date().toISOString();
}

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();
}

function formatItemSummary(items: CommerceOsOrderItemRecord[]) {
  return items
    .slice(0, 2)
    .map((item) => `${item.title} x${item.quantity}`)
    .join(" | ");
}

function toNumber(value: unknown, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function parseProductionWindowDays(value: string | undefined) {
  const matches = String(value || "").match(/\d+/g);
  if (!matches?.length) return null;
  if (matches.length === 1) return Number(matches[0]);
  const values = matches.map(Number).filter(Number.isFinite);
  if (!values.length) return null;
  return Math.ceil(values.reduce((sum, item) => sum + item, 0) / values.length);
}

function addBusinessDays(isoDate: string, businessDays: number) {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return null;
  let remaining = Math.max(0, Math.ceil(businessDays));
  while (remaining > 0) {
    date.setDate(date.getDate() + 1);
    const weekDay = date.getDay();
    if (weekDay !== 0 && weekDay !== 6) {
      remaining -= 1;
    }
  }
  return date.toISOString();
}

function estimateCompletionAt(startIso: string, cumulativeHours: number, hoursPerDay: number | null) {
  if (!hoursPerDay || hoursPerDay <= 0) return null;
  return addBusinessDays(startIso, cumulativeHours / hoursPerDay);
}

function hoursBetween(startIso: string, endIso: string) {
  const start = new Date(startIso);
  const end = new Date(endIso);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return null;
  return Number(((end.getTime() - start.getTime()) / (1000 * 60 * 60)).toFixed(2));
}

function matchProductForItem(item: CommerceOsOrderItemRecord) {
  if (item.productId) {
    const direct = findProduct(item.productId);
    if (direct) return direct;
  }

  const normalizedSku = normalizeText(item.sku);
  const bySku = catalog.find((product) => normalizeText(product.sku) === normalizedSku);
  if (bySku) return bySku;

  const normalizedTitle = normalizeText(item.title);
  return (
    catalog.find(
      (product) =>
        normalizeText(product.name) === normalizedTitle ||
        normalizedTitle.includes(normalizeText(product.name)) ||
        normalizeText(product.name).includes(normalizedTitle)
    ) || null
  );
}

function resolveOperationalMatch(item: CommerceOsOrderItemRecord): OperationalProductMatch {
  const product = matchProductForItem(item);
  const quantity = Math.max(1, item.quantity);
  const grams = toNumber(product?.estimatedGrams ?? product?.grams, 0) * quantity;
  const hours = toNumber(product?.estimatedHours ?? product?.hours, 0) * quantity;
  const estimatedUnitCost = toNumber(product?.estimatedUnitCost, 0);
  const estimatedMargin = estimatedUnitCost > 0 ? Number((item.totalPrice - estimatedUnitCost * quantity).toFixed(2)) : 0;

  return {
    product,
    quantity,
    grams,
    hours,
    estimatedMargin,
    material: item.material || product?.material || null,
    color: item.color || product?.colors[0] || null,
  };
}

function inferPrinterId(matches: OperationalProductMatch[]) {
  const prefersMini = matches.some((match) => {
    if (!match.product) return false;
    return match.product.collection.includes("A1 Mini") || normalizeText(match.product.sku).startsWith("mw-a1");
  });

  return prefersMini ? "bambu-a1-mini" : "bambu-a1";
}

function derivePriority(
  order: CommerceOsOrderRecord,
  blockedReason: string | null,
  slaAt: string | null,
  totalUnits: number
): CommerceProductionPriority {
  if (blockedReason) return "critical";
  if (slaAt) {
    const delay = hoursBetween(nowIso(), slaAt);
    if (typeof delay === "number" && delay < 24) return "critical";
    if (typeof delay === "number" && delay < 72) return "rush";
  }
  if (totalUnits >= 20) return "batch";
  if (normalizeText(order.status).includes("print")) return "rush";
  return "normal";
}

function buildSlaAt(order: CommerceOsOrderRecord, matches: OperationalProductMatch[], overrideSla?: string | null) {
  if (overrideSla) return overrideSla;
  const firstProduct = matches.find((match) => match.product)?.product;
  const days = parseProductionWindowDays(firstProduct?.productionWindow);
  if (!days) return null;
  return addBusinessDays(order.paidAt || order.createdAt, days);
}

function mapLifecycleOrder(order: CommerceOsOrderRecord, ledger: CommerceOsLedger) {
  const override = ledger.orders.find((entry) => entry.orderId === order.id) || null;
  const state = deriveOperationalStateFromOrder(order, override);
  const issues = validateOperationalState(state);
  const matches = order.items.map(resolveOperationalMatch);
  const totalUnits = matches.reduce((sum, item) => sum + item.quantity, 0);
  const grams = Number(matches.reduce((sum, item) => sum + item.grams, 0).toFixed(2));
  const hours = Number(matches.reduce((sum, item) => sum + item.hours, 0).toFixed(2));
  const estimatedMargin = Number(matches.reduce((sum, item) => sum + item.estimatedMargin, 0).toFixed(2));
  const materials = Array.from(new Set(matches.map((item) => item.material).filter(Boolean))) as string[];
  const colors = Array.from(new Set(matches.map((item) => item.color).filter(Boolean))) as string[];
  const blockedReason = override?.blockedReason || override?.holdReason || (state.personalizationStage === "blocked" ? "Personalização bloqueada." : null);
  const printerId = override?.assignedPrinterId || inferPrinterId(matches);
  const slaAt = buildSlaAt(order, matches, override?.slaAt || null);
  const priority = (override?.priority as CommerceProductionPriority | null) || derivePriority(order, blockedReason, slaAt, totalUnits);

  return {
    order,
    state,
    issues,
    matches,
    grams,
    hours,
    estimatedMargin,
    materials,
    colors,
    blockedReason,
    printerId,
    slaAt,
    priority,
  };
}

async function loadOperationalOrders(): Promise<CommerceOsOrderRecord[]> {
  if (await canConnectToDatabase()) {
    const orders = await prisma.order.findMany({
      take: 120,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        items: true,
        payments: true,
        shipment: true,
      },
    });

    return orders.map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      status: order.status,
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod,
      grandTotal: toNumber(order.grandTotal),
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
      paidAt: order.paidAt?.toISOString() || null,
      notes: order.notes,
      items: order.items.map((item) => ({
        id: item.id,
        productId: item.productId,
        title: item.title,
        sku: item.sku,
        quantity: item.quantity,
        unitPrice: toNumber(item.unitPrice),
        totalPrice: toNumber(item.totalPrice),
        color: item.color,
        material: item.material,
        customizationNotes: item.customizationNotes,
        customizations: item.customizations,
      })),
      payments: order.payments.map((payment) => ({
        id: payment.id,
        status: payment.status,
        method: payment.method,
        amount: toNumber(payment.amount),
        paidAt: payment.paidAt?.toISOString() || null,
        externalReference: payment.externalReference,
      })),
      shipment: order.shipment
        ? {
            status: order.shipment.status,
            carrier: order.shipment.carrier,
            trackingCode: order.shipment.trackingCode,
            trackingUrl: order.shipment.trackingUrl,
            postedAt: order.shipment.postedAt?.toISOString() || null,
            deliveredAt: order.shipment.deliveredAt?.toISOString() || null,
          }
        : null,
    }));
  }

  const fallback = await getAdminDashboardSnapshot();
  return (fallback.recentOrders || []).map((order) => {
    const unitTotal = toNumber(order.total_pix || order.total_card || 0);
    return {
      id: order.id,
      orderNumber: order.order_code,
      customerName: order.customer_name,
      customerEmail: order.email,
      status: order.status.toUpperCase(),
      paymentStatus: order.payment_status?.toUpperCase() || null,
      paymentMethod: order.payment_method?.toUpperCase() || null,
      grandTotal: unitTotal,
      createdAt: order.created_at,
      updatedAt: order.created_at,
      paidAt: order.payment_status?.toLowerCase() === "paid" ? order.created_at : null,
      notes: null,
      items: [
        {
          id: `${order.id}:0`,
          productId: null,
          title: order.product_name,
          sku: order.product_name,
          quantity: 1,
          unitPrice: unitTotal,
          totalPrice: unitTotal,
          color: null,
          material: null,
          customizationNotes: null,
          customizations: null,
        },
      ],
      payments: [
        {
          id: `${order.id}:payment`,
          status: order.payment_status || "PENDING",
          method: order.payment_method || "PIX",
          amount: unitTotal,
          paidAt: order.payment_status?.toLowerCase() === "paid" ? order.created_at : null,
          externalReference: order.order_code,
        },
      ],
      shipment: null,
    };
  });
}

function buildQueue(
  printers: CommerceOsPrinterConfig[],
  orders: ReturnType<typeof mapLifecycleOrder>[]
) {
  const printerBuckets = new Map(
    printers.map((printer) => [
      printer.id,
      {
        id: printer.id,
        label: printer.label,
        configuredHoursPerDay: printer.configuredHoursPerDay,
        backlogHours: 0,
        utilization: null as number | null,
        items: [] as CommerceOsQueueItem[],
      },
    ])
  );

  const priorityRank: Record<CommerceProductionPriority, number> = {
    critical: 0,
    rush: 1,
    normal: 2,
    batch: 3,
  };

  const queueCandidates = orders
    .filter((entry) => entry.state.paymentStage === "paid")
    .filter((entry) => entry.state.orderStage !== "completed" && entry.state.orderStage !== "cancelled")
    .sort((left, right) => {
      const rankDiff = priorityRank[left.priority] - priorityRank[right.priority];
      if (rankDiff !== 0) return rankDiff;
      return left.order.createdAt.localeCompare(right.order.createdAt);
    });

  for (const entry of queueCandidates) {
    const bucket = printerBuckets.get(entry.printerId);
    if (!bucket) continue;
    const currentBacklogHours = bucket.backlogHours;
    const predictedCompletionAt = entry.blockedReason
      ? null
      : estimateCompletionAt(nowIso(), currentBacklogHours + entry.hours, bucket.configuredHoursPerDay);
    const delayHours =
      predictedCompletionAt && entry.slaAt ? hoursBetween(entry.slaAt, predictedCompletionAt) : null;

    const item: CommerceOsQueueItem = {
      orderId: entry.order.id,
      orderNumber: entry.order.orderNumber,
      customerName: entry.order.customerName || "Cliente sem nome",
      itemSummary: formatItemSummary(entry.order.items),
      printerId: entry.printerId,
      priority: entry.priority,
      blockedReason: entry.blockedReason,
      materials: entry.materials,
      colors: entry.colors,
      grams: entry.grams,
      hours: entry.hours,
      estimatedMargin: entry.estimatedMargin,
      slaAt: entry.slaAt,
      predictedCompletionAt,
      delayHours: typeof delayHours === "number" && delayHours > 0 ? delayHours : 0,
      validationIssues: entry.issues,
    };

    bucket.items.push(item);
    bucket.backlogHours = Number((bucket.backlogHours + entry.hours).toFixed(2));
  }

  const printersWithUtilization = [...printerBuckets.values()].map((bucket) => ({
    ...bucket,
    utilization:
      bucket.configuredHoursPerDay && bucket.configuredHoursPerDay > 0
        ? Number((bucket.backlogHours / bucket.configuredHoursPerDay).toFixed(2))
        : null,
  }));

  const delayedItems = printersWithUtilization
    .flatMap((printer) => printer.items)
    .filter((item) => (item.delayHours || 0) > 0);
  const blockedItems = printersWithUtilization.flatMap((printer) => printer.items).filter((item) => item.blockedReason);

  return {
    printers: printersWithUtilization,
    delayedItems,
    blockedItems,
  };
}

function needsHardwareAccessory(match: OperationalProductMatch) {
  const label = normalizeText(
    [match.product?.name, match.product?.category, match.product?.subcategory, match.product?.theme].filter(Boolean).join(" ")
  );
  return /chaveir|pingente|tag|lembranc|brinde/.test(label);
}

function buildInventoryDemand(orders: ReturnType<typeof mapLifecycleOrder>[], ledger: CommerceOsLedger) {
  const demand = new Map<
    string,
    {
      id: string;
      label: string;
      kind: string;
      unit: "g" | "unit";
      reserved: number;
      estimatedCost: number;
      actualCost: number | null;
      onHand: number | null;
      reorderLevel: number | null;
    }
  >();

  function upsertDemand(id: string, label: string, kind: string, unit: "g" | "unit", quantity: number) {
    const configured = ledger.consumables.find((item) => item.id === id) || null;
    const current = demand.get(id) || {
      id,
      label,
      kind,
      unit,
      reserved: 0,
      estimatedCost: 0,
      actualCost: configured?.actualUnitCost !== null && configured?.actualUnitCost !== undefined ? 0 : null,
      onHand: configured?.onHand ?? null,
      reorderLevel: configured?.reorderLevel ?? null,
    };
    current.reserved += quantity;
    current.estimatedCost += quantity * (configured?.estimatedUnitCost || 0);
    current.actualCost =
      current.actualCost === null || configured?.actualUnitCost === null || configured?.actualUnitCost === undefined
        ? current.actualCost
        : current.actualCost + quantity * configured.actualUnitCost;
    demand.set(id, current);
  }

  for (const entry of orders) {
    if (entry.state.paymentStage !== "paid") continue;
    for (const match of entry.matches) {
      if (match.grams > 0) {
        const filamentId = `filament:${normalizeText(match.material || "pla")}::${normalizeText(match.color || "padrao")}`;
        const filamentLabel = `Filamento ${match.material || "PLA"}${match.color ? ` ${match.color}` : ""}`;
        upsertDemand(filamentId, filamentLabel, "filament", "g", match.grams);
      }

      if (needsHardwareAccessory(match)) {
        upsertDemand("keyring:standard", "Argola padrão", "keyring", "unit", match.quantity);
        upsertDemand("chain:standard", "Corrente padrão", "chain", "unit", match.quantity);
      }

      upsertDemand("packaging:individual", "Embalagem individual", "packaging", "unit", match.quantity);
    }

    if (entry.state.shippingStage !== "delivered" && entry.state.shippingStage !== "returned") {
      upsertDemand("label:shipping", "Etiqueta de envio", "label", "unit", 1);
    }
  }

  return [...demand.values()]
    .map((item) => ({
      id: item.id,
      label: item.label,
      kind: item.kind,
      unit: item.unit,
      onHand: item.onHand,
      reserved: Number(item.reserved.toFixed(2)),
      available: item.onHand === null ? null : Number((item.onHand - item.reserved).toFixed(2)),
      reorderLevel: item.reorderLevel,
      estimatedCost: Number(item.estimatedCost.toFixed(2)),
      actualCost: item.actualCost === null ? null : Number(item.actualCost.toFixed(2)),
      status:
        item.onHand === null || item.reorderLevel === null
          ? ("unconfigured" as const)
          : item.onHand - item.reserved <= item.reorderLevel
            ? ("critical" as const)
            : ("ok" as const),
    }))
    .sort((left, right) => Number(left.status === "critical") - Number(right.status === "critical"));
}

function summarizeAiObservability(observations: CommerceAiObservation[]) {
  const recent = observations.filter((item) => new Date(item.createdAt).getTime() >= Date.now() - 30 * 24 * 60 * 60 * 1000);
  if (!recent.length) {
    return {
      avgLatencyMs: null,
      errorRate: null,
      handoffRate: null,
      estimatedCostUsd30d: 0,
      anomalies: ["Sem observações registradas ainda para IA e operação."],
    };
  }

  const avgLatencyMs = recent.reduce((sum, item) => sum + item.latencyMs, 0) / recent.length;
  const errors = recent.filter((item) => item.outcome === "error").length;
  const handoffs = recent.filter((item) => item.humanEscalation || item.outcome === "handoff").length;
  const estimatedCostUsd30d = recent.reduce((sum, item) => sum + Number(item.estimatedCostUsd || 0), 0);
  const anomalies: string[] = [];

  if (avgLatencyMs > 4_000) {
    anomalies.push("Latência média acima de 4s nas superfícies monitoradas.");
  }
  if (errors / recent.length > 0.15) {
    anomalies.push("Taxa de erro acima de 15% nas últimas observações.");
  }
  if (handoffs / recent.length > 0.3) {
    anomalies.push("Escalonamento humano acima de 30%; revisar grounding e cobertura.");
  }

  return {
    avgLatencyMs: Number(avgLatencyMs.toFixed(0)),
    errorRate: Number((errors / recent.length).toFixed(2)),
    handoffRate: Number((handoffs / recent.length).toFixed(2)),
    estimatedCostUsd30d: Number(estimatedCostUsd30d.toFixed(4)),
    anomalies: anomalies.length ? anomalies : ["Sem anomalias relevantes nas últimas observações."],
  };
}

export function buildAdminCopilotSuggestions(snapshot: CommerceOsDashboardSnapshot) {
  const suggestions: CommerceOsDashboardSnapshot["copilot"] = [];

  if (snapshot.queue.delayedItems.length > 0) {
    suggestions.push({
      id: "reprioritize-delays",
      title: "Repriorizar fila com risco de atraso",
      rationale: `${snapshot.queue.delayedItems.length} itens já estouram ou encostam no SLA calculado.`,
      domain: "production",
      requiresApproval: true,
    });
  }

  if (snapshot.inventory.consumables.some((item) => item.status === "critical")) {
    suggestions.push({
      id: "replenish-critical-supplies",
      title: "Repor consumíveis críticos",
      rationale: "Há reserva maior que o saldo seguro para pelo menos um insumo operacional.",
      domain: "inventory",
      requiresApproval: true,
    });
  }

  if (snapshot.growth.verifiedReviewEligible > 0) {
    suggestions.push({
      id: "launch-verified-review-batch",
      title: "Disparar lote de avaliação verificada",
      rationale: `${snapshot.growth.verifiedReviewEligible} pedidos entregues podem pedir avaliação com prova de compra.`,
      domain: "growth",
      requiresApproval: true,
    });
  }

  if ((snapshot.ai.errorRate || 0) > 0.15 || (snapshot.ai.handoffRate || 0) > 0.3) {
    suggestions.push({
      id: "tighten-grounding",
      title: "Apertar grounding e fallback do assistente",
      rationale: "Sinais recentes indicam excesso de erro ou escalonamento manual.",
      domain: "ai",
      requiresApproval: true,
    });
  }

  if (snapshot.executive.averageTicket > 0 && snapshot.executive.estimatedMargin / snapshot.executive.revenue < 0.25) {
    suggestions.push({
      id: "bundle-low-margin-orders",
      title: "Sugerir kits para pedidos de margem comprimida",
      rationale: "A margem observada está pressionada; vale elevar ticket com kits e cross-sell aprovado.",
      domain: "orders",
      requiresApproval: true,
    });
  }

  return suggestions;
}

export async function getCommerceOsDashboard(): Promise<CommerceOsDashboardSnapshot> {
  const [ledger, orders, catalogSnapshot] = await Promise.all([
    Promise.resolve(readCommerceOsLedger()),
    loadOperationalOrders(),
    getAdminCatalogSnapshot(),
  ]);

  const operationalOrders = orders.map((order) => mapLifecycleOrder(order, ledger));
  const queue = buildQueue(ledger.printers, operationalOrders);
  const consumables = buildInventoryDemand(operationalOrders, ledger);
  const lowStockProducts = catalogSnapshot
    .filter((product) => product.stock <= 3)
    .slice(0, 10)
    .map((product) => ({ id: product.id, title: product.title, stock: product.stock }));
  const ai = summarizeAiObservability(ledger.aiObservability);

  const paidOrders = operationalOrders.filter((entry) => entry.state.paymentStage === "paid");
  const revenue = paidOrders.reduce((sum, entry) => sum + entry.order.grandTotal, 0);
  const estimatedMargin = paidOrders.reduce((sum, entry) => sum + entry.estimatedMargin, 0);
  const machineHours = paidOrders.reduce((sum, entry) => sum + entry.hours, 0);
  const returnsOpen = operationalOrders.filter((entry) => entry.state.returnStage !== "not_requested" && entry.state.returnStage !== "closed").length;
  const refundsOpen = operationalOrders.filter((entry) => entry.state.refundStage === "pending" || entry.state.refundStage === "approved").length;
  const defects30d = ledger.defects.filter((defect) => new Date(defect.createdAt).getTime() >= Date.now() - 30 * 24 * 60 * 60 * 1000);
  const secureEvidenceCount =
    ledger.qualityChecks.reduce((sum, record) => sum + (record.evidence?.filter((item) => item.visibility === "internal" || item.visibility === "customer_safe").length || 0), 0) +
    ledger.packagingChecks.reduce((sum, record) => sum + (record.evidence?.filter((item) => item.visibility === "internal" || item.visibility === "customer_safe").length || 0), 0);

  let conversionRate: number | null = null;
  try {
    const conversion = await getConversionMetrics(30);
    conversionRate = Number((conversion.purchase_rate * 100).toFixed(2));
  } catch {
    conversionRate = null;
  }

  const deliveredOrders = operationalOrders.filter((entry) => entry.state.shippingStage === "delivered");
  const olderThan45d = deliveredOrders.filter(
    (entry) => new Date(entry.order.createdAt).getTime() <= Date.now() - 45 * 24 * 60 * 60 * 1000
  );

  const jobs = listJobs();
  const deadLetters = getDeadLetterJobs();
  const notes: string[] = [];

  if (ledger.printers.some((printer) => printer.configuredHoursPerDay === null)) {
    notes.push("A capacidade diária das impressoras ainda não foi configurada; o dashboard não inventa horas disponíveis.");
  }

  if (consumables.some((item) => item.status === "unconfigured")) {
    notes.push("Parte dos insumos ainda está sem saldo real configurado; reservas e custos continuam calculados sem mascarar lacunas.");
  }

  const snapshot: CommerceOsDashboardSnapshot = {
    generatedAt: nowIso(),
    notes,
    executive: {
      revenue: Number(revenue.toFixed(2)),
      estimatedMargin: Number(estimatedMargin.toFixed(2)),
      averageTicket: paidOrders.length ? Number((revenue / paidOrders.length).toFixed(2)) : 0,
      conversionRate,
      profitPerMachineHour: machineHours > 0 ? Number((estimatedMargin / machineHours).toFixed(2)) : null,
      queueHours: Number(queue.printers.reduce((sum, printer) => sum + printer.backlogHours, 0).toFixed(2)),
      delayedOrders: queue.delayedItems.length,
      failureCount30d: defects30d.length,
      criticalStockCount: consumables.filter((item) => item.status === "critical").length + lowStockProducts.length,
    },
    lifecycle: {
      activeOrders: operationalOrders.filter((entry) => entry.state.orderStage === "confirmed" || entry.state.orderStage === "in_fulfillment").length,
      awaitingPayment: operationalOrders.filter((entry) => entry.state.orderStage === "awaiting_payment").length,
      personalizationBlocked: operationalOrders.filter((entry) => entry.state.personalizationStage === "blocked").length,
      printing: operationalOrders.filter((entry) => entry.state.productionStage === "printing").length,
      qualityPending: operationalOrders.filter((entry) => entry.state.productionStage === "completed" && entry.state.qualityStage !== "passed").length,
      packingPending: operationalOrders.filter((entry) => entry.state.qualityStage === "passed" && entry.state.packagingStage !== "packed").length,
      inTransit: operationalOrders.filter((entry) => entry.state.shippingStage === "in_transit").length,
      returnsOpen,
      refundsOpen,
    },
    queue,
    inventory: {
      consumables,
      lowStockProducts,
    },
    defects: {
      count30d: defects30d.length,
      reprints30d: defects30d.filter((item) => item.reprintRequired).length,
      estimatedMarginImpact30d: Number(defects30d.reduce((sum, item) => sum + item.estimatedMarginImpact, 0).toFixed(2)),
      recent: defects30d.slice(-8).reverse(),
    },
    quality: {
      pendingOrders: operationalOrders
        .filter((entry) => entry.state.productionStage === "completed" && entry.state.qualityStage !== "passed")
        .slice(0, 8)
        .map((entry) => ({
          orderId: entry.order.id,
          orderNumber: entry.order.orderNumber,
          customerName: entry.order.customerName || "Cliente sem nome",
        })),
      packagingReady: operationalOrders
        .filter((entry) => entry.state.qualityStage === "passed" && entry.state.packagingStage !== "packed")
        .slice(0, 8)
        .map((entry) => ({
          orderId: entry.order.id,
          orderNumber: entry.order.orderNumber,
          customerName: entry.order.customerName || "Cliente sem nome",
        })),
      secureEvidenceCount,
    },
    ai: {
      assistantGrounded: true,
      recommendationEngine: "hybrid_deterministic",
      avgLatencyMs: ai.avgLatencyMs,
      errorRate: ai.errorRate,
      handoffRate: ai.handoffRate,
      estimatedCostUsd30d: ai.estimatedCostUsd30d,
      anomalies: ai.anomalies,
    },
    growth: {
      verifiedReviewEligible: deliveredOrders.length,
      rebuyEligible: olderThan45d.length,
      referralEligible: deliveredOrders.length,
      antiAbuseRules: [
        "Cupom por CPF/e-mail/telefone e janela mínima entre resgates.",
        "Avaliação verificada somente após entrega ou confirmação manual de pagamento.",
        "Indicação só valida na primeira compra liquidada do indicado.",
        "Lote B2B exige revisão humana para desconto progressivo e frete especial.",
      ],
      actions: [
        queue.delayedItems.length > 0
          ? "Repriorizar itens em atraso e travar novos rush até estabilizar a fila."
          : "Manter fila limpa e puxar jobs de pós-venda para crescer recompra.",
        consumables.some((item) => item.status === "critical")
          ? "Comprar ou recontar consumíveis críticos antes de aceitar novos lotes."
          : "Usar saldo de insumos para empurrar kits e lotes com melhor margem.",
        deliveredOrders.length > 0
          ? "Disparar avaliação verificada e recompra apenas para pedidos entregues."
          : "Aguardar entregas reais antes de ativar campanhas de review e indicação.",
      ],
    },
    jobs: {
      queued: jobs.filter((job) => job.status === "queued").length,
      running: jobs.filter((job) => job.status === "running").length,
      failed: jobs.filter((job) => job.status === "failed").length,
      deadLetter: deadLetters.length,
      duplicateProtection: [
        "idempotencyKey por tipo e payload sanitizado",
        "lockKey por domínio crítico",
        "retry limitado com dead-letter local",
      ],
    },
    copilot: [],
  };

  snapshot.copilot = buildAdminCopilotSuggestions(snapshot);
  return snapshot;
}
