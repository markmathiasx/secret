export const commerceOsPrinterIds = ["bambu-a1", "bambu-a1-mini"] as const;
export type CommerceOsPrinterId = (typeof commerceOsPrinterIds)[number];

export const commerceOsDomainRoles = ["customer", "support", "production", "manager", "administrator"] as const;
export type CommerceOsDomainRole = (typeof commerceOsDomainRoles)[number];

export const commerceOsDomains = [
  "executive",
  "orders",
  "production",
  "inventory",
  "support",
  "growth",
  "ai",
  "platform",
] as const;
export type CommerceOsDomain = (typeof commerceOsDomains)[number];

export type CommerceOrderStage = "draft" | "awaiting_payment" | "confirmed" | "in_fulfillment" | "completed" | "cancelled";
export type CommercePaymentStage = "pending" | "authorized" | "paid" | "failed" | "cancelled" | "refunded";
export type CommercePersonalizationStage = "not_required" | "awaiting_input" | "in_review" | "approved" | "blocked";
export type CommerceProductionStage = "not_started" | "queued" | "printing" | "blocked" | "reprint" | "completed";
export type CommerceQualityStage = "pending" | "in_review" | "passed" | "failed";
export type CommercePackagingStage = "pending" | "packing" | "packed";
export type CommerceShippingStage = "not_ready" | "label_pending" | "posted" | "in_transit" | "delivered" | "returned";
export type CommerceReturnStage = "not_requested" | "requested" | "approved" | "received" | "closed";
export type CommerceRefundStage = "not_requested" | "pending" | "approved" | "paid" | "rejected";

export type CommerceProductionPriority = "critical" | "rush" | "normal" | "batch";
export type CommerceAlertLevel = "info" | "warning" | "critical";
export type CommerceConsumableKind = "filament" | "keyring" | "chain" | "packaging" | "label" | "supply";
export type CommerceAiSurface = "public_assistant" | "recommendations" | "admin_copilot" | "jobs";
export type CommerceAiOutcome = "success" | "fallback" | "error" | "handoff";
export type CommerceJobRunStatus = "queued" | "running" | "completed" | "failed" | "dead_letter";

export type CommerceOperationalState = {
  orderStage: CommerceOrderStage;
  paymentStage: CommercePaymentStage;
  personalizationStage: CommercePersonalizationStage;
  productionStage: CommerceProductionStage;
  qualityStage: CommerceQualityStage;
  packagingStage: CommercePackagingStage;
  shippingStage: CommerceShippingStage;
  returnStage: CommerceReturnStage;
  refundStage: CommerceRefundStage;
};

export type CommerceOperationalIssue = {
  field: keyof CommerceOperationalState;
  severity: CommerceAlertLevel;
  code: string;
  message: string;
};

export type CommerceEvidenceRef = {
  storagePath: string;
  capturedAt: string;
  visibility: "internal" | "customer_safe";
  sha256?: string | null;
  mimeType?: string | null;
};

export type CommerceOsOrderItemRecord = {
  id: string;
  productId?: string | null;
  title: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  color?: string | null;
  material?: string | null;
  customizationNotes?: string | null;
  customizations?: unknown;
};

export type CommerceOsPaymentRecord = {
  id: string;
  status: string;
  method: string;
  amount: number;
  paidAt?: string | null;
  externalReference?: string | null;
};

export type CommerceOsShipmentRecord = {
  status: string;
  carrier?: string | null;
  trackingCode?: string | null;
  trackingUrl?: string | null;
  postedAt?: string | null;
  deliveredAt?: string | null;
};

export type CommerceOsOrderRecord = {
  id: string;
  orderNumber: string;
  customerName?: string | null;
  customerEmail?: string | null;
  status: string;
  paymentStatus?: string | null;
  paymentMethod?: string | null;
  grandTotal: number;
  createdAt: string;
  updatedAt: string;
  paidAt?: string | null;
  notes?: string | null;
  items: CommerceOsOrderItemRecord[];
  payments: CommerceOsPaymentRecord[];
  shipment?: CommerceOsShipmentRecord | null;
};

export type CommerceOsPrinterConfig = {
  id: CommerceOsPrinterId;
  label: string;
  active: boolean;
  configuredHoursPerDay: number | null;
  notes?: string | null;
};

export type CommerceOrderOperationalRecord = {
  orderId: string;
  orderNumber?: string | null;
  priority?: CommerceProductionPriority | null;
  assignedPrinterId?: CommerceOsPrinterId | null;
  assignedOperator?: string | null;
  blockedReason?: string | null;
  holdReason?: string | null;
  slaAt?: string | null;
  personalizationStage?: CommercePersonalizationStage | null;
  productionStage?: CommerceProductionStage | null;
  qualityStage?: CommerceQualityStage | null;
  packagingStage?: CommercePackagingStage | null;
  shippingStage?: CommerceShippingStage | null;
  returnStage?: CommerceReturnStage | null;
  refundStage?: CommerceRefundStage | null;
  notes?: string | null;
  evidence?: CommerceEvidenceRef[];
  updatedAt: string;
};

export type CommerceConsumableLedgerRecord = {
  id: string;
  kind: CommerceConsumableKind;
  label: string;
  unit: "g" | "unit";
  material?: string | null;
  color?: string | null;
  onHand: number | null;
  reserved: number;
  reorderLevel: number | null;
  estimatedUnitCost: number | null;
  actualUnitCost: number | null;
  updatedAt: string;
};

export type CommerceDefectRecord = {
  id: string;
  orderId: string;
  itemId?: string | null;
  cause: string;
  stage: "personalization" | "printing" | "quality" | "packaging" | "shipping";
  wasteGrams?: number | null;
  wasteUnits?: number | null;
  reprintRequired: boolean;
  operator?: string | null;
  estimatedMarginImpact: number;
  notes?: string | null;
  createdAt: string;
};

export type CommerceQualityRecord = {
  id: string;
  orderId: string;
  outcome: "passed" | "failed" | "not_applicable";
  checklist: string[];
  notes?: string | null;
  checkedBy?: string | null;
  evidence?: CommerceEvidenceRef[];
  createdAt: string;
};

export type CommercePackagingRecord = {
  id: string;
  orderId: string;
  checklist: string[];
  trackingLabelReady: boolean;
  packedBy?: string | null;
  notes?: string | null;
  evidence?: CommerceEvidenceRef[];
  createdAt: string;
};

export type CommerceAiObservation = {
  id: string;
  surface: CommerceAiSurface;
  outcome: CommerceAiOutcome;
  provider?: string | null;
  model?: string | null;
  latencyMs: number;
  estimatedCostUsd?: number | null;
  cacheHit?: boolean | null;
  humanEscalation?: boolean | null;
  metadata?: Record<string, unknown>;
  createdAt: string;
};

export type CommerceJobExecutionRecord = {
  id: string;
  jobId: string;
  jobType: string;
  idempotencyKey: string;
  lockKey: string;
  status: CommerceJobRunStatus;
  attempts: number;
  lastError?: string | null;
  startedAt: string;
  endedAt?: string | null;
};

export type CommerceOsLedger = {
  version: 1;
  updatedAt: string;
  printers: CommerceOsPrinterConfig[];
  orders: CommerceOrderOperationalRecord[];
  consumables: CommerceConsumableLedgerRecord[];
  defects: CommerceDefectRecord[];
  qualityChecks: CommerceQualityRecord[];
  packagingChecks: CommercePackagingRecord[];
  aiObservability: CommerceAiObservation[];
  jobExecutions: CommerceJobExecutionRecord[];
};
