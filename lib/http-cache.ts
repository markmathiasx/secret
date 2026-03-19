type NoStoreOptions = {
  varyCookie?: boolean;
};

const NO_STORE_HEADERS = {
  "Cache-Control": "private, no-store, no-cache, max-age=0, must-revalidate",
  Pragma: "no-cache",
  Expires: "0"
} as const;

export function applyNoStoreHeaders<T extends Response>(response: T, options: NoStoreOptions = {}) {
  Object.entries(NO_STORE_HEADERS).forEach(([name, value]) => {
    response.headers.set(name, value);
  });

  if (options.varyCookie) {
    const current = response.headers.get("Vary");
    const parts = current
      ? current
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean)
      : [];

    if (!parts.includes("Cookie")) {
      parts.push("Cookie");
    }

    response.headers.set("Vary", parts.join(", "));
  }

  return response;
}
