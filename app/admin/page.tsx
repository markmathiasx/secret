import { redirect } from "next/navigation";
import { CommerceOsDashboard } from "@/components/admin/commerce-os-dashboard";
import { getServerSessionUser, isAdminSession } from "@/lib/server-session";
import { getCommerceOsDashboard } from "@/src/lib/commerce-os/service";

export const dynamic = "force-dynamic";

export default async function AdminHome() {
  const user = await getServerSessionUser();

  if (!isAdminSession(user)) {
    redirect("/admin/login");
  }

  const snapshot = await getCommerceOsDashboard();

  return (
    <section className="mx-auto max-w-[1500px] px-6 py-14">
      <CommerceOsDashboard snapshot={snapshot} />
    </section>
  );
}
