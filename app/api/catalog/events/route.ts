import { NextResponse } from "next/server";
import { CatalogEventType } from "@prisma/client";
import { z } from "zod";
import { canConnectToDatabase, prisma } from "@/lib/prisma";

const schema = z.object({
  type: z.nativeEnum(CatalogEventType),
  productId: z.string().optional(),
  sessionToken: z.string().optional(),
  query: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Evento inválido." }, { status: 400 });
  }

  if (await canConnectToDatabase()) {
    await prisma.catalogEvent.create({
      data: {
        type: parsed.data.type,
        productId: parsed.data.productId,
        sessionToken: parsed.data.sessionToken,
        query: parsed.data.query,
        metadata: parsed.data.metadata,
      },
    });
  }

  return NextResponse.json({ ok: true });
}
