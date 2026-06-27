import { CatalogItem, searchByCategory, searchByKeyword, getCheapest, getPriceRange, getProductLink } from './catalog-index';
import { Intent } from './intent-classifier';

const WHATSAPP_NUMBER = '5521974137662';

function formatProduct(p: CatalogItem): string {
  return `• **${p.name}** - Pix R$ ${p.pricePix.toFixed(2)} | Cartão R$ ${p.priceCard.toFixed(2)}\n  ${getProductLink(p.slug)}`;
}

function formatProducts(products: CatalogItem[], intro: string): string {
  if (products.length === 0) return `${intro}\n\nNão encontrei produtos agora, mas posso buscar algo sob encomenda. Quer falar com um atendente?`;
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
        text: 'Olá! 👋 Bem-vindo à MDH 3D!\n\nSomos especializados em impressão 3D personalizada no Rio de Janeiro. Posso te ajudar com:\n\n• Chaveiros personalizados\n• Presentes geek\n• Organizadores\n• Peças sob medida\n\nO que você procura?',
        products: [],
        suggestions: ['Ver chaveiros', 'Presentes geek', 'Orçamento personalizado', 'Falar com humano'],
        handoff: false
      };

    case 'agradecimento':
      return {
        text: 'Por nada! 😊 Estou aqui para ajudar. Precisa de mais alguma coisa?',
        products: [],
        suggestions: ['Ver produtos', 'Orçamento', 'Falar com humano'],
        handoff: false
      };

    case 'chaveiro': {
      const products = getCheapest(searchByCategory('chaveiro'), 6);
      const range = getPriceRange(products);
      return {
        text: formatProducts(products, `🔑 Tenho chaveiros personalizados de R$ ${range.min.toFixed(2)} a R$ ${range.max.toFixed(2)}. Os mais pedidos são:`),
        products,
        suggestions: ['Chaveiro com nome', 'Chaveiro pet', 'Chaveiro geek', 'Lote de chaveiros', 'Orçamento'],
        handoff: false
      };
    }

    case 'pokemon': {
      const products = getCheapest(searchByKeyword('pokemon').concat(searchByKeyword('geek')), 6);
      return {
        text: formatProducts(products, '⚡ Temos itens geek e inspirados em Pokémon! Confira:'),
        products,
        suggestions: ['Ver mais geek', 'Personalizar', 'Orçamento'],
        handoff: false
      };
    }

    case 'geek': {
      const products = getCheapest(searchByCategory('geek'), 6);
      return {
        text: formatProducts(products, '🎮 Confira nossos itens geek:'),
        products,
        suggestions: ['Pokemon', 'Anime', 'Games', 'Personalizar'],
        handoff: false
      };
    }

    case 'presente': {
      const products = getCheapest(searchByKeyword('presente').concat(searchByCategory('presente')), 6);
      return {
        text: formatProducts(products, '🎁 Para presentes, recomendo estes itens que fazem sucesso:'),
        products,
        suggestions: ['Presentes até R$ 50', 'Personalizados', 'Geek', 'Ver todos'],
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

    case 'setup': {
      const products = getCheapest(searchByCategory('setup').concat(searchByKeyword('setup')), 6);
      return {
        text: formatProducts(products, '🖥️ Para seu setup gamer:'),
        products,
        suggestions: ['Suporte controle', 'Organizadores', 'Personalizar'],
        handoff: false
      };
    }

    case 'organizador': {
      const products = getCheapest(searchByCategory('organizador').concat(searchByKeyword('organizador')), 6);
      return {
        text: formatProducts(products, '📦 Organizadores para sua mesa:'),
        products,
        suggestions: ['Para cabos', 'Para cápsulas', 'Personalizar'],
        handoff: false
      };
    }

    case 'personalizado':
      return {
        text: '✨ Fazemos peças 100% personalizadas!\n\nPara orçar, preciso saber:\n\n1. O que você quer? (chaveiro, miniatura, suporte...)\n2. Tem referência/foto/STL?\n3. Qual tamanho aproximado?\n4. Qual cor?\n5. Para quando precisa?\n6. Quantidade?\n\nMe conta que te passo o valor!',
        products: [],
        suggestions: ['É um chaveiro', 'É uma miniatura', 'É organizador', 'Falar no WhatsApp'],
        handoff: false
      };

    case 'orcamento':
      return {
        text: '💵 Para orçamento:\n\n• Pix: preço direto\n• Cartão: Pix + R$ 1,00\n• Prazo: varia conforme complexidade\n• Personalização: sob consulta\n\nMe diga qual peça você quer e te passo o valor exato!',
        products: [],
        suggestions: ['Chaveiro personalizado', 'Miniatura', 'Organizador', 'Falar com humano'],
        handoff: false
      };

    case 'prazo':
      return {
        text: '⏰ Prazos médios:\n\n• Pronta entrega: 1-2 dias úteis\n• Peças simples: 3-5 dias úteis\n• Personalizadas: 5-10 dias úteis\n• Lotes grandes: sob consulta\n\nEnvio pelos Correios ou retirada no RJ.',
        products: [],
        suggestions: ['Ver produtos', 'Orçamento', 'Falar com humano'],
        handoff: false
      };

    case 'pagamento':
      return {
        text: '💳 Formas de pagamento:\n\n• **Pix**: preço cheio\n• **Cartão**: Pix + R$ 1,00\n\nPagamento seguro via Mercado Pago.',
        products: [],
        suggestions: ['Ver produtos', 'Orçamento', 'Falar com humano'],
        handoff: false
      };

    case 'envio':
      return {
        text: '📦 Enviamos para todo Brasil via Correios.\n\n• PAC: 5-10 dias úteis\n• SEDEX: 2-5 dias úteis\n• Retirada local: Rio de Janeiro\n\nFrete calculado no checkout.',
        products: [],
        suggestions: ['Ver produtos', 'Rastreio', 'Falar com humano'],
        handoff: false
      };

    case 'troca':
      return {
        text: '🔄 Política de trocas:\n\n• 7 dias para arrependimento\n• Produto com defeito: trocamos\n• Personalizado: sem troca (exceto defeito)\n\nEntre em contato pelo WhatsApp.',
        products: [],
        suggestions: ['Falar com humano', 'Rastreio', 'Ver produtos'],
        handoff: false
      };

    case 'rastreio':
      return {
        text: '📍 Para rastrear seu pedido:\n\nMe envie o código de rastreio ou número do pedido que te ajudo!',
        products: [],
        suggestions: ['Falar com humano', 'Ver produtos'],
        handoff: true,
        whatsappLink: `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Olá! Vim pelo site e quero rastrear meu pedido.')}`
      };

    case 'lote':
      return {
        text: '🎁 Fazemos lotes e brindes corporativos!\n\nPara orçar, preciso saber:\n\n1. Tipo de peça\n2. Quantidade\n3. Personalização necessária\n4. Prazo\n\nDescontos progressivos para grandes quantidades.',
        products: [],
        suggestions: ['Chaveiros em lote', 'Brindes', 'Falar com humano'],
        handoff: false
      };

    case 'humano':
      return {
        text: '👤 Vou te transferir para um atendente humano no WhatsApp. Clique abaixo:',
        products: [],
        suggestions: [],
        handoff: true,
        whatsappLink: `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Olá! Vim pelo site e quero falar com um atendente.')}`
      };

    default:
      return {
        text: '🤔 Não entendi bem. Posso te ajudar com:\n\n• **Chaveiros** personalizados\n• **Presentes** geek\n• **Organizadores** para setup\n• **Orçamento** personalizado\n• **Falar com humano**\n\nDigite o que você procura!',
        products: [],
        suggestions: ['Ver chaveiros', 'Presentes', 'Orçamento', 'Falar com humano'],
        handoff: false
      };
  }
}