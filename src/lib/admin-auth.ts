import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { and, eq, gt } from "drizzle-orm";
import { randomBytes, scryptSync, timingSafeEqual, createHash, createHmac } from "node:crypto";
import { getDb, isDatabaseConfigured } from "@/db/client";
import { adminSessions } from "@/db/schema";
import { adminConfig } from "@/lib/constants";
import { databaseUnavailableMessage } from "@/lib/database-status";

const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 14;

type ParsedSession = {
  email: string;
  expiresAt: number;
  token: string;
};

function getSessionSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET;

  if (!secret) {
    throw new Error("ADMIN_SESSION_SECRET não configurado.");
  }

  return secret;
}

function hashAdminPasswordValue(password: string, salt: string) {
  return scryptSync(password, salt, 64).toString("hex");
}

export function makeAdminPasswordHash(password: string) {
  const salt = randomBytes(16).toString("hex");
  return `s2:${salt}:${hashAdminPasswordValue(password, salt)}`;
}

function verifyPasswordHash(password: string, hash: string) {
  const [scheme, salt, digest] = hash.split(":");
  if (scheme !== "s2" || !salt || !digest) return false;

  const expected = Buffer.from(digest, "hex");
  const actual = Buffer.from(hashAdminPasswordValue(password, salt), "hex");

  if (expected.length !== actual.length) return false;
  return timingSafeEqual(expected, actual);
}

function signSessionParts(email: string, expiresAt: number, token: string) {
  return createHmac("sha256", getSessionSecret()).update(`${email}.${expiresAt}.${token}`).digest("hex");
}

function encodeSessionEmail(email: string) {
  return Buffer.from(email, "utf8").toString("base64url");
}

function decodeSessionEmail(encoded: string) {
  try {
    return Buffer.from(encoded, "base64url").toString("utf8");
  } catch {
    return "";
  }
}

function buildSessionValue(email: string, expiresAt: number, token: string) {
  const signature = signSessionParts(email, expiresAt, token);
  return `${encodeSessionEmail(email)}.${expiresAt}.${token}.${signature}`;
}

function parseSessionValue(value: string | undefined | null): ParsedSession | null {
  if (!value) return null;

  const parts = value.split(".");
  if (parts.length < 4) return null;

  const [encodedEmail, expiresAtRaw, token, signature] = parts;
  const email = decodeSessionEmail(encodedEmail);
  const expiresAt = Number(expiresAtRaw);
  if (!email || !Number.isFinite(expiresAt) || !token || !signature) return null;
  if (expiresAt < Date.now()) return null;

  const expected = signSessionParts(email, expiresAt, token);
  const expectedBuffer = Buffer.from(expected, "hex");
  const actualBuffer = Buffer.from(signature, "hex");
  if (expectedBuffer.length !== actualBuffer.length) return null;
  if (!timingSafeEqual(expectedBuffer, actualBuffer)) return null;

  return { email, expiresAt, token };
}

function hashSessionToken(token: string) {
  return createHash("sha256").update(`${getSessionSecret()}:${token}`).digest("hex");
}

function requireSessionStore() {
  if (!isDatabaseConfigured()) {
    throw new Error(databaseUnavailableMessage);
  }

  return getDb();
}

export async function verifyAdminCredentials(email: string, password: string) {
  const adminEmail = adminConfig.email.toLowerCase();
  if (email.trim().toLowerCase() !== adminEmail) return false;

  const passwordHash = process.env.ADMIN_PASSWORD_HASH;
  if (!passwordHash) return false;

  return verifyPasswordHash(password, passwordHash);
}

export async function createAdminSession(input: { email: string; ipAddress?: string | null; userAgent?: string | null }) {
  const token = randomBytes(24).toString("base64url");
  const expiresAt = Date.now() + SESSION_TTL_MS;
  const value = buildSessionValue(input.email.toLowerCase(), expiresAt, token);
  const db = requireSessionStore();
  await db.insert(adminSessions).values({
    email: input.email.toLowerCase(),
    sessionTokenHash: hashSessionToken(token),
    ipAddress: input.ipAddress || null,
    userAgent: input.userAgent || null,
    expiresAt: new Date(expiresAt)
  });

  return {
    value,
    expiresAt
  };
}

export async function getAdminSession(value: string | undefined | null) {
  const parsed = parseSessionValue(value);
  if (!parsed) return null;
  if (!isDatabaseConfigured()) return null;

  try {
    const db = getDb();
    const [session] = await db
      .select()
      .from(adminSessions)
      .where(
        and(
          eq(adminSessions.email, parsed.email.toLowerCase()),
          eq(adminSessions.sessionTokenHash, hashSessionToken(parsed.token)),
          gt(adminSessions.expiresAt, new Date())
        )
      )
      .limit(1);

    if (!session) return null;

    await db
      .update(adminSessions)
      .set({ lastSeenAt: new Date() })
      .where(eq(adminSessions.id, session.id));

    return session;
  } catch {
    return null;
  }
}

export async function destroyAdminSession(value: string | undefined | null) {
  const parsed = parseSessionValue(value);
  if (!parsed || !isDatabaseConfigured()) return;

  try {
    const db = getDb();
    await db
      .delete(adminSessions)
      .where(
        and(
          eq(adminSessions.email, parsed.email.toLowerCase()),
          eq(adminSessions.sessionTokenHash, hashSessionToken(parsed.token))
        )
      );
  } catch {
    // Ignora falha de persistência para garantir logout do cookie.
  }
}

export async function getCurrentAdminSession() {
  const cookieStore = await cookies();
  return getAdminSession(cookieStore.get(adminConfig.sessionCookieName)?.value);
}

export async function requireAdminSession() {
  const session = await getCurrentAdminSession();
  if (!session) redirect(adminConfig.loginPath);
  return session;
}
