import type { ServerSessionUser } from "@/lib/server-session";
import { sessionRoleToAuthRole, type AuthRole } from "@/lib/auth/roles";

const roleRank: Record<AuthRole, number> = {
  BUYER: 1,
  SELLER: 2,
  ADMIN: 3,
};

export function hasRole(user: ServerSessionUser | null | undefined, minimumRole: AuthRole) {
  if (!user) return false;
  return roleRank[sessionRoleToAuthRole(user)] >= roleRank[minimumRole];
}

export function canAccessAdmin(user: ServerSessionUser | null | undefined) {
  return hasRole(user, "ADMIN");
}

export function canAccessSeller(user: ServerSessionUser | null | undefined) {
  return hasRole(user, "SELLER");
}

export function canAccessBuyerArea(user: ServerSessionUser | null | undefined) {
  return hasRole(user, "BUYER");
}
