import { createHash, randomBytes } from "node:crypto";

const ELIGIBLE_ORDER_STATUSES = new Set(["PAID", "PRINTING", "READY_TO_SHIP", "SHIPPED", "DELIVERED"]);
const ALLOWED_TYPES = new Set(["RETURN", "EXCHANGE", "WARRANTY"]);

export type ReturnRequestInput = {
  orderCode: string;
  customerName: string;
  email: string;
  type: "RETURN" | "EXCHANGE" | "WARRANTY";
  reason: string;
  description: string | null;
};

function clean(value: unknown, maxLength: number) {
  return String(value ?? "").trim().slice(0, maxLength);
}

export function parseReturnRequestInput(body: Record<string, unknown>): ReturnRequestInput {
  const orderCode = clean(body.orderCode, 80);
  const customerName = clean(body.customerName, 200);
  const email = clean(body.email, 320).toLowerCase();
  const reason = clean(body.reason, 500);
  const description = clean(body.description, 2_000) || null;
  const requestedType = clean(body.type, 20).toUpperCase() || "RETURN";

  if (!orderCode || !customerName || !email || !reason) {
    throw new Error("Campos obrigatórios: orderCode, customerName, email e reason.");
  }
  if (!ALLOWED_TYPES.has(requestedType)) {
    throw new Error("Tipo de solicitação inválido.");
  }

  return {
    orderCode,
    customerName,
    email,
    type: requestedType as ReturnRequestInput["type"],
    reason,
    description,
  };
}

export function assertReturnEligible(status: string) {
  if (!ELIGIBLE_ORDER_STATUSES.has(status)) {
    throw new Error("Este pedido ainda não está elegível para troca, devolução ou garantia.");
  }
}

export function createReturnRequestKey(input: ReturnRequestInput, providedKey?: string | null) {
  const material = providedKey?.trim().slice(0, 200) || [
    input.orderCode.toLowerCase(), input.email, input.type, input.reason.toLowerCase(), input.description?.toLowerCase() ?? "",
  ].join("|");
  return createHash("sha256").update(material).digest("hex");
}

export function createReturnProtocol(now = new Date(), entropy = randomBytes(4).toString("hex")) {
  const date = now.toISOString().slice(0, 10).replaceAll("-", "");
  return `RMA-${date}-${entropy.toUpperCase()}`;
}
