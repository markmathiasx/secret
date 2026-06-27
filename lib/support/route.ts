import { NextRequest, NextResponse } from 'next/server';
import { classifyIntent } from '@/lib/support/intent-classifier';
import { generateResponse } from '@/lib/support/response-engine';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ ok: false, error: 'Mensagem inválida' }, { status: 400 });
    }

    if (message.length > 1000) {
      return NextResponse.json({ ok: false, error: 'Mensagem muito longa' }, { status: 400 });
    }

    const intent = classifyIntent(message);
    const response = generateResponse(intent, message);

    return NextResponse.json({
      ok: true,
      reply: response.text,
      products: response.products,
      suggestions: response.suggestions,
      handoff: response.handoff,
      whatsappLink: response.whatsappLink || null
    });
  } catch (error) {
    console.error('Support API error:', error);
    return NextResponse.json({ ok: false, error: 'Erro ao processar mensagem' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ ok: false, error: 'Use POST' }, { status: 405 });
}