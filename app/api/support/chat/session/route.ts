import { NextRequest, NextResponse } from "next/server";
import { createChatSession, addChatMessage } from "@/lib/support/chat-storage";
import { processChatbotResponse } from "@/lib/chatbot/mdh-chatbot-engine";
import crypto from "node:crypto";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { visitorId, sourcePage, firstProductId, firstProductName } = body;

    const publicId = Math.random().toString(36).substring(2, 15);

    const result = await createChatSession({
      publicId,
      visitorId: visitorId || "guest",
      sourcePage,
      firstProductId,
      firstProductName,
    });

    return NextResponse.json({ ok: true, session: result.data });
  } catch (error) {
    return NextResponse.json({ ok: false, error: "Falha ao criar sessão" }, { status: 500 });
  }
}
