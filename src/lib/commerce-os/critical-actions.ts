import { createHash } from "node:crypto";

export type CriticalActionType =
  | "confirm_payment"
  | "cancel_order"
  | "refund_order"
  | "override_inventory"
  | "retry_job";

type CriticalActionInput = {
  type: CriticalActionType;
  subjectId: string;
  confirmationText?: string | null;
  delta?: number | null;
};

const criticalActionLabels: Record<CriticalActionType, string> = {
  confirm_payment: "CONFIRMAR PAGAMENTO",
  cancel_order: "CANCELAR PEDIDO",
  refund_order: "CONFIRMAR REEMBOLSO",
  override_inventory: "AJUSTAR ESTOQUE",
  retry_job: "REENFILEIRAR JOB",
};

function normalizeConfirmation(value: string | null | undefined) {
  return String(value || "")
    .trim()
    .toUpperCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

export function buildCriticalActionPhrase(type: CriticalActionType, subjectId: string) {
  return `${criticalActionLabels[type]} ${subjectId}`.trim();
}

export function buildCriticalActionDigest(type: CriticalActionType, subjectId: string) {
  return createHash("sha256").update(`${type}:${subjectId}`).digest("hex").slice(0, 12).toUpperCase();
}

export function requiresCriticalActionConfirmation(input: CriticalActionInput) {
  if (input.type === "confirm_payment" || input.type === "cancel_order" || input.type === "refund_order") {
    return true;
  }

  if (input.type === "override_inventory") {
    return typeof input.delta === "number" && Math.abs(input.delta) >= 5;
  }

  if (input.type === "retry_job") {
    return true;
  }

  return false;
}

export function validateCriticalActionConfirmation(input: CriticalActionInput) {
  if (!requiresCriticalActionConfirmation(input)) {
    return {
      ok: true,
      expectedPhrase: null,
      expectedDigest: null,
    };
  }

  const expectedPhrase = buildCriticalActionPhrase(input.type, input.subjectId);
  const expectedDigest = buildCriticalActionDigest(input.type, input.subjectId);
  const supplied = normalizeConfirmation(input.confirmationText);
  const normalizedPhrase = normalizeConfirmation(expectedPhrase);
  const normalizedDigest = normalizeConfirmation(expectedDigest);

  return {
    ok: supplied === normalizedPhrase || supplied === normalizedDigest,
    expectedPhrase,
    expectedDigest,
  };
}
