import { getCachedData, cacheKeys, cacheTtl } from './cache';
import { createHash } from 'crypto';

// Types for recommendation system
export type RecommendationType = 'collaborative' | 'content-based' | 'contextual' | 'hybrid';

export type Product = {
  id: string;
  slug: string;
  name: string;
  category: string;
  tags: string[];
  material?: string;
  price: number;
  views: number;
  purchases: number;
  rating?: number;
  image?: string;
};

export type UserContext = {
  userId?: string;
  sessionId: string;
  device: 'mobile' | 'desktop' | 'tablet';
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  location?: string;
  referrer?: string;
  history: string[]; // Product IDs viewed
  cart: string[]; // Product IDs in cart
  purchases: string[]; // Product IDs purchased
};

export type RecommendationResult = {
  product: Product;
  score: number;
  reason: string;
  algorithm: RecommendationType;
};

// Collaborative filtering: "quem viu X comprou Y"
export async function getCollaborativeRecommendations(
  productId: string,
  limit: number = 4
): Promise<RecommendationResult[]> {
  const cacheKey = `rec:collab:${productId}:${limit}`;
  
  return getCachedData(
    cacheKey,
    async () => {
      // Fetch from analytics/purchase data
      const response = await fetch(`/api/analytics/collaborative?productId=${productId}&limit=${limit}`);
      if (!response.ok) return [];
      
      const data = await response.json();
      return data.items.map((item: any) => ({
        product: item.product,
        score: item.score,
        reason: 'Quem viu este produto também comprou',
        algorithm: 'collaborative' as const,
      }));
    },
    { memoryTtl: cacheTtl.medium, redisTtl: cacheTtl.long }
  );
}

// Content-based: similaridade por tags/material/categoria
export async function getContentBasedRecommendations(
  product: Product,
  limit: number = 4
): Promise<RecommendationResult[]> {
  const cacheKey = `rec:content:${product.id}:${limit}`;
  
  return getCachedData(
    cacheKey,
    async () => {
      const response = await fetch(`/api/products/similar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          category: product.category,
          tags: product.tags,
          material: product.material,
          limit,
        }),
      });
      
      if (!response.ok) return [];
      
      const data = await response.json();
      return data.items.map((item: any) => ({
        product: item,
        score: calculateSimilarityScore(product, item),
        reason: 'Similar em categoria e características',
        algorithm: 'content-based' as const,
      }));
    },
    { memoryTtl: cacheTtl.medium, redisTtl: cacheTtl.long }
  );
}

// Contextual: hora do dia, localização, dispositivo, histórico
export async function getContextualRecommendations(
  context: UserContext,
  limit: number = 4
): Promise<RecommendationResult[]> {
  const cacheKey = `rec:context:${context.sessionId}:${limit}`;
  
  return getCachedData(
    cacheKey,
    async () => {
      // Adjust recommendations based on time of day
      const timeBasedCategory = getTimeBasedCategory(context.timeOfDay);
      
      // Adjust based on device (mobile = quick gifts, desktop = complex projects)
      const deviceFilter = context.device === 'mobile' 
        ? { maxPrice: 150, quickDelivery: true }
        : { maxPrice: 500 };
      
      const response = await fetch(`/api/products/contextual`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: timeBasedCategory,
          device: context.device,
          history: context.history,
          limit,
          filters: deviceFilter,
        }),
      });
      
      if (!response.ok) return [];
      
      const data = await response.json();
      return data.items.map((item: any) => ({
        product: item,
        score: calculateContextualScore(item, context),
        reason: getContextualReason(context),
        algorithm: 'contextual' as const,
      }));
    },
    { memoryTtl: cacheTtl.short, redisTtl: cacheTtl.medium }
  );
}

// Hybrid: Combina todas as abordagens com A/B testing
export async function getHybridRecommendations(
  productId: string,
  context: UserContext,
  limit: number = 4
): Promise<RecommendationResult[]> {
  // A/B test: 50% collaborative, 50% content-based primary
  const testVariant = getABTestVariant(context.sessionId);
  
  const [collaborative, contentBased, contextual] = await Promise.all([
    getCollaborativeRecommendations(productId, limit),
    getContentBasedRecommendations({ id: productId } as Product, limit),
    getContextualRecommendations(context, limit),
  ]);
  
  // Merge and deduplicate
  const merged = mergeRecommendations(
    testVariant === 'A' ? collaborative : contentBased,
    testVariant === 'A' ? contentBased : collaborative,
    contextual,
    limit
  );
  
  // Track for A/B testing analytics
  trackRecommendationVariant(context.sessionId, testVariant, merged);
  
  return merged;
}

// "Combina com..." for PDP
export async function getComplementaryProducts(
  productId: string,
  limit: number = 3
): Promise<RecommendationResult[]> {
  const cacheKey = `rec:complementary:${productId}:${limit}`;
  
  return getCachedData(
    cacheKey,
    async () => {
      const response = await fetch(`/api/products/complementary?productId=${productId}&limit=${limit}`);
      if (!response.ok) return [];
      
      const data = await response.json();
      return data.items.map((item: any) => ({
        product: item,
        score: item.complementScore || 0.8,
        reason: 'Combina perfeitamente com este produto',
        algorithm: 'hybrid' as const,
      }));
    },
    { memoryTtl: cacheTtl.long, redisTtl: cacheTtl.daily }
  );
}

// "Quem comprou isso precisou disso depois" - post-purchase
export async function getNextPurchaseRecommendations(
  productIds: string[],
  limit: number = 3
): Promise<RecommendationResult[]> {
  const cacheKey = `rec:next:${createHash('md5').update(productIds.join(',')).digest('hex')}:${limit}`;
  
  return getCachedData(
    cacheKey,
    async () => {
      const response = await fetch(`/api/analytics/next-purchase`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productIds, limit }),
      });
      
      if (!response.ok) return [];
      
      const data = await response.json();
      return data.items.map((item: any) => ({
        product: item,
        score: item.sequenceScore || 0.7,
        reason: 'Quem comprou seus itens também adquiriu depois',
        algorithm: 'collaborative' as const,
      }));
    },
    { memoryTtl: cacheTtl.long, redisTtl: cacheTtl.daily }
  );
}

// Helper functions
function calculateSimilarityScore(productA: Product, productB: Product): number {
  let score = 0;
  
  // Category match
  if (productA.category === productB.category) score += 0.4;
  
  // Tag overlap
  const commonTags = productA.tags.filter(t => productB.tags.includes(t));
  score += (commonTags.length / Math.max(productA.tags.length, productB.tags.length)) * 0.3;
  
  // Material match
  if (productA.material && productA.material === productB.material) score += 0.2;
  
  // Price similarity (within 20%)
  const priceDiff = Math.abs(productA.price - productB.price) / productA.price;
  if (priceDiff < 0.2) score += 0.1;
  
  return Math.min(score, 1);
}

function calculateContextualScore(product: Product, context: UserContext): number {
  let score = 0.5; // Base score
  
  // Boost popular products
  score += Math.min(product.purchases / 1000, 0.2);
  
  // Boost highly rated
  if (product.rating) score += (product.rating - 3) * 0.1;
  
  // Time-based boosts
  const hour = new Date().getHours();
  if (hour >= 18 && product.category === 'presentes') score += 0.2;
  if (hour >= 12 && hour <= 14 && product.category === 'setup') score += 0.15;
  
  return Math.min(score, 1);
}

function getTimeBasedCategory(timeOfDay: string): string {
  const categories: Record<string, string> = {
    morning: 'setup',
    afternoon: 'presentes',
    evening: 'geek',
    night: 'decoracao',
  };
  return categories[timeOfDay] || 'presentes';
}

function getContextualReason(context: UserContext): string {
  const reasons: Record<string, string> = {
    morning: 'Popular para começar o dia produtivo',
    afternoon: 'Ótimo para presentear',
    evening: 'Tendência entre entusiastas',
    night: 'Ideal para relaxar',
  };
  return reasons[context.timeOfDay] || 'Recomendado para você';
}

function getABTestVariant(sessionId: string): 'A' | 'B' {
  const hash = createHash('md5').update(sessionId).digest('hex');
  return parseInt(hash.slice(0, 2), 16) % 2 === 0 ? 'A' : 'B';
}

function mergeRecommendations(
  primary: RecommendationResult[],
  secondary: RecommendationResult[],
  tertiary: RecommendationResult[],
  limit: number
): RecommendationResult[] {
  const seen = new Set<string>();
  const merged: RecommendationResult[] = [];
  
  // Add with priority
  [...primary, ...secondary, ...tertiary].forEach(rec => {
    if (!seen.has(rec.product.id) && merged.length < limit) {
      seen.add(rec.product.id);
      merged.push(rec);
    }
  });
  
  return merged;
}

function trackRecommendationVariant(
  sessionId: string,
  variant: 'A' | 'B',
  recommendations: RecommendationResult[]
): void {
  if (typeof window !== 'undefined') {
    fetch('/api/analytics/track-rec', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId,
        variant,
        timestamp: new Date().toISOString(),
        recommendations: recommendations.map(r => r.product.id),
      }),
    }).catch(() => {});
  }
}

// Hook for React components
export function useRecommendations(
  productId: string,
  context: Partial<UserContext>
) {
  const [recommendations, setRecommendations] = React.useState<RecommendationResult[]>([]);
  const [loading, setLoading] = React.useState(true);
  
  React.useEffect(() => {
    const fullContext: UserContext = {
      sessionId: context.sessionId || crypto.randomUUID(),
      device: context.device || 'desktop',
      timeOfDay: getTimeOfDay(),
      history: context.history || [],
      cart: context.cart || [],
      purchases: context.purchases || [],
      ...context,
    };
    
    getHybridRecommendations(productId, fullContext, 4)
      .then(setRecommendations)
      .finally(() => setLoading(false));
  }, [productId]);
  
  return { recommendations, loading };
}

function getTimeOfDay(): 'morning' | 'afternoon' | 'evening' | 'night' {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 18) return 'afternoon';
  if (hour < 22) return 'evening';
  return 'night';
}

// Import React for hook
import React from 'react';

// Invalidate cache on purchase
export async function invalidateRecommendationCache(productId: string): Promise<void> {
  // This would invalidate Redis/cache keys related to recommendations
  await fetch('/api/cache/invalidate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      patterns: [`rec:*:${productId}:*`, 'rec:context:*'],
    }),
  }).catch(() => {});
}

// Trending products for homepage
export async function getTrendingProducts(
  category?: string,
  limit: number = 6
): Promise<Product[]> {
  const cacheKey = `trending:${category || 'all'}:${limit}`;
  
  return getCachedData(
    cacheKey,
    async () => {
      const response = await fetch(`/api/products/trending?category=${category || ''}&limit=${limit}`);
      if (!response.ok) return [];
      return response.json();
    },
    { memoryTtl: cacheTtl.medium, redisTtl: cacheTtl.short }
  );
}

// Personalized homepage sections
export async function getPersonalizedSections(
  context: UserContext
): Promise<{ title: string; products: Product[]; reason: string }[]> {
  const sections: { title: string; products: Product[]; reason: string }[] = [];
  
  // Trending
  const trending = await getTrendingProducts(undefined, 6);
  if (trending.length > 0) {
    sections.push({
      title: 'Mais vendidos da semana',
      products: trending,
      reason: 'Produtos mais populares entre nossos clientes',
    });
  }
  
  // Based on time
  const timeCategory = getTimeBasedCategory(context.timeOfDay);
  const timeProducts = await getTrendingProducts(timeCategory, 4);
  if (timeProducts.length > 0) {
    sections.push({
      title: `Perfeito para ${context.timeOfDay === 'morning' ? 'começar o dia' : 'este momento'}`,
      products: timeProducts,
      reason: 'Selecionados com base no horário e tendências',
    });
  }
  
  // For you (if has history)
  if (context.history.length > 0) {
    const lastViewed = context.history[context.history.length - 1];
    const recommendations = await getHybridRecommendations(lastViewed, context, 4);
    if (recommendations.length > 0) {
      sections.push({
        title: 'Recomendados para você',
        products: recommendations.map(r => r.product),
        reason: 'Baseado no que você visualizou recentemente',
      });
    }
  }
  
  return sections;
}
