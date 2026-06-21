import { apiForbidden, apiUnauthorized } from "@/lib/api-response";
import { getServerSessionUser, isAdminSession } from "@/lib/server-session";

function tokenMatches(request: Request, expected: string) {
  const url = new URL(request.url);
  const queryToken = url.searchParams.get("token");
  const headerToken = request.headers.get("x-admin-secret") || request.headers.get("x-cron-secret");
  const authHeader = request.headers.get("authorization");
  return queryToken === expected || headerToken === expected || authHeader === `Bearer ${expected}`;
}

export async function requireAdminOrSecret(request: Request) {
  const user = await getServerSessionUser();
  if (isAdminSession(user)) return null;

  const expected = (process.env.ADMIN_SECRET || process.env.CRON_SECRET || "").trim();
  if (!expected) return apiUnauthorized();
  if (!tokenMatches(request, expected)) return apiForbidden();
  return null;
}
