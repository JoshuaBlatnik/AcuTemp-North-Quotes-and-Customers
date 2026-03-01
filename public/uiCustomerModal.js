// Imports the API helper used to create a new customer.
import { apiPost } from "./api.js"

// Utility function to create a new DOM element.
function el(tag) {
  return document.createElement(tag)
}

// Creates and returns a customer creation modal.
export function createCustomerModal(onSaved) {

  // Overlay that darkens the background.
  const overlay = el("div")
  overlay.className = "modalOverlay"

  // Main modal panel container.
  const panel = el("div")
  panel.className = "card modalPanel"

  // Modal title.
  const title = el("div")
  title.textContent = "Create customer"
  title.style.fontSize = "20px"
  title.style.fontWeight = "900"
  title.style.marginBottom = "12px"

  // Helper function to build labeled input fields.
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

  // Customer form fields.
  const idRow = field("Customer id", "Example CUST1001")
  const nameRow = field("Name", "Customer name")
  const phoneRow = field("Phone", "Optional")
  const emailRow = field("Email", "Optional")
  const addrRow = field("Address", "Optional")

  // Form layout container.
  const form = el("div")
  form.className = "grid"
  form.appendChild(idRow.wrap)
  form.appendChild(nameRow.wrap)
  form.appendChild(phoneRow.wrap)
  form.appendChild(emailRow.wrap)
  form.appendChild(addrRow.wrap)

  // Error message display.
  const error = el("div")
  error.className = "error"

  // Action buttons container.
  const actions = el("div")
  actions.style.display = "flex"
  actions.style.gap = "10px"
  actions.style.marginTop = "14px"

  // Cancel button.
  const cancel = el("button")
  cancel.className = "btnSmall"
  cancel.textContent = "Cancel"
  cancel.style.flex = "1"

  // Save button.
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

  // Opens the modal and resets form values.
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

  // Closes the modal.
  function close() {
    overlay.style.display = "none"
  }

  // Close modal when cancel button is clicked.
  cancel.addEventListener("click", close)

  // Close modal when clicking outside the panel.
  overlay.addEventListener("click", e => {
    if (e.target === overlay) close()
  })

  // Saves the customer and sends data to the API.
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
      onSaved() // Refresh parent view after successful save.
    } catch (err) {
      error.textContent = String(err && err.message ? err.message : err)
    }
  })

  // Returns the modal overlay and open function.
  return { overlay, open }
}
