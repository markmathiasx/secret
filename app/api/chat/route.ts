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
    const body = await req.json();
    const { action, user_id, thread_id, message, subject, priority } = body;

    if (action === 'start') {
      const session = await startChatSession(user_id, subject, priority);
      return NextResponse.json(session);
    }

    if (action === 'send_message') {
      const msg = await sendChatMessage({
        thread_id,
        sender_id: user_id,
        sender_type: 'customer',
        message
      });
      return NextResponse.json(msg);
    }

    if (action === 'close') {
      await closeChatSession(thread_id, body.rating);
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
