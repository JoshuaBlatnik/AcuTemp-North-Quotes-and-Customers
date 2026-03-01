import { apiPost } from "./api.js"

function el(tag) {
  return document.createElement(tag)
}

export function createCustomerModal(onSaved) {
  const overlay = el("div")
  overlay.className = "modalOverlay"

  const panel = el("div")
  panel.className = "card modalPanel"

  const title = el("div")
  title.textContent = "Create customer"
  title.style.fontSize = "20px"
  title.style.fontWeight = "900"
  title.style.marginBottom = "12px"

  function field(labelText, placeholder) {
    const wrap = el("div")
    wrap.className = "field"

    const label = el("div")
    label.className = "label"
    label.textContent = labelText

    const input = el("input")
    input.className = "input"
    input.placeholder = placeholder

    wrap.appendChild(label)
    wrap.appendChild(input)
    return { wrap, input }
  }

  const idRow = field("Customer id", "Example CUST1001")
  const nameRow = field("Name", "Customer name")
  const phoneRow = field("Phone", "Optional")
  const emailRow = field("Email", "Optional")
  const addrRow = field("Address", "Optional")

  const form = el("div")
  form.className = "grid"
  form.appendChild(idRow.wrap)
  form.appendChild(nameRow.wrap)
  form.appendChild(phoneRow.wrap)
  form.appendChild(emailRow.wrap)
  form.appendChild(addrRow.wrap)

  const error = el("div")
  error.className = "error"

  const actions = el("div")
  actions.style.display = "flex"
  actions.style.gap = "10px"
  actions.style.marginTop = "14px"

  const cancel = el("button")
  cancel.className = "btnSmall"
  cancel.textContent = "Cancel"
  cancel.style.flex = "1"

  const save = el("button")
  save.className = "btn"
  save.textContent = "Save customer"
  save.style.flex = "1"

  actions.appendChild(cancel)
  actions.appendChild(save)

  panel.appendChild(title)
  panel.appendChild(form)
  panel.appendChild(error)
  panel.appendChild(actions)

  overlay.appendChild(panel)

  function open() {
    error.textContent = ""
    overlay.style.display = "flex"
    idRow.input.value = ""
    nameRow.input.value = ""
    phoneRow.input.value = ""
    emailRow.input.value = ""
    addrRow.input.value = ""
    setTimeout(() => idRow.input.focus(), 0)
  }

  function close() {
    overlay.style.display = "none"
  }

  cancel.addEventListener("click", close)
  overlay.addEventListener("click", e => {
    if (e.target === overlay) close()
  })

  save.addEventListener("click", async () => {
    error.textContent = ""
    const payload = {
      customerId: idRow.input.value.trim(),
      name: nameRow.input.value.trim(),
      phone: phoneRow.input.value.trim(),
      email: emailRow.input.value.trim(),
      address: addrRow.input.value.trim()
    }

    try {
      await apiPost("/api/customers", payload)
      close()
      onSaved()
    } catch (err) {
      error.textContent = String(err && err.message ? err.message : err)
    }
  })

  return { overlay, open }
}