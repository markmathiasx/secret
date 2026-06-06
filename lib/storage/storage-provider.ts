import "server-only";
import { createHash } from "node:crypto";
import type { Prisma } from "@prisma/client";
import { canConnectToDatabase, prisma } from "@/lib/prisma";
import { getLocalStorageProvider } from "@/lib/storage/local-storage-provider";
import { getSupabaseStorageProvider } from "@/lib/storage/supabase-storage-provider";

export type FileStorageProviderName = "supabase" | "local";

export type StoreFileInput = {
  buffer: Buffer;
  safeName: string;
  contentType: string;
  purpose: string;
  ownerUserId?: string | null;
  checksum: string;
};

export type StoredFileObject = {
  bucket: string;
  path: string;
  publicUrl: string | null;
  mimeType: string;
  sizeBytes: number;
  checksum: string;
};

export type FileStorageProvider = {
  name: FileStorageProviderName;
  store(input: StoreFileInput): Promise<StoredFileObject>;
};

export type FileAssetRecord = StoredFileObject & {
  id: string;
  ownerUserId: string | null;
  purpose: string;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
};

type FileAssetMemoryState = typeof globalThis & {
  __mdhFileAssets?: Map<string, FileAssetRecord>;
};

function getMemoryAssets() {
  const scope = globalThis as FileAssetMemoryState;
  if (!scope.__mdhFileAssets) {
    scope.__mdhFileAssets = new Map();
  }
  return scope.__mdhFileAssets;
}

function isProductionRuntime() {
  return process.env.NODE_ENV === "production" || process.env.VERCEL === "1" || process.env.VERCEL_ENV === "production";
}

export function checksumBuffer(buffer: Buffer) {
  return createHash("sha256").update(buffer).digest("hex");
}

export function getFileStorageProvider() {
  return getSupabaseStorageProvider() ?? getLocalStorageProvider();
}

export async function storeFileAsset(input: {
  file: File;
  safeName: string;
  contentType: string;
  purpose: string;
  ownerUserId?: string | null;
  metadata?: Record<string, unknown>;
}) {
  const buffer = Buffer.from(await input.file.arrayBuffer());
  const checksum = checksumBuffer(buffer);
  const provider = getFileStorageProvider();
  const stored = await provider.store({
    buffer,
    safeName: input.safeName,
    contentType: input.contentType,
    purpose: input.purpose,
    ownerUserId: input.ownerUserId ?? null,
    checksum,
  });

  return persistFileAssetMetadata({
    ...stored,
    ownerUserId: input.ownerUserId ?? null,
    purpose: input.purpose,
    metadata: {
      provider: provider.name,
      originalName: input.file.name,
      ...input.metadata,
    },
  });
}

export async function persistFileAssetMetadata(input: StoredFileObject & {
  ownerUserId?: string | null;
  purpose: string;
  metadata?: Record<string, unknown>;
}): Promise<FileAssetRecord> {
  const metadata = input.metadata ?? {};

  if (await canConnectToDatabase()) {
    const created = await prisma.fileAsset.create({
      data: {
        ownerUserId: input.ownerUserId ?? null,
        bucket: input.bucket,
        path: input.path,
        publicUrl: input.publicUrl,
        mimeType: input.mimeType,
        sizeBytes: input.sizeBytes,
        checksum: input.checksum,
        purpose: input.purpose,
        metadata: metadata as Prisma.InputJsonValue,
      },
    });

    return {
      id: created.id,
      ownerUserId: created.ownerUserId,
      bucket: created.bucket,
      path: created.path,
      publicUrl: created.publicUrl,
      mimeType: created.mimeType,
      sizeBytes: created.sizeBytes,
      checksum: created.checksum,
      purpose: created.purpose,
      metadata,
      createdAt: created.createdAt.toISOString(),
      updatedAt: created.updatedAt.toISOString(),
    };
  }

  if (isProductionRuntime()) {
    throw new Error("Persistência de arquivos não configurada em produção.");
  }

  const now = new Date().toISOString();
  const record: FileAssetRecord = {
    id: crypto.randomUUID(),
    ownerUserId: input.ownerUserId ?? null,
    bucket: input.bucket,
    path: input.path,
    publicUrl: input.publicUrl,
    mimeType: input.mimeType,
    sizeBytes: input.sizeBytes,
    checksum: input.checksum,
    purpose: input.purpose,
    metadata,
    createdAt: now,
    updatedAt: now,
  };

  getMemoryAssets().set(record.id, record);
  return record;
}

export async function getFileAsset(id: string): Promise<FileAssetRecord | null> {
  if (await canConnectToDatabase()) {
    const asset = await prisma.fileAsset.findUnique({ where: { id } });
    if (!asset) return null;

    return {
      id: asset.id,
      ownerUserId: asset.ownerUserId,
      bucket: asset.bucket,
      path: asset.path,
      publicUrl: asset.publicUrl,
      mimeType: asset.mimeType,
      sizeBytes: asset.sizeBytes,
      checksum: asset.checksum,
      purpose: asset.purpose,
      metadata: typeof asset.metadata === "object" && asset.metadata !== null ? (asset.metadata as Record<string, unknown>) : {},
      createdAt: asset.createdAt.toISOString(),
      updatedAt: asset.updatedAt.toISOString(),
    };
  }

  return getMemoryAssets().get(id) ?? null;
}
