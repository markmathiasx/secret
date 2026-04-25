/**
 * Loyalty Points system.
 * Points are earned on purchase and can be redeemed for discounts.
 * 1 point = R$ 0,05 in discount value.
 */
import { prisma } from "@/lib/prisma";

export const POINT_VALUE_BRL = 0.05; // R$ per point
export const POINTS_PER_BRL = 1; // 1 point per R$ spent
export const POINTS_EXPIRY_DAYS = 365; // 1 year

/** Calculate points earned for a given order value in BRL. */
export function calculatePointsEarned(orderValueBrl: number): number {
  return Math.floor(orderValueBrl * POINTS_PER_BRL);
}

/** Convert points to BRL discount value. */
export function pointsToBrl(points: number): number {
  return parseFloat((points * POINT_VALUE_BRL).toFixed(2));
}

/** Get the current point balance for a user. */
export async function getUserPointBalance(userId: string): Promise<number> {
  const result = await prisma.loyaltyPoint.groupBy({
    by: ["type"],
    where: {
      userId,
      OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
    },
    _sum: { points: true },
  });

  let balance = 0;
  for (const row of result) {
    const sum = row._sum.points ?? 0;
    if (row.type === "earn" || row.type === "bonus") balance += sum;
    if (row.type === "redeem" || row.type === "expire") balance -= sum;
  }

  return Math.max(0, balance);
}

/** Award points to a user after a completed order. */
export async function awardOrderPoints(
  userId: string,
  orderId: string,
  orderValueBrl: number
): Promise<number> {
  const points = calculatePointsEarned(orderValueBrl);
  if (points <= 0) return 0;

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + POINTS_EXPIRY_DAYS);

  await prisma.loyaltyPoint.create({
    data: {
      userId,
      orderId,
      points,
      type: "earn",
      description: `Compra confirmada — pedido ${orderId.slice(-8).toUpperCase()}`,
      expiresAt,
    },
  });

  return points;
}

/** Redeem points for a discount. Returns the BRL amount redeemed. */
export async function redeemPoints(
  userId: string,
  points: number,
  orderId: string
): Promise<number> {
  const balance = await getUserPointBalance(userId);
  const toRedeem = Math.min(points, balance);
  if (toRedeem <= 0) return 0;

  await prisma.loyaltyPoint.create({
    data: {
      userId,
      orderId,
      points: toRedeem,
      type: "redeem",
      description: `Desconto aplicado no pedido ${orderId.slice(-8).toUpperCase()}`,
    },
  });

  return pointsToBrl(toRedeem);
}

/** Award bonus points (e.g., for referrals, first purchase). */
export async function awardBonusPoints(
  userId: string,
  points: number,
  description: string
): Promise<void> {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + POINTS_EXPIRY_DAYS);

  await prisma.loyaltyPoint.create({
    data: { userId, points, type: "bonus", description, expiresAt },
  });
}

/** Get point transaction history for a user. */
export async function getPointHistory(userId: string, limit = 20) {
  return prisma.loyaltyPoint.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: { id: true, points: true, type: true, description: true, createdAt: true, expiresAt: true },
  });
}
