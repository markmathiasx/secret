import { redirect } from "next/navigation";
import { AdminReturnsList } from "@/components/admin/admin-returns-list";
import { getServerSessionUser, isAdminSession } from "@/lib/server-session";

export const dynamic = "force-dynamic";

export default async function AdminReturnsPage() {
  const user = await getServerSessionUser();
  if (!isAdminSession(user)) redirect("/admin/login");
  return <section className="mx-auto max-w-[1200px] px-6 py-14"><AdminReturnsList /></section>;
}
