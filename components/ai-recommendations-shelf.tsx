/**
 * AI Recommendations Shelf Component
 */

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Skeleton } from '@/components/skeleton';

interface ProductRecommendation {
  id: string;
  name: string;
  slug: string;
  score: number;
  reason: string;
  thumbnail?: string;
  price?: number;
}

export function AIRecommendationsShelf({
  userId,
  productId,
  title = 'Recommended For You',
  limit = 6
}: {
  userId?: string;
  productId?: string;
  title?: string;
  limit?: number;
}) {
  const [recommendations, setRecommendations] = useState<ProductRecommendation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const params = new URLSearchParams({
          ...(userId && { user_id: userId }),
          ...(productId && { product_id: productId }),
          limit: limit.toString()
        });

        const response = await fetch(`/api/recommendations?${params}`);
        const data = await response.json();
        setRecommendations(data);
      } catch (error) {
        console.error('Failed to fetch recommendations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [userId, productId, limit]);

  if (loading) {
    return (
      <div className="w-full space-y-4">
        <div className="h-6 bg-gray-200 rounded w-1/3 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <section className="py-8 px-4">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        ✨ {title}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recommendations.map((product) => (
          <Link
            key={product.id}
            href={`/product/${product.slug}`}
            className="group"
          >
            <div className="relative h-64 bg-gray-100 rounded-lg overflow-hidden mb-3">
              {product.thumbnail && (
                <Image
                  src={product.thumbnail}
                  alt={product.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform"
                />
              )}
              <div className="absolute top-2 right-2 bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                {product.reason}
              </div>
            </div>
            <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 line-clamp-2">
              {product.name}
            </h3>
            {product.price && (
              <p className="text-lg font-bold text-gray-900 mt-2">
                R$ {product.price.toFixed(2)}
              </p>
            )}
            <div className="mt-2 flex items-center gap-1">
              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full"
                  style={{ width: `${Math.min(product.score * 100, 100)}%` }}
                />
              </div>
              <span className="text-sm text-gray-600">
                {(product.score * 100).toFixed(0)}%
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default AIRecommendationsShelf;
