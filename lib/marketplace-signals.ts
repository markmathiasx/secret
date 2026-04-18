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

export async function getStoreReputationSummary(): Promise<StoreReputationSummary | null> {
  if (!(await canConnectToDatabase())) {
    logStructured("warn", "marketplace_signals_db_unavailable", { scope: "store" });
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
}

export async function getProductMarketplaceSignals(productId: string, productSku: string): Promise<ProductMarketplaceSignals | null> {
  if (!(await canConnectToDatabase())) {
    logStructured("warn", "marketplace_signals_db_unavailable", { scope: "product", productId, productSku });
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
}
