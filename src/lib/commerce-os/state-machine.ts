import type {
  CommerceOperationalIssue,
  CommerceOperationalState,
  CommerceOrderOperationalRecord,
  CommerceOsOrderRecord,
} from "@/src/lib/commerce-os/types";

const orderTransitions = {
  draft: ["awaiting_payment", "cancelled"],
  awaiting_payment: ["confirmed", "cancelled"],
  confirmed: ["in_fulfillment", "cancelled"],
  in_fulfillment: ["completed", "cancelled"],
  completed: [],
  cancelled: [],
} as const;

const paymentTransitions = {
  pending: ["authorized", "paid", "failed", "cancelled"],
  authorized: ["paid", "failed", "cancelled"],
  paid: ["refunded"],
  failed: [],
  cancelled: [],
  refunded: [],
} as const;

const personalizationTransitions = {
  not_required: [],
  awaiting_input: ["in_review", "blocked"],
  in_review: ["approved", "blocked"],
  approved: [],
  blocked: ["awaiting_input", "in_review", "approved"],
} as const;

const productionTransitions = {
  not_started: ["queued", "blocked"],
  queued: ["printing", "blocked"],
  printing: ["completed", "reprint", "blocked"],
  blocked: ["queued", "printing", "reprint", "completed"],
  reprint: ["queued", "printing", "completed", "blocked"],
  completed: [],
} as const;

const qualityTransitions = {
  pending: ["in_review", "passed", "failed"],
  in_review: ["passed", "failed"],
  passed: [],
  failed: ["in_review", "passed"],
} as const;

const packagingTransitions = {
  pending: ["packing", "packed"],
  packing: ["packed"],
  packed: [],
} as const;

const shippingTransitions = {
  not_ready: ["label_pending", "posted"],
  label_pending: ["posted"],
  posted: ["in_transit", "delivered", "returned"],
  in_transit: ["delivered", "returned"],
  delivered: ["returned"],
  returned: [],
} as const;

const returnTransitions = {
  not_requested: ["requested"],
  requested: ["approved", "closed"],
  approved: ["received", "closed"],
  received: ["closed"],
  closed: [],
} as const;

const refundTransitions = {
  not_requested: ["pending"],
  pending: ["approved", "rejected", "paid"],
  approved: ["paid", "rejected"],
  paid: [],
  rejected: [],
} as const;

type CommerceStageField = keyof CommerceOperationalState;

const transitionMaps: Record<CommerceStageField, Record<string, readonly string[]>> = {
  orderStage: orderTransitions,
  paymentStage: paymentTransitions,
  personalizationStage: personalizationTransitions,
  productionStage: productionTransitions,
  qualityStage: qualityTransitions,
  packagingStage: packagingTransitions,
  shippingStage: shippingTransitions,
  returnStage: returnTransitions,
  refundStage: refundTransitions,
};

function hasPersonalization(order: CommerceOsOrderRecord) {
  return order.items.some(
    (item) =>
      Boolean(item.customizationNotes && item.customizationNotes.trim()) ||
      (typeof item.customizations === "object" && item.customizations !== null)
  );
}

function normalizeStatus(value: string | null | undefined) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

export function createInitialOperationalState(): CommerceOperationalState {
  return {
    orderStage: "draft",
    paymentStage: "pending",
    personalizationStage: "not_required",
    productionStage: "not_started",
    qualityStage: "pending",
    packagingStage: "pending",
    shippingStage: "not_ready",
    returnStage: "not_requested",
    refundStage: "not_requested",
  };
}

export function canTransitionOperationalStage<K extends CommerceStageField>(
  field: K,
  current: CommerceOperationalState[K],
  next: CommerceOperationalState[K]
) {
  if (current === next) return true;
  return transitionMaps[field][current]?.includes(next) || false;
}

export function transitionOperationalState<K extends CommerceStageField>(
  current: CommerceOperationalState,
  field: K,
  next: CommerceOperationalState[K]
) {
  if (!canTransitionOperationalStage(field, current[field], next)) {
    return {
      ok: false,
      nextState: current,
      issues: [
        {
          field,
          severity: "critical",
          code: "invalid_transition",
          message: `Transição inválida em ${field}: ${current[field]} -> ${next}.`,
        } satisfies CommerceOperationalIssue,
      ],
    };
  }

  const nextState = { ...current, [field]: next };
  const issues = validateOperationalState(nextState);
  return {
    ok: !issues.some((issue) => issue.severity === "critical"),
    nextState,
    issues,
  };
}

function mapOrderStage(order: CommerceOsOrderRecord) {
  const status = normalizeStatus(order.status);
  if (status.includes("cancel")) return "cancelled" as const;
  if (status.includes("refund")) return "cancelled" as const;
  if (status.includes("deliver")) return "completed" as const;
  if (status.includes("ship") || status.includes("ready_to_ship") || status.includes("print")) return "in_fulfillment" as const;
  if (status.includes("paid")) return "confirmed" as const;
  if (status.includes("pending")) return "awaiting_payment" as const;
  return "draft" as const;
}

function mapPaymentStage(order: CommerceOsOrderRecord) {
  const status = normalizeStatus(order.paymentStatus || order.payments[0]?.status);
  if (status.includes("refund")) return "refunded" as const;
  if (status === "paid") return "paid" as const;
  if (status.includes("author")) return "authorized" as const;
  if (status.includes("cancel")) return "cancelled" as const;
  if (status.includes("fail")) return "failed" as const;
  return "pending" as const;
}

function mapShippingStage(order: CommerceOsOrderRecord) {
  const status = normalizeStatus(order.shipment?.status || order.status);
  if (status.includes("return")) return "returned" as const;
  if (status.includes("deliver")) return "delivered" as const;
  if (status.includes("transit")) return "in_transit" as const;
  if (status.includes("ship") || Boolean(order.shipment?.trackingCode)) return "posted" as const;
  if (status.includes("label") || status.includes("pack")) return "label_pending" as const;
  return "not_ready" as const;
}

function mapProductionStage(order: CommerceOsOrderRecord, override?: CommerceOrderOperationalRecord | null) {
  if (override?.blockedReason || override?.holdReason) return "blocked" as const;
  if (override?.productionStage) return override.productionStage;
  const status = normalizeStatus(order.status);
  if (status.includes("deliver") || status.includes("ship") || status.includes("ready_to_ship")) return "completed" as const;
  if (status.includes("print")) return "printing" as const;
  if (mapPaymentStage(order) === "paid") return "queued" as const;
  return "not_started" as const;
}

export function deriveOperationalStateFromOrder(
  order: CommerceOsOrderRecord,
  override?: CommerceOrderOperationalRecord | null
): CommerceOperationalState {
  const orderStage = mapOrderStage(order);
  const paymentStage = mapPaymentStage(order);
  const shippingStage = override?.shippingStage || mapShippingStage(order);
  const personalizationStage =
    override?.personalizationStage ||
    (hasPersonalization(order) ? "awaiting_input" : "not_required");
  const productionStage = mapProductionStage(order, override);
  const qualityStage =
    override?.qualityStage ||
    (productionStage === "completed" ? "pending" : productionStage === "blocked" ? "pending" : "pending");
  const packagingStage =
    override?.packagingStage ||
    (shippingStage === "posted" || shippingStage === "in_transit" || shippingStage === "delivered" ? "packed" : "pending");
  const returnStage =
    override?.returnStage ||
    (shippingStage === "returned" ? "received" : "not_requested");
  const refundStage =
    override?.refundStage ||
    (paymentStage === "refunded" ? "paid" : "not_requested");

  return {
    orderStage,
    paymentStage,
    personalizationStage,
    productionStage,
    qualityStage,
    packagingStage,
    shippingStage,
    returnStage,
    refundStage,
  };
}

export function validateOperationalState(state: CommerceOperationalState) {
  const issues: CommerceOperationalIssue[] = [];

  if (state.productionStage === "printing" && state.paymentStage !== "paid") {
    issues.push({
      field: "productionStage",
      severity: "critical",
      code: "payment_required_before_printing",
      message: "Produção não pode avançar para impressão sem pagamento confirmado.",
    });
  }

  if (state.personalizationStage === "blocked" && state.productionStage !== "blocked") {
    issues.push({
      field: "personalizationStage",
      severity: "warning",
      code: "blocked_personalization_without_hold",
      message: "Personalização bloqueada deveria refletir um bloqueio operacional na produção.",
    });
  }

  if (state.qualityStage === "passed" && state.productionStage !== "completed") {
    issues.push({
      field: "qualityStage",
      severity: "critical",
      code: "quality_before_completion",
      message: "QC aprovado exige produção concluída.",
    });
  }

  if ((state.packagingStage === "packing" || state.packagingStage === "packed") && state.qualityStage !== "passed") {
    issues.push({
      field: "packagingStage",
      severity: "critical",
      code: "packaging_before_qc",
      message: "Embalagem só pode avançar depois de QC aprovado.",
    });
  }

  if (
    (state.shippingStage === "posted" || state.shippingStage === "in_transit" || state.shippingStage === "delivered") &&
    state.packagingStage !== "packed"
  ) {
    issues.push({
      field: "shippingStage",
      severity: "critical",
      code: "shipment_before_packaging",
      message: "Envio exige embalagem concluída.",
    });
  }

  if (state.orderStage === "completed" && state.shippingStage !== "delivered") {
    issues.push({
      field: "orderStage",
      severity: "warning",
      code: "completed_without_delivery",
      message: "Pedido concluído sem entrega confirmada.",
    });
  }

  if (state.returnStage !== "not_requested" && state.shippingStage === "not_ready") {
    issues.push({
      field: "returnStage",
      severity: "warning",
      code: "return_without_shipment",
      message: "Fluxo de devolução acionado sem histórico de envio.",
    });
  }

  if ((state.refundStage === "pending" || state.refundStage === "approved" || state.refundStage === "paid") && state.paymentStage !== "paid" && state.paymentStage !== "refunded") {
    issues.push({
      field: "refundStage",
      severity: "warning",
      code: "refund_without_paid_payment",
      message: "Reembolso acionado sem pagamento liquidado anteriormente.",
    });
  }

  return issues;
}
