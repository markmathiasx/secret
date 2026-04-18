import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { orderId, status } = await req.json();

  const payment = await prisma.payment.findFirst({
    where: { orderId },
  });

  if (!payment) {
    return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
  }

  const updated = await prisma.payment.update({
    where: { id: payment.id },
    data: {
      status,
      paidAt: status === 'PAID' ? new Date() : null,
    },
  });

  // Update order status if payment is confirmed
  if (status === 'PAID') {
    await prisma.order.update({
      where: { id: orderId },
      data: { status: 'PAID', paidAt: new Date() },
    });
  }

  return NextResponse.json(updated);
}
