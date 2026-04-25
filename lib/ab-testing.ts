/**
 * A/B Testing library
 * Cookie-based variant assignment with GA4 conversion tracking.
 */
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export interface AbTest {
  testId: string;
  variants: string[];
  weights?: number[]; // Must sum to 100 if provided
}

const COOKIE_PREFIX = "ab_";
const COOKIE_MAX_AGE = 90 * 24 * 60 * 60; // 90 days

/**
 * Assign or retrieve the variant for a test (server-side).
 * Returns the assigned variant string.
 */
export async function getVariant(test: AbTest): Promise<string> {
  const cookieStore = await cookies();
  const cookieKey = `${COOKIE_PREFIX}${test.testId}`;
  const existing = cookieStore.get(cookieKey)?.value;

  if (existing && test.variants.includes(existing)) {
    return existing;
  }

  const variant = pickVariant(test);

  // Set cookie — note: in Server Components this sets the header on the response
  cookieStore.set(cookieKey, variant, {
    path: "/",
    maxAge: COOKIE_MAX_AGE,
    sameSite: "lax",
    httpOnly: false, // Needs to be readable by client-side GA4 tracking
  });

  return variant;
}

/** Pick a variant based on weights (uniform if omitted). */
function pickVariant(test: AbTest): string {
  const { variants, weights } = test;
  if (!weights) {
    return variants[Math.floor(Math.random() * variants.length)];
  }
  const rand = Math.random() * 100;
  let cumulative = 0;
  for (let i = 0; i < variants.length; i++) {
    cumulative += weights[i];
    if (rand < cumulative) return variants[i];
  }
  return variants[variants.length - 1];
}

/**
 * Record a conversion event for an A/B test assignment.
 * Call this server-side when the user completes the target action.
 */
export async function recordConversion(
  testId: string,
  sessionId: string,
  userId?: string
): Promise<void> {
  await prisma.abTestAssignment
    .updateMany({
      where: { testId, sessionId },
      data: { converted: true },
    })
    .catch(() => {});

  // Also create if not exists (handles edge cases)
  if (userId) {
    await prisma.abTestAssignment
      .upsert({
        where: { testId_sessionId: { testId, sessionId } },
        update: { converted: true, userId },
        create: {
          testId,
          sessionId,
          variant: "unknown",
          userId,
          converted: true,
        },
      })
      .catch(() => {});
  }
}

/**
 * Store the assignment in DB for analytics tracking.
 * Call this lazily (not in the critical path).
 */
export async function persistAssignment(
  testId: string,
  variant: string,
  sessionId: string,
  userId?: string
): Promise<void> {
  await prisma.abTestAssignment
    .upsert({
      where: { testId_sessionId: { testId, sessionId } },
      update: { variant, ...(userId && { userId }) },
      create: { testId, variant, sessionId, ...(userId && { userId }) },
    })
    .catch(() => {});
}

// ── Named tests registry ─────────────────────────────────────────────────────

export const AB_TESTS = {
  pdpCtaPrimary: {
    testId: "pdp_cta_primary_v2",
    variants: ["buy_now", "add_to_cart", "get_quote"],
    weights: [50, 30, 20],
  },
  pdpCtaUrgency: {
    testId: "pdp_urgency_badge",
    variants: ["control", "urgency"],
    weights: [50, 50],
  },
  checkoutButton: {
    testId: "checkout_btn_label",
    variants: ["finalizar_pedido", "pagar_agora", "confirmar_compra"],
    weights: [40, 30, 30],
  },
} satisfies Record<string, AbTest>;
