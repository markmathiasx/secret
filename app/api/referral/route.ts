import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSessionUser } from "@/lib/server-session";
import { awardBonusPoints } from "@/lib/loyalty";
import { customAlphabet } from "nanoid";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const nanoid = customAlphabet("ABCDEFGHJKLMNPQRSTUVWXYZ23456789", 8);

/** GET /api/referral — get or create the user's referral code */
export async function GET() {
  const user = await getServerSessionUser();
  if (!user?.id) {
    return NextResponse.json({ ok: false, message: "Autenticação necessária." }, { status: 401 });
  }

  let referral = await prisma.referral.findFirst({
    where: { referrerId: user.id, refereeId: null },
    select: { code: true, rewardPoints: true },
  });

  const usedCount = await prisma.referral.count({
    where: { referrerId: user.id, refereeId: { not: null } },
  });

  if (!referral) {
    const code = nanoid();
    await prisma.referral.create({
      data: { referrerId: user.id, code, rewardPoints: 100 },
    });
    referral = { code, rewardPoints: 100 };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://mdh3d.com.br";

  return NextResponse.json({
    ok: true,
    code: referral.code,
    referralUrl: `${siteUrl}/?ref=${referral.code}`,
    rewardPoints: referral.rewardPoints,
    usedCount,
  });
}

/** POST /api/referral/use — apply a referral code for a new user */
export async function POST(request: NextRequest) {
  const user = await getServerSessionUser();
  if (!user?.id) {
    return NextResponse.json({ ok: false, message: "Autenticação necessária." }, { status: 401 });
  }

  const { code } = await request.json().catch(() => ({}));
  if (!code) {
    return NextResponse.json({ ok: false, message: "Código obrigatório." }, { status: 400 });
  }

  const referral = await prisma.referral.findFirst({
    where: { code: String(code), refereeId: null },
    select: { id: true, referrerId: true, rewardPoints: true },
  });

  if (!referral) {
    return NextResponse.json({ ok: false, message: "Código inválido ou já utilizado." }, { status: 404 });
  }

  if (referral.referrerId === user.id) {
    return NextResponse.json({ ok: false, message: "Você não pode usar seu próprio código." }, { status: 400 });
  }

  await prisma.referral.update({
    where: { id: referral.id },
    data: { refereeId: user.id, usedAt: new Date() },
  });

  // Award points to both parties
  await Promise.all([
    await awardBonusPoints(referral.referrerId, referral.rewardPoints, `Indicação aceita`),
    awardBonusPoints(user.id, Math.floor(referral.rewardPoints / 2), "Bônus de boas-vindas por indicação"),
  ]);

  return NextResponse.json({ ok: true, pointsEarned: Math.floor(referral.rewardPoints / 2) });
}
