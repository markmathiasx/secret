import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logStructured } from '@/lib/logger';
import { getServerSessionUser, isAdminSession } from '@/lib/server-session';
import { validateCriticalActionConfirmation } from '@/src/lib/commerce-os/critical-actions';

const ALLOWED_PAYMENT_STATUSES = ['PENDING', 'PAID', 'FAILED', 'CANCELLED', 'REFUNDED'] as const;
type PaymentStatus = typeof ALLOWED_PAYMENT_STATUSES[number];

export async function POST(req: NextRequest) {
  const user = await getServerSessionUser();
  if (!isAdminSession(user)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  if (!body || typeof body.orderId !== 'string' || typeof body.status !== 'string') {
    return NextResponse.json({ error: 'orderId e status são obrigatórios.' }, { status: 400 });
  }

  const { orderId, status } = body;
  const confirmationText = typeof body.confirmationText === 'string' ? body.confirmationText : undefined;

  if (!ALLOWED_PAYMENT_STATUSES.includes(status as PaymentStatus)) {
    return NextResponse.json({ error: `Status inválido. Permitidos: ${ALLOWED_PAYMENT_STATUSES.join(', ')}` }, { status: 400 });
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { id: true, orderNumber: true },
  });

  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }

  const payment = await prisma.payment.findFirst({
    where: { orderId },
  });

  if (!payment) {
    return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
  }

  if (status === 'PAID' || status === 'REFUNDED' || status === 'CANCELLED') {
    const criticalType = status === 'PAID' ? 'confirm_payment' : 'refund_order';
    const confirmation = validateCriticalActionConfirmation({
      type: criticalType,
      subjectId: order.orderNumber,
      confirmationText,
    });
    if (!confirmation.ok) {
      return NextResponse.json(
        {
          error: 'Critical confirmation required.',
          expectedPhrase: confirmation.expectedPhrase,
          expectedDigest: confirmation.expectedDigest,
        },
        { status: 409 }
      );
    }
  }

  logStructured('info', 'payment_status_changed', {
    adminId: user.id,
    adminEmail: user.email,
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
