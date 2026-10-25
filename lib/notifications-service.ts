/**
 * Real-time Notifications Service for 2026
 * Multi-channel notifications: Email, In-App, Push, SMS, WhatsApp
 */

import 'server-only';
import type { Prisma } from '@prisma/client';
import { prisma } from './prisma';
import nodemailer from 'nodemailer';
import { getSiteUrl } from '@/lib/env';
import { sendWhatsAppText } from "@/lib/meta/whatsapp";
import { formatCurrency } from "@/lib/utils";
import { logStructured } from '@/lib/logger';

export type NotificationChannel = 'EMAIL' | 'IN_APP' | 'PUSH' | 'WHATSAPP';
export type NotificationType = 'order_confirmed' | 'shipment_update' | 'product_available' | 'price_drop' | 'review_request' | 'abandoned_cart' | 'promotion' | 'message';

export interface NotificationPreferences {
  email_marketing: boolean;
  email_orders: boolean;
  push_enabled: boolean;
  sms_enabled: boolean;
  whatsapp_enabled: boolean;
  digest_frequency: 'instant' | 'daily' | 'weekly' | 'never';
}

export interface NotificationPayload {
  type: NotificationType;
  user_id: string;
  title: string;
  message: string;
  channels: NotificationChannel[];
  data?: Record<string, unknown>;
  urgency?: 'low' | 'normal' | 'high';
  expire_at?: Date;
}

/**
 * Send multi-channel notification
 */
const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  email_marketing: true,
  email_orders: true,
  push_enabled: true,
  sms_enabled: false,
  whatsapp_enabled: false,
  digest_frequency: 'daily',
};

const MARKETING_NOTIFICATION_TYPES = new Set<NotificationType>([
  'product_available',
  'price_drop',
  'abandoned_cart',
  'promotion',
]);

function asRecord(value: unknown): Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

function normalizeNotificationPreferences(value: unknown): NotificationPreferences {
  const root = asRecord(value);
  const stored = asRecord(root.notificationPreferences ?? root);
  const digest = stored.digest_frequency;

  return {
    email_marketing: typeof stored.email_marketing === 'boolean' ? stored.email_marketing : DEFAULT_NOTIFICATION_PREFERENCES.email_marketing,
    email_orders: typeof stored.email_orders === 'boolean' ? stored.email_orders : DEFAULT_NOTIFICATION_PREFERENCES.email_orders,
    push_enabled: typeof stored.push_enabled === 'boolean' ? stored.push_enabled : DEFAULT_NOTIFICATION_PREFERENCES.push_enabled,
    sms_enabled: typeof stored.sms_enabled === 'boolean' ? stored.sms_enabled : DEFAULT_NOTIFICATION_PREFERENCES.sms_enabled,
    whatsapp_enabled: typeof stored.whatsapp_enabled === 'boolean' ? stored.whatsapp_enabled : DEFAULT_NOTIFICATION_PREFERENCES.whatsapp_enabled,
    digest_frequency: digest === 'instant' || digest === 'daily' || digest === 'weekly' || digest === 'never'
      ? digest
      : DEFAULT_NOTIFICATION_PREFERENCES.digest_frequency,
  };
}

function sanitizeNotificationPreferencePatch(preferences: Partial<NotificationPreferences>) {
  const patch: Partial<NotificationPreferences> = {};
  const booleanKeys = [
    'email_marketing',
    'email_orders',
    'push_enabled',
    'sms_enabled',
    'whatsapp_enabled',
  ] as const;

  for (const key of booleanKeys) {
    if (typeof preferences[key] === 'boolean') patch[key] = preferences[key];
  }

  const digest = preferences.digest_frequency;
  if (digest === 'instant' || digest === 'daily' || digest === 'weekly' || digest === 'never') {
    patch.digest_frequency = digest;
  }

  return patch;
}

function channelAllowed(
  channel: NotificationChannel,
  type: NotificationType,
  preferences: NotificationPreferences,
) {
  if (channel === 'EMAIL') {
    return MARKETING_NOTIFICATION_TYPES.has(type) ? preferences.email_marketing : preferences.email_orders;
  }
  if (channel === 'PUSH') return preferences.push_enabled;
  if (channel === 'WHATSAPP') return preferences.whatsapp_enabled;
  return true;
}

async function persistDeliveryResult(
  payload: NotificationPayload,
  channel: 'EMAIL' | 'PUSH',
  delivered: boolean,
) {
  try {
    await prisma.notification.create({
      data: {
        userId: payload.user_id,
        channel,
        title: payload.title,
        body: payload.message,
        linkUrl: typeof payload.data?.url === 'string' ? payload.data.url : undefined,
        payload: (payload.data || {}) as Prisma.InputJsonValue,
        status: delivered ? 'SENT' : 'FAILED',
        sentAt: delivered ? new Date() : undefined,
      },
    });
  } catch (error) {
    logStructured('warn', 'notification_delivery_persistence_failed', {
      userId: payload.user_id,
      channel,
      message: error instanceof Error ? error.message : 'unknown',
    });
  }
}

export async function sendNotification(payload: NotificationPayload): Promise<boolean> {
  try {
    const preferences = await getNotificationPreferences(payload.user_id);
    const channels = [...new Set(payload.channels)].filter((channel) => channelAllowed(channel, payload.type, preferences));
    const results = await Promise.allSettled(channels.map(async (channel) => {
      if (channel === 'IN_APP') return saveInAppNotification(payload);
      if (channel === 'WHATSAPP') return sendWhatsAppNotification(payload);

      const delivered = channel === 'EMAIL'
        ? await sendEmailNotification(payload)
        : await sendPushNotification(payload);
      await persistDeliveryResult(payload, channel, delivered);
      return delivered;
    }));

    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        logStructured('warn', 'notification_channel_failed', {
          userId: payload.user_id,
          channel: channels[index],
          message: result.reason instanceof Error ? result.reason.message : 'unknown',
        });
      }
    });

    return results.some((result) => result.status === 'fulfilled' && result.value);
  } catch (error) {
    logStructured('error', 'notification_dispatch_failed', {
      userId: payload.user_id,
      type: payload.type,
      message: error instanceof Error ? error.message : 'unknown',
    });
    return false;
  }
}

/**
 * Send email notification
 */
async function sendEmailNotification(payload: NotificationPayload): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: payload.user_id },
    select: { email: true, name: true }
  });

  if (!user?.email) return false;

  const smtpPassword = (process.env.SMTP_PASS || process.env.SMTP_PASSWORD || '').trim();
  const smtpFrom = (
    process.env.EMAIL_FROM ||
    process.env.SMTP_FROM ||
    `MDH 3D Store <noreply@${new URL(getSiteUrl()).hostname}>`
  ).trim();

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || process.env.MAILHOG_HOST || '127.0.0.1',
    port: Number(process.env.SMTP_PORT || process.env.MAILHOG_SMTP_PORT || 1025),
    secure: process.env.SMTP_SECURE === 'true',
    auth: process.env.SMTP_USER ? {
      user: process.env.SMTP_USER,
      pass: smtpPassword,
    } : undefined
  });

  const htmlContent = generateEmailTemplate(payload, user.name || 'Valued Customer');

  await transporter.sendMail({
    from: smtpFrom,
    to: user.email,
    subject: payload.title,
    html: htmlContent,
    replyTo: process.env.SMTP_REPLY_TO
  });

  return true;
}

/**
 * Save in-app notification
 */
async function saveInAppNotification(payload: NotificationPayload): Promise<boolean> {
  await prisma.notification.create({
    data: {
      userId: payload.user_id,
      channel: 'IN_APP',
      status: 'PENDING',
      title: payload.title,
      body: payload.message,
      linkUrl: typeof payload.data?.link_url === 'string' ? payload.data.link_url : undefined,
      payload: (payload.data || {}) as Prisma.InputJsonValue,
    }
  });
  return true;
}

/**
 * Send push notification (Web Push API)
 */
async function sendPushNotification(payload: NotificationPayload): Promise<boolean> {
  const { sendWebPushToUser } = await import("@/lib/web-push");
  const result = await sendWebPushToUser(payload.user_id, {
    title: payload.title,
    body: payload.message,
    url: typeof payload.data?.url === 'string' ? payload.data.url : "/",
    tag: payload.type,
  });
  return result.sent > 0;
}

/**
 * Send WhatsApp notification
 */
async function sendWhatsAppNotification(payload: NotificationPayload): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: payload.user_id },
    select: { phone: true }
  });

  if (!user?.phone) return false;

  const response = await sendWhatsAppText(user.phone, payload.message);
  if (!response.ok) {
    throw new Error(response.error?.message || "whatsapp_send_failed");
  }
  return true;
}

/**
 * Get user notifications
 */
export async function getUserNotifications(userId: string, unreadOnly: boolean = false) {
  const notifications = await prisma.notification.findMany({
    where: {
      userId: userId,
      ...(unreadOnly && { status: { not: 'READ' } })
    },
    orderBy: { createdAt: 'desc' },
    take: 50
  });

  return notifications;
}

/**
 * Mark notification as read
 */
export async function markNotificationAsRead(notificationId: string): Promise<void> {
  await prisma.notification.update({
    where: { id: notificationId },
    data: { status: 'READ', readAt: new Date() }
  });
}

/**
 * Get notification preferences for user
 */
export async function getNotificationPreferences(userId: string) {
  const profile = await prisma.userProfile.findUnique({
    where: { userId },
    select: { preferences: true },
  });
  return normalizeNotificationPreferences(profile?.preferences);
}

/**
 * Update notification preferences
 */
export async function updateNotificationPreferences(
  userId: string,
  preferences: Partial<NotificationPreferences>,
): Promise<void> {
  const currentProfile = await prisma.userProfile.findUnique({
    where: { userId },
    select: { preferences: true },
  });
  const currentRoot = asRecord(currentProfile?.preferences);
  const currentPreferences = normalizeNotificationPreferences(currentRoot);
  const preferencePatch = sanitizeNotificationPreferencePatch(preferences);
  const nextPreferences = normalizeNotificationPreferences({
    notificationPreferences: { ...currentPreferences, ...preferencePatch },
  });
  const nextRoot = {
    ...currentRoot,
    notificationPreferences: nextPreferences,
  } as unknown as Prisma.InputJsonValue;

  await prisma.userProfile.upsert({
    where: { userId },
    update: { preferences: nextRoot },
    create: { userId, preferences: nextRoot },
  });
}

/**
 * Send abandoned cart recovery notification
 */
export async function sendAbandonedCartNotification(userId: string, cartValue: number): Promise<boolean> {
  return sendNotification({
    type: 'abandoned_cart',
    user_id: userId,
    title: 'Seu carrinho MDH 3D está salvo',
    message: `Seu carrinho de ${formatCurrency(cartValue)} ainda está disponível. Finalize com Pix, cartão ou atendimento humano: ${getSiteUrl()}/checkout`,
    channels: ['WHATSAPP', 'EMAIL', 'IN_APP'],
    data: { cart_value: cartValue, discount_code: 'MDH5', url: `${getSiteUrl()}/checkout` },
    urgency: 'normal'
  });
}

export async function sendAbandonedCartEmail(userId: string, cartValue: number, stage: "24h" | "72h"): Promise<boolean> {
  const discount = stage === "24h" ? "MDH5" : "MDHCLIENTE";
  return sendNotification({
    type: "abandoned_cart",
    user_id: userId,
    title: stage === "24h" ? "Finalize seu carrinho com 5% off" : "Ainda pensando na sua peça 3D?",
    message:
      stage === "24h"
        ? `Seu carrinho de ${formatCurrency(cartValue)} pode ser retomado com o cupom ${discount}.`
        : `Clientes que validam cor, prazo e mídia validada antes de comprar costumam fechar com menos dúvida. Seu carrinho de ${formatCurrency(cartValue)} está salvo.`,
    channels: ["EMAIL", "IN_APP"],
    data: { cart_value: cartValue, discount_code: discount, stage, url: `${getSiteUrl()}/checkout` },
    urgency: "normal",
  });
}

/**
 * Send shipment update notification
 */
export async function sendShipmentNotification(
  userId: string,
  status: string,
  tracking: string
): Promise<boolean> {
  return sendNotification({
    type: 'shipment_update',
    user_id: userId,
    title: `📦 Your order is ${status}`,
    message: `Tracking: ${tracking}`,
    channels: ['EMAIL', 'IN_APP', 'PUSH', 'WHATSAPP'],
    data: { tracking_number: tracking, status },
    urgency: 'high'
  });
}

/**
 * Send product available notification (waitlist)
 */
export async function sendProductAvailableNotification(
  userId: string,
  productName: string,
  productId: string
): Promise<boolean> {
  return sendNotification({
    type: 'product_available',
    user_id: userId,
    title: `✨ ${productName} is back in stock!`,
    message: 'Limited quantities available. Shop now before it sells out.',
    channels: ['EMAIL', 'IN_APP', 'PUSH'],
    data: { product_id: productId },
    urgency: 'high'
  });
}

/**
 * Generate email template
 */
function generateEmailTemplate(payload: NotificationPayload, userName: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.5; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .cta { display: inline-block; background: #667eea; color: white; padding: 12px 24px; border-radius: 4px; text-decoration: none; margin-top: 15px; }
          .footer { font-size: 12px; color: #999; margin-top: 30px; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🌟 MDH 3D Store</h1>
          </div>
          <div class="content">
            <p>Hi ${userName},</p>
            <h2>${payload.title}</h2>
            <p>${payload.message}</p>
            <a href="${getSiteUrl()}" class="cta">View More</a>
            <div class="footer">
              <p>© 2026 MDH 3D Store. All rights reserved.</p>
              <p><a href="${getSiteUrl()}/notifications-preferences">Update your preferences</a></p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
}
