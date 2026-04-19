/**
 * Live Chat & AI Support Service for 2026
 * Real-time customer support with AI-powered responses
 */

import { prisma } from './prisma';
import { OpenAI } from 'openai';

let openai: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!openai && process.env.OPENAI_API_KEY) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }
  return openai || ({} as OpenAI);
}

export interface ChatMessage {
  id?: string;
  thread_id: string;
  sender_id: string;
  sender_type: 'customer' | 'support_agent' | 'ai';
  message: string;
  attachments?: string[];
  is_ai_generated?: boolean;
  confidence_score?: number;
  created_at?: Date;
}

export interface ChatSession {
  id: string;
  customer_id: string;
  subject: string;
  status: 'active' | 'waiting' | 'resolved' | 'closed';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  assigned_agent_id?: string;
  messages: ChatMessage[];
  created_at: Date;
  updated_at: Date;
}

/**
 * Start a new chat session
 */
export async function startChatSession(customerId: string, subject: string, priority: string = 'normal'): Promise<ChatSession> {
  const session = await prisma.chatThread.create({
    data: {
      buyerId: customerId,
      subject,
      type: 'SUPPORT',
      lastMessageAt: new Date()
    }
  });

  return {
    id: session.id,
    customer_id: session.buyerId || '',
    subject: session.subject || '',
    status: 'active',
    priority: 'normal',
    messages: [],
    created_at: session.createdAt,
    updated_at: session.updatedAt
  };
}

/**
 * Send message in chat (customer or AI)
 */
export async function sendChatMessage(message: ChatMessage): Promise<ChatMessage> {
  const saved = await prisma.chatMessage.create({
    data: {
      threadId: message.thread_id,
      senderId: message.sender_id,
      body: message.message,
      attachments: message.attachments ? { attachments: message.attachments } : undefined
    }
  });

  // If customer message, trigger AI response
  if (message.sender_type === 'customer') {
    setTimeout(() => {
      generateAIResponse(message.thread_id, message.message).catch(err =>
        console.error('AI response error:', err)
      );
    }, 500);
  }

  return {
    id: saved.id,
    thread_id: saved.threadId,
    sender_id: saved.senderId,
    sender_type: message.sender_type,
    message: saved.body,
    attachments: message.attachments,
    created_at: saved.createdAt
  };
}

/**
 * Generate AI response to customer message
 */
async function generateAIResponse(threadId: string, customerMessage: string): Promise<void> {
  try {
    // Get conversation history for context
    const history = await prisma.chatMessage.findMany({
      where: { threadId: threadId },
      orderBy: { createdAt: 'asc' },
      take: 10
    });

    // Build conversation context
    const conversationContext = history
      .map(m => `${m.senderId}: ${m.body}`)
      .join('\n');

    const systemPrompt = `You are a helpful customer support AI for MDH 3D Store, a professional 3D printing service.
    
Guidelines:
- Be friendly, professional, and helpful
- Provide accurate information about 3D printing, products, and services
- If you're unsure, admit it and offer to connect with a human agent
- Keep responses concise (under 150 words)
- Include product recommendations when relevant
- Always offer a way to escalate to human support

Store Information:
- Specializes in 3D printing services and products
- Located in Rio de Janeiro
- Offers custom printing, 3D models, and pre-made products
- Payment methods: Credit card, PIX, Mercado Pago
- Shipping: Rio area and nationwide`;

    const messages = [
      { role: 'system' as const, content: systemPrompt },
      ...history
        .map(m => ({
          role: (m.senderId === 'ai-bot' ? 'assistant' : 'user') as 'user' | 'assistant',
          content: m.body
        })),
      { role: 'user' as const, content: customerMessage }
    ];

    const response = await getOpenAIClient().chat.completions.create({
      model: 'gpt-4',
      messages: messages as any,
      temperature: 0.7,
      max_tokens: 200
    });

    const aiMessage = response.choices[0]?.message?.content || 'How can I help you?';

    // Save AI response
    await prisma.chatMessage.create({
      data: {
        threadId: threadId,
        senderId: 'ai-bot',
        body: aiMessage
      }
    });
  } catch (error) {
    console.error('AI response generation error:', error);
    
    // Save fallback message
    await prisma.chatMessage.create({
      data: {
        threadId: threadId,
        senderId: 'ai-bot',
        body: 'Thanks for your message! A team member will get back to you shortly. How can we help?'
      }
    });
  }
}

/**
 * Get chat session with messages
 */
export async function getChatSession(threadId: string): Promise<ChatSession | null> {
  const thread = await prisma.chatThread.findUnique({
    where: { id: threadId },
    include: { messages: true }
  });

  if (!thread) return null;

  return {
    id: thread.id,
    customer_id: thread.buyerId || '',
    subject: thread.subject || '',
    status: 'active',
    priority: 'normal',
    assigned_agent_id: thread.sellerId || undefined,
    messages: thread.messages.map(m => ({
      id: m.id,
      thread_id: m.threadId,
      sender_id: m.senderId,
      sender_type: m.senderId === 'ai-bot' ? 'ai' : m.senderId === 'system' ? 'support_agent' : 'customer',
      message: m.body,
      created_at: m.createdAt
    })),
    created_at: thread.createdAt,
    updated_at: thread.updatedAt
  };
}

/**
 * Get active chats for customer
 */
export async function getActiveChats(customerId: string): Promise<ChatSession[]> {
  const threads = await prisma.chatThread.findMany({
    where: {
      buyerId: customerId
    },
    orderBy: { updatedAt: 'desc' }
  });

  return threads.map(t => ({
    id: t.id,
    customer_id: t.buyerId || '',
    subject: t.subject || '',
    status: 'active',
    priority: 'normal',
    assigned_agent_id: t.sellerId || undefined,
    messages: [],
    created_at: t.createdAt,
    updated_at: t.updatedAt
  }));
}

/**
 * Close chat session
 */
export async function closeChatSession(threadId: string, rating?: number): Promise<void> {
  await prisma.chatThread.update({
    where: { id: threadId },
    data: {
      updatedAt: new Date()
    }
  });
}

/**
 * Assign human agent to chat
 */
export async function assignAgentToChat(threadId: string, agentId: string): Promise<void> {
  await prisma.chatThread.update({
    where: { id: threadId },
    data: {
      sellerId: agentId,
      updatedAt: new Date()
    }
  });

  // Add system message
  await prisma.chatMessage.create({
    data: {
      threadId: threadId,
      senderId: 'system',
      body: `Support agent assigned. They will be with you shortly.`
    }
  });
}

/**
 * Get FAQs relevant to customer inquiry
 */
export async function getSuggestedFAQs(query: string): Promise<any[]> {
  // For now, return empty array
  // In production, implement FAQ search
  return [];
}

/**
 * Get support status and estimated wait time
 */
export async function getSupportStatus(): Promise<{
  available: boolean;
  average_wait_time: number;
  active_agents: number;
  queue_length: number;
}> {
  const activeChats = await prisma.chatThread.count();

  const activeAgents = await prisma.user.count({
    where: {
      role: { in: ['ADMIN'] }
    }
  });

  return {
    available: activeAgents > 0,
    average_wait_time: activeAgents > 0 ? Math.ceil(activeChats / activeAgents) * 5 : 30,
    active_agents: activeAgents,
    queue_length: activeChats
  };
}

/**
 * Get chat analytics
 */
export async function getChatAnalytics(days: number = 30) {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const chats = await prisma.chatThread.findMany({
    where: { createdAt: { gte: since } }
  });

  const messages = await prisma.chatMessage.findMany({
    where: { createdAt: { gte: since } }
  });

  return {
    total_chats: chats.length,
    closed_chats: 0,
    total_messages: messages.length,
    ai_messages: 0,
    average_resolution_time: 0,
    customer_satisfaction: 0
  };
}

function calculateAverageResolutionTime(chats: any[]): number {
  return 0;
}

async function getAverageRating(chats: any[]): Promise<number> {
  return 0;
}
