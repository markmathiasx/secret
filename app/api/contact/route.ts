import { NextRequest, NextResponse } from "next/server";
import { applyNoStoreHeaders } from "@/lib/http-cache";
import { sendMail } from "@/lib/mailer";
import { supportEmail } from "@/lib/constants";
import { getClientIp, checkRateLimit } from "@/lib/security";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const ip = getClientIp(req.headers);
  const rate = checkRateLimit(`contact:${ip}`, 3, 60 * 60 * 1000);
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

  const adminHtml = `
    <h2>Nova mensagem de contato</h2>
    <p><strong>Nome:</strong> ${name}</p>
    <p><strong>E-mail:</strong> ${email}</p>
    <p><strong>Assunto:</strong> ${subject || "(sem assunto)"}</p>
    <p><strong>Mensagem:</strong></p>
    <blockquote>${message.replace(/\n/g, "<br>")}</blockquote>
  `;

  const userHtml = `
    <p>Olá <strong>${name}</strong>,</p>
    <p>Recebemos sua mensagem e responderemos em breve.</p>
    <p>Sua mensagem:</p>
    <blockquote>${message.replace(/\n/g, "<br>")}</blockquote>
    <p>— Equipe MDH 3D</p>
  `;

  try {
    await sendMail({ to: supportEmail, subject: `[Contato] ${subject || name} — MDH 3D`, html: adminHtml });
    await sendMail({ to: email, subject: "Mensagem recebida — MDH 3D", html: userHtml });
  } catch {
    console.error("[contact] Falha ao enviar e-mail");
  }

  return applyNoStoreHeaders(NextResponse.json({ ok: true, message: "Mensagem enviada com sucesso!" }));
}
