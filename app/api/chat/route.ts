/**
 * Live Chat API Route
 */

import {
  startChatSession,
  sendChatMessage,
  getChatSession,
  getActiveChats,
  closeChatSession,
  getSupportStatus
} from '@/lib/live-chat-service';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const { action, user_id, visitor_id, thread_id, message, subject, priority } = body as Record<string, unknown>;
    const actorId = String(user_id || visitor_id || "").trim();
    const threadId = String(thread_id || "").trim();
    const text = String(message || "").trim();
    const subjectText = String(subject || "").trim();
    const priorityText = String(priority || "normal").trim();

    if (action === 'start') {
      if (!actorId) {
        return NextResponse.json(
          { error: 'Missing visitor or user id' },
          { status: 400 }
        );
      }

      const session = await startChatSession(actorId, subjectText, priorityText);
      return NextResponse.json(session);
    }

    if (action === 'send_message') {
      if (!threadId || !text) {
        return NextResponse.json(
          { error: 'Missing thread or message' },
          { status: 400 }
        );
      }

      const msg = await sendChatMessage({
        thread_id: threadId,
        sender_id: actorId,
        sender_type: 'customer',
        message: text
      });
      return NextResponse.json(msg);
    }

    if (action === 'close') {
      if (!threadId) {
        return NextResponse.json(
          { error: 'Missing thread id' },
          { status: 400 }
        );
      }

      await closeChatSession(threadId, Number((body as { rating?: unknown }).rating));
      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json(
      { error: 'Failed to process chat' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('user_id');
    const threadId = searchParams.get('thread_id');
    const action = searchParams.get('action');

    if (action === 'status') {
      const status = await getSupportStatus();
      return NextResponse.json(status);
    }

    if (threadId) {
      const session = await getChatSession(threadId);
      return NextResponse.json(session);
    }

    if (userId) {
      const chats = await getActiveChats(userId);
      return NextResponse.json(chats);
    }

    return NextResponse.json(
      { error: 'Invalid parameters' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Chat GET error:', error);
    return NextResponse.json(
      { error: 'Failed to get chat' },
      { status: 500 }
    );
  }
}
