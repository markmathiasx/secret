import assert from "node:assert/strict";
import test from "node:test";
import { createProjectRequire } from "../scripts/catalog/ts-runtime.mjs";

const require = createProjectRequire();
const { normalizeAuthUrl } = require("@/lib/auth-url");

test("corrige domínio de produção sem protocolo", () => {
  assert.equal(normalizeAuthUrl("www.mdh3d.com.br"), "https://www.mdh3d.com.br");
});

test("preserva HTTPS e desenvolvimento local", () => {
  assert.equal(normalizeAuthUrl("https://mdh3d.com.br/path"), "https://mdh3d.com.br");
  assert.equal(normalizeAuthUrl("localhost:3000"), "http://localhost:3000");
});

test("rejeita protocolos inseguros", () => {
  assert.equal(normalizeAuthUrl("javascript:alert(1)"), "https://www.mdh3d.com.br");
});
