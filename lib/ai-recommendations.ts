import { getHybridHomepageSections, getHybridRecommendations, type HybridRecommendationFilters } from "@/src/lib/commerce-os/recommendations";

export interface RecommendationRequest {
  userId?: string;
  productId?: string;
  browsing_history?: string[];
  purchase_history?: string[];
  preferences?: Record<string, number>;
  maxResults?: number;
  filters?: HybridRecommendationFilters;
}

export interface RecommendationResult {
  id: string;
  name: string;
  slug: string;
  score: number;
  reason: string;
  thumbnail?: string;
  price?: number;
  justification?: string;
  url?: string;
}

export async function getAIRecommendations(request: RecommendationRequest): Promise<RecommendationResult[]> {
  const recommendations = await getHybridRecommendations({
    userId: request.userId,
    productId: request.productId,
    browsingHistory: request.browsing_history,
    purchaseHistory: request.purchase_history,
    maxResults: request.maxResults,
    filters: request.filters,
  });

  return recommendations.map((item) => ({
    id: item.id,
    name: item.name,
    slug: item.slug,
    score: item.score,
    reason: item.reason,
    thumbnail: item.thumbnail,
    price: item.price,
    justification: item.justification,
    url: item.url,
  }));
}

export async function getPersonalizedHomepage(userId?: string, limit = 20, filters?: HybridRecommendationFilters) {
  const sections = await getHybridHomepageSections(userId, limit, filters);
  return sections.map((section) => ({
    title: section.title,
    type: section.type,
    products: section.items.map((item) => ({
      id: item.id,
      name: item.name,
      slug: item.slug,
      score: item.score,
      reason: item.reason,
      thumbnail: item.thumbnail,
      price: item.price,
      justification: item.justification,
      url: item.url,
    })),
  }));
}
