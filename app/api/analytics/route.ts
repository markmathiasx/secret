/**
 * Analytics API Route
 */

import { trackEvent, getConversionMetrics, getRealtimeDashboard, getUserBehavior } from '@/lib/advanced-analytics';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, user_id, session_id, product_id, value, metadata } = body;

    // Track event
    await trackEvent({
      type,
      user_id,
      session_id,
      product_id,
      value,
      metadata
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
