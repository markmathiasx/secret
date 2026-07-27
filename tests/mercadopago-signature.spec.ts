import { createHmac } from "node:crypto";
import { expect, test } from "@playwright/test";
import {
  isMercadoPagoSignatureFresh,
  verifyMercadoPagoSignature,
} from "../lib/mercadopago";

function sign(secret: string, input: { dataId: string; requestId: string; timestampSeconds: number }) {
  const manifest = `id:${input.dataId};request-id:${input.requestId};ts:${input.timestampSeconds};`;
  const digest = createHmac("sha256", secret).update(manifest).digest("hex");
  return `ts=${input.timestampSeconds},v1=${digest}`;
}

test("mercado pago signatures stay valid inside the replay window", () => {
  const nowMs = Date.UTC(2026, 6, 27, 3, 0, 0);
  const timestampSeconds = Math.floor((nowMs - 60_000) / 1000);
  const signature = sign("test-secret", {
    dataId: "12345",
    requestId: "req-1",
    timestampSeconds,
  });

  expect(
    verifyMercadoPagoSignature({
      secret: "test-secret",
      signature,
      requestId: "req-1",
      dataId: "12345",
    })
  ).toBe(true);
  expect(isMercadoPagoSignatureFresh(signature, { nowMs })).toBe(true);
});

test("mercado pago signatures are rejected when the replay window is exceeded", () => {
  const nowMs = Date.UTC(2026, 6, 27, 3, 0, 0);
  const timestampSeconds = Math.floor((nowMs - 20 * 60_000) / 1000);
  const signature = sign("test-secret", {
    dataId: "12345",
    requestId: "req-2",
    timestampSeconds,
  });

  expect(
    verifyMercadoPagoSignature({
      secret: "test-secret",
      signature,
      requestId: "req-2",
      dataId: "12345",
    })
  ).toBe(true);
  expect(isMercadoPagoSignatureFresh(signature, { nowMs })).toBe(false);
});
