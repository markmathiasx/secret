import { redirect } from 'next/navigation';
import { getServerSessionUser, isAdminSession } from '@/lib/server-session';
import { prisma } from '@/lib/prisma';
import AdminOrderDetail from '@/components/admin/admin-order-detail';

export const dynamic = 'force-dynamic';

export default async function AdminOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getServerSessionUser();
  if (!isAdminSession(user)) {
    redirect('/admin/login');
  }

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: { include: { product: true } },
      payments: true,
      invoice: true,
      shipment: true,
      shippingAddress: true,
    },
  });

  if (!order) {
    return <div className="text-center py-20">Pedido não encontrado</div>;
  }

  const serializedOrder = JSON.parse(JSON.stringify(order));

  return (
    <section className="mx-auto max-w-6xl px-6 py-14">
      <AdminOrderDetail order={serializedOrder} />
    </section>
  );
}
