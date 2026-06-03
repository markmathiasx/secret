const CACHE = "mdh-static-v4";
const LEGACY_PREFIXES = ["mdh3d-", "mdh-static-v", "mdh-static-", "mdh-3d-"];
const CORE = ["/logo-mdh.jpg", "/icon-192.png", "/icon-512.png", "/apple-touch-icon.png", "/offline.html"];
const STATIC_ASSET_PATTERN = /\.(?:png|jpe?g|webp|avif|gif|svg|ico|woff2?|ttf|otf)$/i;
const SAFE_DESTINATIONS = new Set(["image", "font"]);

function shouldHandleStatic(request) {
  if (request.method !== "GET") return false;
  if (request.headers.get("authorization")) return false;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return false;
  if (url.pathname.startsWith("/admin")) return false;
  if (url.pathname.startsWith("/checkout")) return false;
  if (url.pathname.startsWith("/api/")) return false;
  if (url.pathname.startsWith("/_next/")) return false;

  return SAFE_DESTINATIONS.has(request.destination) || STATIC_ASSET_PATTERN.test(url.pathname);
}

function isNavigationRequest(request) {
  return request.mode === "navigate" || request.destination === "document";
}

async function warmCoreAssets() {
  const cache = await caches.open(CACHE);
  await Promise.allSettled(
    CORE.map(async (path) => {
      try {
        const response = await fetch(path, { cache: "reload" });
        if (response.ok) await cache.put(path, response);
      } catch {
        // Non-critical: don't block install if a core asset is unavailable
      }
    })
  );
}

async function updateCache(request, cache) {
  const response = await fetch(request);
  if (response.ok) await cache.put(request, response.clone());
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

  // Navigation (HTML pages): network-first, fall back to /offline.html
  if (isNavigationRequest(request)) {
    event.respondWith(
      fetch(request).catch(async () => {
        const cache = await caches.open(CACHE);
        const offline = await cache.match("/offline.html");
        return offline || new Response("Offline", { status: 503 });
      })
    );
    return;
  }

  // Static assets: stale-while-revalidate
  if (!shouldHandleStatic(request)) return;

  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE);
      const cached = await cache.match(request);

      if (cached) {
        event.waitUntil(updateCache(request, cache).catch(() => undefined));
        return cached;
      }

      return updateCache(request, cache).catch(() => {
        // Return a transparent 1x1 GIF as fallback for images
        const url = new URL(request.url);
        if (STATIC_ASSET_PATTERN.test(url.pathname)) {
          return new Response(
            atob("R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"),
            { status: 200, headers: { "Content-Type": "image/gif" } }
          );
        }
        return new Response("", { status: 503 });
      });
    })()
  );
});

// ─── Push Notifications ─────────────────────────────────────────────────────

self.addEventListener("push", (event) => {
  let data = { title: "MDH 3D", body: "Nova atualização disponível.", url: "/" };
  try {
    if (event.data) data = { ...data, ...event.data.json() };
  } catch {
    if (event.data) data.body = event.data.text();
  }

  const options = {
    body: data.body,
    icon: "/icon-192.png",
    badge: "/icon-192.png",
    data: { url: data.url || "/" },
    vibrate: [100, 50, 100],
    actions: [
      { action: "open", title: "Abrir" },
      { action: "dismiss", title: "Dispensar" },
    ],
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action === "dismiss") return;

  const targetUrl = event.notification.data?.url || "/";

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clients) => {
        // Focus existing window if already open
        const existing = clients.find((c) => c.url === targetUrl || c.url.includes(targetUrl));
        if (existing) return existing.focus();
        return self.clients.openWindow(targetUrl);
      })
  );
});
