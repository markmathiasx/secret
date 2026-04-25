import webpush from "web-push";
import { prisma } from "@/lib/prisma";

let initialized = false;

function ensureInit() {
  if (initialized) return;
  const subject = process.env.VAPID_SUBJECT;
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  if (!subject || !publicKey || !privateKey) {
    throw new Error("VAPID keys not configured. Set VAPID_SUBJECT, NEXT_PUBLIC_VAPID_PUBLIC_KEY, and VAPID_PRIVATE_KEY.");
  }
  webpush.setVapidDetails(subject, publicKey, privateKey);
  initialized = true;
}

export interface PushPayload {
  title: string;
  body: string;
  url?: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: Record<string, unknown>;
}

/**
 * Send a push notification to a single subscription endpoint.
 * Returns true on success, false if the subscription is expired/invalid (410/404).
 * Throws on other errors.
 */
export async function sendWebPush(
  subscription: { endpoint: string; p256dh: string; auth: string },
  payload: PushPayload
): Promise<boolean> {
  ensureInit();
  try {
    await webpush.sendNotification(
      {
        endpoint: subscription.endpoint,
        keys: { p256dh: subscription.p256dh, auth: subscription.auth },
      },
      JSON.stringify(payload),
      { TTL: 3600 }
    );
    return true;
  } catch (err: unknown) {
    const status = (err as { statusCode?: number }).statusCode;
    if (status === 410 || status === 404) return false; // subscription expired
    throw err;
  }
}

/**
 * Send a push notification to all subscriptions for a user.
 * Automatically removes expired/invalid subscriptions from the database.
 */
export async function sendWebPushToUser(
  userId: string,
  payload: PushPayload
): Promise<{ sent: number; removed: number }> {
  const subs = await prisma.pushSubscription.findMany({ where: { userId } });
  let sent = 0;
  let removed = 0;

  await Promise.allSettled(
    subs.map(async (sub) => {
      const ok = await sendWebPush(
        { endpoint: sub.endpoint, p256dh: sub.p256dh, auth: sub.auth },
        payload
      );
      if (ok) {
        sent++;
      } else {
        await prisma.pushSubscription.delete({ where: { id: sub.id } }).catch(() => {});
        removed++;
      }
    })
  );

  return { sent, removed };
}

/**
 * Broadcast a push notification to all active subscriptions.
 * Use sparingly — for global announcements only.
 */
export async function broadcastWebPush(
  payload: PushPayload,
  options: { limit?: number } = {}
): Promise<{ sent: number; removed: number; errors: number }> {
  const subs = await prisma.pushSubscription.findMany({
    take: options.limit ?? 1000,
    orderBy: { createdAt: "desc" },
  });
  let sent = 0;
  let removed = 0;
  let errors = 0;

  await Promise.allSettled(
    subs.map(async (sub) => {
      try {
        const ok = await sendWebPush(
          { endpoint: sub.endpoint, p256dh: sub.p256dh, auth: sub.auth },
          payload
        );
        if (ok) {
          sent++;
        } else {
          await prisma.pushSubscription.delete({ where: { id: sub.id } }).catch(() => {});
          removed++;
        }
      } catch {
        errors++;
      }
    })
  );

  return { sent, removed, errors };
}
