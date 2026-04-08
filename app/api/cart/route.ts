import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { canConnectToDatabase, prisma } from "@/lib/prisma";

const schema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().min(1).max(20).default(1),
});

export async function GET() {
  const session = await auth();
  if (!(await canConnectToDatabase())) {
    return NextResponse.json({ ok: true, cart: null });
  }

  const cart = await prisma.cart.findFirst({
    where: session?.user?.id ? { userId: session.user.id, status: "ACTIVE" } : undefined,
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  return NextResponse.json({ ok: true, cart });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id || !(await canConnectToDatabase())) {
    return NextResponse.json({ ok: false, error: "Faça login para usar o carrinho persistente." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Item de carrinho inválido." }, { status: 400 });
  }

  const cart = await prisma.cart.upsert({
    where: { sessionToken: `user-cart:${session.user.id}` },
    update: {
      userId: session.user.id,
    },
    create: {
      userId: session.user.id,
      sessionToken: `user-cart:${session.user.id}`,
    },
  });

  const product = await prisma.product.findUnique({
    where: { id: parsed.data.productId },
  });

  if (!product) {
    return NextResponse.json({ ok: false, error: "Produto não encontrado." }, { status: 404 });
  }

  const existing = await prisma.cartItem.findFirst({
    where: {
      cartId: cart.id,
      productId: parsed.data.productId,
    },
  });

  if (existing) {
    await prisma.cartItem.update({
      where: { id: existing.id },
      data: {
        quantity: parsed.data.quantity,
      },
    });
  } else {
    await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId: parsed.data.productId,
        quantity: parsed.data.quantity,
        unitPrice: product.pricePix,
      },
    });
  }

  return NextResponse.json({ ok: true });
}
