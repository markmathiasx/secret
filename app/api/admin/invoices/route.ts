import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSessionUser, isAdminSession } from '@/lib/server-session';

export async function POST(req: NextRequest) {
  const user = await getServerSessionUser();
  if (!isAdminSession(user)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { orderId, invoiceType, invoiceNumber, invoiceSeries, invoiceKey, invoiceUrl, invoiceXmlUrl, issuerNotes } = await req.json();

  const invoice = await prisma.invoice.upsert({
    where: { orderId },
    create: {
      orderId,
      invoiceType: invoiceType || 'NFe',
      invoiceNumber,
      invoiceSeries,
      invoiceKey,
      invoiceUrl,
      invoiceXmlUrl,
      issuerNotes,
      issuedAt: new Date(),
    },
    update: {
      invoiceType: invoiceType || 'NFe',
      invoiceNumber,
      invoiceSeries,
      invoiceKey,
      invoiceUrl,
      invoiceXmlUrl,
      issuerNotes,
      issuedAt: new Date(),
    },
  });

  return NextResponse.json(invoice);
}

export async function GET(req: NextRequest) {
  const user = await getServerSessionUser();
  if (!isAdminSession(user)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const orderId = searchParams.get('orderId');

  if (!orderId) {
    return NextResponse.json({ error: 'orderId required' }, { status: 400 });
  }

  const invoice = await prisma.invoice.findUnique({
    where: { orderId },
  });

  return NextResponse.json(invoice || {});
}
