import { NextResponse } from "next/server";
import type { Address as PrismaAddress } from "@prisma/client";
import { auth } from "@/auth";
import { addressInputSchema, normalizeAddressInput } from "@/lib/address-book";
import { canConnectToDatabase, prisma } from "@/lib/prisma";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

function serializeAddress(address: PrismaAddress) {
  return {
    id: address.id,
    label: address.label,
    recipientName: address.recipientName,
    phone: address.phone || "",
    zipCode: address.zipCode,
    line1: address.line1,
    line2: address.line2 || "",
    neighborhood: address.neighborhood || "",
    city: address.city,
    state: address.state,
    country: address.country,
    isDefaultShipping: address.isDefaultShipping,
    isDefaultBilling: address.isDefaultBilling,
  };
}

export async function PATCH(request: Request, context: RouteContext) {
  const session = await auth();
  const { id } = await context.params;

  if (!session?.user?.id) {
    return NextResponse.json({ ok: false, error: "Faça login para atualizar endereços." }, { status: 401 });
  }

  if (!(await canConnectToDatabase())) {
    return NextResponse.json({ ok: false, error: "Banco indisponível para atualizar endereços." }, { status: 503 });
  }

  const body = await request.json().catch(() => null);
  const parsed = addressInputSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Dados inválidos para o endereço." }, { status: 400 });
  }

  const existing = await prisma.address.findFirst({
    where: {
      id,
      userId: session.user.id,
    },
  });

  if (!existing) {
    return NextResponse.json({ ok: false, error: "Endereço não encontrado." }, { status: 404 });
  }

  const addressData = normalizeAddressInput(parsed.data);

  const address = await prisma.$transaction(async (tx) => {
    if (addressData.isDefaultShipping) {
      await tx.address.updateMany({
        where: { userId: session.user.id },
        data: { isDefaultShipping: false },
      });
    }

    if (addressData.isDefaultBilling) {
      await tx.address.updateMany({
        where: { userId: session.user.id },
        data: { isDefaultBilling: false },
      });
    }

    return tx.address.update({
      where: { id },
      data: addressData,
    });
  });

  return NextResponse.json({
    ok: true,
    address: serializeAddress(address),
  });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const session = await auth();
  const { id } = await context.params;

  if (!session?.user?.id) {
    return NextResponse.json({ ok: false, error: "Faça login para remover endereços." }, { status: 401 });
  }

  if (!(await canConnectToDatabase())) {
    return NextResponse.json({ ok: false, error: "Banco indisponível para remover endereços." }, { status: 503 });
  }

  const existing = await prisma.address.findFirst({
    where: {
      id,
      userId: session.user.id,
    },
  });

  if (!existing) {
    return NextResponse.json({ ok: false, error: "Endereço não encontrado." }, { status: 404 });
  }

  await prisma.address.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
