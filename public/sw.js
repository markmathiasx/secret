const CACHE = "mdh-static-v2";
const LEGACY_PREFIXES = ["mdh3d-", "mdh-static-", "mdh-3d-"];
const CORE = ["/logo-mdh.jpg", "/icon-192.png", "/icon-512.png", "/apple-touch-icon.png"];
const STATIC_ASSET_PATTERN = /\.(?:png|jpe?g|webp|avif|gif|svg|ico|woff2?|ttf|otf)$/i;
const SAFE_DESTINATIONS = new Set(["image", "font"]);

function shouldHandle(request) {
  if (request.method !== "GET") return false;
  if (request.mode === "navigate" || request.destination === "document") return false;
  if (request.headers.get("authorization")) return false;

  const url = new URL(request.url);

  if (url.origin !== self.location.origin) return false;
  if (url.pathname.startsWith("/api/")) return false;
  if (url.pathname.startsWith("/_next/")) return false;

  return SAFE_DESTINATIONS.has(request.destination) || STATIC_ASSET_PATTERN.test(url.pathname);
}

async function warmCoreAssets() {
  const cache = await caches.open(CACHE);

  await Promise.allSettled(
    CORE.map(async (path) => {
      const response = await fetch(path, { cache: "reload" });
      if (response.ok) {
        await cache.put(path, response);
      }
    })
  );
}

async function updateCache(request, cache) {
  const response = await fetch(request);

  if (response.ok) {
    await cache.put(request, response.clone());
  }

  return response;
}

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(warmCoreAssets());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((key) => key !== CACHE && LEGACY_PREFIXES.some((prefix) => key.startsWith(prefix)))
          .map((key) => caches.delete(key))
      );
      await self.clients.claim();
    })()
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;

  if (!shouldHandle(request)) {
    return;
  }

  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE);
      const cached = await cache.match(request);

      if (cached) {
        event.waitUntil(updateCache(request, cache).catch(() => undefined));
        return cached;
      }

      return updateCache(request, cache);
    })()
  );
});
