import { get, list, put } from "@vercel/blob";

export type BlobStorageKind = "quotes" | "orders" | "quoteRequests";

type BlobStoreRecord = Record<string, unknown> & {
  id: string;
};

type BlobStoreResult =
  | {
      ok: true;
      storage: "blob";
      data: BlobStoreRecord;
    }
  | {
      ok: false;
      storage: "blob";
      error: string;
    };

function getOrderBlobToken() {
  return (process.env.ORDER_BLOB_READ_WRITE_TOKEN || "").trim();
}

export function isOrderBlobConfigured() {
  return Boolean(getOrderBlobToken());
}

function requireOrderBlobToken() {
  const token = getOrderBlobToken();
  if (!token) {
    throw new Error("ORDER_BLOB_READ_WRITE_TOKEN ausente.");
  }

  return token;
}

function encodePathSegment(value: string) {
  return Buffer.from(value.trim().toLowerCase()).toString("base64url");
}

function getOrderCode(record: Record<string, unknown>) {
  const orderCode = typeof record.order_code === "string" ? record.order_code.trim() : "";
  if (!orderCode) {
    throw new Error("order_code ausente para gravacao no Blob.");
  }

  return orderCode;
}

function getQuoteCode(record: Record<string, unknown>) {
  if (typeof record.quote_id === "string" && record.quote_id.trim()) {
    return record.quote_id.trim();
  }

  return typeof record.id === "string" ? record.id : crypto.randomUUID();
}

function getBlobPaths(kind: BlobStorageKind, record: BlobStoreRecord) {
  if (kind === "orders") {
    const orderCode = getOrderCode(record);
    const paths = [`orders/by-code/${orderCode}.json`];
    const email = typeof record.email === "string" ? record.email.trim().toLowerCase() : "";

    if (email) {
      paths.push(`orders/by-email/${encodePathSegment(email)}/${orderCode}.json`);
    }

    return paths;
  }

  if (kind === "quotes") {
    const quoteCode = getQuoteCode(record);
    return [`quotes/by-id/${quoteCode}.json`];
  }

  const quoteRequestCode = getQuoteCode(record);
  return [`quote-requests/by-id/${quoteRequestCode}.json`];
}

async function writeJsonBlob(pathname: string, data: BlobStoreRecord) {
  return put(pathname, JSON.stringify(data), {
    access: "private",
    token: requireOrderBlobToken(),
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
    cacheControlMaxAge: 60,
  });
}

async function readJsonBlob(pathname: string) {
  const result = await get(pathname, {
    access: "private",
    token: requireOrderBlobToken(),
    useCache: false,
  });

  if (!result || result.statusCode !== 200 || !result.stream) {
    return null;
  }

  const text = await new Response(result.stream).text();
  if (!text.trim()) {
    return null;
  }

  return JSON.parse(text) as BlobStoreRecord;
}

export async function writeSecureBlobJson(pathname: string, data: unknown) {
  return put(pathname, JSON.stringify(data), {
    access: "private",
    token: requireOrderBlobToken(),
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
    cacheControlMaxAge: 60,
  });
}

export async function readSecureBlobJson<T>(pathname: string) {
  const result = await get(pathname, {
    access: "private",
    token: requireOrderBlobToken(),
    useCache: false,
  });

  if (!result || result.statusCode !== 200 || !result.stream) {
    return null;
  }

  const text = await new Response(result.stream).text();
  if (!text.trim()) {
    return null;
  }

  return JSON.parse(text) as T;
}

async function listJsonBlobs(prefix: string, limit: number) {
  const blobs: Awaited<ReturnType<typeof list>>['blobs'][number][] = [];
  let cursor: string | undefined;

  do {
    const page = await list({
      token: requireOrderBlobToken(),
      prefix,
      limit: Math.min(limit, 1000),
      cursor,
    });

    blobs.push(...page.blobs);

    if (!page.hasMore || !page.cursor || blobs.length >= limit) {
      break;
    }

    cursor = page.cursor;
  } while (cursor);

  const records = await Promise.all(
    blobs.slice(0, limit).map(async (blob) => {
      try {
        return await readJsonBlob(blob.pathname);
      } catch {
        return null;
      }
    })
  );

  return records.filter(Boolean) as BlobStoreRecord[];
}

function sortByCreatedAtDesc(left: BlobStoreRecord, right: BlobStoreRecord) {
  const leftTime = new Date(String(left.created_at || 0)).getTime();
  const rightTime = new Date(String(right.created_at || 0)).getTime();
  return rightTime - leftTime;
}

export async function storeBlobRecord(
  kind: BlobStorageKind,
  payload: Record<string, unknown>
): Promise<BlobStoreResult> {
  if (!isOrderBlobConfigured()) {
    return {
      ok: false,
      storage: "blob",
      error: "Blob privado não configurado.",
    };
  }

  const data: BlobStoreRecord = {
    id: typeof payload.id === "string" && payload.id.trim() ? payload.id : crypto.randomUUID(),
    ...payload,
  };

  try {
    await Promise.all(getBlobPaths(kind, data).map((pathname) => writeJsonBlob(pathname, data)));
    return {
      ok: true,
      storage: "blob",
      data,
    };
  } catch (error) {
    return {
      ok: false,
      storage: "blob",
      error: error instanceof Error ? error.message : "Falha ao gravar no Blob.",
    };
  }
}

export async function updateBlobOrderRecord(orderCode: string, payload: Record<string, unknown>): Promise<BlobStoreResult> {
  if (!isOrderBlobConfigured()) {
    return {
      ok: false,
      storage: "blob",
      error: "Blob privado não configurado.",
    };
  }

  const normalizedOrderCode = orderCode.trim();
  if (!normalizedOrderCode) {
    return {
      ok: false,
      storage: "blob",
      error: "order_code ausente.",
    };
  }

  try {
    const existing = (await readJsonBlob(`orders/by-code/${normalizedOrderCode}.json`)) || {
      id: crypto.randomUUID(),
      order_code: normalizedOrderCode,
    };

    const merged: BlobStoreRecord = {
      ...existing,
      ...payload,
      id: typeof existing.id === "string" && existing.id ? existing.id : crypto.randomUUID(),
      order_code: normalizedOrderCode,
      updated_at:
        typeof payload.updated_at === "string" && payload.updated_at
          ? payload.updated_at
          : new Date().toISOString(),
    };

    await Promise.all(getBlobPaths("orders", merged).map((pathname) => writeJsonBlob(pathname, merged)));

    return {
      ok: true,
      storage: "blob",
      data: merged,
    };
  } catch (error) {
    return {
      ok: false,
      storage: "blob",
      error: error instanceof Error ? error.message : "Falha ao atualizar pedido no Blob.",
    };
  }
}

export async function listBlobRecords(
  kind: BlobStorageKind,
  options?: { email?: string; limit?: number }
) {
  if (!isOrderBlobConfigured()) {
    return [];
  }

  const limit = options?.limit ?? 20;

  try {
    if (kind === "orders") {
      const email = typeof options?.email === "string" ? options.email.trim().toLowerCase() : "";
      const prefix = email ? `orders/by-email/${encodePathSegment(email)}/` : "orders/by-code/";
      return (await listJsonBlobs(prefix, limit)).sort(sortByCreatedAtDesc);
    }

    if (kind === "quotes") {
      return (await listJsonBlobs("quotes/by-id/", limit)).sort(sortByCreatedAtDesc);
    }

    return (await listJsonBlobs("quote-requests/by-id/", limit)).sort(sortByCreatedAtDesc);
  } catch {
    return [];
  }
}
