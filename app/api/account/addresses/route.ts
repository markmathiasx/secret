import { NextResponse } from "next/server";
import type { Address as PrismaAddress } from "@prisma/client";
import { addressInputSchema, normalizeAddressInput } from "@/lib/address-book";
import { canConnectToDatabase, prisma } from "@/lib/prisma";
import { getServerSessionUser } from "@/lib/server-session";

export const runtime = "nodejs";

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

export async function GET() {
  const user = await getServerSessionUser();

  if (!user?.id) {
    return NextResponse.json({ ok: true, addresses: [] });
  }

  if (!(await canConnectToDatabase())) {
    return NextResponse.json({ ok: true, addresses: [] });
  }

  const addresses = await prisma.address.findMany({
    where: { userId: user.id },
    orderBy: [{ isDefaultShipping: "desc" }, { createdAt: "desc" }],
  });

  return NextResponse.json({
    ok: true,
    addresses: addresses.map(serializeAddress),
  });
}

export async function POST(request: Request) {
  const user = await getServerSessionUser();

  if (!user?.id) {
    return NextResponse.json({ ok: false, error: "Faça login para salvar endereços." }, { status: 401 });
  }

  if (!(await canConnectToDatabase())) {
    return NextResponse.json({ ok: false, error: "Banco indisponível para salvar endereços." }, { status: 503 });
  }

  const body = await request.json().catch(() => null);
  const parsed = addressInputSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Dados inválidos para o endereço." }, { status: 400 });
  }

  const addressData = normalizeAddressInput(parsed.data);

  const address = await prisma.$transaction(async (tx) => {
    if (addressData.isDefaultShipping) {
      await tx.address.updateMany({
        where: { userId: user.id },
        data: { isDefaultShipping: false },
      });
    }

    if (addressData.isDefaultBilling) {
      await tx.address.updateMany({
        where: { userId: user.id },
        data: { isDefaultBilling: false },
      });
    }

    return tx.address.create({
      data: {
        userId: user.id,
        ...addressData,
      },
    });
  });

  return NextResponse.json({
    ok: true,
    address: serializeAddress(address),
  });
}
