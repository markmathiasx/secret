import { redirect } from "next/navigation";
import { AdminDashboard } from "@/components/admin/admin-dashboard";
import { getAdminDashboardSnapshot } from "@/lib/server-store";
import { getAdminCatalogSnapshot } from "@/lib/server/admin-catalog-store";
import { getServerSessionUser, isAdminSession } from "@/lib/server-session";

export const dynamic = "force-dynamic";

export default async function AdminHome() {
  const user = await getServerSessionUser();

  if (!isAdminSession(user)) {
    redirect("/admin/login");
  }

  const [snapshot, catalogSnapshot] = await Promise.all([
    getAdminDashboardSnapshot(),
    getAdminCatalogSnapshot(),
  ]);

  return (
    <section className="mx-auto max-w-[1500px] px-6 py-14">
      <AdminDashboard initialProducts={catalogSnapshot} commerceSnapshot={{ metrics: snapshot.metrics }} />
    </section>
  );
}
