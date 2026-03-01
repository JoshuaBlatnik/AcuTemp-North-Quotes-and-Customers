// Defines the cache name and version.
const CACHE = "acutemp-cache-v1"

// Installs the service worker and pre caches essential app files.
self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) =>
      c.addAll([
        "/",                 // Root path
        "/index.html",       // Main HTML file
        "/styles.css",       // Stylesheet
        "/main.js",          // App entry script
        "/router.js",        // Router logic
        "/api.js",           // API helpers
        "/uiHome.js",        // Home screen
        "/uiCustomers.js",   // Customers screen
        "/uiInventory.js",   // Inventory screen
        "/uiQuote.js",       // Quote screen
        "/uiSalesOrder.js",  // Sales order screen
        "/acutempnorthlogo.png" // App logo
      ])
    )
  )
  // Immediately activates the new service worker.
  self.skipWaiting()
})

// Cleans up old caches when a new service worker activates.
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== CACHE) // Remove outdated caches
          .map((k) => caches.delete(k))
      )
    )
  )
  // Takes control of all open clients immediately.
  self.clients.claim()
})

// Intercepts network requests for offline support.
self.addEventListener("fetch", (e) => {
  const req = e.request
  const url = new URL(req.url)

  // Skip caching for API requests.
  if (url.pathname.startsWith("/api/")) return

  e.respondWith(
    caches.match(req).then((cached) =>
      // Return cached response if available.
      cached ||
      // Otherwise fetch from network and cache the response.
      fetch(req).then((res) => {
        const copy = res.clone()
        caches.open(CACHE).then((c) => c.put(req, copy))
        return res
      }).catch(() => cached)
    )
  )
})
