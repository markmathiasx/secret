import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getClientIp } from "@/lib/security";
import { rateLimitRequest } from "@/lib/redis";
import { generateOTP, hashOTP, OTP_EXPIRY_MINUTES } from "@/lib/otp";
import { sendWhatsAppOTP, normalisePhone } from "@/lib/whatsapp-otp";
import { logStructured } from "@/lib/logger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  phone: z.string().min(8).max(20),
});

export async function POST(request: NextRequest) {
  const ip = getClientIp(request.headers);

  const raw = await request.json().catch(() => null);
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, message: "Número de telefone inválido." }, { status: 400 });
  }

  const phone = normalisePhone(parsed.data.phone);

  // Dual rate limit: per phone (3/hour) + per IP (10/day)
  const [phoneRl, ipRl] = await Promise.all([
    rateLimitRequest(`whatsapp-otp-phone:${phone}`, 3, 60 * 60 * 1000),
    rateLimitRequest(`whatsapp-otp-ip:${ip}`, 10, 24 * 60 * 60 * 1000),
  ]);

  if (!phoneRl.ok || !ipRl.ok) {
    // Always return ok:true to prevent enumeration, but skip the send
    return NextResponse.json({ ok: true });
  }

  // Look up user by phone (never reveal whether found)
  const user = await prisma.user.findFirst({
    where: { phone: { contains: phone.slice(-9) } }, // match last 9 digits to handle formatting
    select: { id: true },
  }).catch(() => null);

  const code = generateOTP();
  const codeHash = hashOTP(code);
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

  // Persist OTP record
  await prisma.passwordResetOTP.create({
    data: {
      phone,
      codeHash,
      expiresAt,
      userId: user?.id ?? null,
    },
  }).catch((err) => {
    logStructured("error", "whatsapp_otp_create_failed", {
      error: err instanceof Error ? err.message : "unknown",
    });
  });

  // Send (never throws — simulated mode returns fallbackLink)
  const result = await sendWhatsAppOTP(phone, code).catch(() => ({
    success: false,
    simulated: true,
    fallbackLink: undefined,
  }));

  logStructured("info", "whatsapp_otp_requested", {
    phoneTail: phone.slice(-4),
    ip,
    simulated: result.simulated ?? false,
  });

  return NextResponse.json({
    ok: true,
    simulated: result.simulated ?? false,
    ...(result.simulated && result.fallbackLink ? { fallbackLink: result.fallbackLink } : {}),
    // In simulated mode, expose the code only in non-production so dev can test
    ...(result.simulated && process.env.NODE_ENV !== "production" ? { devCode: code } : {}),
  });
}
