import { NextRequest, NextResponse } from "next/server";
import { applyNoStoreHeaders } from "@/lib/http-cache";
import { sendMail } from "@/lib/mailer";
import { getStaffNotifyEmail } from "@/lib/server-config";
import { getClientIp, escapeHtml, isValidEmail } from "@/lib/security";
import { rateLimitRequest } from "@/lib/redis";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const ip = getClientIp(req.headers);
  const rate = await rateLimitRequest(`contact:${ip}`, 3, 60 * 60 * 1000);
  if (!rate.ok) {
    return NextResponse.json({ ok: false, error: "Limite de mensagens atingido. Tente novamente em 1 hora." }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ ok: false, error: "Body inválido." }, { status: 400 });
  }

  const { name, email, subject, message } = body;
  if (!name || !email || !message) {
    return NextResponse.json({ ok: false, error: "name, email e message são obrigatórios." }, { status: 400 });
  }

  if (!isValidEmail(String(email))) {
    return NextResponse.json({ ok: false, error: "E-mail inválido." }, { status: 400 });
  }

  const safeName = escapeHtml(String(name).slice(0, 200));
  const safeEmail = escapeHtml(String(email).slice(0, 320));
  const safeSubject = escapeHtml(String(subject || "(sem assunto)").slice(0, 300));
  const safeMessage = escapeHtml(String(message).slice(0, 5000)).replace(/\n/g, "<br>");

  const adminHtml = `
    <h2>Nova mensagem de contato</h2>
    <p><strong>Nome:</strong> ${safeName}</p>
    <p><strong>E-mail:</strong> ${safeEmail}</p>
    <p><strong>Assunto:</strong> ${safeSubject}</p>
    <p><strong>Mensagem:</strong></p>
    <blockquote>${safeMessage}</blockquote>
  `;

  const userHtml = `
    <p>Olá <strong>${safeName}</strong>,</p>
    <p>Recebemos sua mensagem e responderemos em breve.</p>
    <p>Sua mensagem:</p>
    <blockquote>${safeMessage}</blockquote>
    <p>— Equipe MDH 3D</p>
  `;

  try {
    await sendMail({ to: getStaffNotifyEmail(), subject: `[Contato] ${subject || name} — MDH 3D`, html: adminHtml });
    await sendMail({ to: email, subject: "Mensagem recebida — MDH 3D", html: userHtml });
  } catch {
    console.error("[contact] Falha ao enviar e-mail");
  }

  return applyNoStoreHeaders(NextResponse.json({ ok: true, message: "Mensagem enviada com sucesso!" }));
}
