import { getCachedData, cacheTtl } from './cache';

// Server-side analytics tracking
// GA4, Meta CAPI, TikTok Events API

export type AnalyticsEvent = {
  eventName: string;
  userId?: string;
  sessionId: string;
  timestamp: Date;
  properties: Record<string, any>;
  userProperties?: Record<string, any>;
};

export type UserCohort = 'new' | 'returning' | 'vip' | 'at_risk' | 'churned';

export type RFMScore = {
  recency: number; // Days since last purchase
  frequency: number; // Number of purchases
  monetary: number; // Total spent
  score: 'champion' | 'loyal' | 'potential' | 'new' | 'at_risk' | 'lost';
};

// Server-side event tracking
export async function trackServerEvent(event: AnalyticsEvent): Promise<void> {
  // Store in analytics queue (Redis/Queue)
  await fetch('/api/analytics/track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(event),
  }).catch(() => {});

  // Send to Meta CAPI (server-side)
  await sendToMetaCAPI(event);

  // Send to TikTok Events API
  await sendToTikTokEvents(event);
}

// Meta CAPI (Conversions API)
async function sendToMetaCAPI(event: AnalyticsEvent): Promise<void> {
  const pixelId = process.env.META_PIXEL_ID;
  const accessToken = process.env.META_CAPI_TOKEN;

  if (!pixelId || !accessToken) return;

  const eventData = {
    data: [{
      event_name: mapToMetaEvent(event.eventName),
      event_time: Math.floor(event.timestamp.getTime() / 1000),
      event_source_url: event.properties.page_url,
      user_data: hashUserData({
        em: event.properties.email,
        ph: event.properties.phone,
        fn: event.properties.firstName,
        ln: event.properties.lastName,
        external_id: event.userId || event.sessionId,
      }),
      custom_data: sanitizeEventData(event.properties),
    }],
  };

  await fetch(`https://graph.facebook.com/v18.0/${pixelId}/events?access_token=${accessToken}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(eventData),
  }).catch(() => {});
}

// TikTok Events API
async function sendToTikTokEvents(event: AnalyticsEvent): Promise<void> {
  const pixelCode = process.env.TIKTOK_PIXEL_CODE;
  const accessToken = process.env.TIKTOK_EVENTS_API_TOKEN;

  if (!pixelCode || !accessToken) return;

  const eventData = {
    event: mapToTikTokEvent(event.eventName),
    event_time: Math.floor(event.timestamp.getTime() / 1000),
    user: {
      external_id: event.userId || event.sessionId,
      email: hashString(event.properties.email || ''),
      phone_number: hashString(event.properties.phone || ''),
    },
    properties: sanitizeEventData(event.properties),
  };

  await fetch('https://business-api.tiktok.com/open_api/v1.3/event/track/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Access-Token': accessToken,
    },
    body: JSON.stringify({
      pixel_code: pixelCode,
      events: [eventData],
    }),
  }).catch(() => {});
}

// Custom events for 3D printing business
export const trackSTLUploadSuccess = async (
  sessionId: string,
  fileDetails: {
    fileName: string;
    fileSize: number;
    volume?: number;
    estimatedTime?: number;
  }
): Promise<void> => {
  await trackServerEvent({
    eventName: 'stl_upload_success',
    sessionId,
    timestamp: new Date(),
    properties: {
      ...fileDetails,
      category: 'engagement',
    },
  });
};

export const trackQuoteRequested = async (
  sessionId: string,
  quoteDetails: {
    productType: string;
    material?: string;
    quantity: number;
    estimatedValue?: number;
  }
): Promise<void> => {
  await trackServerEvent({
    eventName: 'quote_requested',
    sessionId,
    timestamp: new Date(),
    properties: {
      ...quoteDetails,
      category: 'lead',
    },
  });
};

export const trackChatInitiated = async (
  sessionId: string,
  chatDetails: {
    source: 'widget' | 'page' | 'product';
    productId?: string;
    initialMessage?: string;
  }
): Promise<void> => {
  await trackServerEvent({
    eventName: 'chat_initiated',
    sessionId,
    timestamp: new Date(),
    properties: {
      ...chatDetails,
      category: 'engagement',
    },
  });
};

// Cohort analysis
export async function getUserCohort(userId: string): Promise<UserCohort> {
  const rfm = await calculateRFM(userId);

  if (rfm.score === 'champion' || rfm.score === 'loyal') return 'vip';
  if (rfm.score === 'at_risk' || rfm.score === 'lost') return 'at_risk';
  if (rfm.frequency === 0) return 'new';
  return 'returning';
}

// RFM (Recency, Frequency, Monetary) Scoring
export async function calculateRFM(userId: string): Promise<RFMScore> {
  const cacheKey = `rfm:${userId}`;

  return getCachedData(
    cacheKey,
    async () => {
      const response = await fetch(`/api/analytics/rfm?userId=${userId}`);
      if (!response.ok) {
        return { recency: 999, frequency: 0, monetary: 0, score: 'new' };
      }

      const data = await response.json();

      // Calculate RFM score
      let score: RFMScore['score'] = 'new';

      if (data.recency <= 30 && data.frequency >= 4 && data.monetary >= 500) {
        score = 'champion';
      } else if (data.recency <= 60 && data.frequency >= 2) {
        score = 'loyal';
      } else if (data.recency <= 90 && data.frequency >= 1) {
        score = 'potential';
      } else if (data.recency <= 30 && data.frequency === 1) {
        score = 'new';
      } else if (data.recency <= 180 && data.frequency >= 2) {
        score = 'at_risk';
      } else {
        score = 'lost';
      }

      return { ...data, score };
    },
    { memoryTtl: cacheTtl.medium, redisTtl: cacheTtl.long }
  );
}

// LTV Prediction based on cohort
export async function predictLTV(userId: string): Promise<{
  predictedLTV: number;
  confidence: number;
  nextPurchaseProbability: number;
}> {
  const rfm = await calculateRFM(userId);

  const multipliers: Record<RFMScore['score'], number> = {
    champion: 3.5,
    loyal: 2.8,
    potential: 2.0,
    new: 1.5,
    at_risk: 1.2,
    lost: 0.5,
  };

  const baseLTV = rfm.monetary * multipliers[rfm.score];
  const confidence = rfm.frequency > 2 ? 0.85 : 0.65;
  const nextPurchaseProbability = calculatePurchaseProbability(rfm);

  return {
    predictedLTV: Math.round(baseLTV),
    confidence,
    nextPurchaseProbability,
  };
}

// Multi-touch attribution
export type AttributionModel = 'first_touch' | 'last_touch' | 'linear' | 'time_decay' | 'position_based';

export interface Touchpoint {
  channel: string;
  campaign?: string;
  timestamp: Date;
  value: number;
}

export function calculateAttribution(
  touchpoints: Touchpoint[],
  model: AttributionModel = 'position_based'
): Record<string, number> {
  const attribution: Record<string, number> = {};
  const totalValue = touchpoints.reduce((sum, t) => sum + t.value, 0);

  switch (model) {
    case 'first_touch':
      if (touchpoints[0]) {
        attribution[touchpoints[0].channel] = totalValue;
      }
      break;

    case 'last_touch':
      if (touchpoints[touchpoints.length - 1]) {
        attribution[touchpoints[touchpoints.length - 1].channel] = totalValue;
      }
      break;

    case 'linear':
      const equalShare = totalValue / touchpoints.length;
      touchpoints.forEach((t) => {
        attribution[t.channel] = (attribution[t.channel] || 0) + equalShare;
      });
      break;

    case 'time_decay':
      const now = new Date();
      const weightedSum = touchpoints.reduce(
        (sum, t) => sum + t.value / (1 + (now.getTime() - t.timestamp.getTime()) / 86400000),
        0
      );
      touchpoints.forEach((t) => {
        const weight = t.value / (1 + (now.getTime() - t.timestamp.getTime()) / 86400000);
        attribution[t.channel] = (attribution[t.channel] || 0) + (totalValue * weight / weightedSum);
      });
      break;

    case 'position_based':
      // 40% first, 40% last, 20% distributed among middle
      if (touchpoints.length === 1) {
        attribution[touchpoints[0].channel] = totalValue;
      } else if (touchpoints.length === 2) {
        attribution[touchpoints[0].channel] = totalValue * 0.5;
        attribution[touchpoints[1].channel] = totalValue * 0.5;
      } else {
        const first = touchpoints[0];
        const last = touchpoints[touchpoints.length - 1];
        const middle = touchpoints.slice(1, -1);

        attribution[first.channel] = (attribution[first.channel] || 0) + totalValue * 0.4;
        attribution[last.channel] = (attribution[last.channel] || 0) + totalValue * 0.4;

        const middleShare = (totalValue * 0.2) / middle.length;
        middle.forEach((t) => {
          attribution[t.channel] = (attribution[t.channel] || 0) + middleShare;
        });
      }
      break;
  }

  return attribution;
}

// Helper functions
function mapToMetaEvent(eventName: string): string {
  const mapping: Record<string, string> = {
    'stl_upload_success': 'Lead',
    'quote_requested': 'Lead',
    'chat_initiated': 'Contact',
    'purchase': 'Purchase',
    'add_to_cart': 'AddToCart',
    'view_item': 'ViewContent',
  };
  return mapping[eventName] || 'CustomEvent';
}

function mapToTikTokEvent(eventName: string): string {
  const mapping: Record<string, string> = {
    'stl_upload_success': 'SubmitForm',
    'quote_requested': 'SubmitForm',
    'chat_initiated': 'Contact',
    'purchase': 'CompletePayment',
    'add_to_cart': 'AddToCart',
    'view_item': 'ViewContent',
  };
  return mapping[eventName] || 'Browse';
}

function hashUserData(data: Record<string, string | undefined>): Record<string, string> {
  const hashed: Record<string, string> = {};
  for (const [key, value] of Object.entries(data)) {
    if (value) {
      hashed[key] = hashString(value.toLowerCase().trim());
    }
  }
  return hashed;
}

function hashString(str: string): string {
  // Simple hash for demo - in production use SHA256
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(16);
}

function sanitizeEventData(properties: Record<string, any>): Record<string, any> {
  const sanitized: Record<string, any> = {};
  const sensitiveFields = ['password', 'token', 'ssn', 'credit_card', 'cvv'];

  for (const [key, value] of Object.entries(properties)) {
    if (!sensitiveFields.includes(key.toLowerCase())) {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

function calculatePurchaseProbability(rfm: RFMScore): number {
  let probability = 0.5;

  // Recency factor (more recent = higher probability)
  if (rfm.recency <= 7) probability += 0.3;
  else if (rfm.recency <= 30) probability += 0.15;
  else if (rfm.recency > 90) probability -= 0.2;

  // Frequency factor
  if (rfm.frequency >= 3) probability += 0.2;
  else if (rfm.frequency >= 1) probability += 0.1;

  // Cap at 0.95
  return Math.min(0.95, Math.max(0.05, probability));
}

// Retention cohort analysis
export async function getRetentionCohorts(): Promise<{
  cohorts: Array<{
    month: string;
    users: number;
    retention: number[];
  }>;
}> {
  const response = await fetch('/api/analytics/cohorts');
  return response.json();
}

// Viral coefficient calculation
export async function calculateViralCoefficient(): Promise<{
  k: number;
  referralsPerUser: number;
  conversionRate: number;
}> {
  const response = await fetch('/api/analytics/viral-coefficient');
  return response.json();
}
