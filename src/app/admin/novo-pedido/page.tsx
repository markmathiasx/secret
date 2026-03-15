import { AdminManualOrderForm } from "@/components/admin-manual-order-form";
import { AdminShell } from "@/components/admin-shell";
import { requireAdminSession } from "@/lib/admin-auth";
import { listStorefrontProducts } from "@/lib/catalog-server";

export default async function AdminNewOrderPage() {
  const session = await requireAdminSession();
  const products = await listStorefrontProducts();

  return (
    <AdminShell
      email={session.email}
      title="Pedido manual"
      description="Cadastre pedidos vindos de WhatsApp, Instagram, marketplace ou atendimento direto."
    >
      <div className="rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-[0_18px_48px_rgba(2,8,23,0.18)]">
        <AdminManualOrderForm products={products} />
      </div>
    </AdminShell>
  );
}

