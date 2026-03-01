import { apiGet, apiPost, apiPut, apiDelete } from "./api.js"

function el(tag){ return document.createElement(tag) }

function money(n){
  const x = Number(n)
  if (!Number.isFinite(x)) return ""
  return "$" + x.toFixed(2)
}

function sellPrice(cost, markupPercent){
  const c = Number(cost)
  const m = Number(markupPercent)
  if (!Number.isFinite(c) || !Number.isFinite(m)) return null
  return c * (1 + (m / 100))
}

export async function renderInventory(root){
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
  sub.textContent = "Inventory"

  brand.appendChild(logo)
  brand.appendChild(sub)

  const addCard = el("div")
  addCard.className = "card"

  const addTitle = el("div")
  addTitle.className = "cardTitle"
  addTitle.textContent = "Add item"

  const addGrid = el("div")
  addGrid.className = "grid"

  function input(labelText, placeholder){
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

  const fId = input("Item id", "Example FILTER16X25")
  const fDesc = input("Item description", "Example 16x25x1 pleated filter")
  const fCost = input("Price paid", "Example 12.50")
  const fMarkup = input("Markup percent", "Example 35")

  const addBtn = el("button")
  addBtn.className = "btn btnPrimary"
  addBtn.textContent = "Add item"

  const addErr = el("div")
  addErr.className = "sectionHint"
  addErr.style.color = "rgba(255,180,180,.95)"
  addErr.textContent = ""

  addGrid.appendChild(fId.wrap)
  addGrid.appendChild(fDesc.wrap)
  addGrid.appendChild(fCost.wrap)
  addGrid.appendChild(fMarkup.wrap)
  addGrid.appendChild(addBtn)
  addGrid.appendChild(addErr)

  addCard.appendChild(addTitle)
  addCard.appendChild(addGrid)

  const listCard = el("div")
  listCard.className = "card"

  const listTitleRow = el("div")
  listTitleRow.className = "cardTitle"
  listTitleRow.textContent = "Search and edit"

  const searchWrap = el("div")
  searchWrap.className = "pill"
  searchWrap.style.display = "grid"
  searchWrap.style.gap = "8px"

  const searchLabel = el("div")
  searchLabel.className = "kpiLabel"
  searchLabel.textContent = "Search by description"

  const searchInput = el("input")
  searchInput.placeholder = "Type to filter by description"
  searchInput.style.width = "100%"
  searchInput.style.padding = "12px"
  searchInput.style.borderRadius = "14px"
  searchInput.style.border = "1px solid rgba(255,255,255,.14)"
  searchInput.style.background = "rgba(0,0,0,.18)"
  searchInput.style.color = "#ffffff"
  searchInput.style.outline = "none"
  searchInput.style.fontSize = "14px"

  searchWrap.appendChild(searchLabel)
  searchWrap.appendChild(searchInput)

  const list = el("div")
  list.style.marginTop = "12px"
  list.className = "grid"

  const listErr = el("div")
  listErr.className = "sectionHint"
  listErr.style.color = "rgba(255,180,180,.95)"
  listErr.textContent = ""

  const back = el("button")
  back.className = "btnSmall"
  back.textContent = "Back to menu"
  back.style.marginTop = "14px"

  back.addEventListener("click", () => { location.hash = "home" })

  listCard.appendChild(listTitleRow)
  listCard.appendChild(searchWrap)
  listCard.appendChild(list)
  listCard.appendChild(listErr)
  listCard.appendChild(back)

  const footer = el("div")
  footer.className = "footer"
  footer.textContent = "Inventory saves to data.json."

  app.appendChild(brand)
  app.appendChild(addCard)
  app.appendChild(listCard)
  app.appendChild(footer)
  root.appendChild(app)

  let inventory = []

  function renderList(){
    listErr.textContent = ""
    list.innerHTML = ""

    const q = String(searchInput.value || "").trim().toLowerCase()
    const filtered = inventory.filter(i => String(i.description || "").toLowerCase().includes(q))

    if (!filtered.length){
      const empty = el("div")
      empty.className = "pill"
      empty.style.color = "rgba(255,255,255,.85)"
      empty.textContent = "No matching items."
      list.appendChild(empty)
      return
    }

    filtered.forEach(item => {
      const row = el("div")
      row.className = "pill"
      row.style.display = "grid"
      row.style.gap = "10px"

      const top = el("div")
      top.className = "row"

      const left = el("div")
      const a = el("div")
      a.style.fontWeight = "950"
      a.textContent = item.itemId

      const b = el("div")
      b.style.color = "rgba(255,255,255,.82)"
      b.style.fontSize = "13px"
      b.textContent = item.description

      left.appendChild(a)
      left.appendChild(b)

      const right = el("div")
      right.style.textAlign = "right"
      right.style.display = "grid"
      right.style.gap = "4px"

      const cost = el("div")
      cost.style.fontSize = "13px"
      cost.style.color = "rgba(255,255,255,.82)"
      cost.textContent = "Paid " + money(item.cost)

      const sell = sellPrice(item.cost, item.markupPercent)
      const sellLine = el("div")
      sellLine.style.fontSize = "13px"
      sellLine.style.color = "rgba(255,255,255,.82)"
      sellLine.textContent = sell === null ? "" : "Sell " + money(sell)

      right.appendChild(cost)
      right.appendChild(sellLine)

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

      actions.appendChild(editBtn)
      actions.appendChild(delBtn)

      const editor = el("div")
      editor.style.display = "none"
      editor.style.marginTop = "6px"
      editor.style.display = "none"
      editor.className = "grid"

      const eDesc = input("Description", "Description")
      const eCost = input("Price paid", "12.50")
      const eMarkup = input("Markup percent", "35")

      eDesc.inp.value = item.description || ""
      eCost.inp.value = String(item.cost ?? "")
      eMarkup.inp.value = String(item.markupPercent ?? "")

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

      editor.appendChild(eDesc.wrap)
      editor.appendChild(eCost.wrap)
      editor.appendChild(eMarkup.wrap)
      editor.appendChild(editActions)
      editor.appendChild(editErr)

      row.appendChild(top)
      row.appendChild(actions)
      row.appendChild(editor)

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
          await apiPut(`/api/inventory/${encodeURIComponent(item.itemId)}`, {
            description: eDesc.inp.value.trim(),
            cost: eCost.inp.value.trim(),
            markupPercent: eMarkup.inp.value.trim()
          })
          await load()
        }catch(e){
          editErr.textContent = String(e && e.message ? e.message : e)
        }
      })

      delBtn.addEventListener("click", async () => {
        const ok = confirm(`Delete ${item.itemId}`)
        if (!ok) return
        listErr.textContent = ""
        try{
          await apiDelete(`/api/inventory/${encodeURIComponent(item.itemId)}`)
          await load()
        }catch(e){
          listErr.textContent = String(e && e.message ? e.message : e)
        }
      })

      list.appendChild(row)
    })
  }

  async function load(){
    const res = await apiGet("/api/inventory")
    inventory = Array.isArray(res.inventory) ? res.inventory : []
    renderList()
  }

  searchInput.addEventListener("input", renderList)

  addBtn.addEventListener("click", async () => {
    addErr.textContent = ""
    try{
      await apiPost("/api/inventory", {
        itemId: fId.inp.value.trim(),
        description: fDesc.inp.value.trim(),
        cost: fCost.inp.value.trim(),
        markupPercent: fMarkup.inp.value.trim()
      })

      fId.inp.value = ""
      fDesc.inp.value = ""
      fCost.inp.value = ""
      fMarkup.inp.value = ""
      searchInput.value = ""

      await load()
    }catch(e){
      addErr.textContent = String(e && e.message ? e.message : e)
    }
  })

  await load()
}