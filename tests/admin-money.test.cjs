const assert = require("node:assert/strict");
const { test } = require("node:test");
const { parseAdminMoney, formatAdminMoneyInput } = require("../lib/admin-money.ts");

test("interpreta valores brasileiros sem multiplicar centavos", () => {
  assert.equal(parseAdminMoney("29,90"), 29.9);
  assert.equal(parseAdminMoney("R$ 1.234,56"), 1234.56);
  assert.equal(parseAdminMoney("1.234.567,89"), 1234567.89);
});

test("aceita valor decimal técnico e rejeita conteúdo ambíguo", () => {
  assert.equal(parseAdminMoney("29.90"), 29.9);
  assert.equal(parseAdminMoney(12.345), 12.35);
  assert.equal(parseAdminMoney(""), null);
  assert.equal(parseAdminMoney("R$ --10"), null);
  assert.equal(parseAdminMoney("12 reais"), null);
});

test("formata o valor do input com duas casas", () => {
  assert.equal(formatAdminMoneyInput(29.9), "29,90");
});
