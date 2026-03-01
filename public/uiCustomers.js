import { apiGet } from "./api.js"

function el(tag){ return document.createElement(tag) }

async function requestJson(url, method, body){
  const r = await fetch(url, {
    method,
    body: body ? JSON.stringify(body) : undefined
  })
  const j = await r.json().catch(() => ({}))
  if (!r.ok) throw new Error(j && j.message ? j.message : "Request failed")
  return j
}

function inputBox(labelText, placeholder){
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

function textareaBox(labelText, placeholder){
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

export async function renderCustomers(root){
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
  sub.textContent = "Customers"

  brand.appendChild(logo)
  brand.appendChild(sub)

  const card = el("div")
  card.className = "card"

  const top = el("div")
  top.className = "row"

  const title = el("div")
  title.className = "cardTitle"
  title.textContent = "Customers"

  const right = el("div")
  right.style.display = "flex"
  right.style.gap = "10px"
  right.style.flexWrap = "wrap"

  const backBtn = el("button")
  backBtn.className = "btnSmall"
  backBtn.textContent = "Back"

  right.appendChild(backBtn)
  top.appendChild(title)
  top.appendChild(right)

  const searchWrap = el("div")
  searchWrap.className = "pill"
  searchWrap.style.marginTop = "12px"

  const searchInput = el("input")
  searchInput.placeholder = "Search by name, id, phone"
  searchInput.style.width = "100%"
  searchInput.style.padding = "12px"
  searchInput.style.borderRadius = "14px"
  searchInput.style.border = "1px solid rgba(255,255,255,.14)"
  searchInput.style.background = "rgba(0,0,0,.18)"
  searchInput.style.color = "#ffffff"
  searchInput.style.outline = "none"
  searchInput.style.fontSize = "14px"

  searchWrap.appendChild(searchInput)

  const addWrap = el("div")
  addWrap.className = "pill"
  addWrap.style.display = "grid"
  addWrap.style.gap = "12px"
  addWrap.style.marginTop = "12px"

  const addTitle = el("div")
  addTitle.className = "kpiLabel"
  addTitle.textContent = "Add new customer"

  const fId = inputBox("Customer id", "CUST001")
  const fName = inputBox("Customer name", "Name")
  const fPhone = inputBox("Phone", "Phone")
  const fEmail = inputBox("Email", "Email")
  const fAddress = textareaBox("Address", "Address")
  const fNotes = textareaBox("Notes", "Notes")

  const addBtn = el("button")
  addBtn.className = "btn btnPrimary"
  addBtn.textContent = "Add customer"

  const addErr = el("div")
  addErr.className = "sectionHint"
  addErr.style.color = "rgba(255,180,180,.95)"
  addErr.textContent = ""

  addWrap.appendChild(addTitle)
  addWrap.appendChild(fId.wrap)
  addWrap.appendChild(fName.wrap)
  addWrap.appendChild(fPhone.wrap)
  addWrap.appendChild(fEmail.wrap)
  addWrap.appendChild(fAddress.wrap)
  addWrap.appendChild(fNotes.wrap)
  addWrap.appendChild(addBtn)
  addWrap.appendChild(addErr)

  const listWrap = el("div")
  listWrap.className = "pill"
  listWrap.style.display = "grid"
  listWrap.style.gap = "12px"
  listWrap.style.marginTop = "12px"
  listWrap.style.background = "rgba(255,255,255,.04)"

  const listTitle = el("div")
  listTitle.className = "kpiLabel"
  listTitle.textContent = "Customer list"

  const listErr = el("div")
  listErr.className = "sectionHint"
  listErr.style.color = "rgba(255,180,180,.95)"
  listErr.textContent = ""

  const list = el("div")
  list.className = "grid"

  listWrap.appendChild(listTitle)
  listWrap.appendChild(listErr)
  listWrap.appendChild(list)

  card.appendChild(top)
  card.appendChild(searchWrap)
  card.appendChild(addWrap)
  card.appendChild(listWrap)

  const footer = el("div")
  footer.className = "footer"
  footer.textContent = "Customers are stored in data.json."

  app.appendChild(brand)
  app.appendChild(card)
  app.appendChild(footer)
  root.appendChild(app)

  backBtn.addEventListener("click", () => { location.hash = "home" })

  let customers = []

  function matchCustomer(c, q){
    const s = (q || "").toLowerCase().trim()
    if (!s) return true
    const a = String(c.customerId || "").toLowerCase()
    const b = String(c.name || "").toLowerCase()
    const p = String(c.phone || "").toLowerCase()
    return a.includes(s) || b.includes(s) || p.includes(s)
  }

  function renderList(){
    list.innerHTML = ""
    listErr.textContent = ""

    const q = searchInput.value || ""
    const filtered = customers.filter(c => {
      const name = String(c.name || "").toLowerCase()
      const id = String(c.customerId || "").toLowerCase()
      const phone = String(c.phone || "").toLowerCase()
      return name.includes(q) || id.includes(q) || phone.includes(q)
    })

    if (!filtered.length){
      const empty = el("div")
      empty.className = "pill"
      empty.textContent = "No matching customers."
      list.appendChild(empty)
      return
    }

    filtered.forEach(c => {
      const row = el("div")
      row.className = "pill"
      row.style.display = "grid"
      row.style.gap = "10px"
      row.style.background = "rgba(0,0,0,.14)"

      const top = el("div")
      top.className = "row"

      const left = el("div")
      left.style.display = "grid"
      left.style.gap = "2px"

      const name = el("div")
      name.style.fontWeight = "950"
      name.textContent = c.name || ""

      const meta = el("div")
      meta.style.fontSize = "12px"
      meta.style.color = "rgba(255,255,255,.78)"
      meta.textContent = `Id ${c.customerId}`

      left.appendChild(name)
      left.appendChild(meta)

      const right = el("div")
      right.style.display = "grid"
      right.style.justifyItems = "end"
      right.style.gap = "2px"

      const p = el("div")
      p.style.fontWeight = "950"
      p.textContent = c.phone ? c.phone : ""

      const e = el("div")
      e.style.fontSize = "13px"
      e.style.color = "rgba(255,255,255,.82)"
      e.textContent = c.email ? c.email : ""

      right.appendChild(p)
      right.appendChild(e)

      top.appendChild(left)
      top.appendChild(right)

      const actions = el("div")
      actions.style.display = "flex"
      actions.style.gap = "10px"
      actions.style.flexWrap = "wrap"

      const editBtn = el("button")
      editBtn.className = "btnSmall"
      editBtn.textContent = "Edit"

      const delBtn = el("button")
      delBtn.className = "btnSmall"
      delBtn.textContent = "Delete"

      const newQuoteBtn = el("button")
      newQuoteBtn.className = "btnSmall"
      newQuoteBtn.textContent = "New quote"

      const newSoBtn = el("button")
      newSoBtn.className = "btnSmall"
      newSoBtn.textContent = "New SO"

      actions.appendChild(editBtn)
      actions.appendChild(delBtn)
      actions.appendChild(newQuoteBtn)
      actions.appendChild(newSoBtn)

      const editor = el("div")
      editor.className = "grid"
      editor.style.display = "none"

      const eName = inputBox("Customer name", "Name")
      const ePhone = inputBox("Phone", "Phone")
      const eEmail = inputBox("Email", "Email")
      const eAddress = textareaBox("Address", "Address")
      const eNotes = textareaBox("Notes", "Notes")

      eName.inp.value = c.name || ""
      ePhone.inp.value = c.phone || ""
      eEmail.inp.value = c.email || ""
      eAddress.inp.value = c.address || ""
      eNotes.inp.value = c.notes || ""

      const saveBtn = el("button")
      saveBtn.className = "btn"
      saveBtn.textContent = "Save changes"

      const cancelBtn = el("button")
      cancelBtn.className = "btnSmall"
      cancelBtn.textContent = "Cancel"

      const editErr = el("div")
      editErr.className = "sectionHint"
      editErr.style.color = "rgba(255,180,180,.95)"
      editErr.textContent = ""

      const editActions = el("div")
      editActions.style.display = "flex"
      editActions.style.gap = "10px"
      editActions.style.flexWrap = "wrap"

      editActions.appendChild(saveBtn)
      editActions.appendChild(cancelBtn)

      editor.appendChild(eName.wrap)
      editor.appendChild(ePhone.wrap)
      editor.appendChild(eEmail.wrap)
      editor.appendChild(eAddress.wrap)
      editor.appendChild(eNotes.wrap)
      editor.appendChild(editActions)
      editor.appendChild(editErr)

      const quotesWrap = el("div")
      quotesWrap.className = "pill"
      quotesWrap.style.display = "grid"
      quotesWrap.style.gap = "8px"
      quotesWrap.style.background = "rgba(255,255,255,.05)"

      const qTitle = el("div")
      qTitle.className = "kpiLabel"
      qTitle.textContent = "Sales quotes"

      const qList = el("div")
      qList.className = "grid"

      const qBtn = el("button")
      qBtn.className = "btnSmall"
      qBtn.textContent = "Load quotes"

      quotesWrap.appendChild(qTitle)
      quotesWrap.appendChild(qBtn)
      quotesWrap.appendChild(qList)

      const soWrap = el("div")
      soWrap.className = "pill"
      soWrap.style.display = "grid"
      soWrap.style.gap = "8px"
      soWrap.style.background = "rgba(255,255,255,.05)"

      const soTitle = el("div")
      soTitle.className = "kpiLabel"
      soTitle.textContent = "Sales orders"

      const soList = el("div")
      soList.className = "grid"

      const soBtn = el("button")
      soBtn.className = "btnSmall"
      soBtn.textContent = "Load sales orders"

      soWrap.appendChild(soTitle)
      soWrap.appendChild(soBtn)
      soWrap.appendChild(soList)

      row.appendChild(top)
      row.appendChild(actions)
      row.appendChild(editor)
      row.appendChild(quotesWrap)
      row.appendChild(soWrap)

      editBtn.addEventListener("click", () => {
        editor.style.display = "grid"
        editErr.textContent = ""
      })

      cancelBtn.addEventListener("click", () => {
        editor.style.display = "none"
        editErr.textContent = ""
      })

      saveBtn.addEventListener("click", async () => {
        editErr.textContent = ""
        try{
          await requestJson(`/api/customers/${encodeURIComponent(c.customerId)}`, "PUT", {
            name: eName.inp.value.trim(),
            phone: ePhone.inp.value.trim(),
            email: eEmail.inp.value.trim(),
            address: eAddress.inp.value.trim(),
            notes: eNotes.inp.value.trim()
          })
          await load()
        }catch(e2){
          editErr.textContent = String(e2 && e2.message ? e2.message : e2)
        }
      })

      delBtn.addEventListener("click", async () => {
        const ok = confirm("Delete " + c.name)
        if (!ok) return
        listErr.textContent = ""
        try{
          await requestJson(`/api/customers/${encodeURIComponent(c.customerId)}`, "DELETE")
          await load()
        }catch(e2){
          listErr.textContent = String(e2 && e2.message ? e2.message : e2)
        }
      })

      newQuoteBtn.addEventListener("click", () => {
        location.hash = "quote"
        setTimeout(() => {
          const ev = new CustomEvent("prefillQuoteCustomer", { detail: c })
          document.dispatchEvent(ev)
        }, 50)
      })

      newSoBtn.addEventListener("click", () => {
        location.hash = "so"
        setTimeout(() => {
          const ev = new CustomEvent("prefillSoCustomer", { detail: c })
          document.dispatchEvent(ev)
        }, 50)
      })

      qBtn.addEventListener("click", async () => {
        qList.innerHTML = ""
        try{
          const res = await apiGet(`/api/quotes/byCustomer/${encodeURIComponent(c.customerId)}`)
          const qs = Array.isArray(res.quotes) ? res.quotes : []

          if (!qs.length){
            const empty = el("div")
            empty.className = "pill"
            empty.style.color = "rgba(255,255,255,.85)"
            empty.textContent = "No quotes yet for this customer."
            qList.appendChild(empty)
            return
          }

          qs.slice().reverse().forEach(qo => {
            const item = el("div")
            item.className = "pill"
            item.style.cursor = "pointer"
            item.style.display = "flex"
            item.style.justifyContent = "space-between"
            item.style.alignItems = "center"
            item.style.gap = "10px"

            const left2 = el("div")
            const a2 = el("div")
            a2.style.fontWeight = "950"
            a2.textContent = qo.quoteId

            const b2 = el("div")
            b2.style.fontSize = "12px"
            b2.style.color = "rgba(255,255,255,.78)"
            b2.textContent = qo.createdAt ? new Date(qo.createdAt).toLocaleString() : ""

            left2.appendChild(a2)
            left2.appendChild(b2)

            const right2 = el("div")
            right2.style.display = "flex"
            right2.style.alignItems = "center"
            right2.style.gap = "10px"

            const toSo = el("button")
            toSo.className = "btnSmall"
            toSo.textContent = "To SO"

            toSo.addEventListener("click", (ev3) => {
              ev3.preventDefault()
              ev3.stopPropagation()
              location.hash = "so"
              setTimeout(() => {
                const evx = new CustomEvent("prefillSoFromQuote", { detail: qo })
                document.dispatchEvent(evx)
              }, 50)
            })

            const total2 = el("div")
            right2.style.fontWeight = "950"
            total2.textContent = "$" + Number(qo.total || 0).toFixed(2)

            right2.appendChild(toSo)
            right2.appendChild(total2)

            item.appendChild(left2)
            item.appendChild(right2)

            item.addEventListener("click", () => {
              location.hash = "quoteedit:" + qo.quoteId
            })

            qList.appendChild(item)
          })
        }catch(e2){
          const errBox = el("div")
          errBox.className = "pill"
          errBox.style.color = "rgba(255,180,180,.95)"
          errBox.textContent = String(e2 && e2.message ? e2.message : e2)
          qList.appendChild(errBox)
        }
      })

      soBtn.addEventListener("click", async () => {
        soList.innerHTML = ""
        try{
          const res = await apiGet(`/api/salesOrders/byCustomer/${encodeURIComponent(c.customerId)}`)
          const os = Array.isArray(res.salesOrders) ? res.salesOrders : []

          if (!os.length){
            const empty = el("div")
            empty.className = "pill"
            empty.style.color = "rgba(255,255,255,.85)"
            empty.textContent = "No sales orders yet for this customer."
            soList.appendChild(empty)
            return
          }

          os.slice().reverse().forEach(so => {
            const item = el("div")
            item.className = "pill"
            item.style.cursor = "pointer"
            item.style.display = "flex"
            item.style.justifyContent = "space-between"
            item.style.alignItems = "center"
            item.style.gap = "10px"

            const left2 = el("div")
            const a2 = el("div")
            a2.style.fontWeight = "950"
            a2.textContent = so.soId

            const b2 = el("div")
            b2.style.fontSize = "12px"
            b2.style.color = "rgba(255,255,255,.78)"
            b2.textContent = so.updatedAt ? new Date(so.updatedAt).toLocaleString() : ""

            left2.appendChild(a2)
            left2.appendChild(b2)

            const right2 = el("div")
            right2.style.display = "grid"
            right2.style.justifyItems = "end"

            const s1 = el("div")
            s1.style.fontWeight = "950"
            s1.textContent = (so.status || "Open")

            const s2 = el("div")
            s2.style.fontSize = "12px"
            s2.style.color = "rgba(255,255,255,.78)"
            s2.textContent = "$" + Number(so.total || 0).toFixed(2)

            right2.appendChild(s1)
            right2.appendChild(s2)

            item.appendChild(left2)
            item.appendChild(right2)

            item.addEventListener("click", () => {
              location.hash = "soedit:" + so.soId
            })

            soList.appendChild(item)
          })
        }catch(e2){
          const errBox = el("div")
          errBox.className = "pill"
          errBox.style.color = "rgba(255,180,180,.95)"
          errBox.textContent = String(e2 && e2.message ? e2.message : e2)
          soList.appendChild(errBox)
        }
      })

      list.appendChild(row)
    })
  }

  async function load(){
    const res = await apiGet("/api/customers")
    customers = Array.isArray(res.customers) ? res.customers : []
    renderList()
  }

  function updateSearchMode(){
    const has = String(searchInput.value || "").trim().length > 0
    addWrap.style.display = has ? "none" : "grid"
  }

  searchInput.addEventListener("input", () => {
    updateSearchMode()
    renderList()
  })

  updateSearchMode()

  addBtn.addEventListener("click", async () => {
    addErr.textContent = ""
    try{
      await requestJson("/api/customers", "POST", {
        customerId: fId.inp.value.trim(),
        name: fName.inp.value.trim(),
        phone: fPhone.inp.value.trim(),
        email: fEmail.inp.value.trim(),
        address: fAddress.inp.value.trim(),
        notes: fNotes.inp.value.trim()
      })

      fId.inp.value = ""
      fName.inp.value = ""
      fPhone.inp.value = ""
      fEmail.inp.value = ""
      fAddress.inp.value = ""
      fNotes.inp.value = ""
      searchInput.value = ""

      await load()
    }catch(e2){
      addErr.textContent = String(e2 && e2.message ? e2.message : e2)
    }
  })

  await load()
}