import { NextResponse } from "next/server";
import { applyNoStoreHeaders } from "@/lib/http-cache";
import { getServerSessionUser, isAdminSession } from "@/lib/server-session";
import { getFileAsset } from "@/lib/storage/storage-provider";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const asset = await getFileAsset(id);

  if (!asset) {
    return applyNoStoreHeaders(NextResponse.json({ ok: false, error: "Arquivo não encontrado." }, { status: 404 }));
  }

  if (asset.purpose !== "product-public") {
    const user = await getServerSessionUser();
    if (!user) {
      return applyNoStoreHeaders(NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 }));
    }

    const canReadOwner = asset.ownerUserId && asset.ownerUserId === user.id;
    if (!canReadOwner && !isAdminSession(user)) {
      return applyNoStoreHeaders(NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 }));
    }
  }

  return applyNoStoreHeaders(
    NextResponse.json({
      ok: true,
      asset: {
        id: asset.id,
        ownerUserId: asset.ownerUserId,
        purpose: asset.purpose,
        bucket: asset.bucket,
        path: asset.path,
        publicUrl: asset.publicUrl,
        mimeType: asset.mimeType,
        sizeBytes: asset.sizeBytes,
        checksum: asset.checksum,
        metadata: asset.metadata,
        createdAt: asset.createdAt,
        updatedAt: asset.updatedAt,
      },
    }),
  );
}
