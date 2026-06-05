import { NextRequest, NextResponse } from "next/server";
import { applyNoStoreHeaders } from "@/lib/http-cache";
import { sendMail } from "@/lib/mailer";
import { getStaffNotifyEmail } from "@/lib/server-config";
import { getClientIp, escapeHtml, isValidEmail } from "@/lib/security";
import { rateLimitRequest } from "@/lib/redis";
import { logStructured } from "@/lib/logger";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const ip = getClientIp(req.headers);
  const rate = await rateLimitRequest(`returns:${ip}`, 5, 60 * 60 * 1000);
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

  if (!isValidEmail(String(email))) {
    return NextResponse.json({ ok: false, error: "E-mail inválido." }, { status: 400 });
  }

  const safeOrder = escapeHtml(String(orderCode).slice(0, 50));
  const safeName = escapeHtml(String(customerName).slice(0, 200));
  const safeEmail = escapeHtml(String(email).slice(0, 320));
  const safeReason = escapeHtml(String(reason).slice(0, 500));
  const safeDesc = description ? escapeHtml(String(description).slice(0, 2000)) : "";

  const html = `
    <h2>Solicitação de devolução/troca</h2>
    <p><strong>Pedido:</strong> ${safeOrder}</p>
    <p><strong>Cliente:</strong> ${safeName}</p>
    <p><strong>E-mail:</strong> ${safeEmail}</p>
    <p><strong>Motivo:</strong> ${safeReason}</p>
    ${safeDesc ? `<p><strong>Descrição:</strong> ${safeDesc}</p>` : ""}
  `;

  try {
    await sendMail({ to: getStaffNotifyEmail(), subject: `[Devolução] Pedido ${safeOrder} — ${safeName}`, html });
    await sendMail({
      to: email,
      subject: "Recebemos sua solicitação de devolução — MDH 3D",
      html: `<p>Olá ${safeName}, recebemos sua solicitação referente ao pedido <strong>${safeOrder}</strong> e entraremos em contato pelo canal informado.</p>`,
    });
  } catch (error) {
    logStructured("error", "returns_mail_failed", {
      orderCode,
      customerName,
      message: error instanceof Error ? error.message : "Falha ao enviar e-mail de devolução.",
    });
  }

  return applyNoStoreHeaders(NextResponse.json({ ok: true, message: "Solicitação registrada com sucesso." }));
}
