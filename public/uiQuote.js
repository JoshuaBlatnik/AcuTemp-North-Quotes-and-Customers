// public/uiQuote.js
import { apiGet } from "./api.js"

function el(tag){ return document.createElement(tag) }

function money(n){
  const x = Number(n)
  if (!Number.isFinite(x)) return "$0.00"
  return "$" + x.toFixed(2)
}

function calcAmount(price, qty){
  const p = Number(price)
  const q = Number(qty)
  if (!Number.isFinite(p) || !Number.isFinite(q)) return 0
  return p * q
}

async function requestJson(url, method, body){
  const r = await fetch(url, {
    method,
    body: body ? JSON.stringify(body) : undefined
  })
  const j = await r.json().catch(() => ({}))
  if (!r.ok) throw new Error(j && j.message ? j.message : "Request failed")
  return j
}

function makeInput(labelText, placeholder){
  const wrap = el("div")
  wrap.className = "pill"
  wrap.style.display = "grid"
  wrap.style.gap = "8px"

  const label = el("div")
  label.className = "kpiLabel"
  label.textContent = labelText

  const inp = el("input")
  inp.placeholder = placeholder
  inp.style.width = "100%"
  inp.style.padding = "12px"
  inp.style.borderRadius = "14px"
  inp.style.border = "1px solid rgba(255,255,255,.14)"
  inp.style.background = "rgba(0,0,0,.18)"
  inp.style.color = "#ffffff"
  inp.style.outline = "none"
  inp.style.fontSize = "14px"

  wrap.appendChild(label)
  wrap.appendChild(inp)
  return { wrap, inp }
}

function makeTextArea(labelText, placeholder){
  const wrap = el("div")
  wrap.className = "pill"
  wrap.style.display = "grid"
  wrap.style.gap = "8px"

  const label = el("div")
  label.className = "kpiLabel"
  label.textContent = labelText

  const inp = el("textarea")
  inp.placeholder = placeholder
  inp.rows = 3
  inp.style.width = "100%"
  inp.style.padding = "12px"
  inp.style.borderRadius = "14px"
  inp.style.border = "1px solid rgba(255,255,255,.14)"
  inp.style.background = "rgba(0,0,0,.18)"
  inp.style.color = "#ffffff"
  inp.style.outline = "none"
  inp.style.fontSize = "14px"
  inp.style.resize = "vertical"

  wrap.appendChild(label)
  wrap.appendChild(inp)
  return { wrap, inp }
}

function buildOverlay(){
  const overlay = el("div")
  overlay.className = "modalOverlay"
  overlay.style.display = "none"
  return overlay
}

async function loadInventory(){
  const res = await apiGet("/api/inventory")
  return Array.isArray(res.inventory) ? res.inventory : []
}

async function loadCustomers(){
  const res = await apiGet("/api/customers")
  return Array.isArray(res.customers) ? res.customers : []
}

export async function renderQuote(root, opts = { mode: "new" }){
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
  sub.textContent = "Sales quote"

  brand.appendChild(logo)
  brand.appendChild(sub)

  const headerCard = el("div")
  headerCard.className = "card"

  const headerTitle = el("div")
  headerTitle.className = "cardTitle"
  headerTitle.textContent = "Quote details"

  const row1 = el("div")
  row1.className = "grid2"

  const customerId = makeInput("Customer id", "Click to select")
  customerId.inp.readOnly = true
  customerId.inp.style.cursor = "pointer"

  const quoteIdBox = makeInput("Sales quote id", "Auto on save")
  quoteIdBox.inp.readOnly = true
  quoteIdBox.inp.value = "Will generate when saved"

  row1.appendChild(customerId.wrap)
  row1.appendChild(quoteIdBox.wrap)

  const row2 = el("div")
  row2.className = "grid2"

  const customerName = makeInput("Customer name", "Name or company")
  const phone = makeInput("Phone", "Optional")

  row2.appendChild(customerName.wrap)
  row2.appendChild(phone.wrap)

  const row3 = el("div")
  row3.className = "grid2"

  const poNumber = makeInput("PO Number", "Optional")

  const truckWrap = el("div")
  truckWrap.className = "pill"
  truckWrap.style.display = "grid"
  truckWrap.style.gap = "8px"

  const truckLabel = el("div")
  truckLabel.className = "kpiLabel"
  truckLabel.textContent = "Truck number"

  const truckNumber = el("select")
  truckNumber.style.width = "100%"
  truckNumber.style.padding = "12px"
  truckNumber.style.borderRadius = "14px"
  truckNumber.style.border = "1px solid rgba(255,255,255,.14)"
  truckNumber.style.background = "rgba(0,0,0,.18)"
  truckNumber.style.color = "#ffffff"
  truckNumber.style.outline = "none"
  truckNumber.style.fontSize = "14px"

  ;["PU1","PU2","PU3","PU4"].forEach(v => {
    const o = el("option")
    o.value = v
    o.textContent = v + (v === "PU1" ? " Tacoma" : "")
    truckNumber.appendChild(o)
  })

  truckWrap.appendChild(truckLabel)
  truckWrap.appendChild(truckNumber)

  row3.appendChild(poNumber.wrap)
  row3.appendChild(truckWrap)

  const addrRow = el("div")
  addrRow.className = "grid2"

  const billTo = makeTextArea("Billing address", "Billing address")
  const shipTo = makeTextArea("Ship to address", "Ship to address")

  addrRow.appendChild(billTo.wrap)
  addrRow.appendChild(shipTo.wrap)

  headerCard.appendChild(headerTitle)
  headerCard.appendChild(row1)
  headerCard.appendChild(row2)
  headerCard.appendChild(row3)
  headerCard.appendChild(addrRow)

  const linesCard = el("div")
  linesCard.className = "card"

  const linesTitle = el("div")
  linesTitle.className = "cardTitle"
  linesTitle.textContent = "Line items"

  const table = el("div")
  table.className = "grid"

  const addRowBtn = el("button")
  addRowBtn.className = "btn btnGhost"
  addRowBtn.textContent = "Add row"

  const totalRow = el("div")
  totalRow.className = "pill"
  totalRow.style.display = "flex"
  totalRow.style.justifyContent = "space-between"
  totalRow.style.alignItems = "center"
  totalRow.style.gap = "12px"

  const totalLabel = el("div")
  totalLabel.className = "kpiLabel"
  totalLabel.textContent = "Total"

  const totalValue = el("div")
  totalValue.style.fontWeight = "950"
  totalValue.style.fontSize = "20px"
  totalValue.textContent = "$0.00"

  totalRow.appendChild(totalLabel)
  totalRow.appendChild(totalValue)

  linesCard.appendChild(linesTitle)
  linesCard.appendChild(table)
  linesCard.appendChild(addRowBtn)
  linesCard.appendChild(totalRow)

  const actionsCard = el("div")
  actionsCard.className = "card"

  const saveBtn = el("button")
  saveBtn.className = "btn btnPrimary"
  saveBtn.textContent = opts && opts.mode === "edit" ? "Save changes" : "Save sales quote"

  const backBtn = el("button")
  backBtn.className = "btnSmall"
  backBtn.textContent = "Back to menu"
  backBtn.style.marginTop = "12px"

  const err = el("div")
  err.className = "sectionHint"
  err.style.color = "rgba(255,180,180,.95)"
  err.textContent = ""

  actionsCard.appendChild(saveBtn)
  actionsCard.appendChild(backBtn)
  actionsCard.appendChild(err)

  const footer = el("div")
  footer.className = "footer"
  footer.textContent = "Quotes save to data.json."

  app.appendChild(brand)
  app.appendChild(headerCard)
  app.appendChild(linesCard)
  app.appendChild(actionsCard)
  app.appendChild(footer)

  root.appendChild(app)

  const overlay = buildOverlay()
  document.body.appendChild(overlay)

  let customers = await loadCustomers()
  let inventory = await loadInventory()

  const lines = []

  function recomputeTotal(){
    const total = lines.reduce((sum, l) => sum + calcAmount(l.pricePerUnit.value, l.quantity.value), 0)
    totalValue.textContent = money(total)
  }

  function openInventoryPicker(onPick){
    overlay.innerHTML = ""
    overlay.style.display = "flex"

    const panel = el("div")
    panel.className = "card modalPanel"

    const title = el("div")
    title.style.fontWeight = "950"
    title.style.fontSize = "18px"
    title.textContent = "Select inventory item"

    const search = makeInput("Search by id or description", "Type to search")

    const list = el("div")
    list.className = "grid"
    list.style.marginTop = "12px"

    const close = el("button")
    close.className = "btnSmall"
    close.textContent = "Close"
    close.style.marginTop = "12px"

    function render(){
      list.innerHTML = ""
      const q = String(search.inp.value || "").trim().toLowerCase()
      const filtered = inventory.filter(i => {
        const id = String(i.itemId || "").toLowerCase()
        const desc = String(i.description || "").toLowerCase()
        return id.includes(q) || desc.includes(q)
      })

      if (!filtered.length){
        const empty = el("div")
        empty.className = "pill"
        empty.style.color = "rgba(255,255,255,.85)"
        empty.textContent = "No matches."
        list.appendChild(empty)
        return
      }

      filtered.slice(0, 25).forEach(it => {
        const row = el("div")
        row.className = "pill"
        row.style.cursor = "pointer"
        row.style.display = "grid"
        row.style.gap = "6px"

        const a = el("div")
        a.style.fontWeight = "950"
        a.textContent = it.itemId

        const b = el("div")
        b.style.fontSize = "13px"
        b.style.color = "rgba(255,255,255,.82)"
        b.textContent = it.description

        row.appendChild(a)
        row.appendChild(b)

        row.addEventListener("click", () => {
          overlay.style.display = "none"
          onPick(it)
        })

        list.appendChild(row)
      })
    }

    search.inp.addEventListener("input", render)

    close.addEventListener("click", () => { overlay.style.display = "none" })
    overlay.addEventListener("click", e => { if (e.target === overlay) overlay.style.display = "none" })

    panel.appendChild(title)
    panel.appendChild(search.wrap)
    panel.appendChild(list)
    panel.appendChild(close)

    overlay.appendChild(panel)
    render()
    search.inp.focus()
  }

  function openCustomerPicker(){
    overlay.innerHTML = ""
    overlay.style.display = "flex"

    const panel = el("div")
    panel.className = "card modalPanel"

    const title = el("div")
    title.style.fontWeight = "950"
    title.style.fontSize = "18px"
    title.textContent = "Select customer"

    const search = makeInput("Search by name", "Type to search")

    const list = el("div")
    list.className = "grid"
    list.style.marginTop = "12px"

    const primary = el("button")
    primary.className = "btn btnPrimary"
    primary.textContent = "Create new customer"
    primary.style.marginTop = "12px"

    const close = el("button")
    close.className = "btnSmall"
    close.textContent = "Close"
    close.style.marginTop = "10px"

    function render(){
      list.innerHTML = ""
      const q = String(search.inp.value || "").trim().toLowerCase()
      const filtered = customers.filter(c => String(c.name || "").toLowerCase().includes(q))

      if (!filtered.length){
        const empty = el("div")
        empty.className = "pill"
        empty.style.color = "rgba(255,255,255,.85)"
        empty.textContent = "No matches."
        list.appendChild(empty)
        return
      }

      filtered.slice(0, 25).forEach(c => {
        const row = el("div")
        row.className = "pill"
        row.style.cursor = "pointer"
        row.style.display = "grid"
        row.style.gap = "6px"

        const a = el("div")
        a.style.fontWeight = "950"
        a.textContent = c.name

        const b = el("div")
        b.style.fontSize = "13px"
        b.style.color = "rgba(255,255,255,.82)"
        b.textContent = "Id " + c.customerId

        row.appendChild(a)
        row.appendChild(b)

        row.addEventListener("click", () => {
          overlay.style.display = "none"
          customerId.inp.value = c.customerId || ""
          customerName.inp.value = c.name || ""
          phone.inp.value = c.phone || ""
          billTo.inp.value = c.address || ""
          shipTo.inp.value = c.address || ""
        })

        list.appendChild(row)
      })
    }

    search.inp.addEventListener("input", render)

    primary.addEventListener("click", () => {
      overlay.style.display = "none"
      location.hash = "customers"
    })

    close.addEventListener("click", () => { overlay.style.display = "none" })
    overlay.addEventListener("click", e => { if (e.target === overlay) overlay.style.display = "none" })

    panel.appendChild(title)
    panel.appendChild(search.wrap)
    panel.appendChild(list)
    panel.appendChild(primary)
    panel.appendChild(close)

    overlay.appendChild(panel)
    render()
    search.inp.focus()
  }

  function addLine(){
    const lineWrap = el("div")
    lineWrap.className = "pill"
    lineWrap.style.display = "grid"
    lineWrap.style.gap = "10px"

    const top = el("div")
    top.className = "grid2"

    const itemId = makeInput("Item id", "Click to select inventory item")
    itemId.inp.readOnly = true
    itemId.inp.style.cursor = "pointer"

    const desc = makeInput("Description", "Editable description")
    desc.inp.readOnly = false

    top.appendChild(itemId.wrap)
    top.appendChild(desc.wrap)

    const mid = el("div")
    mid.className = "grid2"

    const pricePerUnit = makeInput("Price per unit", "0.00")
    const quantity = makeInput("Quantity", "1")

    mid.appendChild(pricePerUnit.wrap)
    mid.appendChild(quantity.wrap)

    const bottom = el("div")
    bottom.className = "row"

    const amtLabel = el("div")
    amtLabel.className = "kpiLabel"
    amtLabel.textContent = "Amount"

    const amtValue = el("div")
    amtValue.style.fontWeight = "950"
    amtValue.textContent = "$0.00"

    const del = el("button")
    del.className = "btnSmall"
    del.textContent = "Remove row"

    bottom.appendChild(amtLabel)
    bottom.appendChild(amtValue)
    bottom.appendChild(del)

    function updateAmount(){
      const a = calcAmount(pricePerUnit.inp.value, quantity.inp.value)
      amtValue.textContent = money(a)
      recomputeTotal()
    }

    pricePerUnit.inp.addEventListener("input", updateAmount)
    quantity.inp.addEventListener("input", updateAmount)

    itemId.inp.addEventListener("click", () => {
      openInventoryPicker(it => {
        itemId.inp.value = it.itemId || ""

        if (!desc.inp.value) desc.inp.value = it.description || ""

        const cost = Number(it.cost)
        const m = Number(it.markupPercent)
        const sell = (Number.isFinite(cost) && Number.isFinite(m)) ? cost * (1 + (m / 100)) : 0
        pricePerUnit.inp.value = String(Number.isFinite(sell) ? sell.toFixed(2) : "0.00")

        if (!quantity.inp.value) quantity.inp.value = "1"
        updateAmount()
      })
    })

    del.addEventListener("click", () => {
      const idx = lines.findIndex(x => x.wrap === lineWrap)
      if (idx >= 0) lines.splice(idx, 1)
      lineWrap.remove()
      recomputeTotal()
    })

    lineWrap.appendChild(top)
    lineWrap.appendChild(mid)
    lineWrap.appendChild(bottom)

    table.appendChild(lineWrap)

    const lineObj = {
      wrap: lineWrap,
      itemId: itemId.inp,
      description: desc.inp,
      pricePerUnit: pricePerUnit.inp,
      quantity: quantity.inp
    }

    lines.push(lineObj)
    recomputeTotal()
  }

  addRowBtn.addEventListener("click", addLine)
  addLine()

  customerId.inp.addEventListener("click", openCustomerPicker)

  backBtn.addEventListener("click", () => { location.hash = "home" })

  if (opts && opts.mode === "edit" && opts.quoteId) {
    const r = await apiGet(`/api/quotes/${encodeURIComponent(opts.quoteId)}`)
    const q = r && r.quote ? r.quote : null

    if (q) {
      quoteIdBox.inp.value = q.quoteId || ""
      customerId.inp.value = q.customerId || ""
      customerName.inp.value = q.customerName || ""
      phone.inp.value = q.phone || ""
      billTo.inp.value = q.billingAddress || ""
      shipTo.inp.value = q.shipToAddress || ""
      poNumber.inp.value = q.poNumber || ""
      truckNumber.value = q.truckNumber || "PU1"

      table.innerHTML = ""
      lines.length = 0

      const src = Array.isArray(q.lines) ? q.lines : []
      if (!src.length) addLine()
      src.forEach(() => addLine())

      src.forEach((line, idx) => {
        const l = lines[idx]
        if (!l) return
        l.itemId.value = line.itemId || ""
        l.description.value = line.description || ""
        l.pricePerUnit.value = String(line.pricePerUnit ?? "")
        l.quantity.value = String(line.quantity ?? "")
        l.pricePerUnit.dispatchEvent(new Event("input"))
      })
    }
  }

  saveBtn.addEventListener("click", async () => {
    err.textContent = ""

    try{
      const payload = {
        customerId: customerId.inp.value.trim(),
        customerName: customerName.inp.value.trim(),
        phone: phone.inp.value.trim(),
        billingAddress: billTo.inp.value.trim(),
        shipToAddress: shipTo.inp.value.trim(),
        poNumber: poNumber.inp.value.trim(),
        truckNumber: truckNumber.value,
        lines: lines.map(l => ({
          itemId: l.itemId.value.trim(),
          description: l.description.value.trim(),
          pricePerUnit: l.pricePerUnit.value.trim(),
          quantity: l.quantity.value.trim()
        }))
      }

      if (opts && opts.mode === "edit" && opts.quoteId) {
        const j = await requestJson(`/api/quotes/${encodeURIComponent(opts.quoteId)}`, "PUT", payload)
        quoteIdBox.inp.value = j && j.quote ? j.quote.quoteId : quoteIdBox.inp.value
        alert("Updated quote " + quoteIdBox.inp.value)
        return
      }

      const j = await requestJson("/api/quotes", "POST", payload)
      quoteIdBox.inp.value = j && j.quote ? j.quote.quoteId : "Saved"
      customers = await loadCustomers()
      inventory = await loadInventory()
      alert("Saved quote " + quoteIdBox.inp.value)
    }catch(e){
      err.textContent = String(e && e.message ? e.message : e)
    }
  })
}