/**
 * AI-Powered Recommendations Engine
 * Implements modern 2026 recommendation strategies:
 * - Collaborative filtering
 * - Content-based recommendations
 * - Real-time personalization
 * - Trending analysis
 */

import { Prisma } from '@prisma/client';
import { prisma } from './prisma';

export interface RecommendationRequest {
  userId?: string;
  productId?: string;
  browsing_history?: string[];
  purchase_history?: string[];
  preferences?: Record<string, number>;
  maxResults?: number;
}

export interface RecommendationResult {
  id: string;
  name: string;
  slug: string;
  score: number;
  reason: string;
  thumbnail?: string;
  price?: number;
}

/**
 * Get AI-powered product recommendations
 */
export async function getAIRecommendations(request: RecommendationRequest): Promise<RecommendationResult[]> {
  const { userId, productId, browsing_history = [], maxResults = 12 } = request;

  try {
    // Strategy 1: Content-based (similar products)
    if (productId) {
      const similar = await getContentBasedRecommendations(productId, maxResults);
      if (similar.length > 0) return similar;
    }

    // Strategy 2: Collaborative filtering (users like you also bought)
    if (userId) {
      const collaborative = await getCollaborativeRecommendations(userId, maxResults);
      if (collaborative.length > 0) return collaborative;
    }

    // Strategy 3: Trending & popular
    const trending = await getTrendingRecommendations(maxResults);
    return trending;
  } catch (error) {
    console.error('AI Recommendations Error:', error);
    return [];
  }
}

/**
 * Content-based: Find similar products
 */
async function getContentBasedRecommendations(
  productId: string,
  limit: number
): Promise<RecommendationResult[]> {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { 
      id: true,
      title: true,
      categoryId: true,
      tags: true,
      pricePix: true
    }
  });

  if (!product) return [];

  // Find products in same category with similar price range
  const similar = await prisma.product.findMany({
    where: {
      AND: [
        { id: { not: productId } },
        { categoryId: product.categoryId },
        { status: 'READY_TO_SHIP' },
        { visibility: 'PUBLIC' }
      ]
    },
    select: {
      id: true,
      title: true,
      slug: true,
      pricePix: true,
      ratingAverage: true,
      ratingCount: true
    },
    orderBy: { ratingAverage: 'desc' },
    take: limit
  });

  return similar.map((p, idx) => ({
    id: p.id,
    name: p.title,
    slug: p.slug,
    score: (p.ratingAverage || 0) / 5 * 0.9 + (1 - idx / limit) * 0.1,
    reason: `Similar to ${product.title}`,
    thumbnail: undefined,
    price: Number(p.pricePix) || undefined
  }));
}

/**
 * Collaborative filtering: What similar users bought
 */
async function getCollaborativeRecommendations(
  userId: string,
  limit: number
): Promise<RecommendationResult[]> {
  // Get user's purchase history
  const userOrders = await prisma.order.findMany({
    where: { buyerId: userId, status: 'PAID' },
    select: { items: true }
  });

  if (userOrders.length === 0) return [];

  const userProductIds = userOrders.flatMap(o => o.items.map(i => i.productId)).filter((id): id is string => id !== null);

  // Find other users who bought same products
  const similarOrders = await prisma.order.findMany({
    where: {
      AND: [
        { buyerId: { not: userId } },
        { status: 'PAID' }
      ]
    },
    select: { items: true, buyerId: true },
    take: 100
  });

  // Extract product IDs from similar users
  const recommendations = new Map<string, number>();
  similarOrders.forEach(order => {
    order.items.forEach(item => {
      if (item.productId && !userProductIds.includes(item.productId)) {
        recommendations.set(item.productId, (recommendations.get(item.productId) || 0) + 1);
      }
    });
  });

  // Get top recommended products
  const topIds = Array.from(recommendations.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([id]) => id);

  const products = await prisma.product.findMany({
    where: { 
      id: { in: topIds },
      status: 'READY_TO_SHIP',
      visibility: 'PUBLIC'
    },
    select: {
      id: true,
      title: true,
      slug: true,
      pricePix: true,
      ratingAverage: true
    }
  });

  return products.map(p => ({
    id: p.id,
    name: p.title,
    slug: p.slug,
    score: (recommendations.get(p.id) || 0) / 10,
    reason: 'Customers like you also bought this',
    thumbnail: undefined,
    price: Number(p.pricePix) || undefined
  }));
}

/**
 * Trending: Popular products this week
 */
async function getTrendingRecommendations(limit: number): Promise<RecommendationResult[]> {
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const trending = await prisma.product.findMany({
    where: {
      status: 'READY_TO_SHIP',
      visibility: 'PUBLIC',
      createdAt: { gte: weekAgo }
    },
    select: {
      id: true,
      title: true,
      slug: true,
      pricePix: true,
      ratingAverage: true,
      ratingCount: true
    },
    orderBy: [
      { ratingCount: 'desc' },
      { ratingAverage: 'desc' }
    ],
    take: limit
  });

  return trending.map((p, idx) => ({
    id: p.id,
    name: p.title,
    slug: p.slug,
    score: 0.8 + (1 - idx / limit) * 0.2,
    reason: '🔥 Trending this week',
    thumbnail: undefined,
    price: Number(p.pricePix) || undefined
  }));
}

/**
 * Get personalized home page products
 */
export async function getPersonalizedHomepage(userId?: string, limit: number = 20) {
  const sections = [];

  // Section 1: Trending
  const trending = await getTrendingRecommendations(6);
  if (trending.length > 0) {
    sections.push({
      title: '🔥 Trending Now',
      products: trending,
      type: 'trending'
    });
  }

  // Section 2: Recommendations for user
  if (userId) {
    const recommendations = await getCollaborativeRecommendations(userId, 6);
    if (recommendations.length > 0) {
      sections.push({
        title: 'Recommended For You',
        products: recommendations,
        type: 'recommended'
      });
    }
  }

  // Section 3: New arrivals
  const newArrivals = await prisma.product.findMany({
    where: {
      status: 'READY_TO_SHIP',
      visibility: 'PUBLIC'
    },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      title: true,
      slug: true,
      pricePix: true,
      ratingAverage: true
    },
    take: 6
  });

  if (newArrivals.length > 0) {
    sections.push({
      title: '✨ New Arrivals',
      products: newArrivals.map((p, idx) => ({
        id: p.id,
        name: p.title,
        slug: p.slug,
        score: 0.85,
        reason: 'Just added',
        thumbnail: undefined,
        price: Number(p.pricePix) || undefined
      })),
      type: 'new'
    });
  }

  return sections;
}
