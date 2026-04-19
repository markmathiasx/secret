/**
 * Personalization API Route
 */

import {
  getPersonalizationProfile,
  getPersonalizedRecommendations,
  getCustomizationSuggestions,
  getSocialWishlist,
  shareWishlist,
  getTrendingInUserInterests,
  trackUserInteraction
} from '@/lib/personalization-service';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, user_id, product_id, emails, message, interaction_type } = body;

    if (action === 'share_wishlist') {
      await shareWishlist(user_id, emails, message);
      return NextResponse.json({ success: true });
    }

    if (action === 'track_interaction') {
      await trackUserInteraction(user_id, product_id, interaction_type);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Personalization POST error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('user_id');
    const productId = searchParams.get('product_id');
    const action = searchParams.get('action');
    const limit = parseInt(searchParams.get('limit') || '12');

    if (!userId) {
      return NextResponse.json(
        { error: 'user_id required' },
        { status: 400 }
      );
    }

    if (action === 'profile') {
      const profile = await getPersonalizationProfile(userId);
      return NextResponse.json(profile);
    }

    if (action === 'recommendations') {
      const recommendations = await getPersonalizedRecommendations(userId, limit);
      return NextResponse.json(recommendations);
    }

    if (action === 'wishlist') {
      const wishlist = await getSocialWishlist(userId, true);
      return NextResponse.json(wishlist);
    }

    if (action === 'trending') {
      const trending = await getTrendingInUserInterests(userId, limit);
      return NextResponse.json(trending);
    }

    if (action === 'customization' && productId) {
      const profile = await getPersonalizationProfile(userId);
      const suggestions = await getCustomizationSuggestions(productId, profile);
      return NextResponse.json(suggestions);
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Personalization GET error:', error);
    return NextResponse.json(
      { error: 'Failed to get data' },
      { status: 500 }
    );
  }
}
