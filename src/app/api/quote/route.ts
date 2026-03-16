import { NextResponse } from "next/server";
import { findProduct } from "@/lib/catalog";
import { quoteSchema } from "@/lib/schemas";
import { getClientIp, checkRateLimit } from "@/lib/security";
import { storeRecord } from "@/lib/storage";
import { estimateDeliveryFeeKm } from "@/lib/delivery";

function buildRequestId(prefix = 'MDH') {
  return `${prefix}-${Date.now().toString().slice(-8)}`;
}

export async function POST(request: Request) {
  const ip = getClientIp(request.headers);
  const contentType = request.headers.get('content-type') || '';

  if (contentType.includes('multipart/form-data')) {
    const rateLimit = checkRateLimit(`quote-upload:${ip}`, 3, 60 * 60 * 1000);
    if (!rateLimit.ok) {
      return NextResponse.json({ message: 'Muitas tentativas. Tente novamente em instantes.' }, { status: 429 });
    }

    const form = await request.formData();
    const image = form.get('referenceImage');
    const model = form.get('modelFile');
    const imageSize = image instanceof File ? image.size : 0;
    const modelSize = model instanceof File ? model.size : 0;

    if (image instanceof File && image.size > 10 * 1024 * 1024) {
      return NextResponse.json({ message: 'A imagem de referência excede 10MB.' }, { status: 400 });
    }
    if (model instanceof File && model.size > 50 * 1024 * 1024) {
      return NextResponse.json({ message: 'O arquivo 3D excede 50MB.' }, { status: 400 });
    }

    const quoteId = buildRequestId();
    const payload = {
      quote_id: quoteId,
      request_type: 'image-to-3d',
      customer_name: String(form.get('name') || ''),
      phone: String(form.get('whatsapp') || ''),
      email: String(form.get('email') || ''),
      project_description: String(form.get('description') || ''),
      project_size: String(form.get('size') || ''),
      preferred_material: String(form.get('material') || ''),
      preferred_color: String(form.get('color') || ''),
      desired_deadline: String(form.get('deadline') || ''),
      quantity: Number(form.get('quantity') || '1'),
      reference_image_name: image instanceof File ? image.name : '',
      reference_image_size: imageSize,
      model_file_name: model instanceof File ? model.name : '',
      model_file_size: modelSize,
      created_at: new Date().toISOString(),
      source: 'site',
      storage_mode: 'metadata-only',
    };

    const stored = await storeRecord('quotes', payload as Record<string, unknown>);
    if (!stored.ok) {
      return NextResponse.json({ message: 'Falha ao registrar solicitação.' }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      quoteId,
      storage: stored.storage,
      message: 'Solicitação registrada com sucesso.',
    });
  }

  const rateLimit = checkRateLimit(`quote:${ip}`, 10, 60_000);
  if (!rateLimit.ok) {
    return NextResponse.json({ message: 'Muitas tentativas. Tente novamente em instantes.' }, { status: 429 });
  }
  const raw = await request.json();
  const parsed = quoteSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ message: 'Dados inválidos.', errors: parsed.error.flatten() }, { status: 400 });
  }
  const product = findProduct(parsed.data.productId);
  if (!product) {
    return NextResponse.json({ message: 'Produto não encontrado.' }, { status: 404 });
  }
  const quoteId = `Q-${Date.now()}`;
  const deliveryFee = parsed.data.distanceKm ? estimateDeliveryFeeKm(parsed.data.distanceKm) : 0;
  const result = await storeRecord('quotes', {
    quote_id: quoteId,
    product_id: product.id,
    product_name: product.name,
    ...parsed.data,
    estimated_price_pix: product.pricePix,
    estimated_price_card: product.priceCard,
    estimated_delivery_fee: deliveryFee,
    estimated_total_pix: Number((product.pricePix + deliveryFee).toFixed(2)),
    created_at: new Date().toISOString(),
  } as Record<string, unknown>);
  if (!result.ok) {
    return NextResponse.json({ message: 'Falha ao registrar orçamento.' }, { status: 500 });
  }
  return NextResponse.json({ ok: true, quoteId, storage: result.storage, message: 'Orçamento registrado com sucesso.' });
}
