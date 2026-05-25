import { NextRequest, NextResponse } from "next/server";
import { ProductStatus, ProductVisibility } from "@prisma/client";
import { applyNoStoreHeaders } from "@/lib/http-cache";
import { getServerSessionUser, isAdminSession } from "@/lib/server-session";
import { updateAdminCatalogProduct } from "@/lib/server/admin-catalog-store";
import { canConnectToDatabase, prisma } from "@/lib/prisma";
import { recordAdminAction } from "@/lib/admin-audit";
import { invalidateCatalogCache } from "@/lib/runtime-cache";
import { slugify } from "@/lib/utils";
import { calculateProductionCostRecommendation, roundCurrency } from "@/lib/pricing-engine";
import { BUYING_INTENTS, CATALOG_PRIMARY_CATEGORIES, PRODUCT_OBJECT_TYPES } from "@/lib/catalog-taxonomy";
import { calculateCardPrice } from "@/lib/payment-pricing";
import type { AdminProductOverride, ProfitMode } from "@/types/admin-catalog";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

type NormalizedProductPatch = Partial<AdminProductOverride> & {
  visibility?: ProductVisibility;
};

const NUMERIC_LIMITS: Record<string, { min: number; max: number; integer?: boolean }> = {
  pricePix: { min: 0, max: 99999 },
  priceCard: { min: 0, max: 99999 },
  stock: { min: 0, max: 999999, integer: true },
  costBase: { min: 0, max: 99999 },
  estimatedGrams: { min: 0, max: 100000 },
  estimatedHours: { min: 0, max: 10000 },
  complexity: { min: 0.1, max: 10 },
  spoolPricePerKg: { min: 0, max: 99999 },
  machineHourlyRate: { min: 0, max: 9999 },
  postProcessMinutes: { min: 0, max: 100000, integer: true },
  laborHourlyRate: { min: 0, max: 9999 },
  packagingCost: { min: 0, max: 99999 },
  overheadPercent: { min: 0, max: 300 },
  profitTargetPercent: { min: 0, max: 500 },
  estimatedProfitAmount: { min: -99999, max: 99999 },
  estimatedProfitPercent: { min: -999, max: 999 },
};

function readJson(req: NextRequest) {
  return req.json().catch(() => null) as Promise<Record<string, unknown> | null>;
}

function cleanString(value: unknown, max = 1500) {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, max) : "";
}

function cleanStringList(value: unknown, allowed?: readonly string[], maxItems = 60) {
  const raw = Array.isArray(value)
    ? value
    : typeof value === "string"
      ? value.split(",")
      : [];
  const allowedSet = allowed ? new Set(allowed) : null;
  const seen = new Set<string>();
  const items: string[] = [];

  for (const entry of raw) {
    const text = cleanString(entry, 120);
    if (text === undefined || !text) continue;
    if (allowedSet && !allowedSet.has(text)) continue;
    const key = text.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    items.push(text);
    if (items.length >= maxItems) break;
  }

  return items;
}

function readNumber(body: Record<string, unknown>, key: keyof NormalizedProductPatch) {
  if (!(key in body)) return undefined;
  const raw = body[key as string];
  if (raw === null || raw === "") return null;
  const numberValue = typeof raw === "number" ? raw : Number(String(raw).replace(",", "."));
  const limits = NUMERIC_LIMITS[key as string];
  if (!Number.isFinite(numberValue) || !limits) {
    throw new Error(`Campo numérico inválido: ${String(key)}.`);
  }
  if (numberValue < limits.min || numberValue > limits.max) {
    throw new Error(`Campo ${String(key)} fora do intervalo permitido.`);
  }
  return limits.integer ? Math.round(numberValue) : roundCurrency(numberValue);
}

function readBoolean(body: Record<string, unknown>, key: keyof NormalizedProductPatch) {
  if (!(key in body)) return undefined;
  return Boolean(body[key as string]);
}

function normalizeStatus(value: unknown, customizable?: boolean): ProductStatus | undefined {
  if (value === undefined) return undefined;
  const normalized = String(value).trim();
  if (normalized === ProductStatus.READY_TO_SHIP || normalized === "Pronta entrega") return ProductStatus.READY_TO_SHIP;
  if (normalized === ProductStatus.CUSTOMIZABLE) return ProductStatus.CUSTOMIZABLE;
  if (normalized === ProductStatus.DRAFT) return ProductStatus.DRAFT;
  if (normalized === ProductStatus.ARCHIVED) return ProductStatus.ARCHIVED;
  if (normalized === "Sob encomenda" || normalized === ProductStatus.MADE_TO_ORDER) {
    return customizable ? ProductStatus.CUSTOMIZABLE : ProductStatus.MADE_TO_ORDER;
  }
  throw new Error("Status inválido.");
}

function normalizeLegacyStatus(value: unknown): AdminProductOverride["status"] | undefined {
  if (value === undefined) return undefined;
  const normalized = String(value).trim();
  if (normalized === "Pronta entrega" || normalized === ProductStatus.READY_TO_SHIP) return "Pronta entrega";
  if (
    normalized === "Sob encomenda" ||
    normalized === ProductStatus.MADE_TO_ORDER ||
    normalized === ProductStatus.CUSTOMIZABLE ||
    normalized === ProductStatus.DRAFT ||
    normalized === ProductStatus.ARCHIVED
  ) {
    return "Sob encomenda";
  }
  throw new Error("Status inválido.");
}

function normalizeVisibility(value: unknown): ProductVisibility | undefined {
  if (value === undefined) return undefined;
  const normalized = String(value).trim();
  if (normalized in ProductVisibility) return normalized as ProductVisibility;
  throw new Error("Visibilidade inválida.");
}

function normalizeProfitMode(value: unknown): ProfitMode | undefined {
  if (value === undefined) return undefined;
  if (value === "margin" || value === "markup") return value;
  throw new Error("Modo de lucro inválido.");
}

function normalizeConfidence(value: unknown): AdminProductOverride["confidence"] | undefined {
  if (value === undefined) return undefined;
  if (value === "high" || value === "medium" || value === "low") return value;
  throw new Error("Confiança da classificação inválida.");
}

function normalizeBody(body: Record<string, unknown>): NormalizedProductPatch {
  const patch: NormalizedProductPatch = {};
  const strings: Array<[keyof NormalizedProductPatch, number]> = [
    ["title", 160],
    ["description", 5000],
    ["category", 120],
    ["subcategory", 120],
    ["primaryCategory", 120],
    ["productTypePath", 220],
    ["objectType", 80],
    ["classificationReason", 800],
    ["collection", 120],
    ["material", 120],
    ["finish", 120],
  ];

  for (const [key, max] of strings) {
    if (key in body) patch[key] = cleanString(body[key], max) as never;
  }

  if (patch.primaryCategory && !(CATALOG_PRIMARY_CATEGORIES as readonly string[]).includes(patch.primaryCategory)) {
    throw new Error("Categoria principal inválida.");
  }
  if (patch.objectType && !(PRODUCT_OBJECT_TYPES as readonly string[]).includes(patch.objectType)) {
    throw new Error("Tipo de produto inválido.");
  }

  if ("tags" in body) patch.tags = cleanStringList(body.tags, undefined, 90);
  if ("buyingIntents" in body) patch.buyingIntents = cleanStringList(body.buyingIntents, BUYING_INTENTS, 16);
  if ("useCaseTags" in body) patch.useCaseTags = cleanStringList(body.useCaseTags, undefined, 24);
  if ("seoKeywords" in body) patch.seoKeywords = cleanStringList(body.seoKeywords, undefined, 24);

  for (const key of Object.keys(NUMERIC_LIMITS) as Array<keyof NormalizedProductPatch>) {
    const value = readNumber(body, key);
    if (value !== undefined && value !== null) patch[key] = value as never;
  }

  if (patch.pricePix !== undefined) {
    patch.priceCard = calculateCardPrice(patch.pricePix);
  } else if (patch.priceCard !== undefined) {
    delete patch.priceCard;
  }

  for (const key of ["readyToShip", "customizable", "featured"] as Array<keyof NormalizedProductPatch>) {
    const value = readBoolean(body, key);
    if (value !== undefined) patch[key] = value as never;
  }

  patch.status = normalizeLegacyStatus(body.status);
  patch.visibility = normalizeVisibility(body.visibility);
  patch.profitMode = normalizeProfitMode(body.profitMode);
  patch.confidence = normalizeConfidence(body.confidence);
  if ("taxonomyReviewRequested" in body) patch.taxonomyReviewRequested = Boolean(body.taxonomyReviewRequested);

  if ("costingUpdatedAt" in body) {
    const raw = body.costingUpdatedAt;
    if (typeof raw === "string" && raw.trim()) patch.costingUpdatedAt = new Date(raw).toISOString();
  }

  return patch;
}

async function applyDatabaseUpdate(id: string, patch: NormalizedProductPatch) {
  return prisma.$transaction(async (tx) => {
    const current = await tx.product.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        pricePix: true,
        priceCard: true,
        marketplaceSuggested: true,
        grams: true,
        hours: true,
        complexity: true,
        estimatedGrams: true,
        estimatedHours: true,
        spoolPricePerKg: true,
        machineHourlyRate: true,
        postProcessMinutes: true,
        laborHourlyRate: true,
        packagingCost: true,
        overheadPercent: true,
        profitMode: true,
        profitTargetPercent: true,
      },
    });

    if (!current) throw new Error("Produto não encontrado no banco.");

    let categoryId: string | undefined;
    if (patch.category !== undefined) {
      const categoryName = String(patch.category || "Catálogo").trim() || "Catálogo";
      const category = await tx.category.upsert({
        where: { slug: slugify(categoryName) },
        update: { name: categoryName },
        create: { name: categoryName, slug: slugify(categoryName) },
        select: { id: true },
      });
      categoryId = category.id;
    }

    const effectivePricePix = patch.pricePix ?? Number(current.pricePix);
    const effectivePriceCard = calculateCardPrice(effectivePricePix);
    const recommendation = calculateProductionCostRecommendation({
      estimatedGrams: patch.estimatedGrams ?? Number(current.estimatedGrams ?? current.grams),
      estimatedHours: patch.estimatedHours ?? Number(current.estimatedHours ?? current.hours),
      complexity: patch.complexity ?? current.complexity,
      spoolPricePerKg: patch.spoolPricePerKg ?? Number(current.spoolPricePerKg ?? 150),
      machineHourlyRate: patch.machineHourlyRate ?? Number(current.machineHourlyRate ?? 6.9),
      postProcessMinutes: patch.postProcessMinutes ?? current.postProcessMinutes ?? 15,
      laborHourlyRate: patch.laborHourlyRate ?? Number(current.laborHourlyRate ?? 18),
      packagingCost: patch.packagingCost ?? Number(current.packagingCost ?? 2.5),
      overheadPercent: patch.overheadPercent ?? Number(current.overheadPercent ?? 12),
      profitMode: patch.profitMode ?? (current.profitMode === "markup" ? "markup" : "margin"),
      profitTargetPercent: patch.profitTargetPercent ?? Number(current.profitTargetPercent ?? 50),
      pricePix: effectivePricePix,
      priceCard: effectivePriceCard,
      marketplaceSuggested: Number(current.marketplaceSuggested),
    });
    const estimatedProfitAmount = patch.estimatedProfitAmount ?? roundCurrency(effectivePricePix - recommendation.totalCost);
    const estimatedProfitPercent =
      patch.estimatedProfitPercent ?? (effectivePricePix > 0 ? roundCurrency((estimatedProfitAmount / effectivePricePix) * 100) : 0);

    const updated = await tx.product.update({
      where: { id },
      data: {
        ...(patch.title !== undefined && { title: patch.title }),
        ...(patch.description !== undefined && { description: patch.description }),
        ...(patch.subcategory !== undefined && { subcategory: patch.subcategory }),
        ...(patch.pricePix !== undefined && { pricePix: patch.pricePix }),
        priceCard: effectivePriceCard,
        ...(patch.stock !== undefined && { stock: patch.stock }),
        ...(patch.material !== undefined && { material: patch.material }),
        ...(patch.finish !== undefined && { finish: patch.finish }),
        ...(patch.status !== undefined && { status: normalizeStatus(patch.status, patch.customizable) }),
        ...(patch.visibility !== undefined && { visibility: patch.visibility }),
        ...(patch.readyToShip !== undefined && { readyToShip: patch.readyToShip }),
        ...(patch.customizable !== undefined && { customizable: patch.customizable }),
        ...(patch.featured !== undefined && { featured: patch.featured }),
        ...(patch.tags !== undefined && { tags: patch.tags }),
        ...(categoryId && { categoryId }),
        ...(patch.estimatedGrams !== undefined && { estimatedGrams: patch.estimatedGrams }),
        ...(patch.estimatedHours !== undefined && { estimatedHours: patch.estimatedHours }),
        ...(patch.complexity !== undefined && { complexity: patch.complexity }),
        ...(patch.spoolPricePerKg !== undefined && { spoolPricePerKg: patch.spoolPricePerKg }),
        ...(patch.machineHourlyRate !== undefined && { machineHourlyRate: patch.machineHourlyRate }),
        ...(patch.postProcessMinutes !== undefined && { postProcessMinutes: patch.postProcessMinutes }),
        ...(patch.laborHourlyRate !== undefined && { laborHourlyRate: patch.laborHourlyRate }),
        ...(patch.packagingCost !== undefined && { packagingCost: patch.packagingCost }),
        ...(patch.overheadPercent !== undefined && { overheadPercent: patch.overheadPercent }),
        ...(patch.profitMode !== undefined && { profitMode: patch.profitMode }),
        ...(patch.profitTargetPercent !== undefined && { profitTargetPercent: patch.profitTargetPercent }),
        estimatedUnitCost: recommendation.totalCost,
        estimatedUnitProfit: estimatedProfitAmount,
        estimatedProfitAmount,
        estimatedProfitPercent,
        costingUpdatedAt: new Date(),
        updatedAt: new Date(),
      },
    });

    if (patch.collection !== undefined) {
      await tx.productCollection.deleteMany({ where: { productId: id } });
      const collectionName = String(patch.collection || "").trim();
      if (collectionName) {
        const collection = await tx.collection.upsert({
          where: { slug: slugify(collectionName) },
          update: { name: collectionName },
          create: { name: collectionName, slug: slugify(collectionName) },
          select: { id: true },
        });
        await tx.productCollection.create({
          data: { productId: id, collectionId: collection.id },
        });
      }
    }

    return updated;
  });
}

function fallbackPatchForOverrides(patch: NormalizedProductPatch): Partial<AdminProductOverride> {
  const { visibility: _visibility, ...overridePatch } = patch;
  return overridePatch;
}

export async function PUT(req: NextRequest, context: RouteContext) {
  const user = await getServerSessionUser();
  if (!isAdminSession(user)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const body = await readJson(req);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ ok: false, error: "Body inválido. Envie JSON com os campos do produto." }, { status: 400 });
  }

  let patch: NormalizedProductPatch;
  try {
    patch = normalizeBody(body);
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Campos inválidos no produto." },
      { status: 400 }
    );
  }

  if (await canConnectToDatabase()) {
    try {
      const updated = await applyDatabaseUpdate(id, patch);
      await recordAdminAction({
        actorId: user?.id,
        actorEmail: user?.email,
        action: "admin.product.update",
        entityType: "Product",
        entityId: id,
        summary: `Atualizou produto ${updated.title}`,
        metadata: {
          status: updated.status,
          visibility: updated.visibility,
          stock: updated.stock,
          costingUpdatedAt: updated.costingUpdatedAt?.toISOString(),
        },
        requestId: req.headers.get("x-request-id"),
        ipAddress: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip"),
        userAgent: req.headers.get("user-agent"),
      });
      await invalidateCatalogCache();
      return applyNoStoreHeaders(NextResponse.json({ ok: true, product: updated }));
    } catch {
      // Fall through to catalog override for static/local products not present in the database.
    }
  }

  try {
    const fallbackPatch = {
      ...fallbackPatchForOverrides(patch),
      costingUpdatedAt: new Date().toISOString(),
    };
    const updated = await updateAdminCatalogProduct(id, fallbackPatch);
    await invalidateCatalogCache();
    await recordAdminAction({
      actorId: user?.id,
      actorEmail: user?.email,
      action: "admin.product.update_fallback",
      entityType: "Product",
      entityId: id,
      summary: `Atualizou produto via fallback ${id}`,
      metadata: fallbackPatch as Record<string, unknown>,
      requestId: req.headers.get("x-request-id"),
      ipAddress: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip"),
      userAgent: req.headers.get("user-agent"),
    });
    return applyNoStoreHeaders(NextResponse.json({ ok: true, product: updated }));
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Não foi possível salvar o produto." },
      { status: 400 }
    );
  }
}

export async function DELETE(_req: NextRequest, context: RouteContext) {
  const user = await getServerSessionUser();
  if (!isAdminSession(user)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

  if (await canConnectToDatabase()) {
    try {
      await prisma.product.update({
        where: { id },
        data: { visibility: "PRIVATE", updatedAt: new Date() },
      });
      await invalidateCatalogCache();
      await recordAdminAction({
        actorId: user?.id,
        actorEmail: user?.email,
        action: "admin.product.archive",
        entityType: "Product",
        entityId: id,
        summary: `Arquivou produto ${id}`,
        requestId: _req.headers.get("x-request-id"),
        ipAddress: _req.headers.get("x-forwarded-for") || _req.headers.get("x-real-ip"),
        userAgent: _req.headers.get("user-agent"),
      });
      return NextResponse.json({ ok: true });
    } catch {
      // Fall through
    }
  }

  await updateAdminCatalogProduct(id, { status: "Sob encomenda" });
  await invalidateCatalogCache();
  await recordAdminAction({
    actorId: user?.id,
    actorEmail: user?.email,
    action: "admin.product.archive_fallback",
    entityType: "Product",
    entityId: id,
    summary: `Arquivou produto via fallback ${id}`,
    requestId: _req.headers.get("x-request-id"),
    ipAddress: _req.headers.get("x-forwarded-for") || _req.headers.get("x-real-ip"),
    userAgent: _req.headers.get("user-agent"),
  });
  return NextResponse.json({ ok: true });
}
