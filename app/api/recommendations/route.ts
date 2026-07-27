import { getAIRecommendations, getPersonalizedHomepage } from '@/lib/ai-recommendations';
import type { HybridRecommendationFilters } from '@/src/lib/commerce-os/recommendations';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('user_id');
    const productId = searchParams.get('product_id');
    const type = searchParams.get('type') || 'general';
    const limit = parseInt(searchParams.get('limit') || '12');
    const minMarginPercent = searchParams.get('min_margin_percent');
    const requireVerifiedMedia = searchParams.get('require_verified_media');
    const requireInStock = searchParams.get('require_in_stock');
    const license = searchParams.get('license');
    const licenseFilter: HybridRecommendationFilters["license"] | undefined =
      license === 'commercial' || license === 'personal' ? license : undefined;
    const filters: HybridRecommendationFilters = {
      ...(minMarginPercent ? { minMarginPercent: Number(minMarginPercent) } : {}),
      ...(requireVerifiedMedia ? { requireVerifiedMedia: requireVerifiedMedia === 'true' } : {}),
      ...(requireInStock ? { requireInStock: requireInStock === 'true' } : {}),
      ...(licenseFilter ? { license: licenseFilter } : {}),
    };

    if (type === 'homepage') {
      const sections = await getPersonalizedHomepage(userId || undefined, limit, filters);
      return NextResponse.json({ ok: true, engine: 'hybrid_deterministic', sections });
    }

    const recommendations = await getAIRecommendations({
      userId: userId || undefined,
      productId: productId || undefined,
      maxResults: limit,
      filters,
    });

    return NextResponse.json({
      ok: true,
      engine: 'hybrid_deterministic',
      filters,
      recommendations,
    });
  } catch (error) {
    console.error('Recommendations error:', error);
    return NextResponse.json(
      { error: 'Failed to get recommendations' },
      { status: 500 }
    );
  }
}
