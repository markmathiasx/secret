import { NextResponse } from "next/server";
import { noStoreHeaders } from "@/src/lib/platform/http/cache-headers";
import { platformContentTypes } from "@/src/lib/platform/http/content-types";

export function platformJson(body: unknown, init: ResponseInit = {}) {
  return NextResponse.json(body, {
    ...init,
    headers: {
      ...noStoreHeaders(),
      ...(init.headers || {}),
    },
  });
}

export function platformText(body: string, contentType: string = platformContentTypes.text, init: ResponseInit = {}) {
  return new NextResponse(body, {
    ...init,
    headers: {
      "Content-Type": contentType,
      ...noStoreHeaders(),
      ...(init.headers || {}),
    },
  });
}
