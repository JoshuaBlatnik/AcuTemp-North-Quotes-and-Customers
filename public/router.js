import { renderHome } from "./uiHome.js"
import { renderInventory } from "./uiInventory.js"
import { renderCustomers } from "./uiCustomers.js"
import { renderQuote } from "./uiQuote.js"
import { renderSalesOrder } from "./uiSalesOrder.js"

function getRoute(){
  const hash = String(location.hash || "").replace("#","").trim()
  return hash || "home"
}

export function renderRouter(root){
  async function go(){
    const route = getRoute()

    if (route === "inventory") {
      await renderInventory(root)
      return
    }

    if (route === "customers") {
      await renderCustomers(root)
      return
    }

    if (route.startsWith("quoteedit:")) {
      const quoteId = route.split(":").slice(1).join(":")
      await renderQuote(root, { mode: "edit", quoteId })
      return
    }

    if (route === "quote") {
      await renderQuote(root, { mode: "new" })
      return
    }

    if (route.startsWith("soedit:")) {
      const soId = route.split(":").slice(1).join(":")
      await renderSalesOrder(root, { mode: "edit", soId })
      return
    }

    if (route === "so") {
      await renderSalesOrder(root, { mode: "new" })
      return
    }

    await renderHome(root)
  }

  window.addEventListener("hashchange", go)
  go()
}