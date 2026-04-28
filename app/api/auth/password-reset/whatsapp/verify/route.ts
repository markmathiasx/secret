import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getClientIp } from "@/lib/security";
import { rateLimitRequest } from "@/lib/redis";
import { verifyOTP, MAX_ATTEMPTS } from "@/lib/otp";
import { normalisePhone } from "@/lib/whatsapp-otp";
import { logStructured } from "@/lib/logger";
import { hash } from "bcryptjs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  phone: z.string().min(8).max(20),
  code: z.string().length(6).regex(/^\d{6}$/),
  newPassword: z
    .string()
    .min(8, "A senha deve ter pelo menos 8 caracteres")
    .regex(/[A-Z]/, "A senha deve ter pelo menos uma letra maiúscula")
    .regex(/[a-z]/, "A senha deve ter pelo menos uma letra minúscula")
    .regex(/\d/, "A senha deve ter pelo menos um número"),
});

export async function POST(request: NextRequest) {
  const ip = getClientIp(request.headers);

  // Rate limit verify attempts
  const rl = await rateLimitRequest(`whatsapp-otp-verify:${ip}`, 10, 60 * 60 * 1000);
  if (!rl.ok) {
    return NextResponse.json({ ok: false, message: "Muitas tentativas. Aguarde um momento." }, { status: 429 });
  }

  const raw = await request.json().catch(() => null);
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? "Dados inválidos.";
    return NextResponse.json({ ok: false, message: firstError }, { status: 400 });
  }

  const { code, newPassword } = parsed.data;
  const phone = normalisePhone(parsed.data.phone);

  // Find latest unused, non-expired OTP for this phone
  const otpRecord = await prisma.passwordResetOTP.findFirst({
    where: {
      phone,
      used: false,
      expiresAt: { gt: new Date() },
      attempts: { lt: MAX_ATTEMPTS },
    },
    orderBy: { createdAt: "desc" },
  });

  if (!otpRecord) {
    logStructured("warn", "whatsapp_otp_not_found", { phoneTail: phone.slice(-4), ip });
    return NextResponse.json({ ok: false, message: "Código inválido ou expirado. Solicite um novo." }, { status: 400 });
  }

  // Increment attempt counter
  await prisma.passwordResetOTP.update({
    where: { id: otpRecord.id },
    data: { attempts: { increment: 1 } },
  }).catch(() => {});

  const valid = verifyOTP(code, otpRecord.codeHash);
  if (!valid) {
    const remaining = MAX_ATTEMPTS - (otpRecord.attempts + 1);
    logStructured("warn", "whatsapp_otp_wrong_code", { phoneTail: phone.slice(-4), ip, remaining });

    if (remaining <= 0) {
      return NextResponse.json({ ok: false, message: "Código bloqueado após muitas tentativas. Solicite um novo." }, { status: 400 });
    }
    return NextResponse.json({
      ok: false,
      message: `Código incorreto. ${remaining} tentativa${remaining === 1 ? "" : "s"} restante${remaining === 1 ? "" : "s"}.`,
    }, { status: 400 });
  }

  // Mark OTP as used
  await prisma.passwordResetOTP.update({
    where: { id: otpRecord.id },
    data: { used: true },
  }).catch(() => {});

  // If no user linked, we can't reset the password — but don't reveal this
  if (!otpRecord.userId) {
    logStructured("warn", "whatsapp_otp_no_user", { phoneTail: phone.slice(-4) });
    // Return success UX but do nothing (prevent enumeration)
    return NextResponse.json({ ok: true });
  }

  // Update password
  const passwordHash = await hash(newPassword, 10);
  await prisma.user.update({
    where: { id: otpRecord.userId },
    data: { passwordHash, passwordUpdatedAt: new Date() },
  });

  // Invalidate all existing sessions (security)
  await prisma.session.deleteMany({ where: { userId: otpRecord.userId } }).catch(() => {});

  logStructured("info", "whatsapp_otp_password_reset", { userId: otpRecord.userId });

  return NextResponse.json({ ok: true, message: "Senha redefinida com sucesso. Você já pode entrar." });
}
