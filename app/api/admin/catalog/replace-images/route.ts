import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { replaceCatalogImages } from "@/lib/server/catalog-image-replacement";

const schema = z.object({
  manifestPath: z.string().optional(),
  sourceDir: z.string().optional(),
  dryRun: z.boolean().optional().default(false),
});

function unauthorized() {
  return NextResponse.json({ ok: false, error: "Acesso restrito ao admin." }, { status: 401 });
}

export async function POST(request: Request) {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    return unauthorized();
  }

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Parâmetros inválidos para substituição de imagens." }, { status: 400 });
  }

  const report = await replaceCatalogImages(parsed.data);
  return NextResponse.json({ ok: true, report });
}
