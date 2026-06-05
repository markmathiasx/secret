import { supportEmail, whatsappNumber } from "@/lib/constants";
import { buildSupportCatalogIndex, getSupportCatalogStats, getSupportPriceRange, searchSupportProducts } from "@/lib/support/catalog-support-index";
import { classifySupportIntent } from "@/lib/support/support-intent-router";
import type { SupportIntent, SupportProduct, SupportReply, SupportSessionContext } from "@/lib/support/support-types";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function formatProductLine(product: SupportProduct) {
  return `${product.name}: Pix ${formatCurrency(product.pricePix)}; cartão ${formatCurrency(product.priceCard)}; prazo ${product.productionWindow}; link ${product.url}`;
}

function buildWhatsAppUrl(message: string) {
  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
}

function productQueryForIntent(intent: SupportIntent, message: string) {
  switch (intent) {
    case "produto_barato":
    case "presente_barato":
      return "produto barato menor preço presente chaveiro utilidade";
    case "produto_caro":
      return "premium colecionável decoração peça grande";
    case "presente":
      return `${message} presente criativo`;
    case "chaveiro":
      return "chaveiro keychain pingente tag lembrancinha";
    case "geek":
      return "geek anime colecionável chibi miniatura";
    case "decoracao":
      return "decoração casa vaso luminária parede";
    case "setup":
      return "setup suporte controle fone cabo mesa";
    case "organizador":
      return "organizador porta cápsula gaveta holder setup";
    case "utilidade":
      return "utilidade funcional suporte organizador";
    case "personalizado":
      return "personalizado nome custom sob medida";
    case "lote_brinde":
      return "lote brinde lembrancinha chaveiro quantidade";
    default:
      return message;
  }
}

function productFiltersForIntent(intent: SupportIntent) {
  if (intent === "produto_barato" || intent === "presente_barato" || intent === "presente") {
    return { intent, sort: "price_asc" as const, maxPrice: intent === "presente_barato" ? 50 : undefined, limit: 6 };
  }
  if (intent === "produto_caro") return { intent, sort: "price_desc" as const, limit: 6 };
  if (intent === "personalizado") return { intent, customizable: true, limit: 6 };
  return { intent, limit: 6 };
}

function buildProductReply(intent: SupportIntent, message: string, products: SupportProduct[]) {
  const range = getSupportPriceRange(products);
  if (!products.length) {
    return {
      reply: "Não encontrei produto real no catálogo com esse termo. Me diga o uso, faixa de preço ou categoria, ou chame um atendente humano para montar uma indicação.",
      suggestions: ["Quero presente barato", "Quero organizador para setup", "Quero falar com humano"],
      priceRange: range,
    };
  }

  const intro =
    intent === "chaveiro"
      ? "Encontrei opções reais de chaveiros e itens próximos no catálogo."
      : intent === "presente_barato"
        ? "Separei presentes reais até R$ 50, começando pelos menores preços."
        : intent === "produto_barato" || normalizeText(message).includes("barato")
        ? "Separei produtos reais começando pelos menores preços."
        : intent === "geek"
          ? "Separei opções reais com perfil geek, colecionável ou fandom."
          : intent === "setup" || intent === "organizador"
            ? "Separei utilidades reais para setup, mesa e organização."
            : intent === "lote_brinde"
              ? "Separei opções reais que podem servir para lote, brinde ou lembrancinha."
              : "Separei produtos reais do catálogo.";

  const lines = products.map((product) => `- ${formatProductLine(product)}`).join("\n");
  const rangeLine = range.count
    ? `Faixa desta seleção: ${formatCurrency(range.min)} a ${formatCurrency(range.max)} no Pix.`
    : "";

  return {
    reply: [intro, rangeLine, lines, "Quer filtrar por mais barato, personalizado, geek, lote/brinde ou mandar no WhatsApp?"].filter(Boolean).join("\n\n"),
    suggestions: ["Mais barato", "Personalizado", "Geek", "Lote/brinde", "Mandar no WhatsApp"],
    priceRange: range,
  };
}

function buildQuoteReply() {
  const message = [
    "Quero um orçamento personalizado na MDH 3D.",
    "Uso da peça:",
    "Medidas aproximadas:",
    "Cor/material desejado:",
    "Prazo ideal:",
    "Quantidade:",
    "Tenho referência, foto, STL, OBJ ou 3MF para enviar.",
  ].join("\n");

  return {
    reply: [
      "Para orçamento personalizado, me passe medidas, uso da peça, cor, prazo, quantidade e uma referência/foto/STL se tiver.",
      `Também deixei uma mensagem pronta para o WhatsApp: ${buildWhatsAppUrl(message)}`,
    ].join("\n\n"),
    suggestions: ["Enviar referência", "Ver personalizados", "Falar com humano"],
    whatsappUrl: buildWhatsAppUrl(message),
  };
}

export function buildSupportReply(message: string, sessionContext: SupportSessionContext = {}): SupportReply {
  const trimmed = message.trim().slice(0, 1000);
  const intent = classifySupportIntent(trimmed);
  const stats = getSupportCatalogStats();
  const productIntents: SupportIntent[] = [
    "produto_categoria",
    "produto_preco",
    "produto_barato",
    "produto_caro",
    "presente",
    "presente_barato",
    "chaveiro",
    "geek",
    "decoracao",
    "utilidade",
    "setup",
    "organizador",
    "personalizado",
    "lote_brinde",
  ];

  if (productIntents.includes(intent)) {
    if (intent === "personalizado" && /(or[cç]amento|stl|sob medida|projeto)/i.test(trimmed)) {
      const quote = buildQuoteReply();
      const products = searchSupportProducts(productQueryForIntent(intent, trimmed), productFiltersForIntent(intent));
      return {
        ok: true,
        intent,
        reply: quote.reply,
        products,
        suggestions: quote.suggestions,
        handoff: false,
        whatsappUrl: quote.whatsappUrl,
        priceRange: getSupportPriceRange(products),
      };
    }

    const products = searchSupportProducts(productQueryForIntent(intent, trimmed), productFiltersForIntent(intent));
    const productReply = buildProductReply(intent, trimmed, products);
    return {
      ok: true,
      intent,
      reply: productReply.reply,
      products,
      suggestions: productReply.suggestions,
      handoff: false,
      priceRange: productReply.priceRange,
    };
  }

  if (intent === "material") {
    return {
      ok: true,
      intent,
      reply: "Trabalhamos principalmente com PLA Premium, PLA Silk, PETG e resina. A escolha depende de uso, resistência, acabamento e tamanho. Se você me disser a peça ou mandar referência, eu indico o material mais adequado.",
      products: [],
      suggestions: ["Ver produtos em PLA", "Quero peça resistente", "Quero orçamento personalizado"],
      handoff: false,
    };
  }

  if (intent === "prazo" || intent === "envio") {
    return {
      ok: true,
      intent,
      reply: "O prazo aparece no produto. Pronta entrega costuma sair mais rápido; sob encomenda depende de tamanho, material, fila e acabamento. Para envio, confirme CEP e urgência no atendimento humano antes de fechar.",
      products: [],
      suggestions: ["Ver pronta entrega", "Quero rastrear pedido", "Falar com humano"],
      handoff: false,
    };
  }

  if (intent === "pagamento" || intent === "pix_cartao") {
    return {
      ok: true,
      intent,
      reply: "O Pix é o preço principal exibido no catálogo. No cartão, o valor é sempre Pix + R$ 1,00 por item. O chat nunca pede CPF, dados de cartão ou código de segurança.",
      products: [],
      suggestions: ["Ver produtos baratos", "Ir para catálogo", "Falar com humano"],
      handoff: false,
    };
  }

  if (intent === "troca_devolucao") {
    return {
      ok: true,
      intent,
      reply: "Para troca ou devolução, envie número do pedido, produto, motivo e foto quando houver avaria. Peças personalizadas precisam de análise humana porque foram produzidas sob medida.",
      products: [],
      suggestions: ["Quero falar com humano", "Tenho número do pedido", "Ver política de trocas"],
      handoff: false,
    };
  }

  if (intent === "rastreio" || intent === "status_pedido") {
    return {
      ok: true,
      intent,
      reply: "Para acompanhar pedido, informe o número do pedido ou o e-mail usado na compra. Se tiver código de rastreio, use também na página de rastreio ou envie ao atendimento humano.",
      products: [],
      suggestions: ["Tenho número do pedido", "Tenho código de rastreio", "Falar com humano"],
      handoff: false,
    };
  }

  if (intent === "humano") {
    const humanMessage = [
      "Oi! Quero atendimento humano na MDH 3D.",
      sessionContext.sourcePage ? `Página: ${sessionContext.sourcePage}` : null,
      `Mensagem: ${trimmed}`,
    ].filter(Boolean).join("\n");

    return {
      ok: true,
      intent,
      reply: `Pode chamar a equipe pelo WhatsApp: ${buildWhatsAppUrl(humanMessage)}. Não envie dados de cartão pelo chat; finalize pagamento somente no checkout ou orientação oficial da equipe.`,
      products: [],
      suggestions: ["Abrir WhatsApp", "Ver catálogo", "Orçamento personalizado"],
      handoff: true,
      whatsappUrl: buildWhatsAppUrl(humanMessage),
    };
  }

  if (intent === "saudacao") {
    return {
      ok: true,
      intent,
      reply: `Oi. Sou o assistente da MDH 3D com acesso ao catálogo atual (${stats.products} produtos). Posso indicar produtos reais, preço Pix/cartão, prazo, material, orçamento, rastreio, trocas ou atendimento humano.`,
      products: [],
      suggestions: ["Quero ver chaveiros", "Quero presente barato", "Quero produto geek", "Quero falar com humano"],
      handoff: false,
      priceRange: stats.priceRange,
    };
  }

  const products = searchSupportProducts(trimmed, { limit: 4 });
  if (products.length) {
    const productReply = buildProductReply("produto_categoria", trimmed, products);
    return {
      ok: true,
      intent: "produto_categoria",
      reply: productReply.reply,
      products,
      suggestions: productReply.suggestions,
      handoff: false,
      priceRange: productReply.priceRange,
    };
  }

  return {
    ok: true,
    intent: "fallback",
    reply: `Posso ajudar com produtos reais do catálogo, preço, Pix/cartão, material, prazo, orçamento, pedido, rastreio, trocas e atendimento humano. Se preferir, escreva direto para ${supportEmail} ou chame o WhatsApp.`,
    products: [],
    suggestions: ["Quero ver chaveiros", "Quero presente barato", "Quero orçamento personalizado", "Quero falar com humano"],
    handoff: false,
    priceRange: stats.priceRange,
  };
}

export function buildSupportSearchReply(query: string) {
  const intent = classifySupportIntent(query);
  return {
    intent,
    products: searchSupportProducts(productQueryForIntent(intent, query), productFiltersForIntent(intent)),
  };
}
