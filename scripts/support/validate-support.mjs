import { createProjectRequire, writeJson } from "../catalog/ts-runtime.mjs";

const require = createProjectRequire();
const { buildSupportReply } = require("@/lib/support/support-answer-engine");
const { buildSupportCatalogIndex } = require("@/lib/support/catalog-support-index");
const { calculateCardPrice, normalizeMoney } = require("@/lib/payment-pricing");

const requiredPrompts = [
  { message: "chaveiro", requiresProducts: true },
  { message: "quero presente barato", requiresProducts: true },
  { message: "tem algo geek?", requiresProducts: true },
  { message: "organizador para setup", requiresProducts: true },
  { message: "quanto custa no cartão?", requiresProducts: false, mustMentionCard: true },
  { message: "quero orçamento personalizado", requiresProducts: false, mustAskQuote: true },
  { message: "quero falar com humano", requiresProducts: false, mustHandoff: true },
];

const products = buildSupportCatalogIndex();
const issues = [];
const promptResults = requiredPrompts.map((test) => {
  const answer = buildSupportReply(test.message, { sessionId: "support-validator", sourcePage: "/atendimento" });
  const productIssues = [];

  if (!answer.ok || !answer.reply) productIssues.push("missing_reply");
  if (test.requiresProducts && !answer.products.length) productIssues.push("missing_real_products");
  if (answer.products.length > 6) productIssues.push("too_many_products");
  if (test.mustMentionCard && !/cart[aã]o/i.test(answer.reply)) productIssues.push("missing_card_explanation");
  if (test.mustAskQuote && !/(medidas|uso|cor|prazo|refer[eê]ncia|quantidade)/i.test(answer.reply)) productIssues.push("missing_quote_questions");
  if (test.mustHandoff && (!answer.handoff || !answer.whatsappUrl)) productIssues.push("missing_handoff");

  for (const product of answer.products) {
    if (!product.url || !product.url.startsWith("/")) productIssues.push(`invalid_url:${product.id}`);
    if (Math.abs(normalizeMoney(product.priceCard) - calculateCardPrice(product.pricePix)) > 0.009) {
      productIssues.push(`invalid_card_price:${product.id}`);
    }
  }

  if (productIssues.length) {
    issues.push({ message: test.message, issues: productIssues });
  }

  return {
    message: test.message,
    intent: answer.intent,
    handoff: answer.handoff,
    products: answer.products.map((product) => ({
      id: product.id,
      name: product.name,
      pricePix: product.pricePix,
      priceCard: product.priceCard,
      url: product.url,
    })),
    replyPreview: answer.reply.slice(0, 360),
    issues: productIssues,
  };
});

const catalogIssues = products
  .filter((product) => !product.id || !product.name || !product.url || !product.pricePix || !product.priceCard)
  .map((product) => ({ id: product.id, name: product.name }));

if (catalogIssues.length) {
  issues.push({ message: "catalog_index", issues: [`${catalogIssues.length} produtos incompletos`] });
}

const report = {
  generatedAt: new Date().toISOString(),
  ok: issues.length === 0,
  productsIndexed: products.length,
  issues,
  promptResults,
};

writeJson("reports/support-validation-report.json", report);

if (issues.length) {
  console.error(`Falha: ${issues.length} grupos de erro no suporte.`);
  for (const issue of issues) {
    console.error(`- ${issue.message}: ${issue.issues.join(", ")}`);
  }
  process.exit(1);
}

console.log(`OK: suporte validado com ${products.length} produtos indexados e ${requiredPrompts.length} prompts obrigatórios.`);
