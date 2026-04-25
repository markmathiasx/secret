import "server-only";
import { prisma } from "@/lib/prisma";
import type { MetaChannel } from "./types";

/**
 * Shared utilities for persisting omnichannel messages into the ChatThread / ChatMessage tables.
 */

const AI_BOT_ID = "ai-bot";

const CHANNEL_EMAIL_PREFIX: Record<MetaChannel, string> = {
  whatsapp: "wa",
  facebook_page: "fb",
  instagram_dm: "ig",
  instagram_comment: "igc",
  site: "site",
};

/**
 * Ensures a bot/system user record exists in the DB.
 * All channels share the same AI_BOT_ID for consistency with existing code.
 */
export async function ensureBotUser() {
  return prisma.user.upsert({
    where: { id: AI_BOT_ID },
    update: { name: "Assistente MDH", role: "ADMIN", isActive: true, isInternalSeller: true },
    create: {
      id: AI_BOT_ID,
      email: "ai-bot@mdh.local",
      name: "Assistente MDH",
      role: "ADMIN",
      isActive: true,
      isInternalSeller: true,
    },
    select: { id: true },
  });
}

/**
 * Finds or creates a platform user mapped to an external channel ID.
 * Email scheme: `{prefix}-{externalId}@mdh.local`
 * e.g. fb-12345@mdh.local, ig-67890@mdh.local
 */
export async function ensureChannelUser(
  channel: MetaChannel,
  externalId: string,
  displayName?: string,
  phone?: string
) {
  const prefix = CHANNEL_EMAIL_PREFIX[channel];
  const safe = externalId.replace(/\W/g, "").slice(0, 40);
  const email = `${prefix}-${safe}@mdh.local`;

  return prisma.user.upsert({
    where: { email },
    update: {
      name: displayName ?? `${channel.toUpperCase()} ${safe.slice(-6)}`,
      ...(phone ? { phone } : {}),
      isActive: true,
    },
    create: {
      email,
      name: displayName ?? `${channel.toUpperCase()} ${safe.slice(-6)}`,
      role: "BUYER",
      isActive: true,
      ...(phone ? { phone } : {}),
    },
    select: { id: true, email: true, name: true, phone: true },
  });
}

/**
 * Finds or creates the latest open support thread for a user+channel pair.
 * Subject uniquely identifies the channel conversation.
 */
export async function ensureChannelThread(
  userId: string,
  channel: MetaChannel,
  subjectHint: string
) {
  const existing = await prisma.chatThread.findFirst({
    where: {
      buyerId: userId,
      type: "SUPPORT",
      subject: { contains: subjectHint, mode: "insensitive" },
    },
    orderBy: { updatedAt: "desc" },
  });
  if (existing) return existing;

  return prisma.chatThread.create({
    data: {
      buyerId: userId,
      type: "SUPPORT",
      subject: subjectHint,
      lastMessageAt: new Date(),
    },
  });
}

/** Persist an inbound message and update thread timestamp. */
export async function storeInboundMessage(
  threadId: string,
  senderId: string,
  body: string,
  meta?: { externalMessageId?: string }
) {
  await ensureBotUser();
  const msg = await prisma.chatMessage.create({
    data: {
      threadId,
      senderId,
      body,
      ...(meta?.externalMessageId
        ? { attachments: { externalMessageId: meta.externalMessageId } }
        : {}),
    },
  });
  await prisma.chatThread.update({
    where: { id: threadId },
    data: { lastMessageAt: new Date() },
  });
  return msg;
}

/** Persist a bot/agent reply message. */
export async function storeReplyMessage(threadId: string, body: string, senderId = AI_BOT_ID) {
  await ensureBotUser();
  const msg = await prisma.chatMessage.create({ data: { threadId, senderId, body } });
  await prisma.chatThread.update({
    where: { id: threadId },
    data: { lastMessageAt: new Date() },
  });
  return msg;
}

/**
 * Load the last N messages in a thread for AI context.
 */
export async function loadThreadHistory(threadId: string, take = 12) {
  return prisma.chatMessage.findMany({
    where: { threadId },
    orderBy: { createdAt: "asc" },
    take,
    select: { senderId: true, body: true },
  });
}
