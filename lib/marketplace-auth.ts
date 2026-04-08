import { hash, compare } from "bcryptjs";
import { generateSecret, generateURI, verifySync } from "otplib";
import { Prisma, Role, type User } from "@prisma/client";
import { getAuthBaseUrl } from "@/lib/env";
import { sendMail } from "@/lib/mailer";
import { prisma } from "@/lib/prisma";

const VERIFY_PREFIX = "verify";
const RESET_PREFIX = "reset";

type RegisterBuyerInput = {
  name: string;
  email: string;
  password: string;
};

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function shouldAutoVerifyEmail() {
  return (process.env.AUTH_AUTO_VERIFY_LOCAL || "true").trim() === "true" && process.env.NODE_ENV !== "production";
}

function randomHex(bytes = 32) {
  const buffer = new Uint8Array(bytes);
  crypto.getRandomValues(buffer);
  return Array.from(buffer, (value) => value.toString(16).padStart(2, "0")).join("");
}

function createToken() {
  return randomHex(32);
}

function buildVerificationIdentifier(userId: string, email: string) {
  return `${VERIFY_PREFIX}:${userId}:${normalizeEmail(email)}`;
}

function buildResetIdentifier(userId: string, email: string) {
  return `${RESET_PREFIX}:${userId}:${normalizeEmail(email)}`;
}

function buildVerificationUrl(token: string) {
  return `${getAuthBaseUrl()}/api/auth/verify-email?token=${encodeURIComponent(token)}`;
}

function buildPasswordResetUrl(token: string) {
  return `${getAuthBaseUrl()}/recuperar-senha?token=${encodeURIComponent(token)}`;
}

export function getPublicRole(role: Role) {
  if (role === Role.ADMIN) return "admin";
  if (role === Role.SELLER) return "seller";
  return "buyer";
}

export async function verifyPasswordHash(password: string, passwordHash: string | null | undefined) {
  if (!passwordHash) return false;
  return compare(password, passwordHash);
}

export function canUserAccessRole(userRole: Role, requestedRole?: string) {
  if (!requestedRole || requestedRole === "buyer") return true;
  if (requestedRole === "seller") return userRole === Role.SELLER || userRole === Role.ADMIN;
  if (requestedRole === "admin") return userRole === Role.ADMIN;
  return false;
}

export async function registerBuyerAccount(input: RegisterBuyerInput) {
  const email = normalizeEmail(input.email);
  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    throw new Error("Já existe uma conta cadastrada com este e-mail.");
  }

  const passwordHash = await hash(input.password, 10);
  const user = await prisma.user.create({
    data: {
      name: input.name.trim(),
      email,
      passwordHash,
      role: Role.BUYER,
      emailVerified: shouldAutoVerifyEmail() ? new Date() : null,
      buyerProfile: {
        create: {},
      },
      wishlist: {
        create: {},
      },
    },
  });

  let verificationToken: string | null = null;

  if (!user.emailVerified) {
    verificationToken = await createEmailVerificationToken(user);
    await sendVerificationEmail(user, verificationToken);
  }

  return {
    user,
    needsVerification: !user.emailVerified,
    verificationToken,
  };
}

export async function createEmailVerificationToken(user: Pick<User, "id" | "email">) {
  const token = createToken();
  const email = normalizeEmail(user.email || "");

  await prisma.verificationToken.create({
    data: {
      identifier: buildVerificationIdentifier(user.id, email),
      token,
      expires: new Date(Date.now() + 1000 * 60 * 60 * 24),
    },
  });

  return token;
}

export async function createPasswordResetToken(user: Pick<User, "id" | "email">) {
  const token = createToken();
  const email = normalizeEmail(user.email || "");

  await prisma.verificationToken.create({
    data: {
      identifier: buildResetIdentifier(user.id, email),
      token,
      expires: new Date(Date.now() + 1000 * 60 * 30),
    },
  });

  return token;
}

export async function sendVerificationEmail(user: Pick<User, "email" | "name">, token: string) {
  if (!user.email) return;

  const url = buildVerificationUrl(token);
  await sendMail({
    to: user.email,
    subject: "Confirme seu e-mail na MDH 3D Store",
    text: `Olá${user.name ? `, ${user.name}` : ""}. Confirme seu e-mail acessando ${url}`,
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111827">
        <h1 style="font-size:24px;margin-bottom:12px">Confirme seu e-mail</h1>
        <p>Use o link abaixo para ativar sua conta na MDH 3D Store.</p>
        <p><a href="${url}" style="display:inline-block;padding:12px 20px;border-radius:999px;background:#111827;color:#fff;text-decoration:none">Confirmar e-mail</a></p>
        <p>Se o botão não abrir, copie e cole este link:</p>
        <p>${url}</p>
      </div>
    `,
  });
}

export async function sendPasswordResetEmail(user: Pick<User, "email" | "name">, token: string) {
  if (!user.email) return;

  const url = buildPasswordResetUrl(token);
  await sendMail({
    to: user.email,
    subject: "Recuperação de senha da MDH 3D Store",
    text: `Olá${user.name ? `, ${user.name}` : ""}. Você pode redefinir sua senha acessando ${url}`,
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111827">
        <h1 style="font-size:24px;margin-bottom:12px">Redefinir senha</h1>
        <p>Use o link abaixo para criar uma nova senha.</p>
        <p><a href="${url}" style="display:inline-block;padding:12px 20px;border-radius:999px;background:#111827;color:#fff;text-decoration:none">Redefinir senha</a></p>
        <p>Se o botão não abrir, copie e cole este link:</p>
        <p>${url}</p>
      </div>
    `,
  });
}

async function consumeToken(token: string, prefix: string) {
  const record = await prisma.verificationToken.findUnique({
    where: { token },
  });

  if (!record || !record.identifier.startsWith(`${prefix}:`) || record.expires < new Date()) {
    return null;
  }

  await prisma.verificationToken.delete({
    where: {
      identifier_token: {
        identifier: record.identifier,
        token: record.token,
      },
    },
  });

  return record;
}

export async function verifyEmailWithToken(token: string) {
  const record = await consumeToken(token, VERIFY_PREFIX);
  if (!record) return null;

  const [, userId] = record.identifier.split(":");

  return prisma.user.update({
    where: { id: userId },
    data: {
      emailVerified: new Date(),
    },
  });
}

export async function requestPasswordReset(email: string) {
  const normalizedEmail = normalizeEmail(email);
  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (!user || !user.email) {
    return { ok: true };
  }

  const token = await createPasswordResetToken(user);
  await sendPasswordResetEmail(user, token);
  return { ok: true };
}

export async function resetPasswordWithToken(token: string, password: string) {
  const record = await consumeToken(token, RESET_PREFIX);
  if (!record) return null;

  const [, userId] = record.identifier.split(":");
  const passwordHash = await hash(password, 10);

  return prisma.user.update({
    where: { id: userId },
    data: {
      passwordHash,
      passwordUpdatedAt: new Date(),
    },
  });
}

export async function beginTwoFactorEnrollment(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user?.email) {
    throw new Error("Usuário não encontrado para ativar 2FA.");
  }

  const secret = generateSecret();
  const backupCodes = Array.from({ length: 8 }, () => randomHex(4).toUpperCase());
  const otpauthUrl = generateURI({
    issuer: "MDH 3D Store",
    label: user.email,
    secret,
  });

  await prisma.user.update({
    where: { id: userId },
    data: {
      twoFactorSecret: secret,
      twoFactorEnabled: false,
      twoFactorBackup: backupCodes as Prisma.InputJsonValue,
    },
  });

  return {
    secret,
    backupCodes,
    otpauthUrl,
  };
}

export async function confirmTwoFactorEnrollment(userId: string, code: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user?.twoFactorSecret) {
    throw new Error("Nenhum setup de 2FA foi iniciado.");
  }

  const valid = verifySync({
    token: code,
    secret: user.twoFactorSecret,
  }).valid;

  if (!valid) {
    throw new Error("Código de 2FA inválido.");
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      twoFactorEnabled: true,
    },
  });

  return { ok: true };
}

export async function disableTwoFactor(userId: string) {
  await prisma.user.update({
    where: { id: userId },
    data: {
      twoFactorEnabled: false,
      twoFactorSecret: null,
      twoFactorBackup: Prisma.JsonNull,
    },
  });

  return { ok: true };
}

export async function verifyTwoFactorCode(userId: string, code: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user?.twoFactorEnabled || !user.twoFactorSecret) {
    return true;
  }

  const backupCodes = Array.isArray(user.twoFactorBackup)
    ? user.twoFactorBackup.filter((item): item is string => typeof item === "string")
    : [];
  if (backupCodes.includes(code.toUpperCase())) {
    await prisma.user.update({
        where: { id: userId },
        data: {
          twoFactorBackup: backupCodes.filter((item) => item !== code.toUpperCase()) as Prisma.InputJsonValue,
        },
      });
    return true;
  }

  return verifySync({
    token: code,
    secret: user.twoFactorSecret,
  }).valid;
}

export async function getUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: {
      email: normalizeEmail(email),
    },
  });
}

export { shouldAutoVerifyEmail };
