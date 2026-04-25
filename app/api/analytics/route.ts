/**
 * Analytics API Route
 */

import { trackEvent, getConversionMetrics, getRealtimeDashboard, getUserBehavior } from '@/lib/advanced-analytics';
import { NextRequest, NextResponse } from 'next/server';

type AnalyticsType = 'view' | 'click' | 'add_to_cart' | 'purchase' | 'search' | 'review' | 'wishlist';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (Array.isArray(body?.events)) {
      await Promise.all(
        body.events.slice(0, 50).map((event: any) =>
          trackEvent({
            type: normalizeAnalyticsType(event.event || event.type),
            user_id: safeString(event.user_id),
            session_id: safeString(event.session_id) || safeString(event.sessionId) || 'anonymous',
            product_id: safeString(event.product_id) || safeString(event.productId),
            value: safeNumber(event.value),
            metadata: sanitizeMetadata(event.metadata || event.eventData || event),
          })
        )
      );

      return NextResponse.json({ success: true, count: Math.min(body.events.length, 50) });
    }

    const { type, user_id, session_id, product_id, value, metadata } = body;

    // Track event
    await trackEvent({
      type: normalizeAnalyticsType(type),
      user_id: safeString(user_id),
      session_id: safeString(session_id) || 'anonymous',
      product_id: safeString(product_id),
      value: safeNumber(value),
      metadata: sanitizeMetadata(metadata)
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Analytics track error:', error);
    return NextResponse.json(
      { error: 'Failed to track event' },
      { status: 500 }
    );
  }
}

function safeString(value: unknown) {
  return typeof value === 'string' && value.trim() ? value.trim().slice(0, 160) : undefined;
}

function safeNumber(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function normalizeAnalyticsType(value: unknown): AnalyticsType {
  const normalized = typeof value === 'string' ? value.trim().toLowerCase() : '';
  if (normalized === 'view_item' || normalized === 'product_view') return 'view';
  if (normalized === 'select_item' || normalized === 'click') return 'click';
  if (normalized === 'begin_checkout' || normalized === 'add_to_cart') return 'add_to_cart';
  if (normalized === 'purchase') return 'purchase';
  if (normalized === 'search') return 'search';
  if (normalized === 'wishlist') return 'wishlist';
  if (normalized === 'review') return 'review';
  return 'click';
}

function sanitizeMetadata(value: unknown) {
  if (!value || typeof value !== 'object') return {};
  const blocked = /email|phone|telefone|whatsapp|password|senha|token|secret|session|cpf|cnpj|address|endereco/i;
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>)
      .filter(([key, entry]) => !blocked.test(key) && typeof entry !== 'function')
      .slice(0, 30)
  );
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action');
    const userId = searchParams.get('user_id');
    const days = parseInt(searchParams.get('days') || '30');

    if (action === 'metrics') {
      const metrics = await getConversionMetrics(days);
      return NextResponse.json(metrics);
    }

    if (action === 'realtime') {
      const dashboard = await getRealtimeDashboard();
      return NextResponse.json(dashboard);
    }

    if (action === 'user' && userId) {
      const behavior = await getUserBehavior(userId, days);
      return NextResponse.json(behavior);
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to get analytics' },
      { status: 500 }
    );
  }
}
