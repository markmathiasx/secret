import { NextRequest, NextResponse } from "next/server";
import { addChatMessage, updateSessionStatus } from "@/lib/support/chat-storage";
import { processChatbotResponse, type ChatMessage } from "@/lib/chatbot/mdh-chatbot-engine";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sessionId, content, history } = body;

    if (!sessionId || !content) {
      return NextResponse.json({ ok: false, error: "Dados incompletos" }, { status: 400 });
    }

    // Save visitor message
    await addChatMessage({ sessionId, role: "visitor", content });

    // Process with engine
    const fullHistory: ChatMessage[] = [...(history || []), { role: "visitor", content }];
    const botResponse = await processChatbotResponse(fullHistory);

    // Save bot response
    await addChatMessage({ sessionId, role: "bot", content: botResponse.content });

    if (botResponse.intent === "human_handoff") {
      await updateSessionStatus(sessionId, "human_requested");
      // TODO: Disparar alerta ao admin
    }

    return NextResponse.json({ ok: true, response: botResponse });
  } catch (error) {
    return NextResponse.json({ ok: false, error: "Erro ao processar mensagem" }, { status: 500 });
  }
}
