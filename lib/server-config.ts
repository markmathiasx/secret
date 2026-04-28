import "server-only";
export { adminConfig } from "@/lib/admin-config";

export function getStaffNotifyEmail() {
  return process.env.STAFF_NOTIFY_EMAIL || process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "mdhatendimento@gmail.com";
}
