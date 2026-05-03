'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  MessageCircle, 
  Clock, 
  Search, 
  Package, 
  RefreshCcw,
  ChevronRight,
  Send,
  Bot,
  User,
  MoreVertical,
  Paperclip,
  Smile,
  Phone
} from 'lucide-react';
import { Button } from '@/components/ui/button-simple';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { formatCurrency } from '@/lib/utils';

// Types
interface Ticket {
  id: string;
  subject: string;
  status: 'open' | 'in_progress' | 'waiting' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  lastMessage: string;
  lastUpdate: Date;
  unread: number;
}

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  views: number;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot' | 'agent';
  message: string;
  timestamp: Date;
  attachments?: string[];
}

// Main Support Page
export default function AtendimentoPage() {
  const [activeTab, setActiveTab] = useState<'chat' | 'tickets' | 'faq' | 'orders'>('chat');
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="min-h-screen bg-[#08111b] py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Central de Atendimento</h1>
          <p className="text-white/60">
            Estamos aqui para ajudar! Escolha o canal que preferir.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <QuickStat 
            icon={Clock} 
            label="Tempo de resposta" 
            value="< 30 min" 
            color="cyan"
          />
          <QuickStat 
            icon={MessageCircle} 
            label="Chat ao vivo" 
            value="Disponível" 
            color="emerald"
          />
          <QuickStat 
            icon={Phone} 
            label="WhatsApp" 
            value="(21) 99999-9999" 
            color="green"
          />
          <QuickStat 
            icon={Package} 
            label="Rastreamento" 
            value="Em tempo real" 
            color="purple"
          />
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {[
            { id: 'chat', label: 'Chat ao Vivo', icon: MessageCircle },
            { id: 'tickets', label: 'Meus Tickets', icon: Bot },
            { id: 'orders', label: 'Rastrear Pedido', icon: Package },
            { id: 'faq', label: 'FAQ / Ajuda', icon: Search },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                activeTab === tab.id
                  ? 'bg-cyan-500 text-white'
                  : 'bg-white/10 text-white/60 hover:bg-white/20'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {activeTab === 'chat' && <LiveChat />}
            {activeTab === 'tickets' && <TicketsList />}
            {activeTab === 'orders' && <OrderTracking />}
            {activeTab === 'faq' && <FAQSection searchQuery={searchQuery} />}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Options */}
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Outros Canais</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <a 
                  href="https://wa.me/5521999999999" 
                  target="_blank"
                  className="flex items-center gap-3 p-3 bg-green-500/10 rounded-lg hover:bg-green-500/20 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                    <Phone className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <p className="text-white font-medium">WhatsApp</p>
                    <p className="text-sm text-white/60">Resposta em minutos</p>
                  </div>
                </a>
                
                <a 
                  href="mailto:oi@mdh3d.com.br"
                  className="flex items-center gap-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center">
                    <MessageCircle className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <p className="text-white font-medium">E-mail</p>
                    <p className="text-sm text-white/60">oi@mdh3d.com.br</p>
                  </div>
                </a>
              </CardContent>
            </Card>

            {/* Working Hours */}
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Horário de Atendimento</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-white/80">
                    <span>Seg - Sex</span>
                    <span>08:00 - 20:00</span>
                  </div>
                  <div className="flex justify-between text-white/80">
                    <span>Sábado</span>
                    <span>09:00 - 17:00</span>
                  </div>
                  <div className="flex justify-between text-white/40">
                    <span>Domingo</span>
                    <span>Fechado</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

// Quick Stat Component
function QuickStat({ 
  icon: Icon, 
  label, 
  value, 
  color 
}: { 
  icon: React.ElementType; 
  label: string; 
  value: string; 
  color: string;
}) {
  const colorClasses: Record<string, string> = {
    cyan: 'bg-cyan-500/10 text-cyan-400',
    emerald: 'bg-emerald-500/10 text-emerald-400',
    green: 'bg-green-500/10 text-green-400',
    purple: 'bg-purple-500/10 text-purple-400',
  };

  return (
    <Card className="bg-white/5 border-white/10">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg ${colorClasses[color]} flex items-center justify-center`}>
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm text-white/60">{label}</p>
            <p className="text-lg font-semibold text-white">{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Live Chat Component
function LiveChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'bot',
      message: 'Olá! Sou a IA da MDH 3D. Como posso ajudar você hoje?\n\nEscolha uma opção ou digite sua pergunta:\n\n1️⃣ Dúvidas sobre produtos\n2️⃣ Status do pedido\n3️⃣ Política de troca/devolução\n4️⃣ Orçamento personalizado\n5️⃣ Falar com atendente humano',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      message: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const botResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        message: generateBotResponse(input),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const generateBotResponse = (userInput: string): string => {
    const lower = userInput.toLowerCase();
    
    if (lower.includes('1') || lower.includes('produto')) {
      return 'Temos diversos produtos em categorias como Presentes, Geek & Colecionáveis, Setup e Decoração.\n\nPosso te ajudar a encontrar algo específico. Qual categoria te interessa?';
    }
    if (lower.includes('2') || lower.includes('pedido')) {
      return 'Para consultar seu pedido, preciso do número do pedido ou do e-mail usado na compra.\n\nVocê pode também acessar direto em: https://mdh3d.com.br/conta/pedidos';
    }
    if (lower.includes('3') || lower.includes('troca') || lower.includes('devolução')) {
      return 'Você tem 7 dias para solicitar troca ou devolução, conforme o Código de Defesa do Consumidor.\n\nPara iniciar o processo, acesse sua conta em "Meus Pedidos" ou posso te enviar um link direto. Quer isso?';
    }
    if (lower.includes('4') || lower.includes('orçamento')) {
      return 'Para orçamentos personalizados, você pode:\n\n1. Enviar seu arquivo 3D em: https://mdh3d.com.br/imagem-para-impressao-3d\n2. Descrever o projeto aqui\n3. Agendar uma call\n\nQual prefere?';
    }
    if (lower.includes('5') || lower.includes('humano') || lower.includes('atendente')) {
      return 'Vou conectar você com um de nossos especialistas.\n\n⏱️ Tempo estimado: 2-5 minutos\n\nEnquanto isso, pode me contar brevemente sobre o que precisa? Isso ajuda a agilizar o atendimento.';
    }
    
    return 'Entendi! Para te ajudar melhor, poderia me dar mais detalhes? Ou se preferir, posso conectar você com um de nossos atendentes humanos.';
  };

  return (
    <Card className="bg-white/5 border-white/10 h-[600px] flex flex-col">
      <CardHeader className="border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center">
            <Bot className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <CardTitle className="text-white">Assistente Virtual</CardTitle>
            <p className="text-sm text-emerald-400 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Online
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${
              msg.sender === 'user' ? 'bg-cyan-500/20' : 'bg-white/10'
            }`}>
              {msg.sender === 'user' ? (
                <User className="w-4 h-4 text-cyan-400" />
              ) : (
                <Bot className="w-4 h-4 text-white" />
              )}
            </div>
            <div className={`max-w-[80%] p-3 rounded-lg whitespace-pre-line ${
              msg.sender === 'user'
                ? 'bg-cyan-500 text-white'
                : 'bg-white/10 text-white/90'
            }`}>
              {msg.message}
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="bg-white/10 p-3 rounded-lg flex items-center gap-1">
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
          <button className="p-2 text-white/40 hover:text-white transition-colors">
            <Paperclip className="w-5 h-5" />
          </button>
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Digite sua mensagem..."
            className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
          />
          <button className="p-2 text-white/40 hover:text-white transition-colors">
            <Smile className="w-5 h-5" />
          </button>
          <Button onClick={handleSend} className="px-4">
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </Card>
  );
}

// Tickets List Component
function TicketsList() {
  const [tickets, setTickets] = useState<Ticket[]>([
    {
      id: 'TKT-001',
      subject: 'Dúvida sobre material PLA',
      status: 'resolved',
      priority: 'medium',
      lastMessage: 'Obrigado pela ajuda!',
      lastUpdate: new Date(Date.now() - 86400000),
      unread: 0,
    },
    {
      id: 'TKT-002',
      subject: 'Pedido #4521 - Atraso na entrega',
      status: 'in_progress',
      priority: 'high',
      lastMessage: 'Estamos verificando com a transportadora...',
      lastUpdate: new Date(Date.now() - 3600000),
      unread: 2,
    },
  ]);

  const statusColors: Record<string, string> = {
    open: 'bg-amber-500/20 text-amber-400',
    in_progress: 'bg-cyan-500/20 text-cyan-400',
    waiting: 'bg-purple-500/20 text-purple-400',
    resolved: 'bg-emerald-500/20 text-emerald-400',
    closed: 'bg-white/10 text-white/40',
  };

  const statusLabels: Record<string, string> = {
    open: 'Aberto',
    in_progress: 'Em andamento',
    waiting: 'Aguardando',
    resolved: 'Resolvido',
    closed: 'Fechado',
  };

  return (
    <Card className="bg-white/5 border-white/10">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-white">Meus Tickets</CardTitle>
        <Button size="sm" variant="outline" className="border-cyan-500/50 text-cyan-400">
          Novo Ticket
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {tickets.map((ticket) => (
            <div
              key={ticket.id}
              className="p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer group"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm text-white/40">{ticket.id}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[ticket.status]}`}>
                      {statusLabels[ticket.status]}
                    </span>
                    {ticket.unread > 0 && (
                      <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                        {ticket.unread} novo{ticket.unread > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                  <h3 className="text-white font-medium group-hover:text-cyan-400 transition-colors">
                    {ticket.subject}
                  </h3>
                  <p className="text-sm text-white/60 mt-1 line-clamp-1">
                    {ticket.lastMessage}
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-white/40 group-hover:text-cyan-400 transition-colors" />
              </div>
              <div className="flex items-center gap-4 mt-3 text-xs text-white/40">
                <span>Última atualização: {formatTimeAgo(ticket.lastUpdate)}</span>
                <span className={`px-2 py-0.5 rounded ${
                  ticket.priority === 'urgent' ? 'bg-red-500/20 text-red-400' :
                  ticket.priority === 'high' ? 'bg-orange-500/20 text-orange-400' :
                  'bg-white/10'
                }`}>
                  {ticket.priority === 'urgent' ? 'Urgente' :
                   ticket.priority === 'high' ? 'Alta' :
                   ticket.priority === 'medium' ? 'Média' : 'Baixa'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Order Tracking Component
function OrderTracking() {
  const [orderNumber, setOrderNumber] = useState('');
  const [tracking, setTracking] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleTrack = async () => {
    if (!orderNumber) return;
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setTracking({
      id: orderNumber,
      status: 'shipped',
      carrier: 'Correios',
      trackingCode: 'BR123456789BR',
      estimatedDelivery: '25/01/2026',
      steps: [
        { label: 'Pedido Confirmado', completed: true, date: '20/01' },
        { label: 'Pagamento Aprovado', completed: true, date: '20/01' },
        { label: 'Em Produção', completed: true, date: '21/01' },
        { label: 'Enviado', completed: true, date: '22/01', active: true },
        { label: 'Em Trânsito', completed: false },
        { label: 'Entregue', completed: false },
      ],
    });
    setLoading(false);
  };

  return (
    <Card className="bg-white/5 border-white/10">
      <CardHeader>
        <CardTitle className="text-white">Rastrear Pedido</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 mb-6">
          <Input
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            placeholder="Digite o número do pedido"
            className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
          />
          <Button onClick={handleTrack} disabled={loading}>
            {loading ? (
              <RefreshCcw className="w-5 h-5 animate-spin" />
            ) : (
              'Rastrear'
            )}
          </Button>
        </div>

        {tracking && (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
              <div>
                <p className="text-white font-medium">Pedido #{tracking.id}</p>
                <p className="text-sm text-white/60">
                  {tracking.carrier} - {tracking.trackingCode}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-white/60">Entrega estimada</p>
                <p className="text-emerald-400 font-medium">{tracking.estimatedDelivery}</p>
              </div>
            </div>

            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-white/10" />
              <div className="space-y-4">
                {tracking.steps.map((step: any, idx: number) => (
                  <div key={idx} className="flex items-center gap-4 relative">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center z-10 ${
                      step.completed
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-white/10 text-white/40'
                    } ${step.active ? 'ring-2 ring-cyan-400 ring-offset-2 ring-offset-[#08111b]' : ''}`}>
                      {step.completed ? (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-current" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className={`font-medium ${step.completed || step.active ? 'text-white' : 'text-white/40'}`}>
                        {step.label}
                      </p>
                      {step.date && (
                        <p className="text-sm text-white/60">{step.date}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Button className="w-full" variant="outline">
              Ver detalhes completos
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// FAQ Section
function FAQSection({ searchQuery }: { searchQuery: string }) {
  const [faqs, setFaqs] = useState<FAQItem[]>([
    {
      id: '1',
      question: 'Qual o prazo de entrega?',
      answer: 'O prazo de entrega varia de 2 a 7 dias úteis, dependendo da sua localização. Para o Rio de Janeiro, entregamos em 24-48h.',
      category: 'Entrega',
      views: 1250,
    },
    {
      id: '2',
      question: 'Como funciona a política de troca?',
      answer: 'Você tem 7 dias após o recebimento para solicitar troca ou devolução, conforme o Código de Defesa do Consumidor.',
      category: 'Trocas',
      views: 890,
    },
    {
      id: '3',
      question: 'Quais materiais vocês usam?',
      answer: 'Trabalhamos com PLA, PETG, ABS, TPU e Resina. Cada material tem características específicas indicadas na página do produto.',
      category: 'Produtos',
      views: 756,
    },
    {
      id: '4',
      question: 'Posso enviar meu próprio arquivo 3D?',
      answer: 'Sim! Aceitamos arquivos STL, OBJ e 3MF. Use nossa ferramenta em "Imagem para Impressão 3D" para orçamento.',
      category: 'Personalizados',
      views: 634,
    },
  ]);

  const [expanded, setExpanded] = useState<string | null>(null);

  const filteredFaqs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Card className="bg-white/5 border-white/10">
      <CardHeader>
        <CardTitle className="text-white">Perguntas Frequentes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {filteredFaqs.map((faq) => (
            <div
              key={faq.id}
              className="border border-white/10 rounded-lg overflow-hidden"
            >
              <button
                onClick={() => setExpanded(expanded === faq.id ? null : faq.id)}
                className="w-full p-4 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
              >
                <div>
                  <span className="text-xs text-cyan-400 uppercase tracking-wider">
                    {faq.category}
                  </span>
                  <h3 className="text-white font-medium mt-1">{faq.question}</h3>
                </div>
                <ChevronRight className={`w-5 h-5 text-white/40 transition-transform ${
                  expanded === faq.id ? 'rotate-90' : ''
                }`} />
              </button>
              
              {expanded === faq.id && (
                <div className="px-4 pb-4">
                  <p className="text-white/80 leading-relaxed">{faq.answer}</p>
                  <p className="text-xs text-white/40 mt-2">
                    {faq.views} visualizações
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Helper function
function formatTimeAgo(date: Date): string {
  const diff = Date.now() - date.getTime();
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (hours < 1) return 'Agora';
  if (hours < 24) return `${hours}h atrás`;
  if (days === 1) return 'Ontem';
  return `${days} dias atrás`;
}
