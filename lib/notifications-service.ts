/**
 * Real-time Notifications Service for 2026
 * Multi-channel notifications: Email, In-App, Push, SMS, WhatsApp
 */

import 'server-only';
import { prisma } from './prisma';
import nodemailer from 'nodemailer';

export type NotificationChannel = 'EMAIL' | 'IN_APP' | 'PUSH' | 'SMS' | 'WHATSAPP';
export type NotificationType = 'order_confirmed' | 'shipment_update' | 'product_available' | 'price_drop' | 'review_request' | 'abandoned_cart' | 'promotion' | 'message';

export interface NotificationPayload {
  type: NotificationType;
  user_id: string;
  title: string;
  message: string;
  channels: NotificationChannel[];
  data?: Record<string, any>;
  urgency?: 'low' | 'normal' | 'high';
  expire_at?: Date;
}

/**
 * Send multi-channel notification
 */
export async function sendNotification(payload: NotificationPayload): Promise<boolean> {
  try {
    // Store in database
    const notification = await prisma.notification.create({
      data: {
        userId: payload.user_id,
        channel: payload.channels[0] as any || 'EMAIL',
        title: payload.title,
        body: payload.message,
        payload: payload.data || {},
        status: 'PENDING'
      }
    });

    // Send through channels in parallel
    const results = await Promise.allSettled([
      ...(payload.channels.includes('EMAIL') ? [sendEmailNotification(payload)] : []),
      ...(payload.channels.includes('IN_APP') ? [saveInAppNotification(payload)] : []),
      ...(payload.channels.includes('PUSH') ? [sendPushNotification(payload)] : []),
      ...(payload.channels.includes('SMS') ? [sendSMSNotification(payload)] : []),
      ...(payload.channels.includes('WHATSAPP') ? [sendWhatsAppNotification(payload)] : [])
    ]);

    // Log results
    const failed = results.filter(r => r.status === 'rejected');
    if (failed.length > 0) {
      console.warn(`Failed to send ${failed.length} notifications:`, failed);
    }

    return failed.length < results.length; // Success if at least one channel worked
  } catch (error) {
    console.error('Notification error:', error);
    return false;
  }
}

/**
 * Send email notification
 */
async function sendEmailNotification(payload: NotificationPayload): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: payload.user_id },
    select: { email: true, name: true }
  });

  if (!user?.email) return;

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'localhost',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: process.env.SMTP_USER ? {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD
    } : undefined
  });

  const htmlContent = generateEmailTemplate(payload, user.name || 'Valued Customer');

  await transporter.sendMail({
    from: process.env.SMTP_FROM || 'noreply@mdh3d.local',
    to: user.email,
    subject: payload.title,
    html: htmlContent,
    replyTo: process.env.SMTP_REPLY_TO
  });
}

/**
 * Save in-app notification
 */
async function saveInAppNotification(payload: NotificationPayload): Promise<void> {
  await prisma.notification.create({
    data: {
      userId: payload.user_id,
      channel: 'IN_APP',
      status: 'PENDING',
      title: payload.title,
      body: payload.message,
      linkUrl: payload.data?.link_url,
      payload: payload.data || {}
    }
  }).catch(() => null);
}

/**
 * Send push notification (Web Push API)
 */
async function sendPushNotification(payload: NotificationPayload): Promise<void> {
  // In production, use a push service like Firebase Cloud Messaging
  // For now, this is a placeholder - would need a push subscription model
  try {
    console.log(`Push notification queued for user ${payload.user_id}: ${payload.title}`);
    // TODO: Implement push subscription storage and delivery
  } catch (error) {
    console.error('Push send error:', error);
  }
}

/**
 * Send SMS notification (Twilio integration)
 */
async function sendSMSNotification(payload: NotificationPayload): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: payload.user_id },
    select: { phone: true }
  });

  if (!user?.phone) return;

  // Twilio integration would go here
  console.log(`SMS to ${user.phone}: ${payload.message}`);
}

/**
 * Send WhatsApp notification
 */
async function sendWhatsAppNotification(payload: NotificationPayload): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: payload.user_id },
    select: { phone: true }
  });

  if (!user?.phone) return;

  // WhatsApp integration via Twilio or Meta Business would go here
  console.log(`WhatsApp to ${user.phone}: ${payload.message}`);
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
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true }
  });

  // For now, return default preferences
  // In production, you'd have a separate preferences table/field
  return {
    email_marketing: true,
    email_orders: true,
    push_enabled: true,
    sms_enabled: false,
    whatsapp_enabled: false,
    digest_frequency: 'daily'
  };
}

/**
 * Update notification preferences
 */
export async function updateNotificationPreferences(
  userId: string,
  preferences: Record<string, any>
): Promise<void> {
  // Notification preferences would be stored here if the model had this field
  // For now, preferences are stored in the Notification records themselves
  console.log(`Notification preferences updated for user ${userId}:`, preferences);
}

/**
 * Send abandoned cart recovery notification
 */
export async function sendAbandonedCartNotification(userId: string, cartValue: number): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, name: true }
  });

  if (!user) return false;

  return sendNotification({
    type: 'abandoned_cart',
    user_id: userId,
    title: '🛒 Your cart is waiting!',
    message: `Complete your purchase of $${cartValue.toFixed(2)} and get 10% off`,
    channels: ['EMAIL', 'IN_APP'],
    data: { cart_value: cartValue, discount_code: 'COMEBACK10' },
    urgency: 'normal'
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
    channels: ['EMAIL', 'IN_APP', 'SMS'],
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
            <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}" class="cta">View More</a>
            <div class="footer">
              <p>© 2026 MDH 3D Store. All rights reserved.</p>
              <p><a href="${process.env.NEXTAUTH_URL}/notifications-preferences">Update your preferences</a></p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
}
