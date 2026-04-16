import { NextResponse } from "next/server";
import { z } from "zod";
import { updateAdminCatalogProduct } from "@/lib/server/admin-catalog-store";
import { getServerSessionUser, isAdminSession } from "@/lib/server-session";

const patchSchema = z.object({
  title: z.string().min(3).max(160).optional(),
  description: z.string().min(12).max(1500).optional(),
  category: z.string().min(2).max(120).optional(),
  collection: z.string().min(2).max(120).optional(),
  material: z.string().min(2).max(120).optional(),
  finish: z.string().min(2).max(120).optional(),
  status: z.enum(["Pronta entrega", "Sob encomenda"]).optional(),
  stock: z.number().int().min(0).max(9999).optional(),
  costBase: z.number().min(0).max(99999).optional(),
  pricePix: z.number().min(0).max(99999).optional(),
  readyToShip: z.boolean().optional(),
  customizable: z.boolean().optional(),
  featured: z.boolean().optional(),
  productionStage: z.enum(["recebido", "imprimindo", "pronto"]).optional(),
});

function unauthorized() {
  return NextResponse.json({ ok: false, error: "Acesso restrito ao admin." }, { status: 401 });
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await getServerSessionUser();
  if (!isAdminSession(user)) {
    return unauthorized();
  }

  const { id } = await context.params;
  const body = await request.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Payload inválido.", issues: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const product = await updateAdminCatalogProduct(id, parsed.data);
    return NextResponse.json({ ok: true, product });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Não foi possível atualizar o produto." },
      { status: 400 }
    );
  }
}
