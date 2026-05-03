import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { applyNoStoreHeaders } from "@/lib/http-cache";
import { sendMail } from "@/lib/mailer";
import { getStaffNotifyEmail } from "@/lib/server-config";
import { getClientIp, escapeHtml, isValidEmail } from "@/lib/security";
import { rateLimitRequest } from "@/lib/redis";
import { sanitizeEmail, sanitizeMultilineText, sanitizePlainText } from "@/lib/sanitize";

export const dynamic = "force-dynamic";

const contactSchema = z.object({
  name: z.string().min(2).max(200).transform((value) => sanitizePlainText(value, 200)),
  email: z.string().max(320).transform((value) => sanitizeEmail(value)),
  subject: z.string().max(300).optional().transform((value) => sanitizePlainText(value || "(sem assunto)", 300)),
  message: z.string().min(3).max(5000).transform((value) => sanitizeMultilineText(value, 5000)),
});

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

  const parsed = contactSchema.safeParse(body);

  if (!parsed.success || !isValidEmail(parsed.data.email)) {
    return NextResponse.json({ ok: false, error: "E-mail inválido." }, { status: 400 });
  }

  const { name, email, subject, message } = parsed.data;
  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safeSubject = escapeHtml(subject);
  const safeMessage = escapeHtml(message).replace(/\n/g, "<br>");

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
