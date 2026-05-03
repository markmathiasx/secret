"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, MessageCircle, Send, User, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button-simple';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import Link from 'next/link';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  suggestions?: string[];
  product?: {
    name: string;
    slug: string;
    price: number;
    image?: string;
  };
}

interface AIAssistantProps {
  currentPage?: string;
  productContext?: {
    name: string;
    slug: string;
    category: string;
  };
}

export function AIAssistant({ currentPage, productContext }: AIAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Proactive message based on context
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage = generateWelcomeMessage(currentPage, productContext);
      setMessages([welcomeMessage]);
    }
  }, [isOpen, messages.length, currentPage, productContext]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate AI processing
    setTimeout(() => {
      const response = generateAIResponse(input, productContext);
      setMessages((prev) => [...prev, response]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
    handleSend();
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 
                   bg-gradient-to-r from-cyan-500 to-blue-500 text-white 
                   rounded-full shadow-lg hover:shadow-xl hover:scale-105 
                   transition-all duration-300 group"
      >
        <Sparkles className="w-5 h-5 group-hover:animate-spin" />
        <span className="font-medium">Assistente IA</span>
        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
      </button>
    );
  }

  return (
    <Card className="fixed bottom-6 right-6 z-50 w-96 h-[500px] bg-[#0a1628] border-cyan-500/30 shadow-2xl flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between border-b border-white/10 py-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-white font-medium">Assistente MDH 3D</h3>
            <p className="text-xs text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
              Online agora
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="p-2 text-white/40 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id}>
            <div
              className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  msg.role === 'user' ? 'bg-cyan-500/20' : 'bg-gradient-to-r from-cyan-500 to-blue-500'
                }`}
              >
                {msg.role === 'user' ? (
                  <User className="w-4 h-4 text-cyan-400" />
                ) : (
                  <Bot className="w-4 h-4 text-white" />
                )}
              </div>
              <div
                className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                  msg.role === 'user'
                    ? 'bg-cyan-500 text-white'
                    : 'bg-white/10 text-white/90'
                }`}
              >
                {msg.content}
              </div>
            </div>

            {/* Product suggestion */}
            {msg.product && (
              <Link
                href={`/catalogo/${msg.product.slug}`}
                className="flex items-center gap-3 mt-2 ml-11 p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
              >
                {msg.product.image && (
                  <div className="w-12 h-12 rounded bg-white/10" />
                )}
                <div>
                  <p className="text-white text-sm font-medium">{msg.product.name}</p>
                  <p className="text-cyan-400 text-sm">
                    R$ {msg.product.price.toFixed(2)}
                  </p>
                </div>
              </Link>
            )}

            {/* Suggestions */}
            {msg.suggestions && msg.suggestions.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2 ml-11">
                {msg.suggestions.map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="text-xs px-3 py-1.5 bg-white/10 text-cyan-400 rounded-full hover:bg-cyan-500/20 transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}

        {isTyping && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="bg-white/10 p-3 rounded-2xl flex items-center gap-1">
              <span className="w-2 h-2 bg-white/40 rounded-full animate-bounce" />
              <span className="w-2 h-2 bg-white/40 rounded-full animate-bounce delay-100" />
              <span className="w-2 h-2 bg-white/40 rounded-full animate-bounce delay-200" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </CardContent>

      <div className="p-4 border-t border-white/10">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Digite sua pergunta..."
            className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
          />
          <Button onClick={handleSend} className="px-3">
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-xs text-white/40 mt-2 text-center">
          Powered by MDH 3D AI • <button className="underline hover:text-white">Falar com humano</button>
        </p>
      </div>
    </Card>
  );
}

// Generate contextual welcome message
function generateWelcomeMessage(
  currentPage?: string,
  productContext?: { name: string; slug: string; category: string }
): Message {
  if (productContext) {
    return {
      id: 'welcome',
      role: 'assistant',
      content: `Oi! Vi que você está olhando o **${productContext.name}**. Posso te ajudar com:\n\n• Detalhes sobre material e acabamento\n• Prazo de entrega para sua região\n• Combinações que vendem bem juntas\n• Dúvidas sobre personalização`,
      suggestions: [
        'Qual material recomenda?',
        'Quanto tempo leva?',
        'Tem desconto?',
        'Posso personalizar?',
      ],
    };
  }

  const messages: Record<string, Message> = {
    '/catalogo': {
      id: 'welcome',
      role: 'assistant',
      content: 'Oi! Precisa de ajuda para encontrar algo? Posso:\n\n• Sugerir produtos por categoria\n• Ajudar a comparar opções\n• Verificar disponibilidade\n• Dar dicas de presentes',
      suggestions: [
        'Presentes até R$ 100',
        'O que é mais vendido?',
        'Algo para setup gamer',
        'Decoração geek',
      ],
    },
    '/checkout': {
      id: 'welcome',
      role: 'assistant',
      content: 'Quase lá! 🎉\n\nPosso ajudar com:\n• Dúvidas sobre pagamento\n• Prazo de entrega\n• Política de troca\n• Cupom de desconto?',
      suggestions: [
        'Tem cupom disponível?',
        'Prazo de entrega?',
        'Formas de pagamento',
        'Política de troca',
      ],
    },
  };

  return messages[currentPage || ''] || {
    id: 'welcome',
    role: 'assistant',
    content: 'Olá! Sou o assistente virtual da MDH 3D. Como posso ajudar você hoje?',
    suggestions: [
      'Ver catálogo',
      'Rastrear pedido',
      'Orçamento personalizado',
      'Falar com atendente',
    ],
  };
}

// Generate AI response based on input
function generateAIResponse(
  input: string,
  productContext?: { name: string; slug: string; category: string }
): Message {
  const lower = input.toLowerCase();

  // Material questions
  if (lower.includes('material') || lower.includes('pla') || lower.includes('filamento')) {
    return {
      id: Date.now().toString(),
      role: 'assistant',
      content: `Para **${productContext?.name || 'peças decorativas'}**, recomendamos:\n\n**PLA** - Acabamento premium, cores vibrantes, biodegradável\n**PETG** - Mais resistente, ideal para peças funcionais\n**ABS** - Alta resistência térmica (mais caro)\n\nO padrão é PLA por ter o melhor custo-benefício. Quer mudar para outro material?`,
      suggestions: ['Manter PLA', 'Quero PETG', 'Qual a diferença?'],
    };
  }

  // Pricing/discount questions
  if (lower.includes('preço') || lower.includes('desconto') || lower.includes('cupom')) {
    return {
      id: Date.now().toString(),
      role: 'assistant',
      content: 'Tem algumas formas de economizar:\n\n🎁 **PRIMEIRA10** - 10% OFF primeira compra\n🚚 **Frete grátis** acima de R$ 150\n📦 **Kit 3 peças** = 15% OFF no total\n\nQuer aplicar algum cupom agora?',
      suggestions: ['Aplicar PRIMEIRA10', 'Ver mais cupons', 'Quanto falta para frete grátis?'],
    };
  }

  // Delivery questions
  if (lower.includes('prazo') || lower.includes('entrega') || lower.includes('frete')) {
    return {
      id: Date.now().toString(),
      role: 'assistant',
      content: 'Nossos prazos:\n\n📍 **Rio de Janeiro**: 24-48h (produção local)\n🚚 **Sudeste**: 2-3 dias úteis\n📦 **Demais regiões**: 3-7 dias úteis\n\nO frete é calculado no checkout baseado no CEP. Posso verificar o prazo para sua cidade se informar o CEP.',
      suggestions: ['Meu CEP é 22040-102', 'Frete grátis?', 'Rastrear pedido'],
    };
  }

  // Customization
  if (lower.includes('personalizar') || lower.includes('customizar') || lower.includes('cor')) {
    return {
      id: Date.now().toString(),
      role: 'assistant',
      content: 'Oferecemos personalização!\n\n🎨 **Cores disponíveis:** Preto, Branco, Cinza, Azul, Vermelho, Verde, Dourado, Prata\n✏️ **Texto/Nome:** +R$ 5 por peça\n🎁 **Embalagem de presente:** +R$ 8\n\nQuer adicionar alguma personalização?',
      suggestions: ['Quero cor diferente', 'Adicionar nome', 'Embalagem presente'],
    };
  }

  // Comparison
  if (lower.includes('comparar') || lower.includes('diferença') || lower.includes('versus')) {
    return {
      id: Date.now().toString(),
      role: 'assistant',
      content: 'Posso te ajudar a comparar! Me diga quais produtos ou características quer comparar.\n\nExemplos:\n• Material PLA vs PETG\n• Este vs modelo similar\n• Preços entre categorias',
      suggestions: ['PLA vs PETG', 'Ver similares', 'Qual mais vendido?'],
    };
  }

  // Default response
  return {
    id: Date.now().toString(),
    role: 'assistant',
    content: 'Entendi! Para te ajudar melhor, você pode:\n\n1️⃣ Descrever o que precisa\n2️⃣ Perguntar sobre um produto específico\n3️⃣ Solicitar um orçamento\n4️⃣ Falar com um atendente humano',
    suggestions: ['Ver produtos', 'Orçamento', 'Falar com humano'],
  };
}

// Floating button for all pages
export function AIAssistantButton() {
  return <AIAssistant />;
}
