import { NextRequest, NextResponse } from "next/server";
import { ProductStatus, ProductVisibility } from "@prisma/client";
import { applyNoStoreHeaders } from "@/lib/http-cache";
import { getServerSessionUser, isAdminSession } from "@/lib/server-session";
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

const ADMIN_MONEY_LIMIT = 100000;
const ADMIN_STOCK_LIMIT = 1000000;

const NUMERIC_LIMITS: Record<string, { min: number; max: number; integer?: boolean }> = {
  pricePix: { min: 0.01, max: ADMIN_MONEY_LIMIT },
  priceCard: { min: 0, max: ADMIN_MONEY_LIMIT },
  stock: { min: 0, max: ADMIN_STOCK_LIMIT, integer: true },
  costBase: { min: 0, max: ADMIN_MONEY_LIMIT },
  estimatedGrams: { min: 0, max: 100000 },
  estimatedHours: { min: 0, max: 10000 },
  complexity: { min: 0.1, max: 10 },
  spoolPricePerKg: { min: 0, max: ADMIN_MONEY_LIMIT },
  machineHourlyRate: { min: 0, max: 9999 },
  postProcessMinutes: { min: 0, max: 100000, integer: true },
  laborHourlyRate: { min: 0, max: 9999 },
  packagingCost: { min: 0, max: ADMIN_MONEY_LIMIT },
  overheadPercent: { min: 0, max: 300 },
  profitTargetPercent: { min: 0, max: 500 },
  estimatedProfitAmount: { min: -ADMIN_MONEY_LIMIT, max: ADMIN_MONEY_LIMIT },
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
  if (raw === null || (typeof raw === "string" && !raw.trim())) throw new Error(`Informe um valor para ${String(key)}.`);
  if (typeof raw !== "string" && typeof raw !== "number") throw new Error(`Campo numérico inválido: ${String(key)}.`);
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

    if (!current) throw new Error("PRODUCT_NOT_FOUND");

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
      profitMode: patch.profitMode ?? (current.profitMode === "margin" ? "margin" : "markup"),
      profitTargetPercent: patch.profitTargetPercent ?? Number(current.profitTargetPercent ?? 0),
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

import { revalidatePath } from "next/cache";

async function refreshProductViews() {
  try {
    await invalidateCatalogCache();
    revalidatePath("/catalogo");
    revalidatePath("/catalogo/[slug]", "page");
    revalidatePath("/catalog-data.json");
    revalidatePath("/busca");
    revalidatePath("/produto/[slug]", "page");
    revalidatePath("/admin/products", "layout");
    revalidatePath("/");
    return null;
  } catch {
    return "Preço salvo no banco, mas a atualização do cache falhou. Não reenvie a alteração; confira a vitrine antes de divulgar.";
  }
}

export async function PUT(req: NextRequest, context: RouteContext) {
  const user = await getServerSessionUser();
  if (!isAdminSession(user)) {
    return applyNoStoreHeaders(NextResponse.json({ ok: false, error: user ? "Sua conta não tem permissão para editar produtos." : "Sessão expirada. Entre novamente no admin." }, { status: user ? 403 : 401 }));
  }

  const { id } = await context.params;
  const body = await readJson(req);
  if (!body || typeof body !== "object" || Array.isArray(body)) {
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
      let auditWarning: string | null = null;
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
      }).catch(() => { auditWarning = "Produto salvo, mas o registro de auditoria falhou. Verifique a operação."; });
      const warning = (await refreshProductViews()) || auditWarning || (!["database", "prisma", "db"].includes((process.env.CATALOG_SOURCE || process.env.NEXT_PUBLIC_CATALOG_SOURCE || "static").toLowerCase()) ? "Salvo no banco. A vitrine está em catálogo estático: esta alteração exige reconciliação e publicação antes de aparecer ao cliente." : null);
      return applyNoStoreHeaders(
        NextResponse.json({
          ok: true,
          persisted: true,
          source: "database",
          message: "Produto atualizado no banco.",
          warning,
          product: updated,
        })
      );
    } catch (error) {
      const notFound = error instanceof Error && error.message === "PRODUCT_NOT_FOUND";
      return applyNoStoreHeaders(NextResponse.json({
        ok: false,
        persisted: false,
        code: notFound ? "PRODUCT_NOT_IN_DATABASE" : "DATABASE_UPDATE_FAILED",
        error: notFound ? "Este produto não está no banco. Reconcilie o cadastro antes de editar o preço; nenhum arquivo foi alterado." : "Não foi possível salvar no banco. Nenhuma gravação alternativa foi feita. Tente novamente ou contate a operação.",
      }, { status: notFound ? 404 : 503 }));
    }
  }

  {
    return applyNoStoreHeaders(
      NextResponse.json(
        {
          ok: false,
          code: "DATABASE_PERSISTENCE_REQUIRED",
          error:
            "Banco indisponível ou não configurado. A edição exige persistência no banco; nenhum preço foi salvo em arquivo local.",
          persisted: false,
        },
        { status: 503 }
      )
    );
  }

}

export async function DELETE(_req: NextRequest, context: RouteContext) {
  const user = await getServerSessionUser();
  if (!isAdminSession(user)) return applyNoStoreHeaders(NextResponse.json({ ok: false, error: "Não autorizado." }, { status: user ? 403 : 401 }));
  const { id } = await context.params;
  if (!(await canConnectToDatabase())) return applyNoStoreHeaders(NextResponse.json({ ok: false, persisted: false, error: "Banco indisponível. Nenhum produto foi arquivado." }, { status: 503 }));
  try {
    await prisma.product.update({ where: { id }, data: { visibility: "PRIVATE", updatedAt: new Date() } });
  } catch {
    return applyNoStoreHeaders(NextResponse.json({ ok: false, persisted: false, error: "Não foi possível arquivar no banco." }, { status: 503 }));
  }
  const warning = await refreshProductViews();
  await recordAdminAction({ actorId: user?.id, actorEmail: user?.email, action: "admin.product.archive", entityType: "Product", entityId: id, summary: `Arquivou produto ${id}` }).catch(() => undefined);
  return applyNoStoreHeaders(NextResponse.json({ ok: true, persisted: true, warning: warning || "Arquivado no banco. Confira a publicação da vitrine antes de considerar o produto removido." }));
}
