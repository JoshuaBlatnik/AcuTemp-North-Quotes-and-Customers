// public/uiSalesOrder.js
import { apiGet, apiPost, apiPut, apiDelete } from "./api.js"

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

async function loadQuotes(){
  const res = await apiGet("/api/quotes")
  return Array.isArray(res.quotes) ? res.quotes : []
}

export async function renderSalesOrder(root, opts = { mode: "new" }){
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
  sub.textContent = "Sales order"

  brand.appendChild(logo)
  brand.appendChild(sub)

  const card = el("div")
  card.className = "card"

  const titleRow = el("div")
  titleRow.className = "row"

  const title = el("div")
  title.className = "cardTitle"
  title.textContent = opts && opts.mode === "edit" ? "Edit sales order" : "Create sales order"

  const right = el("div")
  right.style.display = "flex"
  right.style.gap = "10px"
  right.style.flexWrap = "wrap"

  const backBtn = el("button")
  backBtn.className = "btnSmall"
  backBtn.textContent = "Back"

  right.appendChild(backBtn)
  titleRow.appendChild(title)
  titleRow.appendChild(right)

  const grid = el("div")
  grid.className = "grid"

  const soIdBox = makeInput("Sales order id", "Auto")
  soIdBox.inp.disabled = true
  soIdBox.inp.style.opacity = "0.9"

  const fromQuoteBox = makeInput("From quote id", "Optional")
  fromQuoteBox.inp.placeholder = "Click to pick a quote"
  fromQuoteBox.inp.readOnly = true
  fromQuoteBox.inp.style.cursor = "pointer"

  const statusBox = makeInput("Status", "Open")

  const customerId = makeInput("Customer id", "Click to pick")
  customerId.inp.readOnly = true
  customerId.inp.style.cursor = "pointer"

  const customerName = makeInput("Customer name", "Auto")
  const phone = makeInput("Phone", "Optional")
  const billTo = makeTextArea("Bill to", "Billing address")
  const shipTo = makeTextArea("Ship to", "Service address")
  const poNumber = makeInput("PO number", "Optional")

  const truckWrap = el("div")
  truckWrap.className = "pill"
  truckWrap.style.display = "grid"
  truckWrap.style.gap = "8px"

  const truckLabel = el("div")
  truckLabel.className = "kpiLabel"
  truckLabel.textContent = "Truck"

  const truckNumber = el("select")
  truckNumber.style.width = "100%"
  truckNumber.style.padding = "12px"
  truckNumber.style.borderRadius = "14px"
  truckNumber.style.border = "1px solid rgba(255,255,255,.14)"
  truckNumber.style.background = "rgba(0,0,0,.18)"
  truckNumber.style.color = "#ffffff"
  truckNumber.style.outline = "none"
  truckNumber.style.fontSize = "14px"

  ;["PU1", "PU2", "TR1", "TR2"].forEach(v => {
    const o = el("option")
    o.value = v
    o.textContent = v
    truckNumber.appendChild(o)
  })

  truckWrap.appendChild(truckLabel)
  truckWrap.appendChild(truckNumber)

  const notes = makeTextArea("Notes", "Optional")

  grid.appendChild(soIdBox.wrap)
  grid.appendChild(fromQuoteBox.wrap)
  grid.appendChild(statusBox.wrap)
  grid.appendChild(customerId.wrap)
  grid.appendChild(customerName.wrap)
  grid.appendChild(phone.wrap)
  grid.appendChild(billTo.wrap)
  grid.appendChild(shipTo.wrap)
  grid.appendChild(poNumber.wrap)
  grid.appendChild(truckWrap)
  grid.appendChild(notes.wrap)

  const tableCard = el("div")
  tableCard.className = "card"

  const tableTop = el("div")
  tableTop.className = "row"

  const tTitle = el("div")
  tTitle.className = "cardTitle"
  tTitle.textContent = "Line items"

  const tRight = el("div")
  tRight.style.display = "flex"
  tRight.style.gap = "10px"
  tRight.style.flexWrap = "wrap"

  const addRowBtn = el("button")
  addRowBtn.className = "btnSmall"
  addRowBtn.textContent = "Add row"

  tRight.appendChild(addRowBtn)
  tableTop.appendChild(tTitle)
  tableTop.appendChild(tRight)

  const table = el("div")
  table.className = "grid"
  table.style.marginTop = "12px"

  const totalRow = el("div")
  totalRow.className = "row"
  totalRow.style.marginTop = "12px"

  const totalLabel = el("div")
  totalLabel.className = "kpiLabel"
  totalLabel.textContent = "Total"

  const totalValue = el("div")
  totalValue.style.fontWeight = "950"
  totalValue.textContent = "$0.00"

  totalRow.appendChild(totalLabel)
  totalRow.appendChild(totalValue)

  tableCard.appendChild(tableTop)
  tableCard.appendChild(table)
  tableCard.appendChild(totalRow)

  const actions = el("div")
  actions.className = "row"
  actions.style.marginTop = "12px"

  const saveBtn = el("button")
  saveBtn.className = "btn btnPrimary"
  saveBtn.textContent = opts && opts.mode === "edit" ? "Save changes" : "Create sales order"

  const delBtn = el("button")
  delBtn.className = "btn btnGhost"
  delBtn.textContent = "Delete"
  if (!(opts && opts.mode === "edit")) delBtn.style.display = "none"

  actions.appendChild(saveBtn)
  actions.appendChild(delBtn)

  const err = el("div")
  err.className = "sectionHint"
  err.style.color = "rgba(255,180,180,95)"
  err.textContent = ""

  card.appendChild(titleRow)
  card.appendChild(grid)
  card.appendChild(actions)
  card.appendChild(err)

  const footer = el("div")
  footer.className = "footer"
  footer.textContent = "Sales orders save to data.json."

  app.appendChild(brand)
  app.appendChild(card)
  app.appendChild(tableCard)
  app.appendChild(footer)
  root.appendChild(app)

  let inventory = []
  let customers = []
  let quotes = []
  const lines = []

  function recomputeTotal(){
    const sum = lines.reduce((acc, l) => acc + calcAmount(l.pricePerUnit.value, l.quantity.value), 0)
    totalValue.textContent = money(sum)
  }

  function openPicker(overlay, titleText, items, renderRow, onPick){
    overlay.innerHTML = ""
    overlay.style.display = "flex"

    const box = el("div")
    box.className = "modal"

    const head = el("div")
    head.className = "row"

    const h = el("div")
    h.style.fontWeight = "950"
    h.textContent = titleText

    const close = el("button")
    close.className = "btnSmall"
    close.textContent = "Close"

    head.appendChild(h)
    head.appendChild(close)

    const list = el("div")
    list.className = "grid"
    list.style.marginTop = "12px"

    if (!items.length){
      const empty = el("div")
      empty.className = "pill"
      empty.style.opacity = "0.9"
      empty.textContent = "Nothing to pick."
      list.appendChild(empty)
    } else {
      items.forEach(it => {
        const row = renderRow(it)
        row.addEventListener("click", () => {
          overlay.style.display = "none"
          onPick(it)
        })
        list.appendChild(row)
      })
    }

    close.addEventListener("click", () => { overlay.style.display = "none" })

    box.appendChild(head)
    box.appendChild(list)
    overlay.appendChild(box)
  }

  function openInventoryPicker(onPick){
    openPicker(invOverlay, "Pick inventory item", inventory, (it) => {
      const row = el("div")
      row.className = "pill"
      row.style.cursor = "pointer"
      row.style.display = "flex"
      row.style.justifyContent = "space-between"
      row.style.alignItems = "center"
      row.style.gap = "10px"

      const left = el("div")
      const a = el("div")
      a.style.fontWeight = "950"
      a.textContent = it.itemId
      const b = el("div")
      b.style.fontSize = "12px"
      b.style.color = "rgba(255,255,255,.78)"
      b.textContent = it.description
      left.appendChild(a)
      left.appendChild(b)

      const right = el("div")
      right.style.fontWeight = "950"
      const cost = Number(it.cost)
      const m = Number(it.markupPercent)
      const sell = (Number.isFinite(cost) && Number.isFinite(m)) ? cost * (1 + (m / 100)) : 0
      right.textContent = money(sell)

      row.appendChild(left)
      row.appendChild(right)
      return row
    }, onPick)
  }

  function openCustomerPicker(){
    openPicker(custOverlay, "Pick customer", customers, (c) => {
      const row = el("div")
      row.className = "pill"
      row.style.cursor = "pointer"
      row.style.display = "grid"
      row.style.gap = "4px"
      const a = el("div")
      a.style.fontWeight = "950"
      a.textContent = c.name
      const b = el("div")
      b.style.fontSize = "12px"
      b.style.color = "rgba(255,255,255,.78)"
      b.textContent = `Id ${c.customerId}`
      row.appendChild(a)
      row.appendChild(b)
      return row
    }, (c) => {
      applyCustomer(c)
    })
  }

  function openQuotePicker(){
    openPicker(quoteOverlay, "Pick quote", quotes.slice().reverse(), (q) => {
      const row = el("div")
      row.className = "pill"
      row.style.cursor = "pointer"
      row.style.display = "flex"
      row.style.justifyContent = "space-between"
      row.style.alignItems = "center"
      row.style.gap = "10px"

      const left = el("div")
      const a = el("div")
      a.style.fontWeight = "950"
      a.textContent = q.quoteId
      const b = el("div")
      b.style.fontSize = "12px"
      b.style.color = "rgba(255,255,255,.78)"
      b.textContent = `${q.customerName || ""} ${q.customerId ? "(" + q.customerId + ")" : ""}`.trim()
      left.appendChild(a)
      left.appendChild(b)

      const right = el("div")
      right.style.fontWeight = "950"
      right.textContent = money(q.total || 0)

      row.appendChild(left)
      row.appendChild(right)
      return row
    }, (q) => {
      applyQuote(q)
    })
  }

  function applyCustomer(c){
    customerId.inp.value = c.customerId || ""
    customerName.inp.value = c.name || ""
    phone.inp.value = c.phone || ""
    if (!billTo.inp.value) billTo.inp.value = c.address || ""
    if (!shipTo.inp.value) shipTo.inp.value = c.address || ""
  }

  function applyQuote(q){
    fromQuoteBox.inp.value = q.quoteId || ""
    customerId.inp.value = q.customerId || ""
    customerName.inp.value = q.customerName || ""
    phone.inp.value = q.phone || ""
    billTo.inp.value = q.billingAddress || ""
    shipTo.inp.value = q.shipToAddress || ""
    poNumber.inp.value = q.poNumber || ""
    truckNumber.value = q.truckNumber || "PU1"
    statusBox.inp.value = "Open"

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

  function addLine(){
    const lineWrap = el("div")
    lineWrap.className = "pill"
    lineWrap.style.display = "grid"
    lineWrap.style.gap = "10px"

    const top = el("div")
    top.className = "row"

    const itemId = makeInput("Item id", "Click to pick")
    itemId.inp.readOnly = true
    itemId.inp.style.cursor = "pointer"

    const desc = makeInput("Description", "Optional")
    const pricePerUnit = makeInput("Price per unit", "0.00")
    const quantity = makeInput("Quantity", "1")

    const mid = el("div")
    mid.className = "grid"
    mid.appendChild(itemId.wrap)
    mid.appendChild(desc.wrap)
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

    top.appendChild(el("div"))
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

  const invOverlay = buildOverlay()
  const custOverlay = buildOverlay()
  const quoteOverlay = buildOverlay()
  document.body.appendChild(invOverlay)
  document.body.appendChild(custOverlay)
  document.body.appendChild(quoteOverlay)

  addRowBtn.addEventListener("click", addLine)
  addLine()

  backBtn.addEventListener("click", () => { location.hash = "home" })
  customerId.inp.addEventListener("click", openCustomerPicker)
  fromQuoteBox.inp.addEventListener("click", openQuotePicker)

  document.addEventListener("prefillSoCustomer", (ev) => {
    const c = ev && ev.detail ? ev.detail : null
    if (c) applyCustomer(c)
  })

  document.addEventListener("prefillSoFromQuote", (ev) => {
    const q = ev && ev.detail ? ev.detail : null
    if (q) applyQuote(q)
  })

  inventory = await loadInventory()
  customers = await loadCustomers()
  quotes = await loadQuotes()

  if (opts && opts.mode === "edit" && opts.soId) {
    const r = await apiGet(`/api/salesOrders/${encodeURIComponent(opts.soId)}`)
    const so = r && r.salesOrder ? r.salesOrder : null

    if (so) {
      soIdBox.inp.value = so.soId || ""
      fromQuoteBox.inp.value = so.fromQuoteId || ""
      statusBox.inp.value = so.status || "Open"

      customerId.inp.value = so.customerId || ""
      customerName.inp.value = so.customerName || ""
      phone.inp.value = so.phone || ""
      billTo.inp.value = so.billingAddress || ""
      shipTo.inp.value = so.shipToAddress || ""
      poNumber.inp.value = so.poNumber || ""
      truckNumber.value = so.truckNumber || "PU1"
      notes.inp.value = so.notes || ""

      table.innerHTML = ""
      lines.length = 0

      const src = Array.isArray(so.lines) ? so.lines : []
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
  } else {
    const r = await apiGet("/api/nextSo")
    if (r && r.nextSoId) soIdBox.inp.value = r.nextSoId
    statusBox.inp.value = "Open"
  }

  saveBtn.addEventListener("click", async () => {
    err.textContent = ""

    try{
      const payload = {
        fromQuoteId: fromQuoteBox.inp.value.trim(),
        status: statusBox.inp.value.trim() || "Open",
        notes: notes.inp.value.trim(),

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

      if (opts && opts.mode === "edit" && opts.soId) {
        const j = await apiPut(`/api/salesOrders/${encodeURIComponent(opts.soId)}`, payload)
        soIdBox.inp.value = j && j.salesOrder ? j.salesOrder.soId : soIdBox.inp.value
        alert("Saved " + soIdBox.inp.value)
        return
      }

      const j = await apiPost("/api/salesOrders", payload)
      const newId = j && j.salesOrder ? j.salesOrder.soId : ""
      if (newId) {
        location.hash = "soedit:" + newId
        return
      }
      alert("Saved")
    }catch(e){
      err.textContent = String(e && e.message ? e.message : e)
    }
  })

  delBtn.addEventListener("click", async () => {
    if (!(opts && opts.mode === "edit" && opts.soId)) return
    const ok = confirm("Delete " + opts.soId)
    if (!ok) return
    err.textContent = ""
    try{
      await apiDelete(`/api/salesOrders/${encodeURIComponent(opts.soId)}`)
      location.hash = "home"
    }catch(e){
      err.textContent = String(e && e.message ? e.message : e)
    }
  })
}