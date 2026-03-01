const CACHE = "acutemp-cache-v1"

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) =>
      c.addAll([
        "/",
        "/index.html",
        "/styles.css",
        "/main.js",
        "/router.js",
        "/api.js",
        "/uiHome.js",
        "/uiCustomers.js",
        "/uiInventory.js",
        "/uiQuote.js",
        "/uiSalesOrder.js",
        "/acutempnorthlogo.png"
      ])
    )
  )
  self.skipWaiting()
})

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  )
  self.clients.claim()
})

self.addEventListener("fetch", (e) => {
  const req = e.request
  const url = new URL(req.url)

  if (url.pathname.startsWith("/api/")) return

  e.respondWith(
    caches.match(req).then((cached) => cached || fetch(req).then((res) => {
      const copy = res.clone()
      caches.open(CACHE).then((c) => c.put(req, copy))
      return res
    }).catch(() => cached))
  )
})