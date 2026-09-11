import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSessionUser, isAdminSession } from "@/lib/server-session";
import { createPasswordResetRequestRecord, createPasswordResetToken, sendPasswordResetEmail } from "@/lib/marketplace-auth";
import { prisma } from "@/lib/prisma";
import { logStructured } from "@/lib/logger";
import { recordAdminAction } from "@/lib/admin-audit";
import { applyNoStoreHeaders } from "@/lib/http-cache";

const schema = z.object({
  userId: z.string().min(1),
});

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
  await createPasswordResetRequestRecord({
    email: user.email,
    userId: user.id,
    token,
    expiresAt: new Date(Date.now() + 1000 * 60 * 30),
    meta: {
      source: "admin",
      adminEmail: admin.email,
      requestId: request.headers.get("x-request-id"),
      requestedByIp: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip"),
      requestedByUserAgent: request.headers.get("user-agent"),
    },
  });

  await sendPasswordResetEmail(user, token);

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
      requestedByAdmin: admin.email,
    },
  });

  return applyNoStoreHeaders(NextResponse.json({ ok: true, message: "Link de redefinição enviado por e-mail." }));
}
