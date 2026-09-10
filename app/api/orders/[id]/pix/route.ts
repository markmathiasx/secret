import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { makePixPayload } from '@/lib/pix';
import QRCode from 'qrcode';
import { canAccessOrder } from '@/lib/server/order-authorization';
import { getPixKey } from '@/lib/env';

export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const orderId = id;

  try {
    // Get order
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (!(await canAccessOrder(order))) {
      return NextResponse.json({ error: 'Sem acesso ao pedido.' }, { status: 403 });
    }
    if (order.status !== 'PENDING_PAYMENT') {
      return NextResponse.json({ error: 'Pedido indisponível para pagamento.' }, { status: 409 });
    }
    if (!getPixKey()) {
      return NextResponse.json({ error: 'Pix indisponível. Consulte o atendimento.' }, { status: 503 });
    }
    const onlinePayment = await prisma.payment.findFirst({ where: { orderId, provider: { not: 'MANUAL' } } });
    if (onlinePayment) {
      return NextResponse.json({ error: 'Consulte o pagamento existente antes de gerar outro Pix.' }, { status: 409 });
    }

    // Generate PIX payload
    const pixPayload = makePixPayload({
      amount: Number(order.grandTotal),
      description: `Pedido ${order.orderNumber}`,
    });

    // Generate QR code as data URL
    const qrCodeDataUrl = await QRCode.toDataURL(pixPayload, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      quality: 0.95,
      margin: 1,
      width: 300,
    });

    // Update or create payment with PIX data
    let payment = await prisma.payment.findFirst({
      where: {
        orderId,
        method: 'PIX',
      },
    });

    if (payment) {
      payment = await prisma.payment.update({
        where: { id: payment.id },
        data: {
          pixPayload,
          pixQrCode: qrCodeDataUrl,
        },
      });
    } else {
      payment = await prisma.payment.create({
        data: {
          orderId,
          method: 'PIX',
          provider: 'MANUAL',
          status: 'PENDING',
          amount: order.grandTotal,
          currency: 'BRL',
          pixPayload,
          pixQrCode: qrCodeDataUrl,
        },
      });
    }

    return NextResponse.json({
      success: true,
      payment: {
        id: payment.id,
        pixPayload,
        pixQrCode: qrCodeDataUrl,
      },
    });
  } catch (err: any) {
    console.error('Error generating PIX:', err);
    return NextResponse.json(
      { error: 'Não foi possível gerar o Pix.' },
      { status: 500 }
    );
  }
}
