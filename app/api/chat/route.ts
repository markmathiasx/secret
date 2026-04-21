/**
 * Live Chat API Route
 */

import { getCustomerSessionSecret, createSignedSessionToken, verifySignedSessionToken } from "@/lib/session-token";
import {
  startChatSession,
  sendChatMessage,
  getChatSession,
  getActiveChats,
  closeChatSession,
  getSupportStatus,
  getChatThreadAccess,
} from '@/lib/live-chat-service';
import { NextRequest, NextResponse } from 'next/server';

const CHAT_COOKIE_NAME = "mdh_chat_session";
const CHAT_COOKIE_MAX_AGE = 60 * 60 * 24 * 30;
const CHAT_COOKIE_PATH = "/api/chat";

type ChatCookieMetadata = {
  threadId: string;
  customerId: string;
  visitorId: string;
};

async function createChatSessionCookie(metadata: ChatCookieMetadata) {
  const secret = getCustomerSessionSecret();
  if (!secret) {
    return null;
  }

  return createSignedSessionToken(
    {
      sub: metadata.customerId,
      email: `chat-${metadata.customerId}@guest.mdh.local`,
      displayName: "MDH Chat",
      role: "customer",
      expiresInSeconds: CHAT_COOKIE_MAX_AGE,
      metadata,
    },
    secret
  );
}

async function readChatSession(req: NextRequest) {
  const token = req.cookies.get(CHAT_COOKIE_NAME)?.value;
  const secret = getCustomerSessionSecret();
  if (!token || !secret) {
    return null;
  }

  const payload = await verifySignedSessionToken(token, secret);
  const metadata = payload?.metadata;
  if (
    !payload ||
    !metadata ||
    typeof metadata.threadId !== "string" ||
    typeof metadata.customerId !== "string" ||
    typeof metadata.visitorId !== "string"
  ) {
    return null;
  }

  return {
    customerId: metadata.customerId,
    threadId: metadata.threadId,
    visitorId: metadata.visitorId,
  };
}

function applyChatCookie(response: NextResponse, token: string) {
  response.cookies.set({
    name: CHAT_COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: CHAT_COOKIE_PATH,
    maxAge: CHAT_COOKIE_MAX_AGE,
  });
}

function clearChatCookie(response: NextResponse) {
  response.cookies.set({
    name: CHAT_COOKIE_NAME,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: CHAT_COOKIE_PATH,
    maxAge: 0,
  });
}

async function authorizeThread(req: NextRequest, requestedThreadId: string) {
  const session = await readChatSession(req);
  if (!session || session.threadId !== requestedThreadId) {
    return null;
  }

  const thread = await getChatThreadAccess(requestedThreadId);
  if (!thread || thread.buyerId !== session.customerId) {
    return null;
  }

  return session;
}

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

      if (!getCustomerSessionSecret()) {
        console.error("[chat] missing session secret");
        return NextResponse.json(
          { error: "Chat indisponível no momento." },
          { status: 503 }
        );
      }

      const session = await startChatSession(actorId, subjectText, priorityText);
      const chatToken = await createChatSessionCookie({
        threadId: session.id,
        customerId: session.customer_id,
        visitorId: session.visitor_id || actorId,
      });

      if (!chatToken) {
        console.error("[chat] failed to create chat cookie");
        return NextResponse.json(
          { error: "Chat indisponível no momento." },
          { status: 503 }
        );
      }

      const response = NextResponse.json(session);
      applyChatCookie(response, chatToken);
      return response;
    }

    if (action === 'send_message') {
      if (!threadId || !text) {
        return NextResponse.json(
          { error: 'Missing thread or message' },
          { status: 400 }
        );
      }

      const authorized = await authorizeThread(req, threadId);
      if (!authorized) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }

      const msg = await sendChatMessage({
        thread_id: threadId,
        sender_id: authorized.customerId,
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

      const authorized = await authorizeThread(req, threadId);
      if (!authorized) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }

      await closeChatSession(threadId, Number((body as { rating?: unknown }).rating));
      const response = NextResponse.json({ success: true });
      clearChatCookie(response);
      return response;
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('[chat] request failed', {
      message: error instanceof Error ? error.message : "unknown",
    });
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

    if (action === "current") {
      const session = await readChatSession(req);
      if (!session) {
        return NextResponse.json({ session: null });
      }

      const currentThread = await getChatSession(session.threadId);
      if (!currentThread || currentThread.customer_id !== session.customerId) {
        const response = NextResponse.json({ session: null });
        clearChatCookie(response);
        return response;
      }

      return NextResponse.json({ session: currentThread });
    }

    if (threadId) {
      const authorized = await authorizeThread(req, threadId);
      if (!authorized) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }

      const session = await getChatSession(threadId);
      return NextResponse.json(session);
    }

    if (userId) {
      const session = await readChatSession(req);
      if (!session || session.customerId !== userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }

      const chats = await getActiveChats(userId);
      return NextResponse.json(chats);
    }

    return NextResponse.json(
      { error: 'Invalid parameters' },
      { status: 400 }
    );
  } catch (error) {
    console.error('[chat] read failed', {
      message: error instanceof Error ? error.message : "unknown",
    });
    return NextResponse.json(
      { error: 'Failed to get chat' },
      { status: 500 }
    );
  }
}
