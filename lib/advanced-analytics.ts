/**
 * Advanced Analytics Service for 2026
 * Tracks user behavior, conversion metrics, and personalization signals
 */

import { prisma } from './prisma';

export interface AnalyticsEvent {
  type: 'view' | 'click' | 'add_to_cart' | 'purchase' | 'search' | 'review' | 'wishlist';
  user_id?: string;
  session_id: string;
  product_id?: string;
  value?: number;
  metadata?: Record<string, any>;
  timestamp?: Date;
}

export interface ConversionMetrics {
  total_views: number;
  unique_visitors: number;
  add_to_cart_rate: number;
  purchase_rate: number;
  average_session_value: number;
  conversion_funnel: {
    view: number;
    click: number;
    cart: number;
    purchase: number;
  };
}

// In-memory event buffer (in production, use Redis/event queue)
const eventBuffer: AnalyticsEvent[] = [];
const BUFFER_SIZE = 100;
const FLUSH_INTERVAL = 30000; // 30 seconds

/**
 * Track analytics events
 */
export async function trackEvent(event: AnalyticsEvent): Promise<void> {
  eventBuffer.push({
    ...event,
    timestamp: event.timestamp || new Date()
  });

  // Auto-flush when buffer is full
  if (eventBuffer.length >= BUFFER_SIZE) {
    await flushEvents();
  }
}

/**
 * Flush buffered events to database
 */
export async function flushEvents(): Promise<void> {
  if (eventBuffer.length === 0) return;

  const eventsToFlush = [...eventBuffer];
  eventBuffer.length = 0;

  try {
    // Create analytics records using CatalogEvent model
    await Promise.all(
      eventsToFlush.map(async (event) => {
        try {
          const catalogEventType = mapEventToCatalogType(event.type);
          await prisma.catalogEvent.create({
            data: {
              userId: event.user_id,
              sessionToken: event.session_id,
              productId: event.product_id,
              type: catalogEventType,
              metadata: {
                value: event.value,
                ...event.metadata
              }
            }
          });
        } catch (err) {
          console.error('Failed to save analytics event:', err);
        }
      })
    );
  } catch (error) {
    console.error('Failed to flush analytics events:', error);
  }
}

/**
 * Map event type to CatalogEventType
 */
function mapEventToCatalogType(type: string): any {
  const mapping: Record<string, string> = {
    'view': 'VIEW',
    'click': 'VIEW',
    'add_to_cart': 'CART_ADD',
    'purchase': 'PURCHASE',
    'search': 'SEARCH',
    'review': 'VIEW',
    'wishlist': 'FAVORITE'
  };
  return mapping[type] || 'VIEW';
}

/**
 * Get conversion metrics for dashboard
 */
export async function getConversionMetrics(days: number = 30): Promise<ConversionMetrics> {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const events = await prisma.catalogEvent.findMany({
    where: { createdAt: { gte: since } }
  });

  const funnel = {
    view: events.filter(e => e.type === 'VIEW').length,
    click: events.filter(e => e.type === 'VIEW').length,
    cart: events.filter(e => e.type === 'CART_ADD').length,
    purchase: events.filter(e => e.type === 'PURCHASE').length
  };

  const uniqueVisitors = new Set(
    events.filter(e => e.userId).map(e => e.userId)
  ).size;

  const totalValue = events
    .filter(e => e.type === 'PURCHASE')
    .reduce((sum, e) => sum + ((e.metadata as any)?.value || 0), 0);

  const sessions = new Set(events.map(e => e.sessionToken)).size;

  return {
    total_views: funnel.view,
    unique_visitors: uniqueVisitors || sessions,
    add_to_cart_rate: funnel.view > 0 ? funnel.cart / funnel.view : 0,
    purchase_rate: funnel.cart > 0 ? funnel.purchase / funnel.cart : 0,
    average_session_value: sessions > 0 ? totalValue / sessions : 0,
    conversion_funnel: funnel
  };
}

/**
 * Get user behavior heatmap
 */
export async function getUserBehavior(userId: string, days: number = 30) {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const events = await prisma.catalogEvent.findMany({
    where: {
      userId: userId,
      createdAt: { gte: since }
    },
    orderBy: { createdAt: 'asc' }
  });

  const behavior = {
    total_sessions: new Set(events.map(e => e.sessionToken)).size,
    total_actions: events.length,
    products_viewed: new Set(events.filter(e => e.type === 'VIEW').map(e => e.productId)).size,
    products_in_cart: new Set(events.filter(e => e.type === 'CART_ADD').map(e => e.productId)).size,
    purchases: events.filter(e => e.type === 'PURCHASE').length,
    total_spent: events
      .filter(e => e.type === 'PURCHASE')
      .reduce((sum, e) => sum + ((e.metadata as any)?.value || 0), 0),
    favorite_categories: await getFavoriteCategories(userId, events),
    last_activity: events[events.length - 1]?.createdAt || null
  };

  return behavior;
}

/**
 * Get favorite product categories
 */
async function getFavoriteCategories(userId: string, events: any[]) {
  const productIds = events
    .filter(e => e.productId)
    .map(e => e.productId);

  if (productIds.length === 0) return [];

  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: { categoryId: true }
  });

  const categoryCounts = new Map<string | null, number>();
  products.forEach(p => {
    if (p.categoryId) {
      categoryCounts.set(p.categoryId, (categoryCounts.get(p.categoryId) || 0) + 1);
    }
  });

  return Array.from(categoryCounts.entries())
    .filter(([cat]) => cat !== null)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([cat, count]) => ({ category: cat, count }));
}

/**
 * Periodically flush events
 */
export function startEventFlushTimer(): NodeJS.Timer {
  return setInterval(() => {
    flushEvents().catch(err => console.error('Flush error:', err));
  }, FLUSH_INTERVAL);
}

/**
 * Get real-time dashboard metrics
 */
export async function getRealtimeDashboard() {
  const lastHour = new Date(Date.now() - 60 * 60 * 1000);
  
  const recentEvents = await prisma.catalogEvent.findMany({
    where: { createdAt: { gte: lastHour } },
    take: 1000
  });

  return {
    events_this_hour: recentEvents.length,
    active_users: new Set(recentEvents.filter(e => e.userId).map(e => e.userId)).size,
    views_this_hour: recentEvents.filter(e => e.type === 'VIEW').length,
    purchases_this_hour: recentEvents.filter(e => e.type === 'PURCHASE').length,
    revenue_this_hour: recentEvents
      .filter(e => e.type === 'PURCHASE')
      .reduce((sum, e) => sum + ((e.metadata as any)?.value || 0), 0),
    trending_products: await getTrendingProductsRealtime(recentEvents)
  };
}

/**
 * Get trending products in real-time
 */
async function getTrendingProductsRealtime(events: any[]) {
  const productCounts = new Map<string | null, number>();
  events.forEach(e => {
    if (e.productId) {
      productCounts.set(e.productId, (productCounts.get(e.productId) || 0) + 1);
    }
  });

  const topIds = Array.from(productCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([id]) => id)
    .filter((id): id is string => id !== null);

  const products = await prisma.product.findMany({
    where: { id: { in: topIds } },
    select: { id: true, title: true }
  });

  return products.map(p => ({
    id: p.id,
    name: p.title,
    views: productCounts.get(p.id) || 0
  }));
}
