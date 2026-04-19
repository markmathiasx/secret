import 'server-only';
import nodemailer from "nodemailer";
import { getSmtpConfig } from "@/lib/env";

let transport: nodemailer.Transporter | null = null;

function getTransport() {
  if (transport) return transport;

  const config = getSmtpConfig();
  transport = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: config.user && config.pass ? { user: config.user, pass: config.pass } : undefined,
  });

  return transport;
}

export async function sendMail(options: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}) {
  const transporter = getTransport();
  const config = getSmtpConfig();

  return transporter.sendMail({
    from: config.from,
    to: options.to,
    subject: options.subject,
    html: options.html,
    text: options.text,
  });
}
