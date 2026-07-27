import assert from "node:assert/strict";
import { createHmac } from "node:crypto";

const availability = await import("../lib/product-availability.ts");
const mpSignature = await import("../lib/mercadopago-signature.ts");

function sign(secret, input) {
  const manifest = `id:${input.dataId};request-id:${input.requestId};ts:${input.timestampSeconds};`;
  const digest = createHmac("sha256", secret).update(manifest).digest("hex");
  return `ts=${input.timestampSeconds},v1=${digest}`;
}

const results = [];

{
  const product = {
    availabilityMode: "made_to_order",
    readyToShip: false,
    status: "Sob encomenda",
    stock: 24,
  };

  assert.equal(availability.getProductAvailabilityMode(product), "made_to_order");
  assert.equal(availability.getPublicStockQuantity(product), 0);
  assert.equal(availability.getCommerceFeedAvailability(product), "preorder");
  assert.equal(availability.getStructuredDataAvailability(product), "https://schema.org/PreOrder");
  results.push("availability:made_to_order");
}

{
  const product = {
    readyToShip: true,
    status: "Pronta entrega",
    stock: 4,
  };

  assert.equal(availability.getProductAvailabilityMode(product), "in_stock");
  assert.equal(availability.getPublicStockQuantity(product), 4);
  assert.equal(availability.getCommerceFeedAvailability(product), "in stock");
  assert.equal(availability.getStructuredDataAvailability(product), "https://schema.org/InStock");
  results.push("availability:in_stock");
}

{
  const nowMs = Date.UTC(2026, 6, 27, 3, 0, 0);
  const timestampSeconds = Math.floor((nowMs - 60_000) / 1000);
  const signature = sign("test-secret", {
    dataId: "12345",
    requestId: "req-1",
    timestampSeconds,
  });

  assert.equal(
    mpSignature.verifyMercadoPagoSignature({
      secret: "test-secret",
      signature,
      requestId: "req-1",
      dataId: "12345",
    }),
    true,
  );
  assert.equal(mpSignature.isMercadoPagoSignatureFresh(signature, { nowMs }), true);
  results.push("mercadopago:fresh_signature");
}

{
  const nowMs = Date.UTC(2026, 6, 27, 3, 0, 0);
  const timestampSeconds = Math.floor((nowMs - 20 * 60_000) / 1000);
  const signature = sign("test-secret", {
    dataId: "12345",
    requestId: "req-2",
    timestampSeconds,
  });

  assert.equal(
    mpSignature.verifyMercadoPagoSignature({
      secret: "test-secret",
      signature,
      requestId: "req-2",
      dataId: "12345",
    }),
    true,
  );
  assert.equal(mpSignature.isMercadoPagoSignatureFresh(signature, { nowMs }), false);
  results.push("mercadopago:stale_signature");
}

console.log(JSON.stringify({ ok: true, checks: results }, null, 2));
