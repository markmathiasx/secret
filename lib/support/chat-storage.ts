import { createClient } from "@supabase/supabase-js";
import { getSupabaseEnv } from "@/lib/env";
import { canConnectToDatabase, prisma } from "@/lib/prisma";
import type { ChatRole } from "@/lib/chatbot/mdh-chatbot-engine";

export type ChatSessionStatus = "bot" | "human_requested" | "human_active" | "closed";

export interface ChatSessionPayload {
  publicId: string;
  visitorId: string;
  visitorName?: string;
  visitorContact?: string;
  sourcePage?: string;
  firstProductId?: string;
  firstProductName?: string;
  metadata?: any;
}

export interface ChatMessagePayload {
  sessionId: string;
  role: ChatRole;
  content: string;
  metadata?: any;
}

const MEMORY_SESSIONS: Record<string, any> = {};
const MEMORY_MESSAGES: Record<string, any[]> = {};

function getSupabaseAdmin() {
  const { url, serviceRole } = getSupabaseEnv();
  if (!url || !serviceRole) return null;
  return createClient(url, serviceRole);
}

export async function createChatSession(payload: ChatSessionPayload) {
  if (await canConnectToDatabase()) {
    try {
      const session = await prisma.supportChatSession.create({
        data: {
          publicId: payload.publicId,
          visitorId: payload.visitorId,
          visitorName: payload.visitorName,
          visitorContact: payload.visitorContact,
          sourcePage: payload.sourcePage,
          firstProductId: payload.firstProductId,
          firstProductName: payload.firstProductName,
          metadata: payload.metadata || {},
        },
      });
      return { ok: true, storage: "prisma", data: session };
    } catch (err) {
      console.error("[chat-storage] Prisma create session failed", err);
    }
  }

  const supabase = getSupabaseAdmin();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("support_chat_sessions")
        .insert({
          public_id: payload.publicId,
          visitor_id: payload.visitorId,
          visitor_name: payload.visitorName,
          visitor_contact: payload.visitorContact,
          source_page: payload.sourcePage,
          first_product_id: payload.firstProductId,
          first_product_name: payload.firstProductName,
          metadata: payload.metadata || {},
        })
        .select()
        .single();
      if (!error) return { ok: true, storage: "supabase", data };
    } catch (err) {
      console.error("[chat-storage] Supabase create session failed", err);
    }
  }

  // Fallback Memory
  MEMORY_SESSIONS[payload.publicId] = { ...payload, id: payload.publicId, status: "bot", createdAt: new Date() };
  MEMORY_MESSAGES[payload.publicId] = [];
  return { ok: true, storage: "memory", data: MEMORY_SESSIONS[payload.publicId] };
}

export async function addChatMessage(payload: ChatMessagePayload) {
  if (await canConnectToDatabase()) {
    try {
      const session = await prisma.supportChatSession.findUnique({ where: { publicId: payload.sessionId } });
      if (session) {
        const message = await prisma.supportChatMessage.create({
          data: {
            sessionId: session.id,
            role: payload.role,
            content: payload.content,
            metadata: payload.metadata || {},
          },
        });
        return { ok: true, storage: "prisma", data: message };
      }
    } catch (err) {
      console.error("[chat-storage] Prisma add message failed", err);
    }
  }

  const supabase = getSupabaseAdmin();
  if (supabase) {
    try {
      const { data: session } = await supabase.from("support_chat_sessions").select("id").eq("public_id", payload.sessionId).single();
      if (session) {
        const { data, error } = await supabase
          .from("support_chat_messages")
          .insert({
            session_id: session.id,
            role: payload.role,
            content: payload.content,
            metadata: payload.metadata || {},
          })
          .select()
          .single();
        if (!error) return { ok: true, storage: "supabase", data };
      }
    } catch (err) {
      console.error("[chat-storage] Supabase add message failed", err);
    }
  }

  // Fallback Memory
  const msg = { ...payload, id: Math.random().toString(36), createdAt: new Date() };
  if (!MEMORY_MESSAGES[payload.sessionId]) MEMORY_MESSAGES[payload.sessionId] = [];
  MEMORY_MESSAGES[payload.sessionId].push(msg);
  return { ok: true, storage: "memory", data: msg };
}

export async function updateSessionStatus(publicId: string, status: ChatSessionStatus) {
  if (await canConnectToDatabase()) {
    try {
      await prisma.supportChatSession.update({
        where: { publicId },
        data: { status },
      });
    } catch {}
  }

  const supabase = getSupabaseAdmin();
  if (supabase) {
    try {
      await supabase.from("support_chat_sessions").update({ status }).eq("public_id", publicId);
    } catch {}
  }

  if (MEMORY_SESSIONS[publicId]) {
    MEMORY_SESSIONS[publicId].status = status;
  }
}
