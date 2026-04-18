import { redirect } from "next/navigation";
import { getServerSessionUser, isAdminSession } from "@/lib/server-session";
import { getAdminCatalogSnapshot } from "@/lib/server/admin-catalog-store";
import { AdminInventoryTable } from "@/components/admin/admin-inventory-table";

export const dynamic = "force-dynamic";

export default async function AdminInventoryPage() {
  const user = await getServerSessionUser();
  if (!isAdminSession(user)) redirect("/admin/login");

  const products = await getAdminCatalogSnapshot();

  return (
    <section>
      <div className="mb-6">
        <p className="section-kicker">Operação</p>
        <h2 className="section-title">Estoque</h2>
        <p className="section-copy">Atualize o estoque e defina níveis de reposição para cada produto.</p>
      </div>
      <AdminInventoryTable products={products} />
    </section>
  );
}
