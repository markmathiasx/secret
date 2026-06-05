import { createProjectRequire, writeJson } from "./catalog/ts-runtime.mjs";

const require = createProjectRequire();
const { buildSupportReply } = require("@/lib/support/support-answer-engine");
const { whatsappNumber } = require("@/lib/constants");

const prompts = [
  "chaveiro",
  "presente barato",
  "geek",
  "organizador para setup",
  "quanto custa no cartão?",
  "orçamento personalizado",
  "falar com humano",
];

const errors = [];
const results = prompts.map((prompt) => {
  const answer = buildSupportReply(prompt, { sessionId: "validation", sourcePage: "/atendimento" });
  if (!answer.ok) errors.push(`${prompt}: resposta sem ok`);
  if (!answer.reply || answer.reply.length < 20) errors.push(`${prompt}: resposta curta ou vazia`);
  if (["chaveiro", "presente barato", "geek", "organizador para setup"].includes(prompt) && answer.products.length < 3) {
    errors.push(`${prompt}: menos de 3 produtos reais`);
  }
  if (prompt === "presente barato") {
    if (answer.intent !== "presente_barato") errors.push("presente barato nao classificou como presente_barato");
    if (answer.products.some((product) => product.pricePix > 50)) errors.push("presente barato retornou produto acima de R$50");
  }
  if (prompt.includes("cartão") && !answer.reply.includes("Pix + R$ 1")) errors.push("regra de cartao nao explicada");
  if (prompt.includes("orçamento") && !/medidas|quantidade|prazo|refer/i.test(answer.reply)) errors.push("orcamento sem briefing minimo");
  if (prompt.includes("humano") && !answer.whatsappUrl?.includes(String(whatsappNumber))) errors.push("humano sem WhatsApp oficial");
  return {
    prompt,
    intent: answer.intent,
    products: answer.products.map((product) => ({
      name: product.name,
      pricePix: product.pricePix,
      priceCard: product.priceCard,
      url: product.url,
    })),
    hasWhatsapp: Boolean(answer.whatsappUrl),
    replyPreview: answer.reply.slice(0, 240),
  };
});

writeJson("reports/support-bot-validation-report.json", {
  generatedAt: new Date().toISOString(),
  ok: errors.length === 0,
  results,
  errors,
});

if (errors.length) {
  console.error("Falha em validate-support-bot:");
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log(`OK: bot validado em ${prompts.length} intencoes.`);
