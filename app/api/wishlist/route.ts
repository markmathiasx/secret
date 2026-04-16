import { NextResponse } from "next/server";
import { z } from "zod";
import { canConnectToDatabase, prisma } from "@/lib/prisma";
import { getServerSessionUser } from "@/lib/server-session";

const schema = z.object({
  productId: z.string().min(1),
});

export async function GET() {
  const user = await getServerSessionUser();
  if (!user?.id || !(await canConnectToDatabase())) {
    return NextResponse.json({ ok: true, items: [] });
  }

  const wishlist = await prisma.wishlist.findUnique({
    where: { userId: user.id },
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
  const user = await getServerSessionUser();
  if (!user?.id) {
    return NextResponse.json({ ok: false, error: "Faça login para salvar favoritos." }, { status: 401 });
  }

  if (!(await canConnectToDatabase())) {
    return NextResponse.json({ ok: false, error: "Banco indisponível para salvar favoritos." }, { status: 503 });
  }

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Produto inválido." }, { status: 400 });
  }

  const wishlist = await prisma.wishlist.upsert({
    where: { userId: user.id },
    update: {},
    create: { userId: user.id },
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
