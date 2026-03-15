import "server-only";

import { cookies } from "next/headers";
import { and, desc, eq, gt } from "drizzle-orm";
import { randomBytes, scryptSync, timingSafeEqual, createHash, createHmac } from "node:crypto";
import { getDb, isDatabaseConfigured } from "@/db/client";
import { customerAccounts, customerSessions, customers } from "@/db/schema";
import { adminConfig, customerAuthConfig } from "@/lib/constants";
import { databaseUnavailableMessage } from "@/lib/database-status";

const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30;

type ParsedCustomerSession = {
  email: string;
  expiresAt: number;
  token: string;
};

export type CustomerViewer = {
  session: typeof customerSessions.$inferSelect;
  account: typeof customerAccounts.$inferSelect;
  customer: typeof customers.$inferSelect | null;
};

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function getSessionSecret() {
  const secret = process.env.CUSTOMER_SESSION_SECRET || process.env.ADMIN_SESSION_SECRET;

  if (!secret) {
    throw new Error("CUSTOMER_SESSION_SECRET não configurado.");
  }

  if (process.env.CUSTOMER_SESSION_SECRET) {
    return process.env.CUSTOMER_SESSION_SECRET;
  }

  return createHash("sha256").update(`mdh-customer:${secret}`).digest("hex");
}

function hashPasswordValue(password: string, salt: string) {
  return scryptSync(password, salt, 64).toString("hex");
}

export function makeCustomerPasswordHash(password: string) {
  const salt = randomBytes(16).toString("hex");
  return `s2:${salt}:${hashPasswordValue(password, salt)}`;
}

function verifyPasswordHash(password: string, hash: string) {
  const [scheme, salt, digest] = hash.split(":");
  if (scheme !== "s2" || !salt || !digest) return false;

  const expected = Buffer.from(digest, "hex");
  const actual = Buffer.from(hashPasswordValue(password, salt), "hex");

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

function parseSessionValue(value: string | undefined | null): ParsedCustomerSession | null {
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

export function sanitizeCustomerRedirectPath(value: string | undefined | null) {
  const fallback = customerAuthConfig.accountPath;
  const normalized = String(value || "").trim();

  if (!normalized || !normalized.startsWith("/") || normalized.startsWith("//")) {
    return fallback;
  }

  if (normalized.startsWith(adminConfig.panelPath)) {
    return fallback;
  }

  return normalized;
}

export async function registerCustomerAccount(input: { fullName: string; email: string; password: string }) {
  const db = requireSessionStore();
  const normalizedEmail = normalizeEmail(input.email);

  const [existingAccount] = await db
    .select()
    .from(customerAccounts)
    .where(eq(customerAccounts.email, normalizedEmail))
    .limit(1);

  if (existingAccount) {
    throw new Error("Já existe uma conta com esse e-mail. Faça login para continuar.");
  }

  const [existingCustomer] = await db
    .select({ id: customers.id })
    .from(customers)
    .where(eq(customers.email, normalizedEmail))
    .orderBy(desc(customers.updatedAt))
    .limit(1);

  const [account] = await db
    .insert(customerAccounts)
    .values({
      customerId: existingCustomer?.id || null,
      fullName: input.fullName.trim(),
      email: normalizedEmail,
      passwordHash: makeCustomerPasswordHash(input.password)
    })
    .returning();

  return account;
}

export async function verifyCustomerCredentials(email: string, password: string) {
  if (!isDatabaseConfigured()) {
    throw new Error(databaseUnavailableMessage);
  }

  const db = getDb();
  const normalizedEmail = normalizeEmail(email);
  const [account] = await db
    .select()
    .from(customerAccounts)
    .where(eq(customerAccounts.email, normalizedEmail))
    .limit(1);

  if (!account) return null;
  if (!verifyPasswordHash(password, account.passwordHash)) return null;

  return account;
}

export async function createCustomerSession(input: {
  accountId: string;
  email: string;
  ipAddress?: string | null;
  userAgent?: string | null;
}) {
  const token = randomBytes(24).toString("base64url");
  const expiresAt = Date.now() + SESSION_TTL_MS;
  const value = buildSessionValue(normalizeEmail(input.email), expiresAt, token);
  const db = requireSessionStore();

  await db.insert(customerSessions).values({
    accountId: input.accountId,
    sessionTokenHash: hashSessionToken(token),
    ipAddress: input.ipAddress || null,
    userAgent: input.userAgent || null,
    expiresAt: new Date(expiresAt)
  });

  await db
    .update(customerAccounts)
    .set({ lastLoginAt: new Date(), updatedAt: new Date() })
    .where(eq(customerAccounts.id, input.accountId));

  return {
    value,
    expiresAt
  };
}

export async function getCustomerSession(value: string | undefined | null): Promise<CustomerViewer | null> {
  const parsed = parseSessionValue(value);
  if (!parsed || !isDatabaseConfigured()) return null;

  try {
    const db = getDb();
    const [session] = await db
      .select()
      .from(customerSessions)
      .where(
        and(
          eq(customerSessions.sessionTokenHash, hashSessionToken(parsed.token)),
          gt(customerSessions.expiresAt, new Date())
        )
      )
      .limit(1);

    if (!session) return null;

    const [account] = await db
      .select()
      .from(customerAccounts)
      .where(eq(customerAccounts.id, session.accountId))
      .limit(1);

    if (!account) return null;
    if (normalizeEmail(account.email) !== parsed.email) return null;

    const customer = account.customerId
      ? (
          await db
            .select()
            .from(customers)
            .where(eq(customers.id, account.customerId))
            .limit(1)
        )[0] || null
      : null;

    await db
      .update(customerSessions)
      .set({ lastSeenAt: new Date() })
      .where(eq(customerSessions.id, session.id));

    return { session, account, customer };
  } catch {
    return null;
  }
}

export async function destroyCustomerSession(value: string | undefined | null) {
  const parsed = parseSessionValue(value);
  if (!parsed || !isDatabaseConfigured()) return;

  try {
    const db = getDb();
    await db
      .delete(customerSessions)
      .where(eq(customerSessions.sessionTokenHash, hashSessionToken(parsed.token)));
  } catch {
    // O cookie ainda sera limpo mesmo se a persistencia falhar.
  }
}

export async function getCurrentCustomerSession() {
  const cookieStore = await cookies();
  return getCustomerSession(cookieStore.get(customerAuthConfig.sessionCookieName)?.value);
}

export async function linkCustomerAccountToCustomer(input: {
  accountId: string;
  customerId: string;
  fullName: string;
  email?: string | null;
}) {
  const db = requireSessionStore();
  const [account] = await db
    .select()
    .from(customerAccounts)
    .where(eq(customerAccounts.id, input.accountId))
    .limit(1);

  if (!account) return;

  await db
    .update(customerAccounts)
    .set({
      customerId: input.customerId,
      fullName: input.fullName.trim() || account.fullName,
      email: input.email?.trim() ? normalizeEmail(input.email) : account.email,
      updatedAt: new Date()
    })
    .where(eq(customerAccounts.id, input.accountId));
}

export function getCustomerSessionTtlMs() {
  return SESSION_TTL_MS;
}
