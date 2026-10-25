import test from "node:test";
import assert from "node:assert/strict";
import {
  hardenHttpServer,
  forensicPath,
  normalizeErrorCode,
  redactIdentifier,
} from "../src/http-security.js";

test("forensic identifiers are deterministic hashes and error codes are allowlisted", () => {
  const hash = redactIdentifier("buyer@example.test", "test-salt");
  assert.equal(hash, redactIdentifier("buyer@example.test", "test-salt"));
  assert.notEqual(hash, redactIdentifier("other@example.test", "test-salt"));
  assert(!hash.includes("buyer"));
  assert.equal(normalizeErrorCode("XX000"), "xx000");
  assert.equal(normalizeErrorCode("secret connection message"), "internal");
  assert.equal(forensicPath({ path: "/api/payments/123456" }), "/api/payments/:id");
  assert.equal(forensicPath({ route: { path: "/api/products/:id" }, baseUrl: "" }), "/api/products/:id");
});

test("HTTP server hardening sets bounded connection lifetimes", () => {
  const server = {};
  assert.equal(hardenHttpServer(server), server);
  assert.equal(server.requestTimeout, 20_000);
  assert.equal(server.headersTimeout, 10_000);
  assert.equal(server.keepAliveTimeout, 5_000);
  assert.equal(server.maxRequestsPerSocket, 100);
});
