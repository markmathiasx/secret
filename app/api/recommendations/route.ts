/**
 * AI Recommendations API Route
 */

import { getAIRecommendations, getPersonalizedHomepage } from '@/lib/ai-recommendations';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('user_id');
    const productId = searchParams.get('product_id');
    const type = searchParams.get('type') || 'general';
    const limit = parseInt(searchParams.get('limit') || '12');

    // Personalized homepage
    if (type === 'homepage') {
      const sections = await getPersonalizedHomepage(userId || undefined, limit);
      return NextResponse.json(sections);
    }

    // Product recommendations
    const recommendations = await getAIRecommendations({
      userId: userId || undefined,
      productId: productId || undefined,
      maxResults: limit
    });

    return NextResponse.json(recommendations);
  } catch (error) {
    console.error('Recommendations error:', error);
    return NextResponse.json(
      { error: 'Failed to get recommendations' },
      { status: 500 }
    );
  }
}
