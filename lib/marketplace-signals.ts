import { OrderStatus } from "@prisma/client";
import { canConnectToDatabase, prisma } from "@/lib/prisma";
import { logStructured } from "@/lib/logger";

const ACTIVE_ORDER_STATUSES = [
  OrderStatus.PAID,
  OrderStatus.PRINTING,
  OrderStatus.READY_TO_SHIP,
  OrderStatus.SHIPPED,
  OrderStatus.DELIVERED,
] as const;

const SIGNALS_CACHE_TTL_MS = 5 * 60 * 1000;

type CachedSignals<T> = {
  expiresAt: number;
  promise: Promise<T>;
};

let storeReputationCache: CachedSignals<StoreReputationSummary | null> | null = null;
const productSignalsCache = new Map<string, CachedSignals<ProductMarketplaceSignals | null>>();
let dbUnavailableLogged = false;

export type StoreReputationSummary = {
  reviewCount: number;
  averageRating: number | null;
  orderCount: number;
};

export type ProductMarketplaceSignals = {
  reviewCount: number;
  averageRating: number | null;
  soldTotal: number;
  soldLast30Days: number;
};

function roundAverage(value: number | null | undefined) {
  if (typeof value !== "number" || Number.isNaN(value)) return null;
  return Math.round(value * 10) / 10;
}

function logDbUnavailable(scope: "store" | "product", context: Record<string, string> = {}) {
  if (dbUnavailableLogged) return;
  dbUnavailableLogged = true;
  logStructured("warn", "marketplace_signals_db_unavailable", { scope, ...context });
}

export async function getStoreReputationSummary(): Promise<StoreReputationSummary | null> {
  const now = Date.now();
  if (storeReputationCache && storeReputationCache.expiresAt > now) {
    return storeReputationCache.promise;
  }

  const promise = (async () => {
    if (!(await canConnectToDatabase())) {
      logDbUnavailable("store");
      return null;
    }

    try {
      const [reviewAggregate, orderCount] = await Promise.all([
        prisma.catalogReview.aggregate({
          where: { approved: true },
          _avg: { rating: true },
          _count: { id: true },
        }),
        prisma.order.count({
          where: { status: { in: ACTIVE_ORDER_STATUSES as unknown as OrderStatus[] } },
        }),
      ]);

      return {
        reviewCount: reviewAggregate._count.id,
        averageRating: roundAverage(reviewAggregate._avg.rating),
        orderCount,
      };
    } catch (error) {
      logStructured("error", "marketplace_signals_store_failed", {
        message: error instanceof Error ? error.message : "Falha ao carregar reputação da loja.",
      });
      return null;
    }
  })();

  storeReputationCache = {
    expiresAt: now + SIGNALS_CACHE_TTL_MS,
    promise,
  };

  return promise;
}

export async function getProductMarketplaceSignals(productId: string, productSku: string): Promise<ProductMarketplaceSignals | null> {
  const cacheKey = `${productId}:${productSku}`;
  const now = Date.now();
  const cached = productSignalsCache.get(cacheKey);
  if (cached && cached.expiresAt > now) {
    return cached.promise;
  }

  const promise = (async () => {
    if (!(await canConnectToDatabase())) {
      logDbUnavailable("product", { productId, productSku });
      return null;
    }

    try {
      const recentBoundary = new Date();
      recentBoundary.setDate(recentBoundary.getDate() - 30);

      const [reviewAggregate, soldTotal, soldLast30Days] = await Promise.all([
        prisma.catalogReview.aggregate({
          where: { catalogSku: productSku, approved: true },
          _avg: { rating: true },
          _count: { id: true },
        }),
        prisma.orderItem.count({
          where: {
            productId,
            order: { status: { in: ACTIVE_ORDER_STATUSES as unknown as OrderStatus[] } },
          },
        }),
        prisma.orderItem.count({
          where: {
            productId,
            createdAt: { gte: recentBoundary },
            order: { status: { in: ACTIVE_ORDER_STATUSES as unknown as OrderStatus[] } },
          },
        }),
      ]);

      return {
        reviewCount: reviewAggregate._count.id,
        averageRating: roundAverage(reviewAggregate._avg.rating),
        soldTotal,
        soldLast30Days,
      };
    } catch (error) {
      logStructured("error", "marketplace_signals_product_failed", {
        productId,
        productSku,
        message: error instanceof Error ? error.message : "Falha ao carregar sinais do produto.",
      });
      return null;
    }
  })();

  productSignalsCache.set(cacheKey, {
    expiresAt: now + SIGNALS_CACHE_TTL_MS,
    promise,
  });

  return promise;
}
