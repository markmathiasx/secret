import { NextRequest, NextResponse } from 'next/server';
import { classifyIntent } from '@/lib/support/intent-classifier';
import { generateResponse } from '@/lib/support/response-engine';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, sessionId } = body;
    
    if (!message || typeof message !== 'string' || message.length > 1000) {
      return NextResponse.json(
        { ok: false, error: 'Mensagem inválida' },
        { status: 400 }
      );
    }
    
    const intent = classifyIntent(message);
    const response = generateResponse(intent, message);
    
    return NextResponse.json({
      ok: true,
      reply: response.text,
      products: response.products || [],
      suggestions: response.suggestions,
      handoff: response.handoff,
      whatsappLink: response.handoff 
        ? `https://wa.me/5521974137662?text=${encodeURIComponent('Olá! Vim pelo site e preciso de atendimento humano.')}`
        : null
    });
    
  } catch (error) {
    console.error('Support API error:', error);
    return NextResponse.json(
      { ok: false, error: 'Erro ao processar mensagem' },
      { status: 500 }
    );
  }
}