import { NextResponse } from "next/server";
import { findProduct } from "@/lib/catalog";
import { quoteSchema } from "@/lib/schemas";
import { getClientIp, checkRateLimit, validateUploadFile } from "@/lib/security";
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
    const imageValidation = image instanceof File ? await validateUploadFile(image, "image", { maxBytes: 10 * 1024 * 1024 }) : null;
    const modelValidation = model instanceof File ? await validateUploadFile(model, "model", { maxBytes: 50 * 1024 * 1024 }) : null;

    if (imageValidation && !imageValidation.ok) {
      return NextResponse.json({ message: imageValidation.message }, { status: 400 });
    }
    if (modelValidation && !modelValidation.ok) {
      return NextResponse.json({ message: modelValidation.message }, { status: 400 });
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
      reference_image_name: imageValidation?.ok ? imageValidation.safeName : '',
      reference_image_size: imageValidation?.ok ? imageValidation.size : 0,
      model_file_name: modelValidation?.ok ? modelValidation.safeName : '',
      model_file_size: modelValidation?.ok ? modelValidation.size : 0,
      created_at: new Date().toISOString(),
      source: 'site',
      storage_mode: 'metadata-only',
      details: {
        has_reference_image: image instanceof File,
        has_model_file: model instanceof File,
        reference_image_content_type: imageValidation?.ok ? imageValidation.contentType : null,
        model_file_content_type: modelValidation?.ok ? modelValidation.contentType : null
      },
      status: 'recebido'
    };

    const stored = await storeRecord('quoteRequests', payload as Record<string, unknown>);
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
    customername: parsed.data.customerName,
    phone: parsed.data.phone,
    cep: parsed.data.cep,
    neighborhood: parsed.data.neighborhood,
    distancekm: parsed.data.distanceKm,
    colorpreference: parsed.data.colorPreference,
    paymentmethod: parsed.data.paymentMethod,
    notes: parsed.data.notes,
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
