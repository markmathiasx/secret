import "server-only";
import { createClient } from "@supabase/supabase-js";
import { getSupabaseEnv, getSupabaseStorageBucket } from "@/lib/env";
import type { FileStorageProvider, StoreFileInput, StoredFileObject } from "@/lib/storage/storage-provider";

function safeSegment(value: string) {
  return value.replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/^-+|-+$/g, "") || "asset";
}

export function getSupabaseStorageProvider(): FileStorageProvider | null {
  const { url, serviceRole } = getSupabaseEnv();
  const bucket = getSupabaseStorageBucket();

  if (!url || !serviceRole || !bucket) {
    return null;
  }

  const supabase = createClient(url, serviceRole, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return {
    name: "supabase",
    async store(input: StoreFileInput): Promise<StoredFileObject> {
      const ownerSegment = input.ownerUserId ? safeSegment(input.ownerUserId) : "anonymous";
      const objectName = `${crypto.randomUUID()}-${safeSegment(input.safeName)}`;
      const objectPath = [safeSegment(input.purpose), ownerSegment, objectName].join("/");

      const { error } = await supabase.storage.from(bucket).upload(objectPath, input.buffer, {
        contentType: input.contentType,
        upsert: false,
      });

      if (error) {
        throw new Error(error.message || "Falha no upload do Supabase Storage.");
      }

      const publicUrl =
        input.purpose === "product-public"
          ? supabase.storage.from(bucket).getPublicUrl(objectPath).data.publicUrl
          : null;

      return {
        bucket,
        path: objectPath,
        publicUrl,
        mimeType: input.contentType,
        sizeBytes: input.buffer.byteLength,
        checksum: input.checksum,
      };
    },
  };
}
