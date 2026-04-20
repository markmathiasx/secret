import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSessionUser, isAdminSession } from "@/lib/server-session";
import { createPasswordResetRequestRecord, createPasswordResetToken } from "@/lib/marketplace-auth";
import { sendMail } from "@/lib/mailer";
import { escapeHtml } from "@/lib/security";
import { prisma } from "@/lib/prisma";
import { getAuthBaseUrl } from "@/lib/env";
import { logStructured } from "@/lib/logger";
import { recordAdminAction } from "@/lib/admin-audit";
import { applyNoStoreHeaders } from "@/lib/http-cache";

const schema = z.object({
  userId: z.string().min(1),
});

const ADMIN_EMAIL = "markmathias02@gmail.com";

export async function POST(request: Request) {
  const admin = await getServerSessionUser();
  if (!isAdminSession(admin)) {
    return applyNoStoreHeaders(NextResponse.json({ ok: false, error: "Não autorizado." }, { status: 403 }));
  }

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return applyNoStoreHeaders(NextResponse.json({ ok: false, error: "Dados inválidos." }, { status: 400 }));
  }

  const user = await prisma.user.findUnique({
    where: { id: parsed.data.userId },
    select: { id: true, email: true, name: true },
  });

  if (!user || !user.email) {
    return applyNoStoreHeaders(NextResponse.json({ ok: false, error: "Usuário não encontrado." }, { status: 404 }));
  }

  const token = await createPasswordResetToken(user);
  const resetUrl = `${getAuthBaseUrl()}/recuperar-senha/confirmar?token=${encodeURIComponent(token)}`;

  await createPasswordResetRequestRecord({
    email: user.email,
    userId: user.id,
    token,
    expiresAt: new Date(Date.now() + 1000 * 60 * 30),
    meta: {
      source: "admin",
      adminEmail: ADMIN_EMAIL,
      requestId: request.headers.get("x-request-id"),
      requestedByIp: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip"),
      requestedByUserAgent: request.headers.get("user-agent"),
    },
    adminNotifiedAt: new Date(),
  });

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

  logStructured("info", "admin_password_reset_link_sent", {
    requestId: request.headers.get("x-request-id") || null,
    actorId: admin.id,
    targetUserId: user.id,
  });

  await recordAdminAction({
    actorId: admin.id,
    actorEmail: admin.email,
    action: "admin.password_reset.send_link",
    entityType: "User",
    entityId: user.id,
    summary: `Enviou link de redefinição para ${user.email}`,
    requestId: request.headers.get("x-request-id"),
    ipAddress: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip"),
    userAgent: request.headers.get("user-agent"),
    metadata: {
      adminEmail: ADMIN_EMAIL,
    },
  });

  return applyNoStoreHeaders(NextResponse.json({ ok: true, message: "Link de redefinição enviado por e-mail." }));
}
