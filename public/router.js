// Import page rendering functions for each section of the app.
import { renderHome } from "./uiHome.js"
import { renderInventory } from "./uiInventory.js"
import { renderCustomers } from "./uiCustomers.js"
import { renderQuote } from "./uiQuote.js"
import { renderSalesOrder } from "./uiSalesOrder.js"

// Determines the current route from the URL hash.
// Defaults to "home" if no hash is present.
function getRoute(){
  const hash = String(location.hash || "").replace("#","").trim()
  return hash || "home"
}

// Main router function that controls which screen is displayed.
export function renderRouter(root){

  // Handles route changes and renders the correct view.
  async function go(){
    const route = getRoute()

    // Inventory screen
    if (route === "inventory") {
      await renderInventory(root)
      return
    }

    // Customers screen
    if (route === "customers") {
      await renderCustomers(root)
      return
    }

    // Edit existing quote
    if (route.startsWith("quoteedit:")) {
      const quoteId = route.split(":").slice(1).join(":")
      await renderQuote(root, { mode: "edit", quoteId })
      return
    }

    // Create new quote
    if (route === "quote") {
      await renderQuote(root, { mode: "new" })
      return
    }

    // Edit existing sales order
    if (route.startsWith("soedit:")) {
      const soId = route.split(":").slice(1).join(":")
      await renderSalesOrder(root, { mode: "edit", soId })
      return
    }

    // Create new sales order
    if (route === "so") {
      await renderSalesOrder(root, { mode: "new" })
      return
    }

    // Default to home screen
    await renderHome(root)
  }

  // Re render when the URL hash changes.
  window.addEventListener("hashchange", go)

  // Initial render on page load.
  go()
}
