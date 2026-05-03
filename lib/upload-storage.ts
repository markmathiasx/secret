import "server-only";
import { createHash } from "node:crypto";
import { put } from "@vercel/blob";
import { isR2Configured } from "@/lib/env";

export type StoredUpload = {
  ok: true;
  storage: "vercel-blob" | "r2-pending";
  url: string | null;
  pathname: string;
  sha256: string;
};

export async function storeUploadFile(input: {
  file: File;
  quoteId: string;
  kind: "model" | "reference";
  safeName: string;
}): Promise<StoredUpload> {
  const buffer = Buffer.from(await input.file.arrayBuffer());
  const sha256 = createHash("sha256").update(buffer).digest("hex");
  const pathname = `uploads/${input.kind}/${input.quoteId}/${Date.now()}-${input.safeName}`;
  const token = (process.env.BLOB_READ_WRITE_TOKEN || process.env.ORDER_BLOB_READ_WRITE_TOKEN || "").trim();

  if (isR2Configured() || !token) {
    return {
      ok: true,
      storage: isR2Configured() ? "r2-pending" : "vercel-blob",
      url: null,
      pathname,
      sha256,
    };
  }

  const blob = await put(pathname, buffer, {
    access: "public",
    token,
    contentType: input.file.type || "application/octet-stream",
    addRandomSuffix: false,
    allowOverwrite: true,
  });

  return {
    ok: true,
    storage: "vercel-blob",
    url: blob.url,
    pathname: blob.pathname,
    sha256,
  };
}
