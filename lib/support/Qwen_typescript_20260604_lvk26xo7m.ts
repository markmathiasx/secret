import { CatalogItem, searchByCategory, getPriceRange } from './catalog-index';
import { Intent } from './intent-classifier';

export function generateResponse(intent: Intent, message: string): {
  text: string;
  products?: CatalogItem[];
  suggestions: string[];
  handoff: boolean;
} {
  const baseUrl = 'https://www.mdh3d.com.br';
  
  switch (intent) {
    case 'chaveiro': {
      const products = searchByCategory('chaveiro').slice(0, 6);
      const range = getPriceRange(products);
      return {
        text: `Tenho chaveiros personalizados a partir de R$ ${range.min.toFixed(2)}. Os mais pedidos são:`,
        products,
        suggestions: ['Ver chaveiros de nome', 'Chaveiros pet', 'Chaveiros geek', 'Orçamento para lote'],
        handoff: false
      };
    }
    
    case 'presente': {
      const products = searchByCategory('presente').slice(0, 6);
      return {
        text: 'Para presentes, recomendo estes itens que fazem sucesso:',
        products,
        suggestions: ['Presentes até R$ 50', 'Presentes geek', 'Personalizados', 'Falar com atendente'],
        handoff: false
      };
    }
    
    case 'geek': {
      const products = searchByCategory('geek').slice(0, 6);
      return {
        text: 'Temos vários itens geek! Confira:',
        products,
        suggestions: ['Pokemon', 'Anime', 'Games', 'Ver todos'],
        handoff: false
      };
    }
    
    case 'orcamento': {
      return {
        text: 'Para orçamento personalizado, preciso de algumas informações:\n\n1. Qual o tipo de peça?\n2. Tem arquivo STL ou é ideia?\n3. Qual tamanho aproximado?\n4. Qual cor?\n5. Para quando precisa?\n\nMe conte e te passo o valor!',
        suggestions: ['É um chaveiro', 'É uma miniatura', 'É organizador', 'Falar no WhatsApp'],
        handoff: false
      };
    }
    
    case 'humano': {
      return {
        text: 'Vou te transferir para um atendente humano no WhatsApp. Clique abaixo:',
        suggestions: [],
        handoff: true,
        products: []
      };
    }
    
    case 'saudacao': {
      return {
        text: 'Olá! Bem-vindo à MDH 3D! 🎮\n\nComo posso te ajudar hoje?\n\nPosso te mostrar:\n- Chaveiros personalizados\n- Presentes geek\n- Organizadores\n- Orçamento personalizado',
        suggestions: ['Ver chaveiros', 'Ver presentes', 'Orçamento', 'Falar com humano'],
        handoff: false
      };
    }
    
    default: {
      return {
        text: 'Entendi! Para te ajudar melhor, você pode:\n- Digitar "chaveiro" para ver chaveiros\n- Digitar "presente" para ideias de presente\n- Digitar "orçamento" para peça personalizada\n- Digitar "humano" para falar com atendente',
        suggestions: ['Chaveiros', 'Presentes', 'Orçamento', 'Atendente'],
        handoff: false
      };
    }
  }
}