import { NextResponse } from "next/server";
import { applyNoStoreHeaders } from "@/lib/http-cache";
import { rateLimitRequest } from "@/lib/redis";
import { getClientIp, validateUploadFile } from "@/lib/security";
import { getServerSessionUser, isAdminSession } from "@/lib/server-session";
import { storeFileAsset } from "@/lib/storage/storage-provider";
import { recordAuthAudit } from "@/lib/auth/audit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PURPOSES = new Set(["quote-reference", "quote-model", "product-public", "admin-private"]);

function normalizePurpose(value: FormDataEntryValue | null) {
  const purpose = typeof value === "string" ? value.trim() : "";
  return PURPOSES.has(purpose) ? purpose : "quote-reference";
}

function profileForPurpose(purpose: string): "image" | "model" {
  return purpose === "quote-model" ? "model" : "image";
}

export async function POST(request: Request) {
  const user = await getServerSessionUser();
  if (!user) {
    return applyNoStoreHeaders(NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 }));
  }

  const ip = getClientIp(request.headers);
  const rateLimit = await rateLimitRequest(`file_upload:${user.id}:${ip}`, 10, 60_000);
  if (!rateLimit.ok) {
    return applyNoStoreHeaders(NextResponse.json({ ok: false, error: "Muitas tentativas. Aguarde antes de enviar outro arquivo." }, { status: 429 }));
  }

  const form = await request.formData();
  const file = form.get("file");
  const purpose = normalizePurpose(form.get("purpose"));

  if ((purpose === "product-public" || purpose === "admin-private") && !isAdminSession(user)) {
    return applyNoStoreHeaders(NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 }));
  }

  if (!(file instanceof File)) {
    return applyNoStoreHeaders(NextResponse.json({ ok: false, error: "Arquivo obrigatório." }, { status: 400 }));
  }

  const profile = profileForPurpose(purpose);
  const validation = await validateUploadFile(file, profile, {
    maxBytes: profile === "model" ? 50 * 1024 * 1024 : 10 * 1024 * 1024,
  });

  if (!validation.ok) {
    return applyNoStoreHeaders(NextResponse.json({ ok: false, error: validation.message, reason: validation.reason }, { status: 400 }));
  }

  try {
    const asset = await storeFileAsset({
      file,
      safeName: validation.safeName,
      contentType: validation.contentType,
      purpose,
      ownerUserId: user.id,
      metadata: {
        profile,
        requestId: request.headers.get("x-request-id"),
      },
    });

    await recordAuthAudit({
      actorUserId: user.id,
      action: "file.upload",
      targetType: "FileAsset",
      targetId: asset.id,
      ip,
      userAgent: request.headers.get("user-agent"),
      metadata: {
        purpose,
        mimeType: asset.mimeType,
        sizeBytes: asset.sizeBytes,
      },
    });

    return applyNoStoreHeaders(
      NextResponse.json({
        ok: true,
        asset: {
          id: asset.id,
          purpose: asset.purpose,
          mimeType: asset.mimeType,
          sizeBytes: asset.sizeBytes,
          checksum: asset.checksum,
          publicUrl: asset.publicUrl,
          createdAt: asset.createdAt,
        },
      }),
    );
  } catch (error) {
    return applyNoStoreHeaders(
      NextResponse.json(
        {
          ok: false,
          code: "FILE_STORAGE_UNAVAILABLE",
          error: error instanceof Error ? error.message : "Falha ao armazenar arquivo.",
        },
        { status: 503 },
      ),
    );
  }
}
