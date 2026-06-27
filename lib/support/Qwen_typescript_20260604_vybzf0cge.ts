import { NextRequest, NextResponse } from 'next/server';
import { classifyIntent } from '@/lib/support/intent-classifier';
import { generateResponse } from '@/lib/support/response-engine';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, sessionId } = body;

    // Validação de entrada
    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { ok: false, error: 'Mensagem inválida' },
        { status: 400 }
      );
    }

    if (message.length > 1000) {
      return NextResponse.json(
        { ok: false, error: 'Mensagem muito longa (máx. 1000 caracteres)' },
        { status: 400 }
      );
    }

    if (message.trim().length === 0) {
      return NextResponse.json(
        { ok: false, error: 'Mensagem vazia' },
        { status: 400 }
      );
    }

    // Classificar intenção e gerar resposta
    const intent = classifyIntent(message);
    const response = generateResponse(intent, message);

    // Retornar resposta
    return NextResponse.json({
      ok: true,
      reply: response.text,
      products: response.products,
      suggestions: response.suggestions,
      handoff: response.handoff,
      whatsappLink: response.whatsappLink || null,
      intent: intent
    });
  } catch (error) {
    console.error('Support API error:', error);
    
    // Não vazar detalhes do erro
    return NextResponse.json(
      { ok: false, error: 'Erro ao processar mensagem. Tente novamente.' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { ok: false, error: 'Use POST para enviar mensagens' },
    { status: 405 }
  );
}