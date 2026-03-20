import { promises as fs } from "node:fs";
import path from "node:path";
import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { getSupabaseEnv } from "@/lib/env";

export type AuthRole = "customer" | "admin";

type StoredUser = {
  id: string;
  email: string;
  displayName: string;
  role: AuthRole;
  passwordHash: string;
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string | null;
  disabled: boolean;
  source: "local" | "legacy-env";
};

type UserStore = {
  version: 1;
  users: StoredUser[];
};

export type AuthUser = Pick<StoredUser, "id" | "email" | "displayName" | "role" | "createdAt" | "lastLoginAt">;

type AuthStoreRuntime = typeof globalThis & {
  __mdhAuthStoreFsUnavailable?: boolean;
  __mdhAuthStoreMemory?: UserStore;
};

const STORE_DIR =
  (process.env.AUTH_STORE_DIR || "").trim() ||
  (process.env.VERCEL ? path.join("/tmp", "mdh-auth-store") : path.join(process.cwd(), "secret"));
const STORE_FILE = path.join(STORE_DIR, "auth-users.json");
const DEFAULT_STORE: UserStore = { version: 1, users: [] };

let writeQueue = Promise.resolve();

function getRuntimeScope() {
  return globalThis as AuthStoreRuntime;
}

function cloneStore(store: UserStore): UserStore {
  return {
    version: 1,
    users: store.users.map((user) => ({ ...user }))
  };
}

function getMemoryStore() {
  const scope = getRuntimeScope();
  if (!scope.__mdhAuthStoreMemory) {
    scope.__mdhAuthStoreMemory = cloneStore(DEFAULT_STORE);
  }
  return scope.__mdhAuthStoreMemory;
}

function markFsUnavailable() {
  const scope = getRuntimeScope();
  scope.__mdhAuthStoreFsUnavailable = true;
}

function isFsUnavailable() {
  return Boolean(getRuntimeScope().__mdhAuthStoreFsUnavailable);
}

function getSupabaseAdmin() {
  const { url, serviceRole } = getSupabaseEnv();
  if (!url || !serviceRole) return null;
  return createClient(url, serviceRole, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

function getSupabasePublic() {
  const { url, anon } = getSupabaseEnv();
  if (!url || !anon) return null;
  return createClient(url, anon, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

function getPositiveNumber(value: string | undefined, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : fallback;
}

function getRoleLimit(role: AuthRole) {
  return role === "customer"
    ? getPositiveNumber(process.env.AUTH_MAX_CUSTOMERS, 100)
    : getPositiveNumber(process.env.AUTH_MAX_ADMINS, 5);
}

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

function normalizeDisplayName(value: string) {
  return value.trim().replace(/\s+/g, " ").slice(0, 80);
}

function sanitizeStore(raw: unknown): UserStore {
  if (!raw || typeof raw !== "object") return DEFAULT_STORE;
  const users = Array.isArray((raw as UserStore).users) ? (raw as UserStore).users : [];
  return { version: 1, users: users.filter(Boolean) };
}

async function ensureStoreFile() {
  if (isFsUnavailable()) return;

  try {
    await fs.mkdir(STORE_DIR, { recursive: true });

    try {
      await fs.access(STORE_FILE);
    } catch {
      await fs.writeFile(STORE_FILE, JSON.stringify(DEFAULT_STORE, null, 2), "utf8");
    }
  } catch {
    markFsUnavailable();
    getMemoryStore();
  }
}

async function readStore() {
  await ensureStoreFile();
  if (isFsUnavailable()) {
    return cloneStore(getMemoryStore());
  }

  try {
    const raw = await fs.readFile(STORE_FILE, "utf8");
    return sanitizeStore(JSON.parse(raw));
  } catch {
    markFsUnavailable();
    return cloneStore(getMemoryStore());
  }
}

async function writeStore(store: UserStore) {
  await ensureStoreFile();
  if (isFsUnavailable()) {
    const scope = getRuntimeScope();
    scope.__mdhAuthStoreMemory = cloneStore(store);
    return;
  }

  try {
    await fs.writeFile(STORE_FILE, JSON.stringify(store, null, 2), "utf8");
  } catch {
    markFsUnavailable();
    const scope = getRuntimeScope();
    scope.__mdhAuthStoreMemory = cloneStore(store);
  }
}

async function withStoreLock<T>(task: () => Promise<T>) {
  const next = writeQueue.then(task, task);
  writeQueue = next.then(
    () => undefined,
    () => undefined
  );
  return next;
}

function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `scrypt:${salt}:${hash}`;
}

function verifyPassword(password: string, passwordHash: string) {
  const [algorithm, salt, storedHash] = passwordHash.split(":");
  if (!salt || !storedHash) return false;
  if (algorithm !== "scrypt" && algorithm !== "s2") return false;

  const candidate = scryptSync(password, salt, 64);
  const stored = Buffer.from(storedHash, "hex");

  if (candidate.length !== stored.length) return false;
  return timingSafeEqual(candidate, stored);
}

function toAuthUser(user: StoredUser): AuthUser {
  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    role: user.role,
    createdAt: user.createdAt,
    lastLoginAt: user.lastLoginAt
  };
}

function toRemoteAuthUser(user: { id: string; email?: string | null; user_metadata?: Record<string, unknown>; created_at?: string | null }): AuthUser {
  const displayName =
    typeof user.user_metadata?.display_name === "string"
      ? user.user_metadata.display_name
      : typeof user.user_metadata?.full_name === "string"
        ? user.user_metadata.full_name
        : (user.email || "cliente").split("@")[0];

  return {
    id: user.id,
    email: user.email || "",
    displayName,
    role: "customer",
    createdAt: user.created_at || new Date().toISOString(),
    lastLoginAt: new Date().toISOString()
  };
}

async function listRemoteUsers() {
  const supabaseAdmin = getSupabaseAdmin();
  if (!supabaseAdmin) return [];

  const limit = Math.max(getRoleLimit("customer") + getRoleLimit("admin") + 20, 200);
  const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: limit });

  if (error) {
    throw new Error(error.message || "Não foi possível consultar os usuários.");
  }

  return data.users || [];
}

export async function getAuthOverview() {
  let activeCustomers = 0;
  let activeAdmins = 0;

  try {
    const store = await readStore();
    activeCustomers = store.users.filter((user) => user.role === "customer" && !user.disabled).length;
    activeAdmins = store.users.filter((user) => user.role === "admin" && !user.disabled).length;
  } catch {
    activeCustomers = 0;
    activeAdmins = 0;
  }

  return {
    activeCustomers,
    activeAdmins,
    customerLimit: getRoleLimit("customer"),
    adminLimit: getRoleLimit("admin"),
    bootstrapEmail: normalizeEmail(process.env.ADMIN_EMAIL || "") || null,
    canBootstrapAdmin: Boolean((process.env.ADMIN_EMAIL || "").trim() && ((process.env.ADMIN_PASSWORD || "").trim() || (process.env.ADMIN_PASSWORD_HASH || "").trim()))
  };
}

export async function ensureLegacyAdminUser() {
  const adminEmail = normalizeEmail(process.env.ADMIN_EMAIL || "");
  const adminPassword = process.env.ADMIN_PASSWORD || "";
  const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH || "";

  if (!adminEmail || (!adminPassword && !adminPasswordHash)) return null;

  return withStoreLock(async () => {
    const store = await readStore();
    const activeAdmins = store.users.filter((user) => user.role === "admin" && !user.disabled);

    if (activeAdmins.length > 0) {
      return activeAdmins.find((user) => user.email === adminEmail) || null;
    }

    const now = new Date().toISOString();
    const adminUser: StoredUser = {
      id: `admin-${randomBytes(8).toString("hex")}`,
      email: adminEmail,
      displayName: "Administrador MDH",
      role: "admin",
      passwordHash: adminPasswordHash || hashPassword(adminPassword),
      createdAt: now,
      updatedAt: now,
      lastLoginAt: null,
      disabled: false,
      source: "legacy-env"
    };

    store.users.unshift(adminUser);
    await writeStore(store);
    return adminUser;
  });
}

export async function createCustomerAccount(input: {
  email: string;
  displayName: string;
  password: string;
}) {
  const supabaseAdmin = getSupabaseAdmin();

  if (supabaseAdmin) {
    const remoteUsers = await listRemoteUsers();
    const remoteCustomers = remoteUsers.filter((user) => {
      const providers = Array.isArray(user.app_metadata?.providers) ? user.app_metadata.providers : [];
      const source = typeof user.user_metadata?.source === "string" ? user.user_metadata.source : "";
      return source === "local-site" || providers.includes("email");
    });

    if (remoteCustomers.length >= getRoleLimit("customer")) {
      throw new Error("O limite inicial de 100 contas foi atingido.");
    }

    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: normalizeEmail(input.email),
      password: input.password,
      email_confirm: true,
      user_metadata: {
        display_name: normalizeDisplayName(input.displayName),
        source: "local-site"
      }
    });

    if (error || !data.user) {
      throw new Error(error?.message || "Não foi possível criar a conta.");
    }

    return toRemoteAuthUser(data.user);
  }

  return createUser({ ...input, role: "customer" });
}

export async function authenticateCustomerUser(input: {
  email: string;
  password: string;
}) {
  const supabasePublic = getSupabasePublic();

  if (supabasePublic) {
    const { data, error } = await supabasePublic.auth.signInWithPassword({
      email: normalizeEmail(input.email),
      password: input.password
    });

    if (error || !data.user) return null;
    return toRemoteAuthUser(data.user);
  }

  return authenticateUser({ ...input, role: "customer" });
}

export async function createUser(input: {
  email: string;
  displayName: string;
  password: string;
  role: AuthRole;
}) {
  const email = normalizeEmail(input.email);
  const displayName = normalizeDisplayName(input.displayName);

  if (!email) throw new Error("Informe um e-mail válido.");
  if (!displayName) throw new Error("Informe um nome para a conta.");

  return withStoreLock(async () => {
    const store = await readStore();
    const activeUsers = store.users.filter((user) => user.role === input.role && !user.disabled);

    if (activeUsers.length >= getRoleLimit(input.role)) {
      throw new Error(
        input.role === "customer"
          ? "O limite inicial de 100 contas foi atingido."
          : "O limite de acessos administrativos foi atingido."
      );
    }

    const existing = activeUsers.find((user) => user.email === email);
    if (existing) {
      throw new Error("Já existe uma conta cadastrada com este e-mail.");
    }

    const now = new Date().toISOString();
    const user: StoredUser = {
      id: `${input.role}-${randomBytes(8).toString("hex")}`,
      email,
      displayName,
      role: input.role,
      passwordHash: hashPassword(input.password),
      createdAt: now,
      updatedAt: now,
      lastLoginAt: null,
      disabled: false,
      source: "local"
    };

    store.users.unshift(user);
    await writeStore(store);
    return toAuthUser(user);
  });
}

export async function findUserById(id: string, role?: AuthRole) {
  try {
    const store = await readStore();
    const user = store.users.find((entry) => entry.id === id && !entry.disabled && (!role || entry.role === role));
    return user ? toAuthUser(user) : null;
  } catch {
    return null;
  }
}

export async function authenticateUser(input: {
  email: string;
  password: string;
  role: AuthRole;
}) {
  try {
    if (input.role === "admin") {
      await ensureLegacyAdminUser();
    }

    const email = normalizeEmail(input.email);
    const store = await readStore();
    const user = store.users.find((entry) => entry.email === email && entry.role === input.role && !entry.disabled);

    if (!user) return null;
    if (!verifyPassword(input.password, user.passwordHash)) return null;

    const lastLoginAt = new Date().toISOString();

    await withStoreLock(async () => {
      const nextStore = await readStore();
      const nextUser = nextStore.users.find((entry) => entry.id === user.id);
      if (!nextUser) return;
      nextUser.lastLoginAt = lastLoginAt;
      nextUser.updatedAt = lastLoginAt;
      await writeStore(nextStore);
    });

    return toAuthUser({ ...user, lastLoginAt });
  } catch {
    return null;
  }
}
