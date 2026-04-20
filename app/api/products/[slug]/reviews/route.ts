import { NextResponse } from "next/server";
import { OrderStatus } from "@prisma/client";
import { z } from "zod";
import { findCatalogProductBySlug } from "@/lib/catalog-repository";
import { applyNoStoreHeaders } from "@/lib/http-cache";
import { canConnectToDatabase, prisma } from "@/lib/prisma";
import { checkRateLimit, getClientIp } from "@/lib/security";
import { logStructured } from "@/lib/logger";

const postSchema = z.object({
  authorName: z.string().min(2).max(80),
  authorEmail: z.string().email().optional(),
  rating: z.number().int().min(1).max(5),
  title: z.string().max(120).optional(),
  body: z.string().max(2000).optional(),
});

type Params = { params: Promise<{ slug: string }> };

async function hasVerifiedPurchase(productId: string, productSku: string, authorEmail?: string) {
  if (!authorEmail) return false;

  const order = await prisma.order.findFirst({
    where: {
      customerEmail: { equals: authorEmail, mode: "insensitive" },
      status: {
        in: [OrderStatus.PAID, OrderStatus.PRINTING, OrderStatus.READY_TO_SHIP, OrderStatus.SHIPPED, OrderStatus.DELIVERED],
      },
      items: {
        some: {
          OR: [{ sku: productSku }, { productId }],
        },
      },
    },
    select: { id: true },
  });

  return Boolean(order);
}

export async function GET(_req: Request, { params }: Params) {
  const { slug } = await params;
  const product = await findCatalogProductBySlug(slug);
  if (!product) {
    return applyNoStoreHeaders(NextResponse.json({ ok: false, error: "Produto não encontrado." }, { status: 404 }));
  }

  const dbAvailable = await canConnectToDatabase();
  if (!dbAvailable) {
    logStructured("warn", "catalog_reviews_db_unavailable", { slug, method: "GET" });
    return applyNoStoreHeaders(NextResponse.json({ ok: true, reviews: [], total: 0, avgRating: null }));
  }

  try {
    const reviews = await prisma.catalogReview.findMany({
      where: { catalogSku: product.sku, approved: true },
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        id: true,
        authorName: true,
        rating: true,
        title: true,
        body: true,
        verifiedPurchase: true,
        createdAt: true,
      },
    });

    const total = reviews.length;
    const avgRating = total > 0 ? reviews.reduce((acc, r) => acc + r.rating, 0) / total : null;

    return applyNoStoreHeaders(
      NextResponse.json({
        ok: true,
        reviews,
        total,
        avgRating: avgRating !== null ? Math.round(avgRating * 10) / 10 : null,
      })
    );
  } catch (error) {
    logStructured("error", "catalog_reviews_get_failed", {
      slug,
      message: error instanceof Error ? error.message : "Falha ao carregar avaliações.",
    });
    return applyNoStoreHeaders(NextResponse.json({ ok: true, reviews: [], total: 0, avgRating: null }));
  }
}

export async function POST(req: Request, { params }: Params) {
  const { slug } = await params;
  const product = await findCatalogProductBySlug(slug);
  if (!product) {
    return applyNoStoreHeaders(NextResponse.json({ ok: false, error: "Produto não encontrado." }, { status: 404 }));
  }

  const ip = getClientIp(req.headers);
  const rateLimit = checkRateLimit(`review:${slug}:${ip}`, 3, 60_000 * 60);
  if (!rateLimit.ok) {
    return applyNoStoreHeaders(
      NextResponse.json({ ok: false, error: "Muitas avaliações enviadas. Tente novamente em 1 hora." }, { status: 429 })
    );
  }

  const raw = await req.json().catch(() => null);
  const parsed = postSchema.safeParse(raw);
  if (!parsed.success) {
    return applyNoStoreHeaders(
      NextResponse.json({ ok: false, error: "Dados inválidos. Preencha nome, e-mail e nota de 1 a 5." }, { status: 400 })
    );
  }

  const dbAvailable = await canConnectToDatabase();
  if (!dbAvailable) {
    logStructured("warn", "catalog_reviews_db_unavailable", { slug, method: "POST" });
    return applyNoStoreHeaders(
      NextResponse.json({ ok: false, error: "Serviço de avaliações temporariamente indisponível." }, { status: 503 })
    );
  }

  try {
    const verifiedPurchase = await hasVerifiedPurchase(product.id, product.sku, parsed.data.authorEmail?.trim());
    const review = await prisma.catalogReview.create({
      data: {
        catalogSku: product.sku,
        authorName: parsed.data.authorName,
        authorEmail: parsed.data.authorEmail,
        rating: parsed.data.rating,
        title: parsed.data.title,
        body: parsed.data.body,
        verifiedPurchase,
        approved: false,
      },
    });

    return applyNoStoreHeaders(
      NextResponse.json({
        ok: true,
        message: "Avaliação recebida. Ela ficará visível após moderação.",
        id: review.id,
      })
    );
  } catch (error) {
    logStructured("error", "catalog_reviews_create_failed", {
      slug,
      message: error instanceof Error ? error.message : "Erro ao salvar avaliação.",
    });
    return applyNoStoreHeaders(
      NextResponse.json({ ok: false, error: "Erro ao salvar avaliação. Tente novamente." }, { status: 500 })
    );
  }
}
