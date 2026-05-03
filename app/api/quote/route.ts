import { NextResponse } from "next/server";
import { findProduct } from "@/lib/catalog";
import { quoteSchema } from "@/lib/schemas";
import { getClientIp, validateUploadFile } from "@/lib/security";
import { rateLimitRequest } from "@/lib/redis";
import { storeRecord } from "@/lib/storage";
import { estimateDeliveryFeeKm } from "@/lib/delivery";
import { sanitizeEmail, sanitizeMetadataRecord, sanitizePlainText } from "@/lib/sanitize";
import { enqueueStlProcessingJob } from "@/lib/async-stl-processing";
import { storeUploadFile } from "@/lib/upload-storage";

function buildRequestId(prefix = 'MDH') {
  return `${prefix}-${Date.now().toString().slice(-8)}`;
}

export async function POST(request: Request) {
  const ip = getClientIp(request.headers);
  const contentType = request.headers.get('content-type') || '';

  if (contentType.includes('multipart/form-data')) {
    const rateLimit = await rateLimitRequest(`quote-upload:${ip}`, 3, 60 * 60 * 1000);
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
    const referenceUpload =
      image instanceof File && imageValidation?.ok
        ? await storeUploadFile({
            file: image,
            quoteId,
            kind: "reference",
            safeName: imageValidation.safeName,
          }).catch(() => null)
        : null;
    const modelUpload =
      model instanceof File && modelValidation?.ok
        ? await storeUploadFile({
            file: model,
            quoteId,
            kind: "model",
            safeName: modelValidation.safeName,
          }).catch(() => null)
        : null;

    if (modelUpload) {
      await enqueueStlProcessingJob({
        id: `${quoteId}:model`,
        fileName: modelValidation?.ok ? modelValidation.safeName : "model",
        fileSize: modelValidation?.ok ? modelValidation.size : 0,
        contentType: modelValidation?.ok ? modelValidation.contentType : null,
        quoteId,
        storageUrl: modelUpload.url,
        createdAt: new Date().toISOString(),
        status: "queued",
      });
    }

    const payload = sanitizeMetadataRecord({
      quote_id: quoteId,
      request_type: 'image-to-3d',
      customer_name: sanitizePlainText(form.get('name'), 200),
      phone: sanitizePlainText(form.get('whatsapp'), 40),
      email: sanitizeEmail(form.get('email')),
      project_description: sanitizePlainText(form.get('description'), 2000),
      project_size: sanitizePlainText(form.get('size'), 120),
      preferred_material: sanitizePlainText(form.get('material'), 80),
      preferred_color: sanitizePlainText(form.get('color'), 80),
      desired_deadline: sanitizePlainText(form.get('deadline'), 80),
      quantity: Math.max(1, Math.min(999, Number(form.get('quantity') || '1') || 1)),
      material: sanitizePlainText(form.get('material'), 80),
      color: sanitizePlainText(form.get('color'), 80),
      reference_image_name: imageValidation?.ok ? imageValidation.safeName : '',
      reference_image_size: imageValidation?.ok ? imageValidation.size : 0,
      reference_image_storage: referenceUpload?.storage || null,
      reference_image_url: referenceUpload?.url || null,
      reference_image_sha256: referenceUpload?.sha256 || null,
      model_file_name: modelValidation?.ok ? modelValidation.safeName : '',
      model_file_size: modelValidation?.ok ? modelValidation.size : 0,
      model_file_storage: modelUpload?.storage || null,
      model_file_url: modelUpload?.url || null,
      model_file_sha256: modelUpload?.sha256 || null,
      created_at: new Date().toISOString(),
      source: 'site',
      storage_mode: modelUpload || referenceUpload ? 'blob-async' : 'metadata-only',
      details: {
        has_reference_image: image instanceof File,
        has_model_file: model instanceof File,
        reference_image_content_type: imageValidation?.ok ? imageValidation.contentType : null,
        model_file_content_type: modelValidation?.ok ? modelValidation.contentType : null
      },
      status: 'recebido'
    });

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

  const rateLimit = await rateLimitRequest(`quote:${ip}`, 10, 60_000);
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
