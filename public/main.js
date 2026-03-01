// Imports the router function that controls page rendering.
import { renderRouter } from "./router.js"

// Gets the root container where the app will be rendered.
const root = document.getElementById("root")

// Initializes the router and renders the correct view.
renderRouter(root)

// Checks if the browser supports service workers.
if ("serviceWorker" in navigator) {
  // Registers the service worker after the page fully loads.
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {})
  })
}
