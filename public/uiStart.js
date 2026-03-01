import { apiGet } from "./api.js"
import { createCustomerModal } from "./uiCustomerModal.js"

function el(tag) {
  return document.createElement(tag)
}

export async function renderStartScreen(root) {
  root.innerHTML = ""

  const app = el("div")
  app.className = "app"

  const header = el("div")
  header.className = "header"

  const brand = el("div")
  brand.className = "brand"

  const logo = el("img")
  logo.className = "logo"
  logo.src = "logo.png"
  logo.alt = "AcuTemp North"

  const titles = el("div")
  const h1 = el("div")
  h1.className = "h1"
  h1.textContent = "AcuTemp North"

  const sub = el("div")
  sub.className = "sub"
  sub.textContent = "Quotes, invoices, inventory"

  titles.appendChild(h1)
  titles.appendChild(sub)

  brand.appendChild(logo)
  brand.appendChild(titles)

  const right = el("div")
  right.style.display = "flex"
  right.style.gap = "10px"
  right.style.alignItems = "center"

  const newCustomerBtn = el("button")
  newCustomerBtn.className = "btnSmall"
  newCustomerBtn.textContent = "New customer"

  right.appendChild(newCustomerBtn)

  header.appendChild(brand)
  header.appendChild(right)

  const statusCard = el("div")
  statusCard.className = "card"

  const row = el("div")
  row.className = "row"

  const soLabel = el("div")
  soLabel.textContent = "Next service order"
  soLabel.style.opacity = "0.9"

  const soValue = el("div")
  soValue.textContent = "Loading"
  soValue.style.fontWeight = "900"
  soValue.style.fontSize = "18px"

  row.appendChild(soLabel)
  row.appendChild(soValue)

  const help = el("div")
  help.style.marginTop = "10px"
  help.style.opacity = "0.85"
  help.style.fontSize = "13px"
  help.textContent = "Service orders start at SO0000001 and increment automatically."

  statusCard.appendChild(row)
  statusCard.appendChild(help)

  const navCard = el("div")
  navCard.className = "card"

  const navTitle = el("div")
  navTitle.textContent = "Start"
  navTitle.style.fontSize = "18px"
  navTitle.style.fontWeight = "900"
  navTitle.style.marginBottom = "12px"

  const navGrid = el("div")
  navGrid.className = "grid"

  const quoteBtn = el("button")
  quoteBtn.className = "btn"
  quoteBtn.textContent = "Quoting"

  const invoiceBtn = el("button")
  invoiceBtn.className = "btn"
  invoiceBtn.textContent = "Invoice from quote"

  const inventoryBtn = el("button")
  inventoryBtn.className = "btn"
  inventoryBtn.textContent = "Inventory"

  navGrid.appendChild(quoteBtn)
  navGrid.appendChild(invoiceBtn)
  navGrid.appendChild(inventoryBtn)

  const navNote = el("div")
  navNote.style.marginTop = "10px"
  navNote.style.opacity = "0.85"
  navNote.style.fontSize = "13px"
  navNote.textContent = "These buttons will open the next screens once we build them."

  navCard.appendChild(navTitle)
  navCard.appendChild(navGrid)
  navCard.appendChild(navNote)

  const customerCard = el("div")
  customerCard.className = "card"

  const custHead = el("div")
  custHead.className = "row"
  custHead.style.alignItems = "center"

  const custTitle = el("div")
  custTitle.textContent = "Customers"
  custTitle.style.fontSize = "18px"
  custTitle.style.fontWeight = "900"

  const refreshBtn = el("button")
  refreshBtn.className = "btnSmall"
  refreshBtn.textContent = "Refresh"

  custHead.appendChild(custTitle)
  custHead.appendChild(refreshBtn)

  const custList = el("div")
  custList.style.marginTop = "12px"
  custList.className = "grid"

  function renderCustomers(customers) {
    custList.innerHTML = ""
    if (!customers.length) {
      const empty = el("div")
      empty.textContent = "No customers yet. Click New customer."
      empty.style.opacity = "0.85"
      empty.style.fontSize = "13px"
      custList.appendChild(empty)
      return
    }

    customers.slice().reverse().slice(0, 6).forEach(c => {
      const item = el("div")
      item.style.padding = "12px"
      item.style.borderRadius = "14px"
      item.style.background = "rgba(255,255,255,0.08)"
      item.className = "row"

      const left = el("div")
      const nm = el("div")
      nm.textContent = c.name
      nm.style.fontWeight = "800"

      const meta = el("div")
      meta.textContent = `Id ${c.customerId}`
      meta.style.fontSize = "12px"
      meta.style.opacity = "0.85"

      left.appendChild(nm)
      left.appendChild(meta)

      const right = el("div")
      right.style.fontSize = "12px"
      right.style.opacity = "0.85"
      right.textContent = c.phone ? c.phone : ""

      item.appendChild(left)
      item.appendChild(right)
      custList.appendChild(item)
    })
  }

  customerCard.appendChild(custHead)
  customerCard.appendChild(custList)

  const footer = el("div")
  footer.className = "footer"
  footer.textContent = "Local app. Data stored in data.json on this computer."

  app.appendChild(header)
  app.appendChild(statusCard)
  app.appendChild(navCard)
  app.appendChild(customerCard)
  app.appendChild(footer)

  root.appendChild(app)

  const modal = createCustomerModal(loadAll)
  document.body.appendChild(modal.overlay)

  newCustomerBtn.addEventListener("click", () => modal.open())
  refreshBtn.addEventListener("click", loadAll)

  quoteBtn.addEventListener("click", () => alert("Quoting screen is next"))
  invoiceBtn.addEventListener("click", () => alert("Invoice screen is after quoting"))
  inventoryBtn.addEventListener("click", () => alert("Inventory screen is after start screen"))

  async function loadAll() {
    const so = await apiGet("/api/nextSo")
    soValue.textContent = so.nextSoId

    const c = await apiGet("/api/customers")
    renderCustomers(Array.isArray(c.customers) ? c.customers : [])
  }

  await loadAll()
}