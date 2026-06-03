import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSessionUser, isAdminSession } from '@/lib/server-session';

function optionalText(value: unknown, maxLength = 500) {
  if (value === null || value === undefined) return null;
  return String(value).trim().slice(0, maxLength) || null;
}

export async function POST(req: NextRequest) {
  const user = await getServerSessionUser();
  if (!isAdminSession(user)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const orderId = optionalText((body as { orderId?: unknown }).orderId, 120);
  if (!orderId) {
    return NextResponse.json({ error: "orderId required" }, { status: 400 });
  }

  const invoiceType = optionalText((body as { invoiceType?: unknown }).invoiceType, 20) || "NFe";
  const invoiceNumber = optionalText((body as { invoiceNumber?: unknown }).invoiceNumber, 80);
  const invoiceSeries = optionalText((body as { invoiceSeries?: unknown }).invoiceSeries, 30);
  const invoiceKey = optionalText((body as { invoiceKey?: unknown }).invoiceKey, 80);
  const invoiceUrl = optionalText((body as { invoiceUrl?: unknown }).invoiceUrl, 500);
  const invoiceXmlUrl = optionalText((body as { invoiceXmlUrl?: unknown }).invoiceXmlUrl, 500);
  const issuerNotes = optionalText((body as { issuerNotes?: unknown }).issuerNotes, 1000);

  if (!invoiceNumber || !invoiceSeries) {
    return NextResponse.json({ error: "invoiceNumber and invoiceSeries required" }, { status: 400 });
  }

  const invoice = await prisma.invoice.upsert({
    where: { orderId },
    create: {
      orderId,
      invoiceType,
      invoiceNumber,
      invoiceSeries,
      invoiceKey,
      invoiceUrl,
      invoiceXmlUrl,
      issuerNotes,
      issuedAt: new Date(),
    },
    update: {
      invoiceType,
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
