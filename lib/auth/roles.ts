import type { ServerSessionUser } from "@/lib/server-session";

export const AUTH_ROLES = ["BUYER", "SELLER", "ADMIN"] as const;
export type AuthRole = (typeof AUTH_ROLES)[number];

export function normalizeAuthRole(role: string | null | undefined): AuthRole {
  const normalized = (role || "").toUpperCase();
  if (normalized === "ADMIN") return "ADMIN";
  if (normalized === "SELLER") return "SELLER";
  return "BUYER";
}

export function sessionRoleToAuthRole(user: Pick<ServerSessionUser, "role"> | null | undefined): AuthRole {
  if (user?.role === "admin") return "ADMIN";
  if (user?.role === "seller") return "SELLER";
  return "BUYER";
}
