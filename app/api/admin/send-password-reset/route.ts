import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSessionUser, isAdminSession } from "@/lib/server-session";
import { createPasswordResetToken } from "@/lib/marketplace-auth";
import { sendMail } from "@/lib/mailer";
import { escapeHtml } from "@/lib/security";
import { prisma } from "@/lib/prisma";
import { getAuthBaseUrl } from "@/lib/env";

const schema = z.object({
  userId: z.string().min(1),
});

const ADMIN_EMAIL = "markmathias02@gmail.com";

export async function POST(request: Request) {
  const admin = await getServerSessionUser();
  if (!isAdminSession(admin)) {
    return NextResponse.json({ ok: false, error: "Não autorizado." }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Dados inválidos." }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id: parsed.data.userId },
    select: { id: true, email: true, name: true },
  });

  if (!user || !user.email) {
    return NextResponse.json({ ok: false, error: "Usuário não encontrado." }, { status: 404 });
  }

  const token = await createPasswordResetToken(user);
  const resetUrl = `${getAuthBaseUrl()}/recuperar-senha?token=${encodeURIComponent(token)}`;

  await sendMail({
    to: ADMIN_EMAIL,
    subject: `[MDH 3D] Pedido de redefinição de senha — ${user.name || user.email}`,
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111827">
        <h1 style="font-size:20px;margin-bottom:12px">Redefinição de senha solicitada</h1>
        <p><strong>Usuário:</strong> ${escapeHtml(user.name || "—")}</p>
        <p><strong>E-mail:</strong> ${escapeHtml(user.email)}</p>
        <p style="margin-top:16px">Envie o link abaixo para o usuário redefinir a senha:</p>
        <p style="background:#f3f4f6;padding:12px 16px;border-radius:8px;word-break:break-all;font-size:14px;">
          <a href="${resetUrl}">${resetUrl}</a>
        </p>
        <p style="margin-top:16px;font-size:13px;color:#6b7280">Este link expira em 30 minutos.</p>
      </div>
    `,
    text: `Redefinição de senha para ${user.name || user.email}.\nLink: ${resetUrl}\nExpira em 30 minutos.`,
  });

  return NextResponse.json({ ok: true, message: "Link de redefinição enviado por e-mail." });
}
