import { 
  CatalogItem, 
  searchByCategory, 
  searchByKeyword, 
  getCheapest, 
  getMostExpensive,
  getPriceRange, 
  getProductLink,
  getWhatsAppLink
} from './catalog-index';
import { Intent } from './intent-classifier';

const WHATSAPP_NUMBER = '5521974137662';

function formatProduct(p: CatalogItem): string {
  return `• **${p.name}**\n  Pix: R$ ${p.pricePix.toFixed(2)} | Cartão: R$ ${p.priceCard.toFixed(2)}\n  🔗 ${getProductLink(p.slug)}`;
}

function formatProducts(products: CatalogItem[], intro: string): string {
  if (products.length === 0) {
    return `${intro}\n\nNão encontrei produtos agora, mas posso buscar algo sob encomenda. Quer falar com um atendente?`;
  }
  return `${intro}\n\n${products.map(formatProduct).join('\n\n')}`;
}

export interface SupportResponse {
  text: string;
  products: CatalogItem[];
  suggestions: string[];
  handoff: boolean;
  whatsappLink?: string;
}

export function generateResponse(intent: Intent, message: string): SupportResponse {
  switch (intent) {
    case 'saudacao':
      return {
        text: 'Olá! 👋 Bem-vindo à MDH 3D!\n\nSomos especializados em impressão 3D personalizada no Rio de Janeiro.\n\nPosso te ajudar com:\n• 🔑 Chaveiros personalizados\n• 🎁 Presentes geek\n• 📦 Organizadores\n• 🎨 Peças sob medida\n• 💬 Orçamento personalizado\n\nO que você procura hoje?',
        products: [],
        suggestions: ['Ver chaveiros', 'Presentes geek', 'Orçamento personalizado', 'Falar com humano'],
        handoff: false
      };

    case 'agradecimento':
      return {
        text: 'Por nada! 😊 Estou aqui para ajudar.\n\nPrecisa de mais alguma coisa? Posso te mostrar mais produtos ou te ajudar com orçamento.',
        products: [],
        suggestions: ['Ver mais produtos', 'Orçamento', 'Falar com humano'],
        handoff: false
      };

    case 'chaveiro': {
      const products = getCheapest(searchByCategory('chaveiro'), 6);
      const range = getPriceRange(products);
      return {
        text: formatProducts(products, `🔑 Tenho chaveiros personalizados de R$ ${range.min.toFixed(2)} a R$ ${range.max.toFixed(2)}.\n\nOs mais pedidos são:`),
        products,
        suggestions: ['Chaveiro com nome', 'Chaveiro pet', 'Chaveiro geek', 'Chaveiro anime', 'Lote de chaveiros', 'Orçamento'],
        handoff: false
      };
    }

    case 'pokemon': {
      const products = getCheapest(searchByKeyword('pokemon').concat(searchByKeyword('geek')), 6);
      return {
        text: formatProducts(products, '⚡ Temos itens geek e inspirados em Pokémon! Confira:'),
        products,
        suggestions: ['Ver mais geek', 'Personalizar', 'Orçamento', 'Falar com humano'],
        handoff: false
      };
    }

    case 'anime': {
      const products = getCheapest(searchByKeyword('anime'), 6);
      return {
        text: formatProducts(products, '🎌 Confira nossos itens de anime:'),
        products,
        suggestions: ['Ver mais anime', 'Personalizar', 'Orçamento'],
        handoff: false
      };
    }

    case 'geek': {
      const products = getCheapest(searchByCategory('geek'), 6);
      return {
        text: formatProducts(products, '🎮 Confira nossos itens geek:'),
        products,
        suggestions: ['Pokemon', 'Anime', 'Games', 'Personalizar', 'Orçamento'],
        handoff: false
      };
    }

    case 'gamer': {
      const products = getCheapest(searchByCategory('gamer').concat(searchByKeyword('gamer')), 6);
      return {
        text: formatProducts(products, '🎮 Para seu setup gamer:'),
        products,
        suggestions: ['Suporte controle', 'Organizadores', 'Decoração', 'Personalizar'],
        handoff: false
      };
    }

    case 'presente': {
      const products = getCheapest(searchByKeyword('presente').concat(searchByCategory('presente')), 6);
      return {
        text: formatProducts(products, '🎁 Para presentes, recomendo estes itens que fazem sucesso:'),
        products,
        suggestions: ['Presentes até R$ 30', 'Presentes até R$ 50', 'Personalizados', 'Geek', 'Ver todos'],
        handoff: false
      };
    }

    case 'barato': {
      const all = getCheapest(searchByKeyword(''), 6);
      return {
        text: formatProducts(all, '💰 Nossos itens mais em conta:'),
        products: all,
        suggestions: ['Chaveiros', 'Presentes', 'Orçamento'],
        handoff: false
      };
    }

    case 'caro': {
      const all = getMostExpensive(searchByKeyword(''), 6);
      return {
        text: formatProducts(all, '💎 Nossos itens premium:'),
        products: all,
        suggestions: ['Personalizados', 'Luminárias', 'Orçamento'],
        handoff: false
      };
    }

    case 'setup': {
      const products = getCheapest(searchByCategory('setup').concat(searchByKeyword('setup')), 6);
      return {
        text: formatProducts(products, '🖥️ Para seu setup gamer/office:'),
        products,
        suggestions: ['Suporte controle', 'Organizadores', 'Porta-copos', 'Personalizar'],
        handoff: false
      };
    }

    case 'organizador': {
      const products = getCheapest(searchByCategory('organizador').concat(searchByKeyword('organizador')), 6);
      return {
        text: formatProducts(products, '📦 Organizadores para sua mesa:'),
        products,
        suggestions: ['Para cabos', 'Para cápsulas', 'Para canetas', 'Personalizar'],
        handoff: false
      };
    }

    case 'decoracao': {
      const products = getCheapest(searchByCategory('decoracao').concat(searchByKeyword('decoracao')), 6);
      return {
        text: formatProducts(products, '🏠 Decoração para sua casa:'),
        products,
        suggestions: ['Luminárias', 'Miniaturas', 'Vasos', 'Personalizar'],
        handoff: false
      };
    }

    case 'cozinha': {
      const products = getCheapest(searchByCategory('cozinha').concat(searchByKeyword('cozinha')), 6);
      return {
        text: formatProducts(products, '☕ Itens para sua cozinha:'),
        products,
        suggestions: ['Porta cápsulas', 'Porta-copos', 'Utensílios', 'Personalizar'],
        handoff: false
      };
    }

    case 'personalizado':
      return {
        text: '✨ Fazemos peças 100% personalizadas!\n\nPara orçar, preciso saber:\n\n1️⃣ O que você quer? (chaveiro, miniatura, suporte...)\n2️⃣ Tem referência/foto/STL?\n3️⃣ Qual tamanho aproximado?\n4️⃣ Qual cor?\n5️⃣ Para quando precisa?\n6️⃣ Quantidade?\n\nMe conta que te passo o valor!',
        products: [],
        suggestions: ['É um chaveiro', 'É uma miniatura', 'É organizador', 'É decoração', 'Falar no WhatsApp'],
        handoff: false
      };

    case 'orcamento':
      return {
        text: '💵 Para orçamento:\n\n• **Pix**: preço direto\n• **Cartão**: Pix + R$ 1,00\n• **Prazo**: varia conforme complexidade\n• **Personalização**: sob consulta\n\n💡 Dica: Quanto mais detalhes você me der, mais preciso será o orçamento!\n\nMe diga qual peça você quer e te passo o valor exato!',
        products: [],
        suggestions: ['Chaveiro personalizado', 'Miniatura', 'Organizador', 'Luminária', 'Falar com humano'],
        handoff: false
      };

    case 'prazo':
      return {
        text: '⏰ Prazos médios:\n\n• **Pronta entrega**: 1-2 dias úteis\n• **Peças simples**: 3-5 dias úteis\n• **Personalizadas**: 5-10 dias úteis\n• **Lotes grandes**: sob consulta\n\n📦 Envio pelos Correios (PAC/SEDEX) ou retirada no RJ.\n\nQuer saber o prazo para uma peça específica?',
        products: [],
        suggestions: ['Ver produtos', 'Orçamento', 'Falar com humano'],
        handoff: false
      };

    case 'pagamento':
      return {
        text: '💳 Formas de pagamento:\n\n• **Pix**: preço cheio (mais barato)\n• **Cartão de crédito**: Pix + R$ 1,00\n\n🔒 Pagamento seguro via Mercado Pago.\n\n✅ Aprovação imediata\n✅ Parcelamento disponível\n✅ Nota fiscal',
        products: [],
        suggestions: ['Ver produtos', 'Orçamento', 'Falar com humano'],
        handoff: false
      };

    case 'envio':
      return {
        text: '📦 Enviamos para todo Brasil via Correios.\n\n• **PAC**: 5-10 dias úteis\n• **SEDEX**: 2-5 dias úteis\n• **Retirada local**: Rio de Janeiro (grátis)\n\n💰 Frete calculado no checkout conforme seu CEP.\n\n📍 Acompanhe seu pedido pelo código de rastreio.',
        products: [],
        suggestions: ['Ver produtos', 'Rastreio', 'Falar com humano'],
        handoff: false
      };

    case 'troca':
      return {
        text: '🔄 Política de trocas e devoluções:\n\n✅ **7 dias** para arrependimento\n✅ **Produto com defeito**: trocamos sem custo\n✅ **Personalizado**: sem troca (exceto defeito)\n\n📞 Entre em contato pelo WhatsApp em caso de problemas.',
        products: [],
        suggestions: ['Falar com humano', 'Rastreio', 'Ver produtos'],
        handoff: false
      };

    case 'rastreio':
      return {
        text: '📍 Para rastrear seu pedido:\n\nMe envie o **código de rastreio** ou **número do pedido** que te ajudo!\n\nOu clique abaixo para falar direto no WhatsApp:',
        products: [],
        suggestions: ['Falar com humano'],
        handoff: true,
        whatsappLink: getWhatsAppLink('Olá! Vim pelo site e quero rastrear meu pedido.')
      };

    case 'lote':
      return {
        text: '🎁 Fazemos lotes e brindes corporativos!\n\nPara orçar, preciso saber:\n\n1️⃣ Tipo de peça\n2️⃣ Quantidade\n3️⃣ Personalização necessária\n4️⃣ Prazo\n\n💰 **Descontos progressivos** para grandes quantidades!\n\n📦 Entrega para todo Brasil.',
        products: [],
        suggestions: ['Chaveiros em lote', 'Brindes', 'Lembrancinhas', 'Falar com humano'],
        handoff: false
      };

    case 'humano':
      return {
        text: '👤 Vou te transferir para um atendente humano no WhatsApp.\n\nClique abaixo para iniciar a conversa:\n\n📱 WhatsApp: +55 21 97413-7662\n\n⏰ Atendimento: Seg-Sex 9h-18h',
        products: [],
        suggestions: [],
        handoff: true,
        whatsappLink: getWhatsAppLink('Olá! Vim pelo site e quero falar com um atendente.')
      };

    default:
      return {
        text: '🤔 Não entendi bem. Posso te ajudar com:\n\n• 🔑 **Chaveiros** personalizados\n• 🎁 **Presentes** geek\n• 📦 **Organizadores** para setup\n• 🏠 **Decoração** para casa\n• ☕ **Itens** para cozinha\n• 💵 **Orçamento** personalizado\n• 👤 **Falar com humano**\n\nDigite o que você procura!',
        products: [],
        suggestions: ['Ver chaveiros', 'Presentes', 'Organizadores', 'Orçamento', 'Falar com humano'],
        handoff: false
      };
  }
}