import { NextRequest, NextResponse } from "next/server";
import { applyNoStoreHeaders } from "@/lib/http-cache";
import { sendMail } from "@/lib/mailer";
import { supportEmail } from "@/lib/constants";
import { getClientIp, checkRateLimit } from "@/lib/security";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const ip = getClientIp(req.headers);
  const rate = checkRateLimit(`returns:${ip}`, 5, 60 * 60 * 1000);
  if (!rate.ok) {
    return NextResponse.json({ ok: false, error: "Muitas solicitações. Tente novamente em instantes." }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ ok: false, error: "Body inválido." }, { status: 400 });
  }

  const { orderCode, customerName, email, reason, description } = body;
  if (!orderCode || !customerName || !email || !reason) {
    return NextResponse.json({ ok: false, error: "Campos obrigatórios: orderCode, customerName, email, reason." }, { status: 400 });
  }

  const html = `
    <h2>Solicitação de devolução/troca</h2>
    <p><strong>Pedido:</strong> ${orderCode}</p>
    <p><strong>Cliente:</strong> ${customerName}</p>
    <p><strong>E-mail:</strong> ${email}</p>
    <p><strong>Motivo:</strong> ${reason}</p>
    ${description ? `<p><strong>Descrição:</strong> ${description}</p>` : ""}
  `;

  try {
    await sendMail({ to: supportEmail, subject: `[Devolução] Pedido ${orderCode} — ${customerName}`, html });
    await sendMail({
      to: email,
      subject: "Recebemos sua solicitação de devolução — MDH 3D",
      html: `<p>Olá ${customerName}, recebemos sua solicitação referente ao pedido <strong>${orderCode}</strong> e entraremos em contato em breve.</p>`,
    });
  } catch {
    // Log but don't fail the request
    console.error("[returns] Falha ao enviar e-mail");
  }

  return applyNoStoreHeaders(NextResponse.json({ ok: true, message: "Solicitação registrada com sucesso." }));
}
