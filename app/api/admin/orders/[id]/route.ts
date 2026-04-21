import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendMail } from '@/lib/mailer';
import { orderShippedHtml } from '@/lib/email-templates';
import { recordAdminAction } from '@/lib/admin-audit';
import { getServerSessionUser, isAdminSession } from '@/lib/server-session';

export async function GET(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const user = await getServerSessionUser();
  if (!isAdminSession(user)) {
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
  const user = await getServerSessionUser();
  if (!isAdminSession(user)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await context.params;
  const before = await prisma.order.findUnique({
    where: { id },
    select: { status: true, notes: true, orderNumber: true },
  });
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

  await recordAdminAction({
    actorId: user.id || null,
    actorEmail: user.email || null,
    action: "admin.order.update",
    entityType: "Order",
    entityId: id,
    summary: `Atualizou pedido ${updated.orderNumber}`,
    metadata: {
      previousStatus: before?.status || null,
      nextStatus: updated.status,
      notesChanged: before?.notes !== updated.notes,
    },
    requestId: req.headers.get("x-request-id"),
    ipAddress: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip"),
    userAgent: req.headers.get("user-agent"),
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
