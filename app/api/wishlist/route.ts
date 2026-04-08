import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { canConnectToDatabase, prisma } from "@/lib/prisma";

const schema = z.object({
  productId: z.string().min(1),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id || !(await canConnectToDatabase())) {
    return NextResponse.json({ ok: true, items: [] });
  }

  const wishlist = await prisma.wishlist.findUnique({
    where: { userId: session.user.id },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  });

  return NextResponse.json({
    ok: true,
    items: wishlist?.items || [],
  });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id || !(await canConnectToDatabase())) {
    return NextResponse.json({ ok: false, error: "Faça login para salvar favoritos." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Produto inválido." }, { status: 400 });
  }

  const wishlist = await prisma.wishlist.upsert({
    where: { userId: session.user.id },
    update: {},
    create: { userId: session.user.id },
  });

  const existing = await prisma.wishlistItem.findUnique({
    where: {
      wishlistId_productId: {
        wishlistId: wishlist.id,
        productId: parsed.data.productId,
      },
    },
  });

  if (existing) {
    await prisma.wishlistItem.delete({ where: { id: existing.id } });
    return NextResponse.json({ ok: true, favorited: false });
  }

  await prisma.wishlistItem.create({
    data: {
      wishlistId: wishlist.id,
      productId: parsed.data.productId,
    },
  });

  return NextResponse.json({ ok: true, favorited: true });
}
