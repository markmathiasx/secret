import { NextRequest, NextResponse } from 'next/server';
import { getCachedData, cacheTtl } from '@/lib/cache';

export async function POST(request: NextRequest) {
  try {
    const { items } = await request.json();
    
    // Get user session or create guest session
    const sessionId = request.cookies.get('guest_session')?.value || crypto.randomUUID();
    
    // Store cart in Redis with 24h expiration
    const cartData = {
      items: items || [],
      updatedAt: new Date().toISOString(),
      sessionId,
    };
    
    // Cache cart data
    await getCachedData(
      `cart:${sessionId}`,
      async () => cartData,
      {
        memoryTtl: cacheTtl.medium,
        redisTtl: cacheTtl.daily,
      }
    );
    
    // Set session cookie
    const response = NextResponse.json({ success: true, sessionId });
    response.cookies.set('guest_session', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 86400, // 24 hours
    });
    
    return response;
  } catch (error) {
    console.error('Cart sync error:', error);
    return NextResponse.json(
      { error: 'Failed to sync cart' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const sessionId = request.cookies.get('guest_session')?.value;
    
    if (!sessionId) {
      return NextResponse.json({ items: [] });
    }
    
    const cartData = await getCachedData(
      `cart:${sessionId}`,
      async () => ({ items: [] }),
      {
        memoryTtl: cacheTtl.medium,
        redisTtl: cacheTtl.daily,
      }
    );
    
    return NextResponse.json({ items: (cartData as any)?.items || [] });
  } catch (error) {
    console.error('Cart fetch error:', error);
    return NextResponse.json({ items: [] });
  }
}
