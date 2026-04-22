import crypto from "node:crypto";
import { getChatwootHmacToken } from "@/lib/env";

export function createChatwootIdentifierHash(identifier: string) {
  const secret = getChatwootHmacToken();
  const normalized = identifier.trim();
  if (!secret || !normalized) {
    return null;
  }

  return crypto.createHmac("sha256", secret).update(normalized).digest("hex");
}
