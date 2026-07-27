import type { Product } from "@/lib/catalog";
import { catalog, findProduct, getProductUrl } from "@/lib/catalog";
import { canConnectToDatabase, prisma } from "@/lib/prisma";
import { getProductAvailabilityMode } from "@/lib/product-availability";
import { getProductVisual, isProductVisualVerified } from "@/lib/product-visuals";

export type HybridRecommendationFilters = {
  minMarginPercent?: number;
  requireVerifiedMedia?: boolean;
  requireInStock?: boolean;
  license?: "commercial" | "personal";
};

export type HybridRecommendationRequest = {
  userId?: string;
  productId?: string;
  browsingHistory?: string[];
  purchaseHistory?: string[];
  maxResults?: number;
  filters?: HybridRecommendationFilters;
};

export type HybridRecommendation = {
  id: string;
  name: string;
  slug: string;
  score: number;
  reason: string;
  justification: string;
  url: string;
  price?: number;
  thumbnail?: string;
  engine: "hybrid" | "deterministic";
  signals: {
    content: number;
    popularity: number;
    margin: number;
    media: number;
    stock: number;
  };
};

type PopularitySignal = {
  views: number;
  purchases: number;
  cartAdds: number;
};

function clamp(value: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();
}

function tokenize(value: string) {
  return normalizeText(value)
    .split(/[^a-z0-9]+/)
    .map((token) => token.trim())
    .filter(Boolean);
}

function tokenOverlap(left: string[], right: string[]) {
  if (!left.length || !right.length) return 0;
  const rightSet = new Set(right);
  return left.filter((token) => rightSet.has(token)).length / Math.max(left.length, right.length);
}

async function loadPopularitySignals() {
  const empty = new Map<string, PopularitySignal>();
  if (!(await canConnectToDatabase())) {
    return empty;
  }

  try {
    const events = await prisma.catalogEvent.findMany({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
      },
      select: {
        productId: true,
        type: true,
      },
      take: 2_000,
      orderBy: {
        createdAt: "desc",
      },
    });

    return events.reduce((acc, event) => {
      if (!event.productId) return acc;
      const current = acc.get(event.productId) || { views: 0, purchases: 0, cartAdds: 0 };
      if (event.type === "VIEW") current.views += 1;
      if (event.type === "PURCHASE") current.purchases += 1;
      if (event.type === "CART_ADD") current.cartAdds += 1;
      acc.set(event.productId, current);
      return acc;
    }, empty);
  } catch {
    return empty;
  }
}

function buildReferenceProducts(request: HybridRecommendationRequest) {
  const references: Product[] = [];
  if (request.productId) {
    const product = findProduct(request.productId);
    if (product) references.push(product);
  }

  for (const productId of request.browsingHistory || []) {
    const product = findProduct(productId);
    if (product) references.push(product);
  }

  for (const productId of request.purchaseHistory || []) {
    const product = findProduct(productId);
    if (product) references.push(product);
  }

  return references;
}

function passesFilters(product: Product, filters: HybridRecommendationFilters | undefined) {
  if (!filters) return true;
  if (typeof filters.minMarginPercent === "number" && (product.estimatedProfitPercent || 0) < filters.minMarginPercent) {
    return false;
  }
  if (filters.requireVerifiedMedia && !isProductVisualVerified(product)) {
    return false;
  }
  if (filters.requireInStock && getProductAvailabilityMode(product) !== "in_stock") {
    return false;
  }
  if (filters.license && product.licenseType !== filters.license) {
    return false;
  }
  return true;
}

function priceProximity(left: number, right: number) {
  if (!left || !right) return 0;
  const ratio = Math.min(left, right) / Math.max(left, right);
  return clamp(ratio);
}

function scoreCandidate(product: Product, references: Product[], popularity: PopularitySignal | undefined) {
  const productTokens = tokenize([product.name, product.category, product.subcategory, product.theme, ...product.tags].join(" "));
  const visual = getProductVisual(product);
  const contentScores = references.map((reference) => {
    const referenceTokens = tokenize(
      [reference.name, reference.category, reference.subcategory, reference.theme, ...reference.tags].join(" ")
    );

    let score = 0;
    if (reference.category === product.category) score += 0.35;
    if (reference.subcategory === product.subcategory) score += 0.2;
    if (reference.theme === product.theme) score += 0.15;
    if (reference.collection === product.collection) score += 0.1;
    score += tokenOverlap(referenceTokens, productTokens) * 0.2;
    score += priceProximity(reference.pricePix, product.pricePix) * 0.1;
    return score;
  });

  const content = contentScores.length ? Math.max(...contentScores) : 0;
  const popularityScore = clamp(
    ((popularity?.views || 0) * 0.04 + (popularity?.cartAdds || 0) * 0.18 + (popularity?.purchases || 0) * 0.32) / 10
  );
  const margin = clamp((product.estimatedProfitPercent || 0) / 40);
  const media = visual.kind === "foto-real" ? 1 : visual.kind === "render-fiel" ? 0.7 : 0.2;
  const stockMode = getProductAvailabilityMode(product);
  const stock =
    stockMode === "in_stock" ? 1 : stockMode === "made_to_order" ? (product.readyToShip ? 0.85 : 0.55) : 0.1;

  const score = clamp(content * 0.42 + popularityScore * 0.18 + margin * 0.18 + media * 0.12 + stock * 0.1, 0, 2);
  return {
    score,
    signals: {
      content,
      popularity: popularityScore,
      margin,
      media,
      stock,
    },
  };
}

function buildReason(product: Product, signals: HybridRecommendation["signals"]) {
  const reasons: string[] = [];

  if (signals.content >= 0.5) reasons.push("mesmo contexto de uso");
  if (signals.media >= 0.7) reasons.push("mídia forte");
  if (signals.stock >= 0.8) reasons.push("estoque ou pronta entrega");
  if (signals.margin >= 0.6) reasons.push("margem saudável");
  if (signals.popularity >= 0.4) reasons.push("sinal recente de interesse");

  if (!reasons.length) {
    reasons.push(product.featured ? "curadoria da vitrine" : "fallback determinístico");
  }

  return {
    reason: reasons[0],
    justification: reasons.slice(0, 3).join(", "),
  };
}

function enforceDiversity(items: HybridRecommendation[], limit: number) {
  const results: HybridRecommendation[] = [];
  const categoryCounts = new Map<string, number>();

  for (const item of items) {
    const product = findProduct(item.id);
    const categoryKey = product?.category || "sem-categoria";
    const currentCategoryCount = categoryCounts.get(categoryKey) || 0;

    if (currentCategoryCount >= 2 && results.length < Math.max(2, Math.floor(limit / 2))) {
      continue;
    }

    results.push(item);
    categoryCounts.set(categoryKey, currentCategoryCount + 1);

    if (results.length >= limit) {
      break;
    }
  }

  return results;
}

export async function getHybridRecommendations(request: HybridRecommendationRequest): Promise<HybridRecommendation[]> {
  const maxResults = Math.min(Math.max(request.maxResults || 12, 1), 24);
  const references = buildReferenceProducts(request);
  const popularitySignals = await loadPopularitySignals();
  const referenceId = request.productId?.trim();

  const candidates = catalog
    .filter((product) => product.id !== referenceId)
    .filter((product) => passesFilters(product, request.filters))
    .map((product) => {
      const { score, signals } = scoreCandidate(product, references, popularitySignals.get(product.id));
      const { reason, justification } = buildReason(product, signals);

      return {
        id: product.id,
        name: product.name,
        slug: product.slug || product.id,
        score,
        reason,
        justification,
        url: getProductUrl(product),
        price: product.pricePix,
        thumbnail: product.images[0] || product.image,
        engine: references.length || popularitySignals.size ? ("hybrid" as const) : ("deterministic" as const),
        signals,
      };
    })
    .sort((left, right) => right.score - left.score || left.name.localeCompare(right.name));

  return enforceDiversity(candidates, maxResults);
}

export async function getHybridHomepageSections(userId?: string, limit = 12, filters?: HybridRecommendationFilters) {
  const recommendations = await getHybridRecommendations({
    userId,
    maxResults: limit,
    filters,
  });

  const ready = recommendations.filter((item) => item.signals.stock >= 0.8).slice(0, 4);
  const verified = recommendations.filter((item) => item.signals.media >= 0.7).slice(0, 4);
  const margin = recommendations.filter((item) => item.signals.margin >= 0.6).slice(0, 4);

  return [
    {
      title: "Fechar agora",
      type: "ready",
      items: ready,
    },
    {
      title: "Mídia forte",
      type: "verified_media",
      items: verified,
    },
    {
      title: "Boa margem com estoque",
      type: "healthy_margin",
      items: margin,
    },
  ].filter((section) => section.items.length > 0);
}
