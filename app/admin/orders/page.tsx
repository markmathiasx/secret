import { redirect } from "next/navigation";
import { getServerSessionUser, isAdminSession } from "@/lib/server-session";
import { AdminOrdersList } from "@/components/admin/admin-orders-list";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const user = await getServerSessionUser();

  if (!isAdminSession(user)) {
    redirect("/admin/login");
  }

  return (
    <section className="mx-auto max-w-[1200px] px-6 py-14">
      <AdminOrdersList />
    </section>
  );
}
