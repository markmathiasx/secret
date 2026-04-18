import { redirect } from "next/navigation";
import { getServerSessionUser, isAdminSession } from "@/lib/server-session";
import { getAdminCatalogSnapshot } from "@/lib/server/admin-catalog-store";
import { AdminProductsTable } from "@/components/admin/admin-products-table";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const user = await getServerSessionUser();
  if (!isAdminSession(user)) redirect("/admin/login");

  const products = await getAdminCatalogSnapshot();

  return (
    <section>
      <div className="mb-6">
        <p className="section-kicker">Catálogo</p>
        <h2 className="section-title">Produtos</h2>
        <p className="section-copy">Gerencie o catálogo — preços, estoque e status de produção.</p>
      </div>
      <AdminProductsTable products={products} />
    </section>
  );
}
