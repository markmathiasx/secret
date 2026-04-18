import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { sendMail } from '@/lib/mailer';
import { orderShippedHtml } from '@/lib/email-templates';

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await context.params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: { include: { product: true, variant: true } },
      payments: true,
      invoice: true,
      shipment: true,
      shippingAddress: true,
      buyer: { select: { email: true, name: true, phone: true } },
    },
  });

  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }

  return NextResponse.json(order);
}

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await context.params;
  const { status, notes } = await req.json();

  const updated = await prisma.order.update({
    where: { id },
    data: {
      ...(status && { status }),
      ...(notes && { notes }),
      updatedAt: new Date(),
    },
    include: { items: { include: { product: true } }, payments: true, invoice: true },
  });

  if (status === 'SHIPPED' && updated.customerEmail) {
    const firstItem = updated.items[0];
    const productName = firstItem?.product?.title ?? 'Produto';

    try {
      await sendMail({
        to: updated.customerEmail,
        subject: `Pedido ${updated.orderNumber} enviado — MDH 3D`,
        html: orderShippedHtml({
          orderCode: updated.orderNumber,
          customerName: updated.customerName ?? 'cliente',
          productName,
        }),
      });
    } catch {
      console.error('[orders PATCH] falha ao enviar e-mail de envio');
    }
  }

  return NextResponse.json(updated);
}
