import { NextResponse } from 'next/server';
import { z } from 'zod';
import { findProduct } from '@/lib/catalog';
import { storeRecord } from '@/lib/storage';
import { getClientIp, checkRateLimit } from '@/lib/security';

const orderSchema = z.object({
  productId: z.string().min(1),
  quantity: z.coerce.number().int().min(1).max(20),
  customerName: z.string().min(2).max(80),
  email: z.string().email(),
  phone: z.string().min(10).max(20),
  neighborhood: z.string().min(2).max(80),
  cep: z.string().max(10).optional().default(''),
  notes: z.string().max(400).optional().default(''),
  paymentMethod: z.enum(['pix', 'cartao', 'boleto'])
});

export async function POST(request: Request) {
  const ip = getClientIp(request.headers);
  const rateLimit = checkRateLimit(`order:${ip}`, 8, 60_000);
  if (!rateLimit.ok) {
    return NextResponse.json({ ok: false, message: 'Muitas tentativas. Tente novamente em instantes.' }, { status: 429 });
  }

  const raw = await request.json().catch(() => null);
  const parsed = orderSchema.safeParse(raw);

  if (!parsed.success) {
    return NextResponse.json({ ok: false, message: 'Dados inválidos.', errors: parsed.error.flatten() }, { status: 400 });
  }

  const product = findProduct(parsed.data.productId);
  if (!product) {
    return NextResponse.json({ ok: false, message: 'Produto não encontrado.' }, { status: 404 });
  }

  const orderCode = `MDH-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;
  const totalPix = Number((product.pricePix * parsed.data.quantity).toFixed(2));
  const totalCard = Number((product.priceCard * parsed.data.quantity).toFixed(2));

  const result = await storeRecord('orders', {
    order_code: orderCode,
    product_id: product.id,
    product_name: product.name,
    quantity: parsed.data.quantity,
    customer_name: parsed.data.customerName,
    email: parsed.data.email,
    phone: parsed.data.phone,
    neighborhood: parsed.data.neighborhood,
    cep: parsed.data.cep,
    payment_method: parsed.data.paymentMethod,
    notes: parsed.data.notes,
    total_pix: totalPix,
    total_card: totalCard,
    created_at: new Date().toISOString(),
    status: 'novo pedido'
  });

  if (!result.ok) {
    return NextResponse.json({ ok: false, message: 'Falha ao criar pedido.' }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    orderCode,
    storage: result.storage,
    totalPix,
    totalCard,
    product: {
      id: product.id,
      name: product.name
    }
  });
}
