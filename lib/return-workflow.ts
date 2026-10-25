export const RETURN_STATUSES = [
  "REQUESTED", "UNDER_REVIEW", "APPROVED", "REJECTED", "AWAITING_SHIPMENT",
  "IN_TRANSIT", "RECEIVED", "REFUND_PENDING", "REFUNDED", "EXCHANGED", "CANCELED",
] as const;

export type ReturnWorkflowStatus = (typeof RETURN_STATUSES)[number];

const TRANSITIONS: Record<ReturnWorkflowStatus, readonly ReturnWorkflowStatus[]> = {
  REQUESTED: ["UNDER_REVIEW", "APPROVED", "REJECTED", "CANCELED"],
  UNDER_REVIEW: ["APPROVED", "REJECTED", "CANCELED"],
  APPROVED: ["AWAITING_SHIPMENT", "REFUND_PENDING", "EXCHANGED", "CANCELED"],
  REJECTED: [],
  AWAITING_SHIPMENT: ["IN_TRANSIT", "CANCELED"],
  IN_TRANSIT: ["RECEIVED"],
  RECEIVED: ["REFUND_PENDING", "EXCHANGED"],
  REFUND_PENDING: ["REFUNDED"],
  REFUNDED: [],
  EXCHANGED: [],
  CANCELED: [],
};

export function isReturnStatus(value: unknown): value is ReturnWorkflowStatus {
  return typeof value === "string" && RETURN_STATUSES.includes(value as ReturnWorkflowStatus);
}

export function assertReturnTransition(current: ReturnWorkflowStatus, next: ReturnWorkflowStatus) {
  if (current === next) return;
  if (!TRANSITIONS[current].includes(next)) {
    throw new Error(`Transição inválida: ${current} -> ${next}.`);
  }
}
