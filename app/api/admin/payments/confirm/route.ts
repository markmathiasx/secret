import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { logStructured } from '@/lib/logger';

const ALLOWED_PAYMENT_STATUSES = ['PENDING', 'PAID', 'FAILED', 'CANCELLED', 'REFUNDED'] as const;
type PaymentStatus = typeof ALLOWED_PAYMENT_STATUSES[number];

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  if (!body || typeof body.orderId !== 'string' || typeof body.status !== 'string') {
    return NextResponse.json({ error: 'orderId e status são obrigatórios.' }, { status: 400 });
  }

  const { orderId, status } = body;

  if (!ALLOWED_PAYMENT_STATUSES.includes(status as PaymentStatus)) {
    return NextResponse.json({ error: `Status inválido. Permitidos: ${ALLOWED_PAYMENT_STATUSES.join(', ')}` }, { status: 400 });
  }

  const payment = await prisma.payment.findFirst({
    where: { orderId },
  });

  if (!payment) {
    return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
  }

  logStructured('info', 'payment_status_changed', {
    adminId: session.user.id,
    adminEmail: session.user.email,
    orderId,
    oldStatus: payment.status,
    newStatus: status,
  });

  const updated = await prisma.payment.update({
    where: { id: payment.id },
    data: {
      status,
      paidAt: status === 'PAID' ? new Date() : null,
    },
  });

  if (status === 'PAID') {
    await prisma.order.update({
      where: { id: orderId },
      data: { status: 'PAID', paidAt: new Date() },
    });
  }

  return NextResponse.json(updated);
}
