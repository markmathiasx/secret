import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import type { FileStorageProvider, StoreFileInput, StoredFileObject } from "@/lib/storage/storage-provider";

const LOCAL_STORAGE_ROOT = path.join(process.cwd(), ".storage");
const LOCAL_STORAGE_BUCKET = "local-private-assets";

function isProductionRuntime() {
  return process.env.NODE_ENV === "production" || process.env.VERCEL === "1" || process.env.VERCEL_ENV === "production";
}

function safeSegment(value: string) {
  return value.replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/^-+|-+$/g, "") || "asset";
}

export function getLocalStorageProvider(): FileStorageProvider {
  return {
    name: "local",
    async store(input: StoreFileInput): Promise<StoredFileObject> {
      if (isProductionRuntime()) {
        throw new Error("Storage local bloqueado em produção.");
      }

      const folder = safeSegment(input.purpose);
      const objectName = `${crypto.randomUUID()}-${safeSegment(input.safeName)}`;
      const relativePath = path.posix.join(folder, objectName);
      const absolutePath = path.join(LOCAL_STORAGE_ROOT, folder, objectName);

      await fs.mkdir(path.dirname(absolutePath), { recursive: true });
      await fs.writeFile(absolutePath, input.buffer);

      return {
        bucket: LOCAL_STORAGE_BUCKET,
        path: relativePath,
        publicUrl: null,
        mimeType: input.contentType,
        sizeBytes: input.buffer.byteLength,
        checksum: input.checksum,
      };
    },
  };
}
