import { cookies } from "next/headers";
import { auth } from "@/auth";
import { adminConfig } from "@/lib/constants";
import {
  customerSessionCookieName,
  getCustomerSessionSecret,
  isSessionSecretConfigured,
  verifySignedSessionToken,
} from "@/lib/session-token";

export type ServerSessionSource = "authjs" | "customer-cookie" | "admin-cookie";
export type ServerSessionRole = "customer" | "seller" | "admin";

export type ServerSessionUser = {
  id: string;
  email: string;
  displayName: string;
  role: ServerSessionRole;
  twoFactorEnabled: boolean;
  supportsTwoFactor: boolean;
  source: ServerSessionSource;
};

type ServerSession = {
  user: ServerSessionUser;
};

function normalizeRole(role: string | null | undefined): ServerSessionRole {
  if (role === "admin") return "admin";
  if (role === "seller") return "seller";
  return "customer";
}

function createDisplayName(email: string, displayName: string | null | undefined) {
  return displayName?.trim() || email.split("@")[0] || "cliente";
}

async function getAuthJsSession(): Promise<ServerSession | null> {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return null;
    }

    return {
      user: {
        id: String(session.user.id || session.user.email),
        email: session.user.email,
        displayName: createDisplayName(session.user.email, session.user.name),
        role: normalizeRole(session.user.role),
        twoFactorEnabled: Boolean(session.user.twoFactorEnabled),
        supportsTwoFactor: true,
        source: "authjs",
      },
    };
  } catch {
    return null;
  }
}

async function getCookieSession(
  cookieName: string,
  secret: string | null,
  source: ServerSessionSource,
  roleOverride?: ServerSessionRole
): Promise<ServerSession | null> {
  if (!isSessionSecretConfigured(secret)) {
    return null;
  }

  const cookieStore = await cookies();
  const token = cookieStore.get(cookieName)?.value;

  if (!token) {
    return null;
  }

  const payload = await verifySignedSessionToken(token, secret!);
  if (!payload?.email || !payload.sub) {
    return null;
  }

  return {
    user: {
      id: payload.sub,
      email: payload.email,
      displayName: createDisplayName(payload.email, payload.displayName),
      role: roleOverride || normalizeRole(payload.role),
      twoFactorEnabled: false,
      supportsTwoFactor: false,
      source,
    },
  };
}

export async function getServerSession() {
  const authJsSession = await getAuthJsSession();
  if (authJsSession) {
    return authJsSession;
  }

  const adminSession = await getCookieSession(
    adminConfig.sessionCookieName,
    adminConfig.sessionSecret,
    "admin-cookie",
    "admin"
  );
  if (adminSession) {
    return adminSession;
  }

  return getCookieSession(
    customerSessionCookieName,
    getCustomerSessionSecret(),
    "customer-cookie"
  );
}

export async function getServerSessionUser() {
  const session = await getServerSession();
  return session?.user || null;
}

export function isAdminSession(user: ServerSessionUser | null | undefined) {
  return user?.role === "admin";
}

export function canAccessSellerArea(user: ServerSessionUser | null | undefined) {
  return user?.role === "seller" || user?.role === "admin";
}
