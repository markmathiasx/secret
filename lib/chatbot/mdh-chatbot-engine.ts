import { catalog, type Product } from "@/lib/catalog";
import { formatCurrency } from "@/lib/utils";
import { calculateCardPrice } from "@/lib/payment-pricing";
import { OFFICIAL_INSTAGRAM_URL } from "@/lib/constants";

export type ChatRole = "visitor" | "bot" | "admin" | "system";

export type ChatMessage = {
  role: ChatRole;
  content: string;
};

export type ChatIntent =
  | "buy_product"
  | "custom_project"
  | "batch_order"
  | "shipping_query"
  | "material_query"
  | "order_status"
  | "human_handoff"
  | "general_info";

const MAX_BOT_QUESTIONS = 30;

export async function processChatbotResponse(
  messages: ChatMessage[],
  sessionMetadata: Record<string, any> = {}
): Promise<{ content: string; intent?: ChatIntent; suggestions?: string[] }> {
  const visitorMessages = messages.filter(m => m.role === "visitor");
  const lastMessage = visitorMessages[visitorMessages.length - 1]?.content.toLowerCase() || "";

  if (visitorMessages.length >= MAX_BOT_QUESTIONS) {
    return {
      content: "Para continuar com qualidade, vou chamar uma pessoa da MDH 3D para assumir seu atendimento. Só um instante!",
      intent: "human_handoff",
      suggestions: ["Falar com humano agora"]
    };
  }

  // Intent detection
  if (lastMessage.includes("humano") || lastMessage.includes("atendente") || lastMessage.includes("pessoa") || lastMessage.includes("falar com alguém")) {
    return {
      content: "Entendido. Estou chamando um de nossos especialistas. Enquanto isso, você pode adiantar sua dúvida ou o número do seu pedido?",
      intent: "human_handoff",
      suggestions: ["Ver catálogo", "Limpar conversa"]
    };
  }

  if (lastMessage.includes("personalizado") || lastMessage.includes("sob medida") || lastMessage.includes("minha ideia") || lastMessage.includes("arquivo stl")) {
    return {
      content: "Adoramos projetos únicos! Fazemos modelagem e impressão sob medida. Você tem o arquivo .STL ou apenas a ideia? Para orçamentos técnicos, o ideal é conversarmos pelo WhatsApp.",
      intent: "custom_project",
      suggestions: ["Mandar para WhatsApp", "Ver itens base", "Falar com humano"]
    };
  }

  if (lastMessage.includes("preço") || lastMessage.includes("quanto custa") || lastMessage.includes("valor")) {
    const foundProducts = searchProducts(lastMessage);
    if (foundProducts.length > 0) {
      const productList = foundProducts.slice(0, 3).map(p =>
        `- ${p.name}: Pix ${formatCurrency(p.pricePix)} | Cartão + R$ 1: ${formatCurrency(calculateCardPrice(p.pricePix))}`
      ).join("\n");
      return {
        content: `Encontrei esses itens no catálogo:\n\n${productList}\n\nLembrando que no cartão o valor é sempre o do Pix + R$ 1,00 por item. Deseja ver mais detalhes de algum deles?`,
        intent: "buy_product",
        suggestions: ["Ver catálogo", "Frete e prazo", "Falar com humano"]
      };
    }
    return {
      content: "Nossos preços variam conforme o modelo e material. O valor base é sempre o preço via Pix, e no cartão adicionamos apenas R$ 1,00 por peça. Qual tipo de produto você procura?",
      intent: "general_info",
      suggestions: ["Organização", "Geek", "Decoração", "Ver catálogo"]
    };
  }

  if (lastMessage.includes("prazo") || lastMessage.includes("entrega") || lastMessage.includes("chega") || lastMessage.includes("frete")) {
    return {
      content: "Temos itens à 'Pronta entrega' que saem em até 24h. Para itens 'Sob encomenda', o prazo padrão é de 2 a 5 dias úteis para produção. O frete é calculado no checkout com opções de Melhor Envio ou retirada local no Rio.",
      intent: "shipping_query",
      suggestions: ["Calcular frete no carrinho", "Ver pronta entrega", "Falar com humano"]
    };
  }

  if (lastMessage.includes("material") || lastMessage.includes("pla") || lastMessage.includes("petg") || lastMessage.includes("resina")) {
    return {
      content: "Trabalhamos principalmente com PLA (biodegradável, ótimo acabamento) e PETG (mais resistente ao calor). Também temos acabamentos Silk (brilhante) e Matte (fosco). Qual seria a aplicação da sua peça?",
      intent: "material_query",
      suggestions: ["Diferença PLA vs PETG", "Ver amostras no Instagram", "Falar com humano"]
    };
  }

  if (lastMessage.includes("instagram") || lastMessage.includes("insta") || lastMessage.includes("fotos")) {
    return {
      content: `Você pode conferir bastidores, produtos prontos e novidades no @mdh_3d.com.br. O link oficial é ${OFFICIAL_INSTAGRAM_URL}`,
      intent: "general_info",
      suggestions: ["Ver Instagram", "Ver catálogo", "Falar com humano"]
    };
  }

  if (lastMessage.includes("ola") || lastMessage.includes("oi") || lastMessage.includes("bom dia") || lastMessage.includes("boa tarde")) {
    return {
      content: "Olá! Eu sou o MDH3D CHAT BOT. Posso te ajudar a escolher produtos, calcular ideias personalizadas ou tirar dúvidas de prazo e materiais. O que você busca hoje?",
      intent: "general_info",
      suggestions: ["Quero comprar um produto", "Quero peça personalizada", "Dúvida de material", "Falar com humano"]
    };
  }

  // Default fallback
  return {
    content: "Interessante! Não tenho certeza se entendi perfeitamente. Você quer ver o catálogo MDH 3D, fazer um orçamento sob medida ou falar com um humano?",
    intent: "general_info",
    suggestions: ["Ver catálogo", "Orçamento personalizado", "Falar com humano"]
  };
}

function searchProducts(query: string): Product[] {
  const terms = query.split(" ").filter(t => t.length > 2);
  if (terms.length === 0) return [];

  return catalog.filter(p =>
    terms.some(t =>
      p.name.toLowerCase().includes(t) ||
      p.category.toLowerCase().includes(t) ||
      p.tags.some(tag => tag.toLowerCase().includes(t))
    )
  ).sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
}
