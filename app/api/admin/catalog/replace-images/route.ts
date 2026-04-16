import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSessionUser, isAdminSession } from "@/lib/server-session";

const schema = z.object({
  manifestPath: z.string().optional(),
  sourceDir: z.string().optional(),
  dryRun: z.boolean().optional().default(false),
});

function unauthorized() {
  return NextResponse.json({ ok: false, error: "Acesso restrito ao admin." }, { status: 401 });
}

export async function POST(request: Request) {
  const user = await getServerSessionUser();
  if (!isAdminSession(user)) {
    return unauthorized();
  }

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Parâmetros inválidos para substituição de imagens." }, { status: 400 });
  }

  if (process.env.VERCEL || process.env.NODE_ENV === "production") {
    return NextResponse.json(
      {
        ok: false,
        error: "A substituição em massa de imagens fica disponível apenas no ambiente local de operação.",
      },
      { status: 501 }
    );
  }

  const { replaceCatalogImages } = await import("@/lib/server/catalog-image-replacement");
  const report = await replaceCatalogImages(parsed.data);
  return NextResponse.json({ ok: true, report });
}
