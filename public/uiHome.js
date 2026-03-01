// Imports the GET helper used to load the next service order number.
import { apiGet } from "./api.js"

// Small helper for creating DOM elements.
function el(tag){ return document.createElement(tag) }

// Renders the Home screen into the provided root element.
export async function renderHome(root){
  root.innerHTML = ""

  const app = el("div")
  app.className = "app"

  const brand = el("div")
  brand.className = "topBrand"

  const logo = el("img")
  logo.className = "brandLogo"
  logo.src = "acutempnorthlogo.png"
  logo.alt = "AcuTemp North"

  const sub = el("div")
  sub.className = "subline"
  sub.textContent = "Sales orders, quotes, customers, inventory"

  brand.appendChild(logo)
  brand.appendChild(sub)

  // Status card showing the next service order id.
  const statusCard = el("div")
  statusCard.className = "card"

  const top = el("div")
  top.className = "row"

  const left = el("div")
  const l1 = el("div")
  l1.className = "kpiLabel"
  l1.textContent = "Next service order"

  const l2 = el("div")
  l2.className = "kpiValue"
  l2.textContent = "Loading"

  left.appendChild(l1)
  left.appendChild(l2)

  // Quick access button group.
  const quick = el("div")
  quick.style.display = "flex"
  quick.style.gap = "10px"
  quick.style.flexWrap = "wrap"

  const goInventory = el("button")
  goInventory.className = "btnSmall"
  goInventory.textContent = "Open inventory"
  quick.appendChild(goInventory)

  top.appendChild(left)
  top.appendChild(quick)

  const tip = el("div")
  tip.className = "sectionHint"
  tip.textContent = "Service orders start at SO0000001 and auto increment."

  statusCard.appendChild(top)
  statusCard.appendChild(tip)

  // Navigation card with primary actions.
  const navCard = el("div")
  navCard.className = "card"

  const navTitle = el("div")
  navTitle.className = "cardTitle"
  navTitle.textContent = "What do you want to do"

  const grid = el("div")
  grid.className = "grid2"

  const btnSO = el("button")
  btnSO.className = "btn btnPrimary"
  btnSO.textContent = "Create sales order"

  const btnQuote = el("button")
  btnQuote.className = "btn btnGhost"
  btnQuote.textContent = "Create sales quote"

  const btnCustomers = el("button")
  btnCustomers.className = "btn btnGhost"
  btnCustomers.textContent = "Customers"

  const btnInventory = el("button")
  btnInventory.className = "btn btnGhost"
  btnInventory.textContent = "Inventory"

  grid.appendChild(btnSO)
  grid.appendChild(btnQuote)
  grid.appendChild(btnCustomers)
  grid.appendChild(btnInventory)

  const hint = el("div")
  hint.className = "sectionHint"
  hint.textContent = "Create a sales order from a customer or from a quote."

  navCard.appendChild(navTitle)
  navCard.appendChild(grid)
  navCard.appendChild(hint)

  const footer = el("div")
  footer.className = "footer"
  footer.textContent = "Local app. Data saved in data.json."

  app.appendChild(brand)
  app.appendChild(statusCard)
  app.appendChild(navCard)
  app.appendChild(footer)

  root.appendChild(app)

  // Navigation events.
  goInventory.addEventListener("click", () => { location.hash = "inventory" })
  btnInventory.addEventListener("click", () => { location.hash = "inventory" })
  btnSO.addEventListener("click", () => { location.hash = "so" })
  btnQuote.addEventListener("click", () => { location.hash = "quote" })
  btnCustomers.addEventListener("click", () => { location.hash = "customers" })

  // Loads the next service order id from the API.
  const so = await apiGet("/api/nextSo")
  l2.textContent = so.nextSoId
}
