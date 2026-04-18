import { redirect } from "next/navigation";
import { getServerSessionUser, isAdminSession } from "@/lib/server-session";
import { getAdminCatalogSnapshot } from "@/lib/server/admin-catalog-store";
import { AdminProductEditForm } from "@/components/admin/admin-product-edit-form";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export default async function AdminProductEditPage({ params }: Props) {
  const user = await getServerSessionUser();
  if (!isAdminSession(user)) redirect("/admin/login");

  const { id } = await params;
  const products = await getAdminCatalogSnapshot();
  const product = products.find((p) => p.id === id);

  if (!product) {
    return (
      <section>
        <p className="section-kicker">Catálogo</p>
        <h2 className="section-title">Produto não encontrado</h2>
        <p className="mt-4 text-white/60">ID: {id}</p>
      </section>
    );
  }

  return (
    <section>
      <div className="mb-6">
        <p className="section-kicker">Catálogo</p>
        <h2 className="section-title">Editar produto</h2>
        <p className="section-copy">{product.title}</p>
      </div>
      <AdminProductEditForm product={product} />
    </section>
  );
}
