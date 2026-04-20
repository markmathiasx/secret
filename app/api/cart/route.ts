import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { findProduct } from "@/lib/catalog";
import { canConnectToDatabase, prisma } from "@/lib/prisma";
import { getServerSessionUser } from "@/lib/server-session";

const cartItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().min(0).max(20).default(1),
});

const cartMutationSchema = z.object({
  action: z.enum(["set", "merge", "remove"]).default("set"),
  productId: z.string().min(1).optional(),
  quantity: z.number().int().min(0).max(20).optional(),
  items: z.array(cartItemSchema).max(40).optional(),
});

function toNumber(value: Prisma.Decimal | number | null | undefined) {
  if (value == null) return 0;
  return Number(value);
}

async function getActiveCart(userId: string) {
  return prisma.cart.findFirst({
    where: {
      userId,
      status: "ACTIVE",
    },
    include: {
      items: {
        include: {
          product: true,
        },
        orderBy: {
          updatedAt: "desc",
        },
      },
    },
    orderBy: {
      updatedAt: "desc",
    },
  });
}

function mapCart(cart: Awaited<ReturnType<typeof getActiveCart>>) {
  if (!cart) return null;

  return {
    id: cart.id,
    updatedAt: cart.updatedAt.toISOString(),
    items: cart.items.map((item) => {
      const catalogProduct = findProduct(item.productId);
      return {
        id: item.id,
        productId: item.productId,
        quantity: item.quantity,
        title: item.product.title,
        pricePix: toNumber(item.product.pricePix),
        priceCard: toNumber(item.product.priceCard),
        image: catalogProduct?.images?.[0] || catalogProduct?.image || null,
        updatedAt: item.updatedAt.toISOString(),
      };
    }),
  };
}

async function ensureActiveCart(userId: string) {
  return prisma.cart.upsert({
    where: {
      sessionToken: `user-cart:${userId}`,
    },
    update: {
      userId,
      status: "ACTIVE",
    },
    create: {
      userId,
      sessionToken: `user-cart:${userId}`,
      status: "ACTIVE",
    },
  });
}

export async function GET() {
  const user = await getServerSessionUser();

  if (!user?.id) {
    return NextResponse.json({ ok: true, cart: null, persisted: false });
  }

  if (!(await canConnectToDatabase())) {
    return NextResponse.json({ ok: true, cart: null, persisted: false });
  }

  const cart = await getActiveCart(user.id);
  return NextResponse.json({ ok: true, cart: mapCart(cart), persisted: true });
}

export async function POST(request: Request) {
  const user = await getServerSessionUser();

  if (!user?.id) {
    return NextResponse.json({ ok: false, error: "Faça login para sincronizar o carrinho." }, { status: 401 });
  }

  if (!(await canConnectToDatabase())) {
    return NextResponse.json({ ok: false, error: "Banco indisponível para persistir o carrinho." }, { status: 503 });
  }

  const body = await request.json().catch(() => null);
  const parsed = cartMutationSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Payload de carrinho inválido." }, { status: 400 });
  }

  const items =
    parsed.data.action === "merge"
      ? parsed.data.items || []
      : parsed.data.action === "remove"
        ? parsed.data.productId
          ? [{ productId: parsed.data.productId, quantity: 0 }]
          : []
      : parsed.data.productId
        ? [{ productId: parsed.data.productId, quantity: parsed.data.quantity ?? 1 }]
        : [];

  if (!items.length) {
    return NextResponse.json({ ok: false, error: "Nenhum item válido foi enviado para o carrinho." }, { status: 400 });
  }

  const cart = await ensureActiveCart(user.id);

  await prisma.$transaction(async (tx) => {
    for (const item of items) {
      const product = await tx.product.findUnique({
        where: {
          id: item.productId,
        },
        select: {
          id: true,
          pricePix: true,
        },
      });

      if (!product) continue;

      const existing = await tx.cartItem.findFirst({
        where: {
          cartId: cart.id,
          productId: item.productId,
        },
      });

      const nextQuantity =
        parsed.data.action === "merge" && existing
          ? Math.min(20, existing.quantity + item.quantity)
          : Math.min(20, item.quantity);

      if (nextQuantity <= 0) {
        if (existing) {
          await tx.cartItem.delete({
            where: {
              id: existing.id,
            },
          });
        }
        continue;
      }

      if (existing) {
        await tx.cartItem.update({
          where: {
            id: existing.id,
          },
          data: {
            quantity: nextQuantity,
            unitPrice: product.pricePix,
          },
        });
      } else {
        await tx.cartItem.create({
          data: {
            cartId: cart.id,
            productId: item.productId,
            quantity: nextQuantity,
            unitPrice: product.pricePix,
          },
        });
      }
    }
  });

  const hydratedCart = await getActiveCart(user.id);
  return NextResponse.json({ ok: true, cart: mapCart(hydratedCart), persisted: true });
}
